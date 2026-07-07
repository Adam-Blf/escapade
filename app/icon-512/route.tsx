import { ImageResponse } from "next/og";

/** Icône PWA 512x512, voir app/icon-192/route.tsx pour le rationnel. */
export async function GET() {
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
          fontSize: 280,
        }}
      >
        E
      </div>
    ),
    { width: 512, height: 512 }
  );
}
