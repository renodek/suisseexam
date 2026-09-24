// Résout les composants : bundle généré s'il existe, sinon transpile les .jsx sources (aperçu local).
(function () {
  const ROOT = (document.currentScript && document.currentScript.dataset.root) || "../../";
  const FILES = ["icons/Icon", "buttons/Button", "badges/Badge", "keyfigures/KeyFigure", "challenges/ChallengeCard", "benefits/BenefitCard", "testimonials/TestimonialCard", "forms/ContactForm", "navigation/NavBar", "navigation/Footer", "timeline/Timeline", "why/WhyCard"];
  function find() {
    for (const k of Object.keys(window)) {
      try { const v = window[k]; if (v && typeof v === "object" && v.Button && v.Badge && v.Icon) return v; } catch (e) {}
    }
    return null;
  }
  window.__MZI_ready = (async function () {
    let ns = find();
    if (ns) return ns;
    try {
      const r = await fetch(ROOT + "_ds_bundle.js", { method: "HEAD" });
      if (r.ok) {
        await new Promise((res) => { const s = document.createElement("script"); s.src = ROOT + "_ds_bundle.js"; s.onload = res; s.onerror = res; document.head.appendChild(s); });
        ns = find();
        if (ns) return ns;
      }
    } catch (e) {}
    const srcs = await Promise.all(FILES.map((f) => fetch(ROOT + "components/" + f + ".jsx").then((r) => r.text())));
    let code = "const { useState, useEffect, useRef } = React;\n";
    const names = [];
    srcs.forEach((s) => {
      s = s.replace(/^import[^;]*;\s*$/gm, "");
      s = s.replace(/export (function|const) (\w+)/g, (m, kw, n) => { names.push(n); return kw + " " + n; });
      code += s + "\n";
    });
    code += "window.__MZI_NS = {" + names.join(",") + "};";
    const out = Babel.transform(code, { presets: ["react"] }).code;
    new Function(out)();
    return window.__MZI_NS;
  })();
})();
