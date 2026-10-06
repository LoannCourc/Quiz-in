// Vérifie les polices du site des joueurs, déclarées dans public/index.html (préchargement et @font-face).
//   node scripts/checkWebFonts.mjs dist                         → fichiers présents dans l'export et bien en woff2
//   node scripts/checkWebFonts.mjs https://quizin-play.web.app  → le site les sert en 200, type font/woff2
// Lancé après chaque export web (npm run export:web) : un export sans ses polices fait échouer le déploiement.
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

const WOFF2_SIGNATURE = 'wOF2';
const target = process.argv[2] ?? 'dist';
const isRemote = /^https?:\/\//.test(target);

async function readIndexHtml() {
  if (isRemote) {
    const response = await fetch(new URL('/', target));
    return response.text();
  }
  return readFile(join(target, 'index.html'), 'utf8');
}

// Adresses de polices citées par la page : préchargements et @font-face (les polices de repli « local() »
// n'ont pas d'adresse).
function fontUrls(html) {
  const preloads = [...html.matchAll(/<link[^>]*rel="preload"[^>]*href="([^"]+)"[^>]*as="font"/g)].map((m) => m[1]);
  const faces = [...html.matchAll(/url\('([^']+\.woff2)'\)/g)].map((m) => m[1]);
  return { preloads, faces, all: [...new Set([...preloads, ...faces])] };
}

async function checkRemote(url) {
  const response = await fetch(new URL(url, target));
  const type = response.headers.get('content-type') ?? '';
  const body = Buffer.from(await response.arrayBuffer());
  const problems = [];
  if (response.status !== 200) problems.push(`statut ${response.status}`);
  if (!type.startsWith('font/woff2')) problems.push(`type « ${type} »`);
  if (body.toString('latin1', 0, 4) !== WOFF2_SIGNATURE) problems.push('contenu qui n’est pas du woff2');
  return { problems, detail: `${response.status}, ${type}, ${body.length} octets, cache « ${response.headers.get('cache-control')} »` };
}

async function checkLocal(url) {
  try {
    const body = await readFile(join(target, url));
    const problems = body.toString('latin1', 0, 4) === WOFF2_SIGNATURE ? [] : ['contenu qui n’est pas du woff2'];
    return { problems, detail: `${body.length} octets` };
  } catch {
    return { problems: ['fichier absent'], detail: '' };
  }
}

const { preloads, faces, all } = fontUrls(await readIndexHtml());
let failed = all.length === 0;
if (failed) console.error('Aucune police trouvée dans index.html');
for (const url of faces) {
  if (!preloads.includes(url)) {
    console.error(`${url} : déclarée sans préchargement`);
    failed = true;
  }
}
for (const url of all) {
  const { problems, detail } = isRemote ? await checkRemote(url) : await checkLocal(url);
  if (problems.length > 0) failed = true;
  console.log(`${problems.length > 0 ? 'ÉCHEC' : 'ok'}  ${url}  ${detail}${problems.length > 0 ? `  → ${problems.join(', ')}` : ''}`);
}
if (failed) {
  console.error('Polices du site des joueurs : vérification échouée');
  process.exit(1);
}
console.log(`Polices du site des joueurs : ${all.length} fichiers vérifiés (${isRemote ? target : 'export local'})`);
