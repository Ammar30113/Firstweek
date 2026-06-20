import type { MetadataRoute } from "next";

const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${base}/`, priority: 1 },
    { url: `${base}/story`, priority: 0.8 },
    { url: `${base}/login`, priority: 0.5 },
  ];
}
