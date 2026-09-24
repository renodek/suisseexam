// Recréation de la page d'accueil de mzi-consulting.com à partir des composants du design system.
// Espacements entre sections : mesurés approximativement sur accueil-1440.png (non définis globalement dans le CSS).

const LOGO = "../../assets/logo/mzi-consulting-logo.png";
const H2 = ({ children, mobile, weight = 800 }) => (
  <h2 style={{ margin: 0, textAlign: "center", fontFamily: "Outfit, sans-serif", fontWeight: weight, fontSize: mobile ? 35 : 60, lineHeight: 1.2, color: "#fff", textWrap: "balance" }}>{children}</h2>
);
const C = ({ children }) => <strong style={{ color: "#10D7FD" }}>{children}</strong>;
const Lead = ({ children, mobile }) => (
  <p style={{ margin: 0, maxWidth: mobile ? "100%" : "60%", textAlign: "center", fontFamily: "Lato, sans-serif", fontSize: mobile ? 16 : 20, lineHeight: 1.5, color: "#7e8da3" }}>{children}</p>
);
const Section = ({ id, children, mobile }) => (
  <section id={id} style={{ position: "relative", zIndex: 1, padding: mobile ? "60px 16px" : "100px 20px" }}>
    <div style={{ maxWidth: 1140, margin: "0 auto", display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>{children}</div>
  </section>
);

function NeuralCanvas() {
  const ref = React.useRef(null);
  React.useEffect(() => {
    const c = ref.current, x = c.getContext("2d");
    let W, H, n = [], raf;
    const resize = () => { W = c.width = c.offsetWidth; H = c.height = c.offsetHeight; n = []; for (let i = 0; i < Math.floor((W * H) / 14000); i++) n.push({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .25, vy: (Math.random() - .5) * .25, r: Math.random() * 1.5 + .5 }); };
    const draw = () => {
      x.clearRect(0, 0, W, H);
      n.forEach((p) => { p.x += p.vx; p.y += p.vy; if (p.x < 0 || p.x > W) p.vx *= -1; if (p.y < 0 || p.y > H) p.vy *= -1; });
      for (let i = 0; i < n.length; i++) {
        for (let j = i + 1; j < n.length; j++) { const d = Math.hypot(n[i].x - n[j].x, n[i].y - n[j].y); if (d < 130) { x.beginPath(); x.strokeStyle = `rgba(0, 200, 255, ${(1 - d / 130) * .4})`; x.lineWidth = .5; x.moveTo(n[i].x, n[i].y); x.lineTo(n[j].x, n[j].y); x.stroke(); } }
        x.beginPath(); x.arc(n[i].x, n[i].y, n[i].r, 0, Math.PI * 2); x.fillStyle = "rgba(0, 200, 255, 0.55)"; x.fill();
      }
      raf = requestAnimationFrame(draw);
    };
    resize(); draw(); window.addEventListener("resize", resize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={ref} style={{ position: "fixed", inset: 0, width: "100%", height: "100vh", zIndex: 0, background: "#0A0E1A", pointerEvents: "none" }} />;
}

function Hero({ mobile, go }) {
  const { Badge, Button, KeyFigure } = window.MZI;
  return (
    <section style={{ position: "relative", zIndex: 1, padding: mobile ? "30px 16px 40px" : "80px 20px 60px" }}>
      <div style={{ maxWidth: 1140, margin: "0 auto", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Badge>Agence IA à Annemasse</Badge>
        <h1 style={{ margin: "20px 0 0", textAlign: "center", fontFamily: "Outfit, sans-serif", fontWeight: 800, fontSize: mobile ? 45 : 104, lineHeight: 1.2, color: "#fff" }}>
          <span style={{ color: "#10D7FD" }}>Automatisez votre</span><br />business avec l’IA
        </h1>
        <p style={{ margin: "20px 0", maxWidth: mobile ? "100%" : "60%", textAlign: "center", fontFamily: "Lato, sans-serif", fontSize: 20, lineHeight: "30px", color: "#7e8da3" }}>Gagnez du temps et augmentez votre chiffre d’affaires grâce à nos solutions IA sur-mesure.</p>
        <div style={{ display: "flex", flexDirection: mobile ? "column" : "row", gap: 20, alignItems: "center", marginTop: 20 }}>
          <Button icon="fas-arrow-right" mobile={mobile} onClick={() => go("contact")}>Réserver un audit IA gratuit</Button>
          <Button variant="secondary" mobile={mobile} onClick={() => go("methodologie")}>Découvrir notre méthode</Button>
        </div>
        <div style={{ display: "flex", flexDirection: mobile ? "column" : "row", gap: mobile ? 20 : 40, marginTop: 80, alignItems: "center" }}>
          <KeyFigure value="50+" label="Entreprises accompagnées" style={{ width: mobile ? "auto" : 160 }} />
          <KeyFigure value="3x" label="Productivité moyenne" style={{ width: mobile ? "auto" : 140 }} />
          <KeyFigure value="40%" label="Temps économisé" style={{ width: mobile ? "auto" : 120 }} />
        </div>
      </div>
    </section>
  );
}

const DEFIS = [
  ["far-clock", "Perte de temps massive", "Vos équipes passent trop de temps sur des tâches répétitives. Pourtant, ces tâches pourraient être automatisées en quelques clics afin de libérer du temps pour les tâches les plus importantes."],
  ["fas-bolt", "Manque d'automatisation", "Vous ne disposez pas d'un système performant pour accélérer vos résultats. Par conséquent, vous ne pouvez pas vous concentrer sur ce qui rapporte vraiment."],
  ["fas-chart-line", "Concurrence plus rapide", "Vos concurrents utilisent déjà l'IA et prennent une avance significative sur votre part de marché. Donc, agir maintenant est indispensable."],
  ["fas-exclamation-triangle", "Mauvaise utilisation de l'IA", "Vous avez utilisé quelques outils d'IA. Cependant, vous n'obtenez pas encore les résultats souhaités pour votre activité. C'est pourquoi un accompagnement avec un expert fait toute la différence."],
];
const SOLUTION = [
  ["fas-search", "Analyse ultra détaillée et complète", "Nous analysons vos processus, vos outils actuels et votre organisation. Ensuite, nous identifions les opportunités d'automatisation les plus pertinentes afin de vous offrir une vision claire."],
  ["far-lightbulb", "Identification des opportunités IA", "Nous identifions les gains potentiels automatisables, les plus pertinents pour votre activité et vos objectifs."],
  ["far-file-alt", "Recommandations concrètes", "Nous vous fournissons une liste de recommandations afin de vous permettre d'accélérer efficacement vers l'IA."],
];
const BENEFITS = [["01", "40%", "Gain de temps immédiat", "Réduction du temps passé sur les tâches répétitives"], ["02", "3x", "Productivité décuplée", "Plus de résultats avec les mêmes ressources"], ["03", "+60%", "Plus de clients potentiels", "Augmentation significative de l'acquisition"], ["04", "2x", "Meilleure rentabilité", "Transformez vos process en machine rentable"]];
const TESTIS = [
  ["Une expertise rare qui allie vision business et maîtrise technique. En seulement deux mois, nous avons triplé notre capacité de traitement de leads grâce aux outils d'IA recommandés. Je recommande vivement.", "Clara Vallet"],
  ["L'audit était clair, actionnable et nous avons pu augmenter notre rentabilité.", "Sophie D."],
  ["MZI Consulting nous a aidés à ne pas nous noyer dans la masse d'outils disponibles. Cette agence IA a su identifier exactement ce dont nous avions besoin pour rester compétitifs face à une concurrence agressive.", "Lucie B."],
  ["L'audit est extrêmement complet. Nous avons désormais une machine de vente dopée à l'IA qui nous permet de générer beaucoup plus de prospects qualifiés supplémentaires. Une collaboration rentable et efficace.", "Mélanie Walker"],
  ["Initialement sceptique sur l'IA dans mon secteur, l'approche personnalisée de MZI Consulting m'a convaincu. L'analyse de nos processus internes a permis de réduire nos coûts opérationnels de près de 30% dès le premier trimestre.", "Marc L."],
  ["Grâce à l'implémentation des automatisations suggérées lors de l'audit gratuit, nos équipes ont retrouvé du temps pour des tâches à haute valeur ajoutée. L'impact sur le moral et la productivité est impressionnant.", "Thomas G."],
  ["Le langage technique est vulgarisé avec brio. Nous avons pu intégrer l'IA dans nos processus de recrutement sans friction. L'approche est structurée et rassurante pour les collaborateurs.", "Yohanna B."],
];

const grid = (mobile, cols) => ({ width: "100%", display: "grid", gridTemplateColumns: mobile ? "1fr" : `repeat(auto-fit, minmax(${cols === 4 ? 240 : 300}px, 1fr))`, gap: 20, marginTop: 20 });

function Placeholder({ label }) {
  return (
    <div style={{ width: "100%", boxSizing: "border-box", padding: 40, border: "1px dashed #7e8da385", borderRadius: 10, textAlign: "center", fontFamily: "ui-monospace, Menlo, monospace", fontSize: 13, color: "#7e8da3" }}>{label}</div>
  );
}

function App() {
  const { NavBar, Footer, Badge, Button, ChallengeCard, BenefitCard, TestimonialCard, ContactForm } = window.MZI;
  const [mobile, setMobile] = React.useState(false);
  const go = (id) => { const el = document.getElementById(id); if (el) window.scrollTo({ top: el.offsetTop - 86, behavior: "smooth" }); };
  return (
    <div style={{ position: "relative", minHeight: "100vh", width: mobile ? 390 : "100%", margin: "0 auto", overflowX: "hidden" }}>
      <NeuralCanvas />
      <div style={{ position: "sticky", top: 0, zIndex: 10 }}><NavBar logoSrc={LOGO} mobile={mobile} onContact={() => go("contact")} /></div>
      <Hero mobile={mobile} go={go} />
      <Section id="probleme" mobile={mobile}>
        <Badge variant="section">Notre défi</Badge>
        <H2 mobile={mobile}>Votre entreprise à Annemasse<br /> fait face à <C>ces défis ?</C></H2>
        <Lead mobile={mobile}>Les entreprises qui n’adoptent pas l’intelligence artificielle perdent un avantage concurrentiel majeur. Pourtant, des solutions simples existent afin de renverser cette tendance rapidement.</Lead>
        <div style={grid(mobile, 4)}>{DEFIS.map(([i, t, d]) => <ChallengeCard key={t} icon={i} title={t} description={d} align={mobile ? "center" : undefined} />)}</div>
      </Section>
      <Section id="solution" mobile={mobile}>
        <Badge variant="section">La solution</Badge>
        <H2 mobile={mobile}>Un <C>audit IA personnalisé</C><br /> pour votre entreprise</H2>
        <Lead mobile={mobile}>En tant qu’agence IA à Annemasse, nous vous proposons un accompagnement afin de transformer votre activité grâce à l’intelligence artificielle.</Lead>
        <div style={grid(mobile, 3)}>{SOLUTION.map(([i, t, d]) => <ChallengeCard key={t} variant="solution" icon={i} title={t} description={d} />)}</div>
        <Button icon="fas-arrow-right" mobile={mobile} onClick={() => go("contact")} style={{ marginTop: 10 }}>Demarrer votre audit</Button>
      </Section>
      <Section id="benefices" mobile={mobile}>
        <Badge variant="section">Résultats</Badge>
        <H2 mobile={mobile}>Des <C>bénéfices concrets</C><br /> pour votre entreprise</H2>
        <div style={grid(mobile, 4)}>{BENEFITS.map(([n, s, t, d], i) => <BenefitCard key={n} first={i === 0} number={n} stat={s} title={t} description={d} mobile={mobile} />)}</div>
      </Section>
      <Section id="temoignages" mobile={mobile}>
        <Badge variant="section">Témoignages</Badge>
        <H2 mobile={mobile}>Ce que disent <C>nos clients</C></H2>
        <TestimonialCard featured quote="L'audit réalisé a été un véritable tournant pour notre structure. Nous perdions un temps fou sur la saisie de données ; aujourd'hui, tout est automatisé. Une agence à l'écoute et très pro sur Annemasse." author="Jean-Pierre Morel" style={{ width: "100%", marginTop: 30, padding: mobile ? 21 : 50 }} />
        <div style={grid(mobile, 3)}>{TESTIS.map(([q, a]) => <TestimonialCard key={a} quote={q} author={a} />)}</div>
      </Section>
      <Section id="methodologie" mobile={mobile}>
        <Badge variant="section">Méthodologies</Badge>
        <H2 mobile={mobile} weight={600}>Une approche <C>structurée et éprouvée</C></H2>
        <Lead mobile={mobile}>Notre accompagnement en intelligence artificielle à Annemasse suit un processus en 4 étapes.</Lead>
        <window.MZI.Timeline mobile={mobile} style={{ marginTop: 20 }} />
        <Button icon="fas-arrow-right" mobile={mobile} onClick={() => go("contact")} style={{ marginTop: 10 }}>Demander un audit</Button>
      </Section>
      <Section id="pourquoi" mobile={mobile}>
        <Badge variant="section">Pourquoi nous choisir ?</Badge>
        <H2 mobile={mobile} weight={600}>Votre <C>agence IA de confiance</C><br /> à Annemasse</H2>
        <Lead mobile={mobile}>Les entreprises qui n’adoptent pas l’intelligence artificielle perdent un avantage concurrentiel majeur.</Lead>
        <window.MZI.WhySection mobile={mobile} imageSrc="../../assets/images/94833.jpg" />
      </Section>
      <Section id="contact" mobile={mobile}>
        <Badge variant="section">Audit gratuit et sans engagement</Badge>
        <H2 mobile={mobile}>Prêt à transformer votre entreprise avec <C>l'IA à Annemasse ?</C></H2>
        <Lead mobile={mobile}>Réservez votre audit IA gratuit et découvrez concrètement comment exploiter les opportunités de l’intelligence artificielle pour votre entreprise.</Lead>
        <ContactForm mobile={mobile} style={{ marginTop: 20 }} />
      </Section>
      <div style={{ position: "relative", zIndex: 1 }}><Footer mobile={mobile} /></div>
      <div style={{ position: "fixed", right: 30, bottom: 30, zIndex: 20 }}><Button variant="scrollTop" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} /></div>
      <button onClick={() => setMobile(!mobile)} style={{ position: "fixed", left: 16, bottom: 16, zIndex: 30, background: "#0c0f14", color: "#7e8da3", border: "1px solid #7e8da3", borderRadius: 6, padding: "6px 10px", fontFamily: "ui-monospace, Menlo, monospace", fontSize: 11, cursor: "pointer" }}>
        {mobile ? "Vue desktop" : "Vue mobile 390px"}
      </button>
    </div>
  );
}
window.MZIHome = App;
