import { useEffect, useState } from 'react';
import { Dimensions, Keyboard, Platform } from 'react-native';

// Hauteur cachée par le clavier, en bas de la fenêtre (0 sans clavier). Screen la retire de la zone
// utile : le bas de l'écran (bouton « Valider ») reste juste au-dessus du clavier.
// - Android (bord à bord, Expo 57) : la fenêtre ne rétrécit plus d'elle-même ; on prend le haut du
//   clavier (screenY) annoncé par React Native. Une feuille (Modal) doit aussi être en bord à bord
//   (BottomSheet), sinon le système la remonte déjà et le clavier compte deux fois.
// - Web (site des joueurs) : le clavier ne réduit que la zone visible (visualViewport), pas la page.
export function useKeyboardInset(): number {
  const [inset, setInset] = useState(0);

  useEffect(() => {
    if (Platform.OS === 'web') return watchVisualViewport(setInset);
    // iOS : « Will » annonce le clavier dès le début de son animation ; « Did » (seul disponible sur
    // Android) arrive à la fin, le champ resterait caché pendant l'animation.
    const isIos = Platform.OS === 'ios';
    const show = Keyboard.addListener(isIos ? 'keyboardWillShow' : 'keyboardDidShow', (event) => {
      const { screenY, height } = event.endCoordinates;
      const fromTop = screenY > 0 ? Dimensions.get('window').height - screenY : height;
      setInset(Math.max(0, Math.round(fromTop)));
    });
    const hide = Keyboard.addListener(isIos ? 'keyboardWillHide' : 'keyboardDidHide', () => setInset(0));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  return inset;
}

function watchVisualViewport(setInset: (inset: number) => void): (() => void) | undefined {
  const viewport = typeof window !== 'undefined' ? window.visualViewport : null;
  if (!viewport) return undefined;
  const update = () => setInset(Math.max(0, Math.round(window.innerHeight - viewport.height - viewport.offsetTop)));
  viewport.addEventListener('resize', update);
  viewport.addEventListener('scroll', update);
  update();
  return () => {
    viewport.removeEventListener('resize', update);
    viewport.removeEventListener('scroll', update);
  };
}
