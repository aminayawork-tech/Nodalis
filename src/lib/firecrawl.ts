export interface ScrapedSource {
  url: string;
  title: string;
  content: string;
}

const FIRECRAWL_BASE = "https://api.firecrawl.dev/v1";

function apiKey(): string | undefined {
  return process.env.FIRECRAWL_API_KEY || undefined;
}

export function hasFirecrawl(): boolean {
  return Boolean(apiKey());
}

// Searches the web for `query` and returns scraped page content for each hit.
// Returns [] (rather than throwing) when no API key is configured, so the
// synthesis pipeline can still run in a degraded, sources-less mode.
export async function firecrawlSearch(
  query: string,
  limit = 6
): Promise<ScrapedSource[]> {
  const key = apiKey();
  if (!key) return [];

  const res = await fetch(`${FIRECRAWL_BASE}/search`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query,
      limit,
      scrapeOptions: { formats: ["markdown"] },
    }),
  });

  if (!res.ok) {
    console.error(`Firecrawl search failed (${res.status}): ${await res.text()}`);
    return [];
  }

  const json = await res.json();
  const results: unknown[] = json?.data ?? [];

  return results
    .map((r): ScrapedSource | null => {
      const item = r as Record<string, unknown>;
      const url = typeof item.url === "string" ? item.url : null;
      const content =
        typeof item.markdown === "string" ? item.markdown : null;
      if (!url || !content) return null;
      return {
        url,
        title: typeof item.title === "string" ? item.title : url,
        content: content.slice(0, 8000),
      };
    })
    .filter((s): s is ScrapedSource => s !== null);
}
