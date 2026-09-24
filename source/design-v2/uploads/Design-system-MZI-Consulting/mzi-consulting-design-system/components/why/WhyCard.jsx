import React, { useState } from "react";
import { Icon } from "../icons/Icon.jsx";

export function WhyCard({ icon, title, description, forceState, style }) {
  const [h, setH] = useState(false);
  const hov = forceState ? forceState === "hover" : h;
  return (
    <div onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ padding: 20, border: "1px solid #7e8da361", borderRadius: 10, boxSizing: "border-box", display: "flex", alignItems: "center", gap: 15, textAlign: "start", position: "relative", overflow: "hidden",
        transition: "all 0.5s cubic-bezier(0.23, 1, 0.32, 1)", background: hov ? "rgba(0, 103, 177, 0.05)" : "transparent",
        boxShadow: hov ? "inset 0 0 20px rgba(0, 103, 177, 0.1), 0 10px 30px rgba(0, 0, 0, 0.1)" : "none", backdropFilter: hov ? "blur(4px)" : "none", transform: hov ? "translateY(-5px)" : "none", ...style }}>
      <span style={{ display: "inline-flex", fontSize: 27, padding: ".5em", border: "3px solid #10d7fd", color: "#10d7fd", borderRadius: "10%", boxShadow: "0 0 15px 13px rgba(7, 105, 124, 0.6)", flexShrink: 0, transition: "transform 200ms", transform: hov ? "scale(1.1)" : "none" }}>
        <Icon name={icon} size="1em" />
      </span>
      <div style={{ minWidth: 0 }}>
        <h3 style={{ margin: "0 0 9px", fontFamily: "Lato, sans-serif", fontSize: 20, fontWeight: 600, lineHeight: 1.2, color: "#ffffff" }}>{title}</h3>
        <p style={{ margin: 0, fontFamily: "Lato, sans-serif", fontSize: 16, lineHeight: "24px", color: "#7e8da3" }}>{description}</p>
      </div>
    </div>
  );
}

const ITEMS = [
  ["fas-asterisk", "Expert certifié", "Formation approfondie et certifications reconnues en intelligence artificielle et automatisation digitale."],
  ["fas-user-check", "Approche personnalisée", "Chaque audit est unique, adapté à votre secteur, vos objectifs et votre culture d'entreprise."],
  ["fas-bullseye", "Résultats concrets", "Nos recommandations sont actionnables immédiatement avec un impact mesurable et une valeur ajoutée réelle."],
  ["far-eye", "Vision business + technique", "Alliance rare entre compréhension business et maitrise technique d'IA."],
];

export function WhySection({ imageSrc = "assets/images/94833.jpg", mobile = false, style }) {
  return (
    <div style={{ width: "100%", display: "flex", flexDirection: mobile ? "column" : "row", alignItems: "center", gap: 30, padding: "50px 0", boxSizing: "border-box", ...style }}>
      <div style={{ flex: "1 1 0", minWidth: 0, width: mobile ? "100%" : "auto", display: "flex", flexDirection: "column", gap: 20 }}>
        {ITEMS.map(([i, t, d]) => <WhyCard key={t} icon={i} title={t} description={d} />)}
      </div>
      <div style={{ flex: "1 1 0", minWidth: 0, width: mobile ? "100%" : "auto" }}>
        <img src={imageSrc} alt="" style={{ width: "100%", height: "auto", display: "block" }} />
      </div>
    </div>
  );
}
