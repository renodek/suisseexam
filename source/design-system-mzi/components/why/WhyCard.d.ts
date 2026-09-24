/**
 * Carte « Pourquoi nous » (icône à gauche) et section complète avec image.
 * @startingPoint section="Composants" subtitle="Cartes « Pourquoi nous » + image" viewport="700x480"
 */
export interface WhyCardProps {
  icon: import("../icons/Icon").IconName;
  title: string;
  description: string;
  forceState?: "normal" | "hover";
  style?: React.CSSProperties;
}
export declare function WhyCard(props: WhyCardProps): JSX.Element;
export interface WhySectionProps {
  /** Chemin de 94833.jpg (défaut assets/images/94833.jpg, relatif à la racine) */
  imageSrc?: string;
  mobile?: boolean;
  style?: React.CSSProperties;
}
export declare function WhySection(props: WhySectionProps): JSX.Element;
