const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Unix epoch seconds -> "May 18, 2026". */
export function formatDate(epochSeconds: number): string {
  const d = new Date(epochSeconds * 1000);
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}

/** Bare domain for display, e.g. "https://www.zsa.io/x" -> "zsa.io". */
export function domain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

/** Split the denormalized space-joined tag string into an array. */
export function splitTags(tags: string | null): string[] {
  return tags ? tags.split(" ").filter(Boolean) : [];
}
