"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Sets <html lang> from the URL path. The root layout hardcodes
 * lang="en-CA"; this client component overrides it per path, because
 * reading the locale in the root layout would force every page dynamic
 * (and break the hourly ISR the Nov 6 egress fix depends on).
 */
export default function LocaleHtmlLang() {
  const pathname = usePathname();
  useEffect(() => {
    const isFr = pathname === "/fr" || pathname.startsWith("/fr/");
    document.documentElement.lang = isFr ? "fr-CA" : "en-CA";
  }, [pathname]);
  return null;
}
