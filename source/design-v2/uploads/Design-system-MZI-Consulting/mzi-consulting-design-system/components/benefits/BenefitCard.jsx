import React from "react";

export function BenefitCard({ number, stat, title, description, first = false, mobile = false, style }) {
  return (
    <div style={{ border: "1px solid #333333", borderRadius: 15, padding: "35px 15px", boxShadow: first ? "0 0 10px 0 rgba(0,0,0,.5)" : "0 0 10px 0 rgba(42.5,40.56,40.56,.5)", display: "flex", flexDirection: "column", gap: 20, textAlign: "center", boxSizing: "border-box", ...style }}>
      <span style={{ fontFamily: "Outfit, sans-serif", fontSize: mobile ? 40 : 90, fontWeight: 800, lineHeight: 1, color: "#ffffff" }}>{number}</span>
      <p style={{ margin: "14px 0 0", fontFamily: "Outfit, sans-serif", fontSize: mobile ? 25 : 18, fontWeight: 800, color: "#10d7fd" }}>{stat}</p>
      <h3 style={{ margin: 0, fontFamily: "Outfit, sans-serif", fontSize: mobile ? 29 : 20, fontWeight: 600, color: "#ffffff" }}>{title}</h3>
      <p style={{ margin: 0, fontFamily: "Outfit, sans-serif", fontSize: 20, fontWeight: 400, lineHeight: "31px", color: "#9ca3af" }}>{description}</p>
    </div>
  );
}
