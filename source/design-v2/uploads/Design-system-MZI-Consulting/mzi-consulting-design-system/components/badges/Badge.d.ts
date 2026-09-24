/**
 * Badge / surtitre : « Agence IA à Annemasse » (héros) et surtitres de section.
 * @startingPoint section="Composants" subtitle="Badge héros et badges de section" viewport="700x180"
 */
export interface BadgeProps {
  /** hero = badge « Agence IA à Annemasse » (bordure #7e8da3, rayon 50px, icône cerveau) ; section = surtitre de section (rayon 23px) */
  variant?: "hero" | "section";
  children: React.ReactNode;
  /** Icône avant le texte ; défaut fas-brain pour hero, aucune pour section. null pour retirer. */
  icon?: import("../icons/Icon").IconName | null;
  forceState?: "normal" | "hover";
  style?: React.CSSProperties;
}
export declare function Badge(props: BadgeProps): JSX.Element;
