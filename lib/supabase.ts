import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Two clients, deliberately separated.
 *
 * - getPublicClient() uses the publishable (formerly "anon") key. Row-level
 *   security applies. This is what every page render uses, so a bug in a
 *   query cannot leak an unpublished draft or a withdrawn candidate.
 *
 * - getServiceClient() uses the secret (formerly "service_role") key and
 *   BYPASSES row-level security entirely. Server-side writes only: the
 *   corrections inbox, the view counter, the admin review screen. It throws
 *   if anything tries to load it in the browser.
 *
 * KEY NAMING: Supabase is migrating from anon/service_role to
 * publishable/secret keys, and is deprecating the old pair at the end of
 * 2026. Both names are read here so the app works whichever your project
 * shows, and keeps working after the old keys are switched off.
 *
 * Note: each process.env.NEXT_PUBLIC_* reference must be written out in
 * full — Next.js inlines these literally at build time, so a dynamically
 * built key name would come back undefined in the browser.
 */

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;

const publicKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** True when the app has been given real credentials. */
export const isConfigured = Boolean(url && publicKey);

let publicClient: SupabaseClient | null = null;

export function getPublicClient(): SupabaseClient | null {
  if (!isConfigured) return null;
  if (!publicClient) {
    publicClient = createClient(url as string, publicKey as string, {
      auth: { persistSession: false },
    });
  }
  return publicClient;
}

let serviceClient: SupabaseClient | null = null;

export function getServiceClient(): SupabaseClient {
  if (typeof window !== "undefined") {
    throw new Error(
      "getServiceClient() was called in the browser. The secret key bypasses " +
        "row-level security and must never reach a client bundle."
    );
  }
  const secretKey =
    process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !secretKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or the secret key. Set " +
        "SUPABASE_SECRET_KEY (or the legacy SUPABASE_SERVICE_ROLE_KEY) in " +
        ".env.local and in the Vercel project's environment variables."
    );
  }
  if (!serviceClient) {
    serviceClient = createClient(url, secretKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return serviceClient;
}

/**
 * Human-readable reason the app can't reach the database. Used by the
 * diagnostic page so a misconfiguration is obvious instead of silent.
 * Never returns any part of a key.
 */
export function configProblem(): string | null {
  if (!url) return "NEXT_PUBLIC_SUPABASE_URL is not set.";

  const trimmed = url.trim();

  // By far the commonest mistake: pasting the dashboard address instead of
  // the API address. They look similar and the dashboard one is the one
  // you're staring at when you go looking. Name it explicitly.
  const dashboard = trimmed.match(
    /supabase\.com\/dashboard\/project\/([a-z0-9]+)/i
  );
  if (dashboard) {
    return `That's the DASHBOARD address, not the API address. You want the project ref with .supabase.co on the end. Based on what you pasted, yours is almost certainly: https://${dashboard[1]}.supabase.co`;
  }

  if (trimmed !== url) {
    return "NEXT_PUBLIC_SUPABASE_URL has a space or line break around it. Remove it.";
  }
  if (/^["'].*["']$/.test(trimmed)) {
    return "NEXT_PUBLIC_SUPABASE_URL is wrapped in quotes. Remove them — .env files don't need them.";
  }
  if (trimmed.endsWith("/")) {
    return `NEXT_PUBLIC_SUPABASE_URL has a trailing slash: "${trimmed}". Remove it.`;
  }
  if (trimmed.startsWith("http://")) {
    return "NEXT_PUBLIC_SUPABASE_URL starts with http:// — it must be https://.";
  }
  if (/\/rest\/v1/.test(trimmed)) {
    return `NEXT_PUBLIC_SUPABASE_URL includes /rest/v1. Drop that part — you want just https://your-ref.supabase.co.`;
  }
  if (!/^https:\/\/[a-z0-9-]+\.supabase\.(co|in)$/i.test(trimmed)) {
    return `NEXT_PUBLIC_SUPABASE_URL doesn't look right: "${url}". It should look like https://abcdefgh.supabase.co — nothing before the ref, nothing after .co.`;
  }
  if (!publicKey) {
    return "No public key set. Add NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (or the legacy NEXT_PUBLIC_SUPABASE_ANON_KEY).";
  }
  if (publicKey.trim() !== publicKey) {
    return "The public key has a space or line break around it. Remove it.";
  }
  if (publicKey.startsWith("sb_secret_")) {
    return "You've pasted the SECRET key where the publishable key belongs. Swap them — and rotate that secret key in Supabase, because it may now be in your browser bundle.";
  }
  return null;
}
