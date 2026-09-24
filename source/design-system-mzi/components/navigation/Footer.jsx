import React from "react";

const LEGAL = [["Mentions légales", "https://mzi-consulting.com/mention-legale/"], ["Politique de confidentialité", "https://mzi-consulting.com/politique-de-confidentialite/"], ["Politique de cookies", "https://mzi-consulting.com/politique-de-cookies-ue/"]];

export function Footer({ mobile = false, style }) {
  const t = { fontFamily: "Lato, sans-serif", fontSize: 13, fontWeight: 400, color: "#7e8da3" };
  return (
    <footer style={{ background: "#0c0f14", ...style }}>
      <div style={{ maxWidth: 1140, margin: "0 auto", padding: "50px 20px 10px", boxSizing: "border-box", display: "flex", flexDirection: mobile ? "column" : "row", alignItems: "center", gap: mobile ? 8 : 0 }}>
        <div style={{ ...t, flex: mobile ? "none" : "0 0 50%", textAlign: mobile ? "center" : "left" }}>Agence IA à Annemasse | Haute-Savoie, France</div>
        <div style={{ ...t, flex: mobile ? "none" : "0 0 50%", textAlign: mobile ? "center" : "right" }}>© 2026 MZI Consulting - Tous droits réservés</div>
      </div>
      <div style={{ maxWidth: 1140, margin: "0 auto", padding: "50px 20px 10px", boxSizing: "border-box", display: "flex", justifyContent: "center", flexWrap: "wrap" }}>
        {LEGAL.map(([l, h], i) => (
          <a key={l} href={h} style={{ ...t, textDecoration: "none", whiteSpace: "nowrap", padding: "0 8px", borderLeft: i ? "1px solid #dddddd2e" : "none" }}>{l}</a>
        ))}
      </div>
    </footer>
  );
}
