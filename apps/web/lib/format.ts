/** L'API renvoie des dates UTC sans fuseau ("2026-09-28T22:15:40.125917"). */
export function parseApiDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const iso = /(?:[zZ]|[+-]\d{2}:?\d{2})$/.test(value) ? value : `${value}Z`;
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDate(value: string | null | undefined): string {
  const date = parseApiDate(value);
  if (!date) return "—";
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}

export function formatRelative(value: string | null | undefined, now: number = Date.now()): string {
  const date = parseApiDate(value);
  if (!date) return "—";
  const seconds = Math.round((now - date.getTime()) / 1000);
  if (seconds < 60) return "à l'instant";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `il y a ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "hier";
  if (days < 30) return `il y a ${days} j`;
  return formatDate(value);
}

/** Texte brut d'un contenu markdown, tronqué proprement. */
export function excerpt(text: string | null | undefined, max = 160): string {
  const plain = (text ?? "")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]*)`/g, "$1")
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1")
    // [ \t] et non \s : \s traverserait les sauts de ligne (backtracking catastrophique)
    .replace(/^[ \t]*\|?(?:[ \t]*:?-+:?[ \t]*\|)+[ \t]*:?-*:?[ \t]*$/gm, " ")
    .replace(/\|/g, " ")
    .replace(/^\s{0,3}(?:#{1,6}|>|[-*+]|\d+\.)\s+/gm, "")
    .replace(/[*_~]+/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (plain.length <= max) return plain;
  const cut = plain.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
}
