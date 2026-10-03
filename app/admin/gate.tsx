import { loginAction } from "./actions";

/**
 * The two states every /admin route starts in: the admin area is either
 * switched off in this environment, or the visitor hasn't signed in.
 *
 * Shared so /admin and /admin/import (and any future route) gate
 * identically. The login form carries a `next` field so a successful sign-in
 * returns to the page that asked for it.
 */

export function AdminDisabled() {
  return (
    <div className="prose-civic">
      <h1 className="text-3xl text-ink">Admin is off in this environment</h1>
      <p className="mt-4">
        No <code className="rounded bg-paper-warm px-1">ADMIN_PASSWORD</code> is set, so
        there is no admin area here at all — not a locked door, no door.
      </p>
      <p>
        This is the intended default for production. Review positions locally instead:
        set <code className="rounded bg-paper-warm px-1">ADMIN_PASSWORD</code> in your{" "}
        <code className="rounded bg-paper-warm px-1">.env.local</code>, restart{" "}
        <code className="rounded bg-paper-warm px-1">npm run dev</code>, and work against
        the same database. Nothing about publishing requires the admin area to be exposed
        on the internet.
      </p>
    </div>
  );
}

export function AdminLogin({ error, next }: { error: boolean; next: string }) {
  return (
    <div className="mx-auto max-w-sm">
      <h1 className="text-2xl">Review queue</h1>
      <p className="mt-2 text-sm text-ink-soft">Sign in to review drafts.</p>
      {error && (
        <p className="mt-4 rounded-md border border-flag/40 bg-flag-light px-3 py-2 text-sm text-ink">
          That password didn&rsquo;t match.
        </p>
      )}
      <form action={loginAction} className="mt-6 space-y-3">
        <input type="hidden" name="next" value={next} />
        <label htmlFor="password" className="block text-sm font-medium">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="w-full rounded-md border border-paper-edge px-3 py-2"
        />
        <button
          type="submit"
          className="tap-target w-full justify-center rounded-md bg-accent px-4 py-2.5 font-medium text-white"
        >
          Sign in
        </button>
      </form>
    </div>
  );
}
