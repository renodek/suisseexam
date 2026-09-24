import React, { useState } from "react";
import { Button } from "../buttons/Button.jsx";
import { Icon } from "../icons/Icon.jsx";

const FIELDS = [
  { name: "nom", label: "Nom Complet", type: "text" },
  { name: "email", label: "E-mail", type: "email" },
  { name: "tel", label: "Téléphone", type: "tel" },
  { name: "message", label: "Comment pouvons-nous vous aider ?", type: "textarea" },
];

export function ContactForm({ mobile = false, onSubmit, showReassurance = true, style }) {
  const [sent, setSent] = useState(false);
  const [focus, setFocus] = useState(null);
  const field = { width: "100%", boxSizing: "border-box", background: "#24282e", color: "#ffffff", border: "1px solid #666666", borderRadius: 5, padding: 5, fontFamily: "Lato, sans-serif", fontSize: 16, lineHeight: "24px", outline: "none" };
  return (
    <div style={{ width: mobile ? "100%" : "70%", margin: "0 auto", display: "flex", flexDirection: "column", alignItems: "center", gap: 20, ...style }}>
      <div style={{ width: "100%", position: "relative", background: "radial-gradient(circle at 50% 0%, rgba(0, 103, 177, 0.15) 0%, rgba(0, 103, 177, 0.05) 40%, transparent 80%)" }}>
      <form onSubmit={(e) => { e.preventDefault(); setSent(true); onSubmit && onSubmit(); }}
        style={{ width: "100%", boxSizing: "border-box", padding: 30, borderRadius: 15, border: "3px solid #333333", display: "flex", flexDirection: "column" }}>
        {FIELDS.map((f) => (
          <label key={f.name} style={{ display: "block", fontFamily: "Lato, sans-serif", fontSize: 14, color: "#ffffff", textAlign: "left" }}>
            {f.label}
            <span style={{ display: "flex", marginTop: mobile ? 5 : 10, marginBottom: 20 }}>
              {f.type === "textarea" ? <textarea rows={10} onFocus={() => setFocus(f.name)} onBlur={() => setFocus(null)} style={{ ...field, resize: "vertical", borderColor: focus === f.name ? "#333333" : "#666666" }} /> : <input type={f.type} onFocus={() => setFocus(f.name)} onBlur={() => setFocus(null)} style={{ ...field, borderColor: focus === f.name ? "#333333" : "#666666" }} />}
            </span>
          </label>
        ))}
        <div style={{ display: "flex", justifyContent: "center" }}>
          <Button variant="submit" style={mobile ? { width: "100%" } : undefined}>{sent ? "Envoyé" : "Envoyer"}</Button>
        </div>
      </form>
      </div>
      {showReassurance && !mobile && (
        <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 20, fontFamily: "Lato, sans-serif", fontSize: 16, color: "#7e8da3" }}>
          {["Sans engagement", "Réponse sous 24h", "Audit personnalisé"].map((t) => (
            <li key={t} style={{ display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" }}><Icon name="fas-check" size={14} color="#7e8da3" />{t}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
