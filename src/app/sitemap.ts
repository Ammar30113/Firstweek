import type { MetadataRoute } from "next";
import { GUIDES } from "@/data/guides";

const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${base}/`, priority: 1 },
    { url: `${base}/guides`, priority: 0.9 },
    { url: `${base}/pricing`, priority: 0.8 },
    { url: `${base}/story`, priority: 0.8 },
    { url: `${base}/support`, priority: 0.5 },
    { url: `${base}/login`, priority: 0.5 },
    { url: `${base}/privacy`, priority: 0.3 },
    { url: `${base}/terms`, priority: 0.3 },
    ...GUIDES.map((g) => ({
      url: `${base}/guides/${g.slug}`,
      lastModified: g.datePublished,
      priority: 0.7,
    })),
  ];
}
