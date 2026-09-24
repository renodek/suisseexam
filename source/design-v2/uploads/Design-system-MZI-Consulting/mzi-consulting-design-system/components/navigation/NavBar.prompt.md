Header fixe du site : fond #0c0f14, hauteur min. 86px, logo 100px, liens Lato 600 blancs (padding latéral 25px), bouton « Contact » cyan rayon 200px.
```jsx
<NavBar logoSrc="../../assets/logo/mzi-consulting-logo.png" />
<NavBar mobile />
```
- Mobile : icône fas-align-justify cyan ; menu déroulant fond #0c0f14, liens #7e8da3 (survol #10d7fd), padding 25px, séparateurs 1px #c4c4c4, bordure #7e8da3.
- Taille des liens non déterminée dans les CSS (15px, estimé d'après capture). Survol des liens desktop : non déterminé.
- Au-delà de 300px de défilement le header devient fixe, se masque en descendant et réapparaît en remontant (transform .4s cubic-bezier(0.4,0,0.2,1), ombre 0 4px 12px rgba(0,0,0,.1)).
