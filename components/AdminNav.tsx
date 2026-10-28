import { logoutAction } from "@/app/admin/actions";

export type AdminNavCurrent = "review" | "import" | "corrections" | "submissions";

/**
 * Shared admin navigation, top right of every post-auth admin screen.
 * Added Oct 28, 2026: before this, only the main review page linked to
 * Import/Corrections, and the import/corrections screens only linked
 * back to /admin — there was no way to go back and forth between
 * sections. Deliberately NOT rendered on the login/gate screen
 * (pre-auth, nothing to navigate between).
 */
export default function AdminNav({ current }: { current: AdminNavCurrent }) {
  const links: { href: string; label: string; key: AdminNavCurrent }[] = [
    { href: "/admin", label: "Awaiting review", key: "review" },
    { href: "/admin/import", label: "Import", key: "import" },
    { href: "/admin/corrections", label: "Corrections", key: "corrections" },
    { href: "/admin/submissions", label: "Submissions", key: "submissions" },
  ];
  return (
    <div className="flex flex-wrap gap-2">
      {links.map((l) => (
        <a
          key={l.key}
          href={l.href}
          className={`tap-target rounded-md px-3 py-2 text-sm no-underline ${
            current === l.key
              ? "bg-accent text-white"
              : "border border-paper-edge text-ink"
          }`}
        >
          {l.label}
        </a>
      ))}
      <form action={logoutAction}>
        <button className="tap-target rounded-md border border-paper-edge px-3 py-2 text-sm">
          Sign out
        </button>
      </form>
    </div>
  );
}
