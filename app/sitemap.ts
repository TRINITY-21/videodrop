import type { MetadataRoute } from "next";

const BASE_URL = "https://videodrop.app";

const tools = [
  "/compress",
  "/convert",
  "/trim",
  "/gif",
  "/resize",
  "/speed",
  "/rotate",
  "/remove-audio",
  "/extract-audio",
  "/merge",
  "/crop",
  "/frames",
  "/filters",
  "/batch",
  "/reverse",
  "/loop",
  "/flip",
  "/boomerang",
  "/watermark",
  "/fade",
  "/volume",
  "/replace-audio",
  "/split",
  "/subtitles",
  "/pip",
  "/background-music",
  "/webp",
  "/aspect-ratio",
  "/sharpen",
  "/denoise",
  "/chroma-key",
  "/thumbnail",
  "/timelapse",
  "/split-screen",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    {
      url: BASE_URL,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${BASE_URL}/tools`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    ...tools.map((tool) => ({
      url: `${BASE_URL}${tool}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
