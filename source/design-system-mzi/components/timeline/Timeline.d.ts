/**
 * Frise verticale « Méthodologie » (4 étapes alternées gauche/droite).
 * @startingPoint section="Composants" subtitle="Timeline Méthodologie" viewport="700x560"
 */
export interface TimelineStep { label: string; icon: import("../icons/Icon").IconName; text: string; }
export interface TimelineProps {
  /** Défaut : Audit, Stratégie IA, Implémentation, Optimisation (textes du site) */
  steps?: TimelineStep[];
  /** Mobile : ligne à gauche, libellés 18px */
  mobile?: boolean;
  style?: React.CSSProperties;
}
export declare function Timeline(props: TimelineProps): JSX.Element;
