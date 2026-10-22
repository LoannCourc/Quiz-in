// Aperçu local de la page des statistiques (npm run serve, puis http://localhost:5181), branchée sur les
// émulateurs (admin.js : localhost → émulateurs Database 9000 et Auth 9099). Même politique de sécurité qu'en
// ligne, plus les adresses des émulateurs. Développement seulement.
import { createServer } from 'node:http'
import { existsSync, readFileSync, statSync } from 'node:fs'
import { dirname, extname, join, normalize } from 'node:path'
import { fileURLToPath } from 'node:url'

const PUBLIC_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'public')
const PORT = Number(process.env.PORT) || 5181
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
}
const EMULATORS = 'http://127.0.0.1:9000 ws://127.0.0.1:9000 http://127.0.0.1:9099'
const CSP = `default-src 'none'; script-src 'self' https://www.gstatic.com; style-src 'self'; img-src 'self'; connect-src 'self' ${EMULATORS}; base-uri 'none'; form-action 'none'; frame-ancestors 'none'`

function resolve(pathname) {
  const path = normalize(decodeURIComponent(pathname)).replace(/^([/\\])+/, '') || 'index.html'
  const file = join(PUBLIC_DIR, path)
  return file.startsWith(PUBLIC_DIR) && existsSync(file) && statSync(file).isFile() ? file : null
}

createServer((request, response) => {
  const file = resolve(new URL(request.url, 'http://localhost').pathname)
  const headers = { 'Content-Security-Policy': CSP, 'X-Robots-Tag': 'noindex, nofollow', 'Cache-Control': 'no-cache' }
  if (!file) {
    response.writeHead(404, { ...headers, 'Content-Type': 'text/plain; charset=utf-8' })
    response.end('Introuvable')
    return
  }
  response.writeHead(200, { ...headers, 'Content-Type': TYPES[extname(file)] ?? 'application/octet-stream' })
  response.end(readFileSync(file))
}).listen(PORT, () => console.log(`Page des statistiques (émulateurs) : http://localhost:${PORT}`))
