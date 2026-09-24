/**
 * Formulaire de contact (Contact Form 7) de la section finale.
 * @startingPoint section="Composants" subtitle="Formulaire de contact" viewport="700x620"
 */
export interface ContactFormProps {
  /** Mobile : largeur 100 %, bouton pleine largeur, ligne de réassurance masquée */
  mobile?: boolean;
  /** Ligne « Sans engagement · Réponse sous 24h · Audit personnalisé » sous le formulaire */
  showReassurance?: boolean;
  onSubmit?: () => void;
  style?: React.CSSProperties;
}
export declare function ContactForm(props: ContactFormProps): JSX.Element;
