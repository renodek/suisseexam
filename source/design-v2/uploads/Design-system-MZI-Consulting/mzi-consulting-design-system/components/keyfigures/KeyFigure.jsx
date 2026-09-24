import React from "react";

export function KeyFigure({ value, label, style }) {
  return (
    <div style={{ textAlign: "center", ...style }}>
      <div style={{ fontFamily: "Lato, sans-serif", fontSize: 35, fontWeight: 600, lineHeight: "42px", color: "#ffffff" }}>{value}</div>
      <div style={{ fontFamily: "Lato, sans-serif", fontSize: 18, fontWeight: 400, lineHeight: "27px", color: "#7e8da3" }}>{label}</div>
    </div>
  );
}
