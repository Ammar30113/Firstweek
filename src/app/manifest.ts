import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "FirstWeek — Simulate the job before you apply",
    short_name: "FirstWeek",
    description:
      "Do the real work a job involves before you apply, and get an honest readiness report.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#fafaf9",
    theme_color: "#c8472a",
    icons: [
      { src: "/icon", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon", sizes: "512x512", type: "image/png", purpose: "maskable" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
