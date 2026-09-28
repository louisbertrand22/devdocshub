export const MAIN_NAV = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/docs", label: "Docs" },
  { href: "/notes", label: "Notes" },
  { href: "/collections", label: "Collections" },
] as const;

const SECTION_PREFIXES = ["/docs", "/notes", "/collections"] as const;

export function isActivePath(pathname: string | null, href: string): boolean {
  if (!pathname) return false;
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Routes qui ont une sidebar de section (et gèrent leur propre largeur). */
export function isSectionPath(pathname: string | null): boolean {
  return SECTION_PREFIXES.some((prefix) => isActivePath(pathname, prefix));
}
