import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  isQuebecPage,
  LOCALE_COOKIE,
  localeFromPath,
  localePrefix,
  NON_DEFAULT_LOCALES,
  type Locale,
} from "@/lib/i18n";

/**
 * Locale routing (decision D1: English keeps today's URLs; every other
 * language lives under its own prefix). Admin is excluded — an English-only tool.
 *
 * - /<locale>/* passes through and sets the sv-locale cookie.
 * - English path + sv-locale=<non-English> cookie → redirect to /<locale><path>
 *   (the remembered choice wins over a bare link).
 * - English path + no cookie + Quebec page → redirect to /fr<path>
 *   (decision D4: French default on Quebec riding pages, first visit only.
 *   No first-visit default exists for the other locales.)
 * - Everything else passes through untouched.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const locale = localeFromPath(pathname);
  const cookieLocale = request.cookies.get(LOCALE_COOKIE)?.value;

  if (locale !== "en") {
    const res = NextResponse.next();
    if (cookieLocale !== locale) {
      res.cookies.set(LOCALE_COOKIE, locale, { path: "/", maxAge: 31536000 });
    }
    return res;
  }

  // "/en/..." is not a route — English keeps today's bare URLs. A stale
  // /en/ link must land on the English page (and set the cookie to en,
  // so it acts as a working "switch to English" escape hatch), not get
  // a locale prefix prepended into a /fr/en/... 404.
  if (pathname === "/en" || pathname.startsWith("/en/")) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.slice(3) || "/";
    const res = NextResponse.redirect(url);
    res.cookies.set(LOCALE_COOKIE, "en", { path: "/", maxAge: 31536000 });
    return res;
  }

  // The French default (D4) is a FIRST-visit default, not a veto: it
  // applies only when no language choice is remembered. An explicit
  // sv-locale=en cookie must win, or the switcher's EN option and /en/
  // links can never leave a Quebec page — the old condition redirected
  // to /fr on every Quebec-page visit regardless of the cookie.
  // A remembered non-English choice redirects the same way, so a bare
  // link never drops a reader out of the language they picked. The
  // cookie is untrusted input — only a known locale prefix redirects.
  const remembered =
    cookieLocale &&
    (NON_DEFAULT_LOCALES as readonly string[]).includes(cookieLocale)
      ? (cookieLocale as Locale)
      : null;
  if (remembered || (!cookieLocale && isQuebecPage(pathname))) {
    const prefix = localePrefix(remembered ?? "fr");
    const url = request.nextUrl.clone();
    url.pathname = pathname === "/" ? prefix : `${prefix}${pathname}`;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|admin|_next|.*\\..*).*)"],
};
