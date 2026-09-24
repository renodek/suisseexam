import React from "react";
import { Icon } from "../icons/Icon.jsx";

// Widget « Timeline Widget Addon » 1.6.23, réglages de la section Méthodologie.
const STEPS = [
  { label: "Audit", icon: "fas-file-medical-alt", text: "Analyse approfondie de vos processus, outils, vos objectifs et de l'état de votre entreprise actuelle." },
  { label: "Stratégie IA", icon: "far-clock", text: "Élaboration d'une feuille de route IA personnalisée qui va répondre à vos objectifs business." },
  { label: "Implémentation", icon: "fas-rocket", text: "Mise en place des outils IA et des automatisations afin de transformer vos résultats en bénéfices concrets." },
  { label: "Optimisation", icon: "fas-rocket", text: "Suivi des performances, ajustements et itérations pour des résultats optimaux sur le long terme." },
];

function Dot() {
  return <span style={{ width: 12, height: 12, borderRadius: "50%", background: "#7e8da3", display: "block" }} />;
}

export function Timeline({ steps = STEPS, mobile = false, style }) {
  const ibx = 48;
  const labelSize = mobile ? 18 : 32;
  const box = (text, align) => (
    <div style={{ background: "#0c0f14", borderRadius: 6, padding: "0.75em 0.75em calc(0.75em - 10px)", boxShadow: "0px 2px 8px -2px rgba(0,0,0,.3)", fontFamily: "Lato, sans-serif", fontSize: 15, lineHeight: 1.6, color: "#7e8da3", textAlign: align, maxWidth: 340 }}>
      <p style={{ margin: "0 0 10px" }}>{text}</p>
    </div>
  );
  const label = (t, align) => <div style={{ fontFamily: "Outfit, sans-serif", fontWeight: 500, fontSize: labelSize, lineHeight: 1, color: "#ffffff", whiteSpace: "nowrap", textAlign: align }}>{t}</div>;
  const node = (icon) => (
    <span style={{ width: ibx, height: ibx, boxSizing: "border-box", borderRadius: "50%", border: "4px solid #7e8da3", background: "#0c0f14", color: "#10d7fd", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 15px 13px rgba(7, 105, 124, 0.6)", position: "relative", zIndex: 1, flexShrink: 0 }}>
      <Icon name={icon} size={20} />
    </span>
  );
  return (
    <div style={{ position: "relative", width: "100%", display: "flex", flexDirection: "column", alignItems: "center", ...style }}>
      <div style={{ position: "absolute", top: 6, bottom: 6, left: mobile ? ibx / 2 - 2 : "calc(50% - 2px)", width: 4, background: "#7e8da3" }} />
      <div style={{ alignSelf: mobile ? "flex-start" : "center", marginLeft: mobile ? ibx / 2 - 6 : 0 }}><Dot /></div>
      <div style={{ display: "flex", flexDirection: "column", gap: 60, width: "100%", padding: "40px 0" }}>
        {steps.map((s, i) => {
          const right = i % 2 === 0; // contenu à droite, libellé à gauche
          if (mobile) return (
            <div key={s.label} style={{ display: "grid", gridTemplateColumns: ibx + "px 1fr", gap: 20, alignItems: "start" }}>
              {node(s.icon)}
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>{label(s.label, "left")}{box(s.text, "left")}</div>
            </div>
          );
          return (
            <div key={s.label} style={{ display: "grid", gridTemplateColumns: "1fr " + ibx + "px 1fr", gap: 24, alignItems: "center" }}>
              <div style={{ display: "flex", justifyContent: "flex-end" }}>{right ? label(s.label, "right") : box(s.text, "right")}</div>
              {node(s.icon)}
              <div style={{ display: "flex", justifyContent: "flex-start" }}>{right ? box(s.text, "left") : label(s.label, "left")}</div>
            </div>
          );
        })}
      </div>
      <div style={{ alignSelf: mobile ? "flex-start" : "center", marginLeft: mobile ? ibx / 2 - 6 : 0 }}><Dot /></div>
    </div>
  );
}
