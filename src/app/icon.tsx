import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

// "Rising bars" mark on terracotta — readiness/growth. No text (no font needed).
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          background: "#c8472a",
          alignItems: "flex-end",
          justifyContent: "center",
          gap: 34,
          paddingBottom: 150,
        }}
      >
        <div style={{ width: 64, height: 110, background: "#ffffff", borderRadius: 18 }} />
        <div style={{ width: 64, height: 185, background: "#ffffff", borderRadius: 18 }} />
        <div style={{ width: 64, height: 260, background: "#ffffff", borderRadius: 18 }} />
      </div>
    ),
    { ...size }
  );
}
