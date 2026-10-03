import type { Metadata } from "next";
import { adminEnabled, isSignedIn } from "@/lib/admin-auth";
import { AdminDisabled, AdminLogin } from "../gate";
import { ImportForm } from "./form";

export const metadata: Metadata = {
  title: "Import JSON",
  robots: { index: false, follow: false, nocache: true },
};
export const dynamic = "force-dynamic";

export default async function ImportPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const sp = await searchParams;

  if (!adminEnabled()) return <AdminDisabled />;
  if (!(await isSignedIn()))
    return <AdminLogin error={sp.error === "1"} next="/admin/import" />;

  return (
    <div>
      <h1 className="text-3xl">Import</h1>
      <p className="mt-1 max-w-2xl text-sm text-ink-soft">
        Paste staged content as JSON. Every row lands in the review queue as{" "}
        <em>in review</em> — nothing here publishes anything. Duplicates are
        skipped, not overwritten, and every problem is reported below instead of
        failing silently.
      </p>
      <ImportForm />
    </div>
  );
}
