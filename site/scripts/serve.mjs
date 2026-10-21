// Aperçu local de site/dist/ (npm run serve, puis http://localhost:5180) : mêmes règles d'adresses
// que Firebase Hosting (cleanUrls, 404.html). Développement seulement.
import { createServer } from 'node:http'
import { existsSync, readFileSync, statSync } from 'node:fs'
import { dirname, extname, join, normalize } from 'node:path'
import { fileURLToPath } from 'node:url'

const DIST_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist')
const PORT = Number(process.env.PORT) || 5180
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml',
}

function resolve(pathname) {
  const path = normalize(decodeURIComponent(pathname)).replace(/^([/\\])+/, '')
  const candidates = [join(DIST_DIR, path), join(DIST_DIR, path, 'index.html'), join(DIST_DIR, `${path}.html`)]
  return candidates.find((file) => file.startsWith(DIST_DIR) && existsSync(file) && statSync(file).isFile())
}

createServer((request, response) => {
  const file = resolve(new URL(request.url, 'http://localhost').pathname)
  const served = file ?? join(DIST_DIR, '404.html')
  response.writeHead(file ? 200 : 404, { 'Content-Type': TYPES[extname(served)] ?? 'application/octet-stream' })
  response.end(readFileSync(served))
}).listen(PORT, () => console.log(`Aperçu du site : http://localhost:${PORT}`))
