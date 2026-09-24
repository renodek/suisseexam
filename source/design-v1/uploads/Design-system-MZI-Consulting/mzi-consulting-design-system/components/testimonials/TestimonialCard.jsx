import React from "react";
import { Icon } from "../icons/Icon.jsx";

export function TestimonialCard({ quote, author, rating = "5/5", featured = false, style }) {
  return (
    <div style={{ background: "#0f1526", borderRadius: 15, padding: featured ? 50 : 21, display: "flex", flexDirection: "column", gap: 20, boxSizing: "border-box", ...style }}>
      <div style={{ display: "flex", alignItems: "center", gap: 2, color: "#f5b401" }}>
        {[0, 1, 2, 3, 4].map((i) => <span key={i} style={{ display: "inline-flex", paddingInlineEnd: 5 }}><Icon name="fas-star" size={14} /></span>)}
        {rating && <span style={{ fontFamily: "Outfit, sans-serif", fontSize: 15, color: "#7e8da3" }}>{rating}</span>}
      </div>
      <p style={{ margin: 0, fontFamily: "Outfit, sans-serif", fontWeight: 300, fontSize: featured ? 30 : 16, lineHeight: featured ? "32px" : "26px", color: "#ffffff" }}>
        {quote}<br /><br />{author}
      </p>
    </div>
  );
}
