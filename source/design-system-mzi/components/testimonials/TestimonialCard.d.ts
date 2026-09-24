/**
 * Carte témoignage avec 5 étoiles or.
 * @startingPoint section="Composants" subtitle="Cartes de témoignages avec étoiles" viewport="700x300"
 */
export interface TestimonialCardProps {
  quote: string;
  /** Nom de l'auteur, rendu dans le même paragraphe après deux sauts de ligne (comme sur le site) */
  author: string;
  /** Texte après les étoiles (site : « 5/5 ») */
  rating?: string | null;
  /** Témoignage mis en avant : padding 50px, citation 30px/32px */
  featured?: boolean;
  style?: React.CSSProperties;
}
export declare function TestimonialCard(props: TestimonialCardProps): JSX.Element;
