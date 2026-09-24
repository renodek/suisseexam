import React, { useState } from "react";
import { Icon } from "../icons/Icon.jsx";

// variant "defi" = section « défis » ; variant "solution" = section « audit personnalisé » (même widget icon-box, réglages différents).
export function ChallengeCard({ variant = "defi", icon, title, description, align, forceState, style }) {
  const [hover, setHover] = useState(false);
  const [cardHover, setCardHover] = useState(false);
  const ch = forceState ? forceState === "hover" : cardHover;
  const sol = variant === "solution";
  const iconSize = sol ? 34 : 30;
  const textAlign = align || (sol ? "center" : "start");
  return (
    <div onMouseEnter={() => setCardHover(true)} onMouseLeave={() => setCardHover(false)}
      style={{ padding: 35, border: "1px solid #7e8da385", borderRadius: 10, boxSizing: "border-box", display: "flex", flexDirection: "column", gap: sol ? 22 : 24, textAlign, alignItems: textAlign === "center" ? "center" : "flex-start", position: "relative", overflow: "hidden",
        transition: "all 0.5s cubic-bezier(0.23, 1, 0.32, 1)",
        background: ch ? "rgba(0, 103, 177, 0.05)" : "transparent",
        boxShadow: ch ? "inset 0 0 20px rgba(0, 103, 177, 0.1), 0 10px 30px rgba(0, 0, 0, 0.1)" : "none",
        backdropFilter: ch ? "blur(4px)" : "none",
        transform: ch ? "translateY(-5px)" : "none", ...style }}>
      <span onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
        style={{ display: "inline-flex", fontSize: iconSize, padding: ".5em", border: "3px solid #10d7fd", color: "#10d7fd", borderRadius: sol ? "50%" : "10%", boxShadow: "0 0 15px 13px rgba(7, 105, 124, 0.6)", transition: "transform 200ms", transform: hover ? "scale(1.1)" : "none" }}>
        <Icon name={icon} size="1em" />
      </span>
      <div>
        <h3 style={{ margin: "0 0 6px", fontFamily: sol ? "Lato, sans-serif" : "Outfit, sans-serif", fontSize: 24, fontWeight: 600, lineHeight: 1.2, color: "#ffffff", overflowWrap: "anywhere", hyphens: "auto" }}>{title}</h3>
        <p style={{ margin: 0, fontFamily: "Lato, sans-serif", fontSize: 16, lineHeight: "24px", color: "#7e8da3" }}>{description}</p>
      </div>
    </div>
  );
}
