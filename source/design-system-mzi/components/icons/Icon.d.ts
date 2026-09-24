export type IconName = "far-clock" | "fas-bolt" | "fas-chart-line" | "fas-exclamation-triangle" | "fas-search" | "far-lightbulb" | "far-file-alt" | "fas-asterisk" | "fas-user-check" | "fas-bullseye" | "far-eye" | "fas-brain" | "fas-arrow-right" | "fas-arrow-up" | "fas-check" | "fas-star" | "fas-file-medical-alt" | "fas-rocket" | "fas-align-justify";
export interface IconProps {
  /** Nom Font Awesome 5 (préfixe far-/fas-) tel qu'utilisé sur le site */
  name: IconName;
  /** Taille CSS, défaut 1em */
  size?: string | number;
  /** Couleur de remplissage, défaut currentColor */
  color?: string;
  style?: React.CSSProperties;
}
export declare const ICON_NAMES: IconName[];
export declare function Icon(props: IconProps): JSX.Element | null;
