/**
 * En-tête fixe : logo, 4 ancres, bouton Contact ; menu hamburger en mobile.
 * @startingPoint section="Composants" subtitle="Navigation desktop et mobile" viewport="700x260"
 */
export interface NavBarProps {
  /** Chemin du logo (défaut assets/logo/mzi-consulting-logo.png, relatif à la racine) */
  logoSrc?: string;
  mobile?: boolean;
  links?: [string, string][];
  onContact?: () => void;
  /** État « sticky » (défilement > 300px) : ombre 0 4px 12px rgba(0,0,0,.1) */
  sticky?: boolean;
  style?: React.CSSProperties;
}
export declare function NavBar(props: NavBarProps): JSX.Element;
