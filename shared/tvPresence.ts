import type { PublicSession } from './types'

// Une TV est-elle ouverte sur la partie (Cast ou plan B) ? Faux si on ne le sait pas (champ absent :
// aucune TV, partie créée avant ce champ, ou TV encore en train de se connecter) : dans le doute, les
// téléphones gardent tout ce que la TV aurait affiché.
export function isTvPresent(session: Pick<PublicSession, 'tvPresence'>): boolean {
  return Object.keys(session.tvPresence ?? {}).length > 0
}
