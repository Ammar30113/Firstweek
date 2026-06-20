import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
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
          gap: 12,
          paddingBottom: 50,
        }}
      >
        <div style={{ width: 22, height: 38, background: "#ffffff", borderRadius: 6 }} />
        <div style={{ width: 22, height: 64, background: "#ffffff", borderRadius: 6 }} />
        <div style={{ width: 22, height: 90, background: "#ffffff", borderRadius: 6 }} />
      </div>
    ),
    { ...size }
  );
}
