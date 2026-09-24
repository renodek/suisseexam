import React, { useState } from "react";
import { Icon } from "../icons/Icon.jsx";

// Valeurs relevées dans les CSS Elementor de mzi-consulting.com.
const BASE = { display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "pointer", textDecoration: "none", whiteSpace: "nowrap", lineHeight: 1, boxSizing: "border-box", transition: "all .3s", border: "none" };

const VARIANTS = {
  primary: {
    normal: { background: "#10d7fd", color: "#0c0f14", fontFamily: "Outfit, sans-serif", fontWeight: 500, fontSize: 20, borderRadius: 50, padding: 20, gap: 20 },
    hover: { background: "#09c6eb", color: "#ffffff", boxShadow: "0 0 10px 0 rgba(255,255,255,.5)" },
  },
  secondary: {
    normal: { background: "#ffffff1f", color: "#ffffff", fontFamily: "Outfit, sans-serif", fontWeight: 500, fontSize: 20, borderRadius: 50, padding: 20, gap: 20, border: "1px solid #7e8da3" },
    hover: { background: "#ffffff38", color: "#ffffff", boxShadow: "0 0 10px 0 rgba(255,255,255,.5)" },
  },
  nav: {
    normal: { background: "#10d7fd", color: "#0c0f14", fontFamily: "Lato, sans-serif", fontWeight: 400, fontSize: 16, lineHeight: "24px", borderRadius: 200, padding: "12px 24px", minHeight: 40 },
    hover: { background: "#7e8da3" },
  },
  submit: {
    normal: { background: "#10d7fd", color: "#0c0f14", fontFamily: "Lato, sans-serif", fontWeight: 400, fontSize: 16, lineHeight: "24px", borderRadius: 50, width: 150, padding: "8px 0", marginTop: 13 },
    hover: { background: "#ffffff", color: "#0c0f14" },
  },
  scrollTop: {
    normal: { background: "#7e8da3", color: "#ffffff", borderRadius: 0, padding: "12px 8px", fontSize: 20 },
    hover: { background: "#10d7fd" },
  },
};

export function Button({ variant = "primary", children, icon, mobile = false, forceState, href, onClick, fullWidth = false, style }) {
  const [hover, setHover] = useState(false);
  const v = VARIANTS[variant] || VARIANTS.primary;
  const isHover = forceState ? forceState === "hover" : hover;
  const iconName = variant === "scrollTop" ? "fas-arrow-up" : icon;
  const s = { ...BASE, ...v.normal, ...(isHover ? v.hover : {}), ...(mobile && (variant === "primary" || variant === "secondary") ? { fontSize: 15 } : {}), ...(fullWidth ? { width: "100%" } : {}), ...style };
  const Tag = href ? "a" : "button";
  return (
    <Tag href={href} onClick={onClick} style={s} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      {children != null && <span>{children}</span>}
      {iconName && <Icon name={iconName} size={variant === "scrollTop" ? 20 : "1em"} />}
    </Tag>
  );
}
