import { ImageResponse } from "next/og";

/**
 * Icône PWA 192x192 référencée par app/manifest.ts. Route dédiée (plutôt que
 * la convention icon.tsx qui ne gère qu'une taille par défaut côté favicon)
 * pour garder une URL stable et prévisible dans le manifest.
 */
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
          fontSize: 104,
        }}
      >
        E
      </div>
    ),
    { width: 192, height: 192 }
  );
}
