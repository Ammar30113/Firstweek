import type { MetadataRoute } from "next";

const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/guides", "/pricing", "/story", "/support", "/privacy", "/terms", "/login"],
        disallow: ["/dashboard", "/assessment/", "/api/"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
