/**
 * En-tête minimal des guides de démo :
 *
 *   ---
 *   title: Docker Compose en pratique
 *   slug: docker-compose-en-pratique
 *   tech: docker
 *   ---
 */
export function parseFrontMatter(text: string): { data: Record<string, string>; body: string } {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  if (lines[0]?.trim() !== "---") throw new Error("Missing front matter (first line must be ---)");
  const end = lines.indexOf("---", 1);
  if (end === -1) throw new Error("Unterminated front matter (closing --- not found)");

  const data: Record<string, string> = {};
  for (const line of lines.slice(1, end)) {
    const colon = line.indexOf(":");
    if (colon === -1) continue;
    data[line.slice(0, colon).trim()] = line.slice(colon + 1).trim();
  }
  return { data, body: lines.slice(end + 1).join("\n").trim() };
}
