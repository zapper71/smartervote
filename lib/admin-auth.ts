import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";

/**
 * Admin authentication.
 *
 * DESIGN DECISION, and its reasoning, because this protects the ability to
 * publish statements about real candidates during a live election:
 *
 * 1. The admin area is DISABLED BY DEFAULT IN PRODUCTION. It only exists if
 *    ADMIN_PASSWORD is set. If you never set it in Vercel, there is no admin
 *    surface on the public internet at all — you review locally against the
 *    same database. That is the safest default, and it is the one you get
 *    unless you deliberately opt out of it.
 *
 * 2. When enabled, it is a single shared password, hashed into an httpOnly
 *    signed cookie. This is V1-grade auth: appropriate for one person, and
 *    NOT appropriate for multiple reviewers or for anything you would be
 *    upset to see altered. When you add volunteer reviewers (Q14), this
 *    should be replaced with Supabase Auth and per-user accounts.
 *
 * 3. All writes run server-side with the service role key, which never
 *    reaches the browser.
 */

const COOKIE = "sv_admin_session";
const MAX_AGE = 60 * 60 * 12; // 12 hours — a working day, then sign in again

function secret(): string | null {
  const s = process.env.ADMIN_PASSWORD;
  return s && s.length > 0 ? s : null;
}

/** True when an admin area exists at all in this environment. */
export function adminEnabled(): boolean {
  return secret() !== null;
}

/**
 * The cookie value: an HMAC of a fixed message keyed by the password.
 * Knowing the cookie doesn't reveal the password, and the cookie becomes
 * invalid the moment the password is rotated.
 */
function sessionToken(): string {
  const s = secret();
  if (!s) throw new Error("ADMIN_PASSWORD is not set");
  return createHmac("sha256", s).update("smartervote-admin-v1").digest("hex");
}

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

/** Constant-time password check. */
export function passwordMatches(input: string): boolean {
  const s = secret();
  if (!s) return false;
  // Hash both sides first so the comparison is always over equal lengths
  // and never leaks the password length through timing.
  const h = (v: string) =>
    createHmac("sha256", "smartervote-pw-compare").update(v).digest("hex");
  return safeEqual(h(input), h(s));
}

export async function isSignedIn(): Promise<boolean> {
  if (!adminEnabled()) return false;
  const jar = await cookies();
  const v = jar.get(COOKIE)?.value;
  if (!v) return false;
  try {
    return safeEqual(v, sessionToken());
  } catch {
    return false;
  }
}

export async function signIn(): Promise<void> {
  const jar = await cookies();
  jar.set(COOKIE, sessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/admin",
    maxAge: MAX_AGE,
  });
}

export async function signOut(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE);
}

/** Throws unless the caller is an authenticated admin. Use in every action. */
export async function requireAdmin(): Promise<void> {
  if (!adminEnabled()) {
    throw new Error("Admin is not enabled in this environment.");
  }
  if (!(await isSignedIn())) {
    throw new Error("Not signed in.");
  }
}
