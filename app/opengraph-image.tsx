import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          background: "#0c1a20",
          padding: "80px",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 28,
            fontWeight: 600,
            letterSpacing: 6,
            textTransform: "uppercase",
            color: "#2aa39b",
            marginBottom: 24,
          }}
        >
          Escapade
        </div>
        <div
          style={{
            fontSize: 76,
            fontWeight: 800,
            lineHeight: 1.05,
            color: "#e9efea",
            maxWidth: 900,
          }}
        >
          Dis ton envie. On sort le billet.
        </div>
        <div style={{ fontSize: 32, color: "#93a8ad", marginTop: 32 }}>
          Budget réel, seul(e) ou à deux.
        </div>
      </div>
    ),
    { ...size }
  );
}
