import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0e6d68",
          color: "#ffffff",
          fontFamily: "sans-serif",
          fontWeight: 700,
          fontSize: 18,
          borderRadius: 7,
        }}
      >
        E
      </div>
    ),
    { ...size }
  );
}
