import React, { useState } from "react";
import { Button } from "../buttons/Button.jsx";
import { Icon } from "../icons/Icon.jsx";

const LINKS = [["Problèmes", "#probleme"], ["Solution", "#solution"], ["Méthodologie", "#methodologie"], ["Pourquoi nous", "#pourquoi"]];

export function NavBar({ logoSrc = "assets/logo/mzi-consulting-logo.png", mobile = false, links = LINKS, onContact, sticky = false, style }) {
  const [open, setOpen] = useState(false);
  const [hov, setHov] = useState(null);
  return (
    <header style={{ boxShadow: sticky ? "0 4px 12px rgba(0,0,0,0.1)" : "none", background: "#0c0f14", minHeight: 86, padding: mobile ? 5 : 10, boxSizing: "border-box", position: "relative", ...style }}>
      <div style={{ maxWidth: 1140, minHeight: mobile ? 76 : 66, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20 }}>
        <img src={logoSrc} alt="MZI Consulting" style={{ width: 100, display: "block" }} />
        {!mobile && (
          <nav style={{ display: "flex" }}>
            {links.map(([l, h]) => <a key={l} href={h} style={{ padding: "0 25px", color: "#ffffff", fontFamily: "Lato, sans-serif", fontWeight: 600, fontSize: 15, lineHeight: 1, textDecoration: "none", whiteSpace: "nowrap" }}>{l}</a>)}
          </nav>
        )}
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <Button variant="nav" onClick={onContact}>Contact</Button>
          {mobile && (
            <button onClick={() => setOpen(!open)} aria-label="Menu" style={{ background: "transparent", border: "none", color: "#10d7fd", padding: ".35em", cursor: "pointer", width: 50 }}>
              <Icon name="fas-align-justify" size={28} />
            </button>
          )}
        </div>
      </div>
      {mobile && open && (
        <nav style={{ background: "#0c0f14", border: "1px solid #7e8da3", marginTop: 5 }}>
          {links.map(([l, h], i) => (
            <a key={l} href={h} onClick={() => setOpen(false)} onMouseEnter={() => setHov(i)} onMouseLeave={() => setHov(null)}
              style={{ display: "block", padding: "25px 2px", color: hov === i ? "#10d7fd" : "#7e8da3", fontFamily: "Lato, sans-serif", fontWeight: 600, fontSize: 15, textAlign: "center", textDecoration: "none", borderBottom: i < links.length - 1 ? "1px solid #c4c4c4" : "none" }}>{l}</a>
          ))}
        </nav>
      )}
    </header>
  );
}
