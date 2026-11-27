import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isQuebecPage, LOCALE_COOKIE, localeFromPath } from "@/lib/i18n";

/**
 * Locale routing (decision D1: English keeps today's URLs, French under
 * /fr/…). Admin is excluded — an English-only tool.
 *
 * - /fr/* passes through and sets the sv-locale=fr cookie.
 * - English path + sv-locale=fr cookie → redirect to /fr<path>.
 * - English path + no cookie + Quebec page → redirect to /fr<path>
 *   (decision D4: French default on Quebec riding pages).
 * - Everything else passes through untouched.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const locale = localeFromPath(pathname);
  const cookieLocale = request.cookies.get(LOCALE_COOKIE)?.value;

  if (locale === "fr") {
    const res = NextResponse.next();
    if (cookieLocale !== "fr") {
      res.cookies.set(LOCALE_COOKIE, "fr", { path: "/", maxAge: 31536000 });
    }
    return res;
  }

  if (cookieLocale === "fr" || isQuebecPage(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = pathname === "/" ? "/fr" : `/fr${pathname}`;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|admin|_next|.*\\..*).*)"],
};
