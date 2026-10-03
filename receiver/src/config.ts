import { PLAYERS_SITE_URL } from '@shared/constants'

// Adresse encodée dans le QR code du lobby (spec 6.6), réglée dans shared/constants.ts.
export const JOIN_URL_BASE = `${PLAYERS_SITE_URL}/join/`

// Adresse courte affichée à côté du code (« quizin-play.web.app »).
export const PLAYERS_SITE_HOST = new URL(PLAYERS_SITE_URL).host
