import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// Apple touch icon — same "Day One" calendar as icon.tsx, scaled to 180px.
export default function AppleIcon() {
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
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: 130,
            height: 130,
            borderRadius: 22,
            overflow: "hidden",
            boxShadow: "0 0 30px 8px rgba(243,200,122,0.15)",
          }}
        >
          {/* Gradient header */}
          <div
            style={{
              display: "flex",
              height: 34,
              background: "linear-gradient(100deg, #f3c87a 0%, #e6a85a 30%, #e67d57 60%, #c8472a 100%)",
            }}
          />
          {/* Body */}
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
                fontSize: 64,
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
