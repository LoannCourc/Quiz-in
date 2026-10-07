// Œil (mot affiché) ou œil barré (mot masqué), en SVG : le site des joueurs passe par react-dom, qui
// dessine les balises SVG sans dépendance. Seul le site des joueurs affiche l'écran du dessinateur.
export function EyeIcon({ isOpen, size, color }: { isOpen: boolean; size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 12c2.6-4.6 6-7 10-7s7.4 2.4 10 7c-2.6 4.6-6 7-10 7s-7.4-2.4-10-7z" />
      <circle cx="12" cy="12" r="3.2" />
      {!isOpen && <path d="M4 4l16 16" />}
    </svg>
  );
}
