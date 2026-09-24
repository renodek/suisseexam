/**
 * Carte à icône encadrée (sections « défis » et « solution »).
 * @startingPoint section="Composants" subtitle="Cartes défis avec icône" viewport="700x340"
 */
export interface ChallengeCardProps {
  /** defi : icône carré arrondi 30px, titre Outfit, aligné à gauche ; solution : icône cercle 34px, titre Lato, centré */
  variant?: "defi" | "solution";
  icon: import("../icons/Icon").IconName;
  title: string;
  description: string;
  /** Forcer l'alignement (le site centre les cartes défis en mobile) */
  align?: "start" | "center";
  /** Force l'état de survol de la carte (documentation) */
  forceState?: "normal" | "hover";
  style?: React.CSSProperties;
}
export declare function ChallengeCard(props: ChallengeCardProps): JSX.Element;
