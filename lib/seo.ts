import type { Metadata } from "next";

const BASE_URL = "https://videodrop.app";

/**
 * Generate full SEO metadata for a tool page.
 * Includes title, description, keywords, Open Graph, Twitter Card, and canonical URL.
 */
export function toolMeta(
  path: string,
  title: string,
  description: string,
  keywords: string[]
): Metadata {
  const url = `${BASE_URL}${path}`;
  const fullKeywords = [
    ...keywords,
    "free",
    "online",
    "no upload",
    "browser-based",
    "private",
    "VideoDrop",
  ];

  return {
    title,
    description,
    keywords: fullKeywords,
    openGraph: {
      title,
      description,
      url,
      siteName: "VideoDrop",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    alternates: {
      canonical: url,
    },
  };
}
