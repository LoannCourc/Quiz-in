import Svg, { Circle, G, Path } from 'react-native-svg';

// « ? » sur la grille de 24 des icônes de thème : crochet en arc de cercle (centre 12 ; 8,6, rayon 3,8) ouvert
// vers le bas à gauche, qui se referme vers l'axe, tige droite sur x = 12, point centré sur le même axe.
// Trait de 2,3 aux bouts arrondis, comme les autres icônes. Chargé seulement par QuestionMarkIcon (module natif).
const HOOK_AND_STEM = 'M8.2 8.6 a3.8 3.8 0 1 1 5.87 3.19 c-1.3 0.9 -2.07 1.7 -2.07 3.31 v1.2';
const STROKE_WIDTH = 2.3;
const DOT = { cx: 12, cy: 19.4, r: 1.45 };
const GRID = 24;

interface QuestionMarkSvgProps {
  size: number;
  color: string;
  // Ombre dure décalée vers le bas (icônes de thème) : sa couleur et son décalage en pixels.
  shadowColor?: string;
  shadowOffset?: number;
}

function Mark({ color }: { color: string }) {
  return (
    <>
      <Path d={HOOK_AND_STEM} stroke={color} strokeWidth={STROKE_WIDTH} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <Circle cx={DOT.cx} cy={DOT.cy} r={DOT.r} fill={color} />
    </>
  );
}

export function QuestionMarkSvg({ size, color, shadowColor, shadowOffset = 0 }: QuestionMarkSvgProps) {
  // Décalage de l'ombre converti en unités de la grille ; la boîte grandit d'autant vers le bas.
  const dy = shadowColor ? (shadowOffset * GRID) / size : 0;
  return (
    <Svg width={size} height={size + (shadowColor ? shadowOffset : 0)} viewBox={`0 0 ${GRID} ${GRID + dy}`}>
      {shadowColor && (
        <G transform={`translate(0 ${dy})`}>
          <Mark color={shadowColor} />
        </G>
      )}
      <Mark color={color} />
    </Svg>
  );
}
