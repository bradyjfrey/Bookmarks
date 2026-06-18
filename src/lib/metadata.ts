import "server-only";

/** Best-effort fetch of a page's <title> and meta description. */
export async function fetchMetadata(
  url: string,
): Promise<{ title: string | null; description: string | null }> {
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 6000);
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { "User-Agent": "Mozilla/5.0 (compatible; BookmarksBot/1.0)" },
      redirect: "follow",
    });
    clearTimeout(timer);
    const html = (await res.text()).slice(0, 200_000);
    const decode = (s: string) =>
      s.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").trim();
    const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1];
    const desc =
      html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i)?.[1] ??
      html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']*)["']/i)?.[1];
    return { title: title ? decode(title) : null, description: desc ? decode(desc) : null };
  } catch {
    return { title: null, description: null };
  }
}
