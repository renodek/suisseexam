/**
 * Carte numérotée de la section « bénéfices » (01–04).
 * @startingPoint section="Composants" subtitle="Cartes numérotées des bénéfices" viewport="700x380"
 */
export interface BenefitCardProps {
  /** « 01 » … « 04 » — Outfit 800 90px (mobile 40px) */
  number: string;
  /** Statistique cyan — Outfit 800 18px (mobile 25px) */
  stat: string;
  title: string;
  description: string;
  /** La carte 01 a une ombre noire, les autres une ombre grise */
  first?: boolean;
  mobile?: boolean;
  style?: React.CSSProperties;
}
export declare function BenefitCard(props: BenefitCardProps): JSX.Element;
