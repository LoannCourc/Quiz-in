import { useEffect } from 'react';

// Page du site des joueurs qui ne défile jamais (saisie du code) : tant qu'elle est affichée, la page fait
// exactement la hauteur visible (100dvh, sinon 100 %), sans défilement ni rebond. Sur iPhone, 100 % de
// la hauteur laissait un espace vide en bas, que l'on pouvait faire défiler.
const FIXED_STYLE = { overflow: 'hidden', overscrollBehavior: 'none' } as const;

export function useFixedPage(): void {
  useEffect(() => {
    const height = CSS.supports('height', '100dvh') ? '100dvh' : '100%';
    const elements = [document.documentElement, document.body, document.getElementById('root')].filter(
      (element): element is HTMLElement => element !== null,
    );
    const saved = elements.map((element) => element.style.cssText);
    for (const element of elements) Object.assign(element.style, FIXED_STYLE, { height });
    window.scrollTo(0, 0);
    return () => elements.forEach((element, index) => (element.style.cssText = saved[index]));
  }, []);
}
