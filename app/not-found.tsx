import Link from "next/link";
import { cookies } from "next/headers";
import { getUiStrings } from "@/lib/queries";
import { localizePath, parseLocale, type Locale } from "@/lib/i18n";

/**
 * 404 page. It has no route locale of its own — notFound() can fire from
 * any page — so the locale comes from the sv-locale cookie the
 * middleware sets on every response. A first visit to /fr/404 with no
 * cookie yet falls back to English.
 */
export default async function NotFound() {
  const cookieLocale = (await cookies()).get("sv-locale")?.value;
  const locale: Locale = parseLocale(cookieLocale);
  const s = await getUiStrings(locale, {
    "notfound.title": "Page not found",
    "notfound.body":
      "That page doesn’t exist. It may have been a mistyped address, or something that moved.",
    "notfound.find_link": "Find your municipality or district",
  });
  return (
    <div className="prose-civic">
      <h1 className="text-3xl text-ink">{s["notfound.title"]}</h1>
      <p className="mt-4">{s["notfound.body"]}</p>
      <ul className="mt-4">
        <li>
          <Link href={localizePath("/", locale)} className="link">
            {s["notfound.find_link"]}
          </Link>
        </li>
      </ul>
    </div>
  );
}
