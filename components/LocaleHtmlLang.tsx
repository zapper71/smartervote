"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { localeFromPath, localeTag } from "@/lib/i18n";

/**
 * Sets <html lang> from the URL path. The root layout hardcodes
 * lang="en-CA"; this client component overrides it per path, because
 * reading the locale in the root layout would force every page dynamic
 * (and break the hourly ISR the Nov 6 egress fix depends on).
 */
export default function LocaleHtmlLang() {
  const pathname = usePathname();
  useEffect(() => {
    document.documentElement.lang = localeTag(localeFromPath(pathname));
  }, [pathname]);
  return null;
}
