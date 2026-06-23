import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

// "Day One" calendar mark — gold-to-terracotta gradient header, serif "1"
// on espresso dark. Matches the cinematic UI design system.
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          background: "#140c06",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Calendar shape */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: 340,
            height: 340,
            borderRadius: 52,
            overflow: "hidden",
            boxShadow: "0 0 80px 20px rgba(243,200,122,0.18), 0 0 160px 40px rgba(200,71,42,0.12)",
          }}
        >
          {/* Gradient header stripe */}
          <div
            style={{
              display: "flex",
              height: 90,
              background: "linear-gradient(100deg, #f3c87a 0%, #e6a85a 30%, #e67d57 60%, #c8472a 100%)",
            }}
          />
          {/* Dark body with "1" */}
          <div
            style={{
              display: "flex",
              flex: 1,
              background: "#1b110a",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span
              style={{
                fontSize: 180,
                fontWeight: 700,
                color: "#faf4ec",
                fontFamily: "Georgia, serif",
                lineHeight: 1,
              }}
            >
              1
            </span>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
