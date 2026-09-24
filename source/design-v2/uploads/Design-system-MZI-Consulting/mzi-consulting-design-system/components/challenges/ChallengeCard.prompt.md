Carte à icône cyan encadrée, bordure #7e8da385, rayon 10px, padding 35px.
```jsx
<ChallengeCard icon="far-clock" title="Perte de temps massive" description="Vos équipes passent trop de temps…" />
<ChallengeCard variant="solution" icon="fas-search" title="Analyse ultra détaillée et complète" description="…" />
```
Icônes défis : far-clock, fas-bolt, fas-chart-line, fas-exclamation-triangle. Icônes solution : fas-search, far-lightbulb, far-file-alt. Survol de l'icône : scale(1.1), 200ms.
- Halo de l'icône (CSS personnalisé du site) : box-shadow 0 0 15px 13px rgba(7,105,124,.6).
- Survol de la carte (CSS personnalisé) : fond rgba(0,103,177,.05), ombre inset 0 0 20px rgba(0,103,177,.1) + 0 10px 30px rgba(0,0,0,.1), flou d'arrière-plan 4px, translateY(-5px), transition 0.5s cubic-bezier(0.23,1,0.32,1). Le reflet radial ::before (rgba(0,103,177,.15)) n'est pas reproduit.
