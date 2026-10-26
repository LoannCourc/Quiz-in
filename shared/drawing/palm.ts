// Contact plus large que ce diamètre (pixels CSS) : une paume, pas un doigt (si le navigateur le donne).
export const PALM_CONTACT_PX = 44

export interface ContactSize {
  pointerType: string
  width: number
  height: number
}

// Paume posée sur le dessin, ignorée (Android). Jamais sur iPhone ni iPad : WebKit donne pour largeur deux
// fois le rayon du doigt mesuré par iOS (souvent 40 à 60 px), un doigt y passait pour une paume et rien ne
// se dessinait (retour du test fermé, iPhone X).
export function isPalmContact(contact: ContactSize, isIos: boolean): boolean {
  return !isIos && contact.pointerType === 'touch' && Math.max(contact.width, contact.height) > PALM_CONTACT_PX
}
