export type BiPublishedUpdate = {
  id: string;
  title: string;
  excerpt: string;
  url: string;
  publishedAt: string;
  imageUrl?: string;
};

type BiPublishingFeed = {
  version: 1;
  items: BiPublishedUpdate[];
};

const DEFAULT_BI_PUBLISH_FEED_URL =
  "https://raw.githubusercontent.com/alwhite524/beaumont-intelligence/main/docs/publishing/mbf-feed.json";

const isHttpUrl = (value: unknown): value is string => {
  if (typeof value !== "string") return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
};

const isPublishedUpdate = (value: unknown): value is BiPublishedUpdate => {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.id === "string" &&
    typeof item.title === "string" &&
    typeof item.excerpt === "string" &&
    isHttpUrl(item.url) &&
    typeof item.publishedAt === "string" &&
    !Number.isNaN(Date.parse(item.publishedAt)) &&
    (item.imageUrl === undefined || isHttpUrl(item.imageUrl))
  );
};

export async function getBiPublishedUpdates(
  limit = 3,
): Promise<BiPublishedUpdate[]> {
  const feedUrl =
    process.env.BI_PUBLISH_FEED_URL ?? DEFAULT_BI_PUBLISH_FEED_URL;
  if (!isHttpUrl(feedUrl)) throw new Error("BI_PUBLISH_FEED_URL must be an HTTP(S) URL.");

  const headers = new Headers({ accept: "application/json" });
  const token = process.env.BI_PUBLISH_FEED_TOKEN;
  if (token) headers.set("authorization", `Bearer ${token}`);

  const response = await fetch(feedUrl, { headers, cache: "no-store" });
  if (!response.ok) {
    throw new Error(`BI publishing feed returned HTTP ${response.status}.`);
  }

  const feed = (await response.json()) as Partial<BiPublishingFeed>;
  if (feed.version !== 1 || !Array.isArray(feed.items)) {
    throw new Error("BI publishing feed does not match contract version 1.");
  }

  return feed.items
    .filter(isPublishedUpdate)
    .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt))
    .slice(0, Math.max(0, limit));
}
