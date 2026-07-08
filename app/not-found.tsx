import Link from "next/link";

/**
 * Filet de secours pour un segment de langue invalide (ex: /xx/...), déclenché
 * AVANT que app/[lang]/layout.tsx ait pu rendre son <html>/<body> — ce fichier
 * doit donc fournir le sien, minimal, sans dépendre du LocaleProvider.
 */
export default function RootNotFound() {
  return (
    <html lang="fr">
      <body style={{ fontFamily: "system-ui, sans-serif" }}>
        <main
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            padding: "2rem",
          }}
        >
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800 }}>Page introuvable</h1>
          <p style={{ marginTop: "1rem", color: "#666" }}>
            Page not found.
          </p>
          <Link
            href="/"
            style={{
              marginTop: "2rem",
              padding: "0.75rem 1.5rem",
              borderRadius: "999px",
              background: "#e8402f",
              color: "white",
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            Escapade →
          </Link>
        </main>
      </body>
    </html>
  );
}
