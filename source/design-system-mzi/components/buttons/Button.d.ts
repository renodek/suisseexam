/**
 * Bouton MZI Consulting, tel qu'il existe sur le site.
 * @startingPoint section="Composants" subtitle="Boutons principal, secondaire, header, formulaire" viewport="700x320"
 */
export interface ButtonProps {
  /** primary = cyan (héros, CTA sections) ; secondary = voile blanc 12 % ; nav = « Contact » du header ; submit = « Envoyer » du formulaire ; scrollTop = retour en haut */
  variant?: "primary" | "secondary" | "nav" | "submit" | "scrollTop";
  children?: React.ReactNode;
  /** Icône placée après le texte (site : fas-arrow-right sur les boutons principaux) */
  icon?: import("../icons/Icon").IconName;
  /** Taille mobile (≤767px) : 15px pour primary/secondary */
  mobile?: boolean;
  /** Force l'état affiché (documentation) */
  forceState?: "normal" | "hover";
  fullWidth?: boolean;
  href?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
}
export declare function Button(props: ButtonProps): JSX.Element;
