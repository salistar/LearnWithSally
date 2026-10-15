import { CALL_TYPE } from "@/lib/teacher";
import { assertOwnsCall, errorResponse, HttpError, requireUserId } from "@/lib/server-auth";

// POST   /api/agent-session            { callId }            → asks Sally to join the call
// DELETE /api/agent-session?callId=&sessionId=               → makes Sally leave
//
// Both require a valid Clerk session AND the call must belong to the caller.
// The Python service (VISION_AGENT_URL) must NOT be reachable from the internet.

const AGENT_URL = (process.env.VISION_AGENT_URL ?? "http://127.0.0.1:8000").replace(/\/$/, "");

export async function POST(request: Request): Promise<Response> {
  try {
    const userId = await requireUserId(request);

    let body: { callId?: unknown };
    try {
      body = await request.json();
    } catch {
      throw new HttpError(400, "Invalid JSON body");
    }
    if (typeof body.callId !== "string") throw new HttpError(400, "callId is required");
    assertOwnsCall(body.callId, userId);

    let res: Response;
    try {
      res = await fetch(`${AGENT_URL}/calls/${encodeURIComponent(body.callId)}/sessions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ call_type: CALL_TYPE }),
      });
    } catch (err) {
      console.error("[agent-session] cannot reach vision agent", err);
      throw new HttpError(503, "The AI teacher service is not running");
    }

    if (!res.ok) {
      console.error("[agent-session] agent returned", res.status, await res.text());
      throw new HttpError(502, "The AI teacher could not join");
    }

    const data = (await res.json()) as { session_id?: string };
    return Response.json({ sessionId: data.session_id ?? null });
  } catch (err) {
    return errorResponse(err);
  }
}

export async function DELETE(request: Request): Promise<Response> {
  try {
    const userId = await requireUserId(request);
    const { searchParams } = new URL(request.url);
    const callId = searchParams.get("callId");
    const sessionId = searchParams.get("sessionId");
    if (!callId || !sessionId) throw new HttpError(400, "callId and sessionId are required");
    assertOwnsCall(callId, userId);

    try {
      const res = await fetch(
        `${AGENT_URL}/calls/${encodeURIComponent(callId)}/sessions/${encodeURIComponent(sessionId)}`,
        { method: "DELETE" },
      );
      if (!res.ok && res.status !== 404) throw new HttpError(502, "Could not stop the AI teacher");
    } catch (err) {
      if (err instanceof HttpError) throw err;
      throw new HttpError(503, "The AI teacher service is not running");
    }
    return Response.json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
