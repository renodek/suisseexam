/**
 * Chiffre-clé du héros (50+, 3x, 40 %).
 */
export interface KeyFigureProps {
  /** Nombre affiché (H3 Lato 600 35px blanc) */
  value: string;
  /** Légende Lato 400 18px #7e8da3 */
  label: string;
  style?: React.CSSProperties;
}
export declare function KeyFigure(props: KeyFigureProps): JSX.Element;
