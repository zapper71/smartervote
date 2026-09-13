import type { Metadata } from "next";
import RaceCard from "@/components/RaceCard";
import UnavailableNotice from "@/components/UnavailableNotice";
import { getRacesWithCandidates } from "@/lib/queries";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "All races",
  description:
    "Every race on the Town of Huntsville 2026 ballot: mayor, District and Town councillors, ward councillors and school board trustees.",
};

export default async function RacesPage() {
  const races = await getRacesWithCandidates();

  if (races.length === 0) {
    return <UnavailableNotice what="The list of races" />;
  }

  return (
    <div>
      <h1 className="text-3xl">Everything on the Huntsville ballot</h1>
      <p className="prose-civic mt-3">
        Every Huntsville elector votes for Mayor, for three District and Town Councillors,
        for their own ward councillor, and for a school board trustee. That&rsquo;s four
        separate decisions on one ballot.
      </p>

      <ul className="mt-8 grid gap-4 sm:grid-cols-2">
        {races.map((race) => (
          <RaceCard key={race.id} race={race} />
        ))}
      </ul>
    </div>
  );
}
