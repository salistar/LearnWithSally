// Server-only helpers for app/api/* routes. Never import this from a screen.
import { verifyToken } from "@clerk/backend";

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

/**
 * Verifies the Clerk session token sent as `Authorization: Bearer <token>`
 * with Clerk's official SDK (signature, expiry, not-before, issuer) and
 * returns the authenticated user id.
 */
export async function requireUserId(request: Request): Promise<string> {
  const header = request.headers.get("Authorization");
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) throw new HttpError(401, "Missing session token");

  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey) throw new HttpError(500, "CLERK_SECRET_KEY is not configured");

  try {
    const payload = await verifyToken(token, {
      secretKey,
      // Optional: comma-separated list of allowed origins (azp claim).
      authorizedParties: process.env.CLERK_AUTHORIZED_PARTIES?.split(",").filter(Boolean),
    });
    if (!payload.sub) throw new Error("No subject");
    return payload.sub;
  } catch {
    throw new HttpError(401, "Invalid or expired session");
  }
}

export function errorResponse(err: unknown): Response {
  if (err instanceof HttpError) {
    return Response.json({ error: err.message }, { status: err.status });
  }
  console.error("[api] unexpected error", err);
  return Response.json({ error: "Internal error" }, { status: 500 });
}

/** Lesson calls are named `lesson-<lessonId>-<userId>`; only the owner may use them. */
export function assertOwnsCall(callId: string, userId: string) {
  if (!/^lesson-[a-z]{2}-\d+-\d+-[A-Za-z0-9_]+$/.test(callId) || !callId.endsWith(`-${userId}`)) {
    throw new HttpError(403, "This call does not belong to you");
  }
}
