import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const alt = "FirstWeek — Simulate the job before you apply";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Branded social share card (dark cinematic). Reads a bundled WOFF straight from
// disk (prerendered at build), so there's no network/font fetch at runtime.
export default async function OpengraphImage() {
  const font = readFileSync(join(process.cwd(), "src", "app", "og-font.woff"));

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          padding: 80,
          justifyContent: "space-between",
          backgroundColor: "#160d07",
          backgroundImage:
            "radial-gradient(circle at 18% 8%, rgba(200,71,42,0.45), transparent 42%), radial-gradient(circle at 92% 95%, rgba(230,168,90,0.22), transparent 45%)",
          color: "#ffffff",
          fontFamily: "Jakarta",
        }}
      >
        {/* wordmark */}
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 54 }}>
            <div style={{ width: 16, height: 26, backgroundColor: "#f3c87a", borderRadius: 5 }} />
            <div style={{ width: 16, height: 40, backgroundColor: "#e67d57", borderRadius: 5 }} />
            <div style={{ width: 16, height: 54, backgroundColor: "#c8472a", borderRadius: 5 }} />
          </div>
          <div style={{ fontSize: 36 }}>FirstWeek</div>
        </div>

        {/* headline */}
        <div style={{ display: "flex", flexDirection: "column", letterSpacing: -2 }}>
          <div style={{ display: "flex", gap: 22, fontSize: 78, lineHeight: 1.05 }}>
            <span>Do the</span>
            <span style={{ color: "#e6a85a" }}>real work</span>
          </div>
          <div style={{ fontSize: 78, lineHeight: 1.05 }}>before you get the job.</div>
          <div style={{ fontSize: 33, color: "#a8a29e", marginTop: 30, letterSpacing: 0 }}>
            Simulate the job before you apply. Get an honest readiness report.
          </div>
        </div>

        {/* footer */}
        <div style={{ fontSize: 27, color: "#8a7d70" }}>firstweekapp.vercel.app</div>
      </div>
    ),
    { ...size, fonts: [{ name: "Jakarta", data: font, weight: 700, style: "normal" }] },
  );
}
