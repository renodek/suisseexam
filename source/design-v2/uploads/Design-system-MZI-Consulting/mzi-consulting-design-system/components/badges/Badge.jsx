import React, { useState } from "react";
import { Icon } from "../icons/Icon.jsx";

export function Badge({ variant = "hero", children, icon, forceState, style }) {
  const [hover, setHover] = useState(false);
  const h = forceState ? forceState === "hover" : hover;
  const common = { display: "inline-flex", alignItems: "center", gap: 5, color: "#10d7fd", fontFamily: "Lato, sans-serif", fontSize: 16, fontWeight: 600, lineHeight: "16px", whiteSpace: "nowrap", borderStyle: "solid", borderWidth: 1, boxSizing: "border-box", transition: "background .3s" };
  const s = variant === "hero"
    ? { ...common, borderColor: "#7e8da3", borderRadius: 50, padding: "5px 15px", background: h ? "#ffffff1a" : "transparent" }
    : { ...common, borderColor: "#333333", borderRadius: 23, padding: "5px 20px", background: h ? "#ffffff2e" : "transparent" };
  const iconName = icon === undefined && variant === "hero" ? "fas-brain" : icon;
  return (
    <span style={{ ...s, ...style }} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      {iconName && <Icon name={iconName} size="1em" />}
      <span>{children}</span>
    </span>
  );
}
