import { createHmac } from "node:crypto";

import { errorResponse, requireUserId } from "@/lib/server-auth";

// GET /api/stream-token
// Returns a short-lived Stream user token for the signed-in Clerk user.
// STREAM_API_SECRET never leaves the server.

const TOKEN_TTL_SECONDS = 60 * 60;

function base64url(input: string | Buffer): string {
  return Buffer.from(input).toString("base64url");
}

function createStreamUserToken(userId: string, secret: string): string {
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  // iat slightly in the past to tolerate small clock differences
  const payload = base64url(JSON.stringify({ user_id: userId, iat: now - 30, exp: now + TOKEN_TTL_SECONDS }));
  const signature = createHmac("sha256", secret).update(`${header}.${payload}`).digest("base64url");
  return `${header}.${payload}.${signature}`;
}

export async function GET(request: Request): Promise<Response> {
  try {
    const userId = await requireUserId(request);

    const apiKey = process.env.STREAM_API_KEY;
    const secret = process.env.STREAM_API_SECRET;
    if (!apiKey || !secret) {
      return Response.json({ error: "Stream is not configured on the server" }, { status: 500 });
    }

    return Response.json({ apiKey, token: createStreamUserToken(userId, secret), userId });
  } catch (err) {
    return errorResponse(err);
  }
}
