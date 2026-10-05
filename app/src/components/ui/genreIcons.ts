import type { GenreIconName } from '@shared/themeIcons';
import type { ReactNode } from 'react';

import { AppColors } from '@/constants/appTheme';

import { box, clipped, dot, line, ring, tile, type Pen } from './iconShapes';

// Icônes des genres de blind test (maquette I3), sur la grille de 24 unités de ThemeIcon. Dessins
// volontairement simples : ils doivent rester lisibles à 18 px.

function cassette(pen: Pen): ReactNode[] {
  return [
    box(pen, 'body', 2, 5, 20, 14, 2.5),
    ring(pen, 'reelL', 8, 11, 4.4, 4.4),
    ring(pen, 'reelR', 16, 11, 4.4, 4.4),
    line(pen, 'window', 7, 16, 17, 16),
  ];
}

function cd(pen: Pen): ReactNode[] {
  return [ring(pen, 'disc', 12, 12, 19, 19), ring(pen, 'hole', 12, 12, 6, 6), line(pen, 'shine', 6.6, 9.4, 8.6, 6.8)];
}

// Casque : arceau (moitié haute d'un cercle, découpée) et deux écouteurs.
function headphones(pen: Pen): ReactNode[] {
  return [
    clipped(pen, 'band', { x: 2, y: 2, w: 20, h: 11, radius: 0 }, (band) => [ring(band, 'arc', 12, 13, 18, 18)]),
    line(pen, 'sideL', 3.1, 12, 3.1, 14),
    line(pen, 'sideR', 20.9, 12, 20.9, 14),
    box(pen, 'cupL', 2, 13, 5.5, 8, 2),
    box(pen, 'cupR', 16.5, 13, 5.5, 8, 2),
  ];
}

function smartphone(pen: Pen): ReactNode[] {
  return [box(pen, 'body', 6.5, 2, 11, 20, 2.5), line(pen, 'home', 10.5, 18, 13.5, 18)];
}

// Accordéon : deux poignées et, entre elles, le soufflet (bords haut et bas, plis en zigzag).
const BELLOWS_TOP = 6;
const BELLOWS_BOTTOM = 18;
const BELLOWS_X: readonly number[] = [6.8, 8.53, 10.27, 12, 13.73, 15.47, 17.2];

function accordion(pen: Pen): ReactNode[] {
  const folds = BELLOWS_X.slice(1).map((x, index) => {
    const from = BELLOWS_X[index];
    const [y1, y2] = index % 2 === 0 ? [BELLOWS_TOP, BELLOWS_BOTTOM] : [BELLOWS_BOTTOM, BELLOWS_TOP];
    return line(pen, `fold${index}`, from, y1, x, y2);
  });
  return [
    box(pen, 'handleL', 1.5, 3.5, 4.5, 17, 1.5),
    box(pen, 'handleR', 18, 3.5, 4.5, 17, 1.5),
    line(pen, 'top', 6.8, BELLOWS_TOP, 17.2, BELLOWS_TOP),
    line(pen, 'bottom', 6.8, BELLOWS_BOTTOM, 17.2, BELLOWS_BOTTOM),
    ...folds,
  ];
}

// Boule disco : fil, puis boule pleine avec des carrés évidés en damier (couleur de l'ombre), découpés
// par la boule.
const DISCO = { x: 3, y: 4.5, w: 18, h: 18, radius: 9 };
const DISCO_CELL = 3.6;
const DISCO_SQUARE = 2.6;
const DISCO_GRID = 5;

function discoBall(pen: Pen): ReactNode[] {
  const origin = { x: 12 - (DISCO_GRID * DISCO_CELL) / 2, y: 13.5 - (DISCO_GRID * DISCO_CELL) / 2 };
  const squares: { key: string; x: number; y: number }[] = [];
  for (let row = 0; row < DISCO_GRID; row++) {
    for (let column = row % 2; column < DISCO_GRID; column += 2) {
      const x = origin.x + column * DISCO_CELL + (DISCO_CELL - DISCO_SQUARE) / 2;
      const y = origin.y + row * DISCO_CELL + (DISCO_CELL - DISCO_SQUARE) / 2;
      squares.push({ key: `facet${row}-${column}`, x, y });
    }
  }
  return [
    line(pen, 'string', 12, 1.2, 12, 3.5),
    clipped(pen, 'ball', DISCO, (inner) => [
      tile(inner, 'fill', DISCO.x, DISCO.y, DISCO.w, DISCO.h),
      ...squares.map(({ key, x, y }) => tile(inner, key, x, y, DISCO_SQUARE, DISCO_SQUARE, AppColors.themeIconShadow)),
    ]),
  ];
}

const SUN_RAYS: readonly [number, number, number, number][] = [
  [12, 1.5, 12, 3.8],
  [12, 20.2, 12, 22.5],
  [1.5, 12, 3.8, 12],
  [20.2, 12, 22.5, 12],
  [4.6, 4.6, 6.2, 6.2],
  [17.8, 17.8, 19.4, 19.4],
  [19.4, 4.6, 17.8, 6.2],
  [4.6, 19.4, 6.2, 17.8],
];

function sun(pen: Pen): ReactNode[] {
  return [ring(pen, 'core', 12, 12, 9.5, 9.5), ...SUN_RAYS.map(([x1, y1, x2, y2], index) => line(pen, `ray${index}`, x1, y1, x2, y2))];
}

// Étoile à cinq branches en contour : dix traits entre pointes et creux.
const STAR_CENTER = { x: 12, y: 12.8 };
const STAR_OUTER = 10.2;
const STAR_INNER = 4.4;

function starPoints(): { x: number; y: number }[] {
  return Array.from({ length: 10 }, (_, index) => {
    const radius = index % 2 === 0 ? STAR_OUTER : STAR_INNER;
    const angle = ((-90 + index * 36) * Math.PI) / 180;
    return { x: STAR_CENTER.x + radius * Math.cos(angle), y: STAR_CENTER.y + radius * Math.sin(angle) };
  });
}

function star(pen: Pen): ReactNode[] {
  const points = starPoints();
  return points.map((point, index) => {
    const next = points[(index + 1) % points.length];
    return line(pen, `edge${index}`, point.x, point.y, next.x, next.y);
  });
}

// Micro : capsule, support (moitié basse d'un cercle, découpée), pied et socle.
function microphone(pen: Pen): ReactNode[] {
  return [
    box(pen, 'capsule', 8.5, 1.5, 7, 12.5, 3.5),
    clipped(pen, 'holder', { x: 4, y: 10, w: 16, h: 8, radius: 0 }, (holder) => [ring(holder, 'arc', 12, 10, 12.5, 13)]),
    line(pen, 'stem', 12, 16.5, 12, 20.5),
    line(pen, 'base', 8.5, 21, 15.5, 21),
  ];
}

// Guitare : caisse ronde avec sa rosace, manche en diagonale et tête.
function guitar(pen: Pen): ReactNode[] {
  return [
    ring(pen, 'body', 8.5, 15.5, 11, 11),
    dot(pen, 'hole', 8.5, 15.5, 3),
    line(pen, 'neck', 12.5, 11.5, 19, 5),
    line(pen, 'head', 17.5, 3, 21, 6.5),
  ];
}

// Bulle de dialogue : bulle arrondie, pointe en bas à gauche et trois points.
function speechBubble(pen: Pen): ReactNode[] {
  return [
    box(pen, 'bubble', 2.5, 3.5, 19, 13.5, 3),
    line(pen, 'tailL', 7, 16, 6.5, 21),
    line(pen, 'tailR', 6.5, 21, 11.5, 16.5),
    dot(pen, 'dot1', 8, 10.3, 2.4),
    dot(pen, 'dot2', 12, 10.3, 2.4),
    dot(pen, 'dot3', 16, 10.3, 2.4),
  ];
}

export const GENRE_DRAWINGS: Record<GenreIconName, (pen: Pen) => ReactNode[]> = {
  cassette,
  cd,
  headphones,
  smartphone,
  accordion,
  discoBall,
  sun,
  star,
  microphone,
  guitar,
  speechBubble,
};
