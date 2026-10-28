/* ============================================================================
   API DES ACTUALITÉS

   Le Worker sert les fichiers statiques du site (binding ASSETS) et répond
   aux routes /api/* ci-dessous. Les actus vivent dans D1 (binding DB), les
   photos dans KV (binding PHOTOS). Le secret de session vient de
   `wrangler secret put SESSION_SECRET`.

   Routes :
     GET    /api/actus         liste publique, JSON
     POST   /api/actus         dépôt (multipart), membre connecté
     DELETE /api/actus/:id     suppression, membre connecté
     GET    /api/photos/:id    une photo, cache long
     POST   /api/login         { email, code } → cookie de session
     POST   /api/logout        efface le cookie
     GET    /api/me            { email } si connecté, sinon 401
   ========================================================================== */

const COOKIE = 'usmamvb_session';
const SESSION_DUREE_MS = 30 * 24 * 60 * 60 * 1000;
const PBKDF2_ITERATIONS = 100000;

const ACTUS_MAX = 100;
const PHOTOS_MAX = 3;
const PHOTO_POIDS_MAX = 2 * 1024 * 1024;
const PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const CATEGORIE_MAX = 40;
const TITRE_MAX = 90;
const TEXTE_MAX = 1200;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (!url.pathname.startsWith('/api/')) {
      return env.ASSETS.fetch(request);
    }

    try {
      return await router(request, env, url);
    } catch (erreur) {
      console.error(erreur);
      return json({ erreur: 'Erreur interne.' }, 500);
    }
  }
};

async function router(request, env, url) {
  const route = request.method + ' ' + url.pathname;
  const photo = url.pathname.match(/^\/api\/photos\/([0-9a-f-]{36})$/);
  const actu = url.pathname.match(/^\/api\/actus\/([0-9a-f-]{36})$/);

  if (photo && request.method === 'GET') {
    return servirPhoto(env, photo[1]);
  }

  if (route === 'GET /api/actus') {
    return listerActus(env);
  }

  if (route === 'POST /api/login') {
    return refuserOrigineEtrangere(request, url) || connecter(request, env);
  }

  if (route === 'POST /api/logout') {
    return deconnecter();
  }

  if (route === 'GET /api/me') {
    const email = await membreConnecte(request, env);
    return email ? json({ email }) : json({ erreur: 'Non connecté.' }, 401);
  }

  if (route === 'POST /api/actus') {
    return refuserOrigineEtrangere(request, url) || exigerMembre(request, env, (email) => posterActu(request, env, email));
  }

  if (actu && request.method === 'DELETE') {
    return refuserOrigineEtrangere(request, url) || exigerMembre(request, env, () => supprimerActu(env, actu[1]));
  }

  return json({ erreur: 'Route inconnue.' }, 404);
}

/* ---------- Actus ---------- */

async function listerActus(env) {
  const { results } = await env.DB
    .prepare('SELECT id, date, categorie, titre, texte, photos FROM actus ORDER BY date DESC, created_at DESC LIMIT ?')
    .bind(ACTUS_MAX)
    .all();

  return json(results.map(versActuPublique), 200, { 'Cache-Control': 'no-store' });
}

function versActuPublique(ligne) {
  return {
    id: ligne.id,
    date: ligne.date,
    categorie: ligne.categorie,
    titre: ligne.titre,
    texte: ligne.texte,
    photos: JSON.parse(ligne.photos).map((id) => '/api/photos/' + id)
  };
}

async function posterActu(request, env, email) {
  const form = await request.formData();
  const champs = lireChamps(form);
  const probleme = validerChamps(champs) || validerPhotos(form.getAll('photos'));

  if (probleme) {
    return json({ erreur: probleme }, 400);
  }

  const photos = await enregistrerPhotos(env, form.getAll('photos'));
  const id = crypto.randomUUID();

  await env.DB
    .prepare('INSERT INTO actus (id, date, categorie, titre, texte, photos, auteur) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .bind(id, champs.date, champs.categorie, champs.titre, champs.texte, JSON.stringify(photos), email)
    .run();

  return json(versActuPublique({ id, photos: JSON.stringify(photos), ...champs }), 201);
}

function lireChamps(form) {
  const texte = (nom) => String(form.get(nom) || '').trim();

  return {
    categorie: texte('categorie'),
    date: texte('date'),
    titre: texte('titre'),
    texte: texte('texte')
  };
}

function validerChamps(champs) {
  if (!champs.categorie || !champs.date || !champs.titre || !champs.texte) {
    return 'Merci de remplir les quatre champs.';
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(champs.date)) {
    return 'La date doit être au format AAAA-MM-JJ.';
  }
  if (champs.categorie.length > CATEGORIE_MAX) {
    return 'La catégorie est trop longue (' + CATEGORIE_MAX + ' caractères maximum).';
  }
  if (champs.titre.length > TITRE_MAX) {
    return 'Le titre est trop long (' + TITRE_MAX + ' caractères maximum).';
  }
  if (champs.texte.length > TEXTE_MAX) {
    return 'Le paragraphe est trop long (' + TEXTE_MAX + ' caractères maximum).';
  }
  return null;
}

function validerPhotos(fichiers) {
  if (fichiers.length > PHOTOS_MAX) {
    return PHOTOS_MAX + ' photos au maximum.';
  }
  for (const fichier of fichiers) {
    if (!(fichier instanceof File)) {
      return 'Photo illisible.';
    }
    if (!PHOTO_TYPES.includes(fichier.type)) {
      return 'Format de photo non pris en charge (JPEG, PNG ou WebP).';
    }
    if (fichier.size > PHOTO_POIDS_MAX) {
      return 'Une photo dépasse 2 Mo.';
    }
  }
  return null;
}

async function enregistrerPhotos(env, fichiers) {
  const ids = [];

  for (const fichier of fichiers) {
    const id = crypto.randomUUID();
    await env.PHOTOS.put(clePhoto(id), await fichier.arrayBuffer(), { metadata: { type: fichier.type } });
    ids.push(id);
  }

  return ids;
}

async function supprimerActu(env, id) {
  const ligne = await env.DB.prepare('SELECT photos FROM actus WHERE id = ?').bind(id).first();

  if (!ligne) {
    return json({ erreur: 'Actualité introuvable.' }, 404);
  }

  for (const photo of JSON.parse(ligne.photos)) {
    await env.PHOTOS.delete(clePhoto(photo));
  }

  await env.DB.prepare('DELETE FROM actus WHERE id = ?').bind(id).run();

  return new Response(null, { status: 204 });
}

/* ---------- Photos ---------- */

function clePhoto(id) {
  return 'photo:' + id;
}

async function servirPhoto(env, id) {
  const { value, metadata } = await env.PHOTOS.getWithMetadata(clePhoto(id), { type: 'arrayBuffer' });

  if (!value) {
    return new Response('Photo introuvable.', { status: 404 });
  }

  return new Response(value, {
    headers: {
      'Content-Type': (metadata && metadata.type) || 'image/jpeg',
      'Cache-Control': 'public, max-age=31536000, immutable'
    }
  });
}

/* ---------- Connexion ----------
   Le code de chaque membre est haché en PBKDF2-SHA256 avec un sel propre,
   au format `pbkdf2$<itérations>$<sel hex>$<hash hex>`, produit par
   scripts/ajouter-membre.mjs. Un e-mail inconnu passe quand même par un
   hachage, pour que le temps de réponse ne révèle pas qui est membre. */

const HASH_FACTICE = 'pbkdf2$' + PBKDF2_ITERATIONS + '$' + '00'.repeat(16) + '$' + '00'.repeat(32);

async function connecter(request, env) {
  const corps = await lireJson(request);
  const email = String((corps && corps.email) || '').trim().toLowerCase();
  const code = String((corps && corps.code) || '');

  if (!email || !code) {
    return json({ erreur: 'E-mail et code requis.' }, 400);
  }

  const membre = await env.DB.prepare('SELECT code_hash FROM membres WHERE email = ?').bind(email).first();
  const valide = await verifierCode(code, membre ? membre.code_hash : HASH_FACTICE);

  if (!membre || !valide) {
    return json({ erreur: 'E-mail ou code incorrect.' }, 401);
  }

  const jeton = await signerSession(env, email, Date.now() + SESSION_DUREE_MS);

  return json({ email }, 200, { 'Set-Cookie': cookieSession(jeton, SESSION_DUREE_MS / 1000) });
}

function deconnecter() {
  return json({ ok: true }, 200, { 'Set-Cookie': cookieSession('', 0) });
}

async function verifierCode(code, stocke) {
  const [algo, iterations, selHex, hashHex] = stocke.split('$');

  if (algo !== 'pbkdf2') {
    return false;
  }

  const calcule = await pbkdf2(code, hexVersOctets(selHex), parseInt(iterations, 10));

  return egalConstant(calcule, hexVersOctets(hashHex));
}

async function pbkdf2(code, sel, iterations) {
  const cle = await crypto.subtle.importKey('raw', new TextEncoder().encode(code), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: sel, iterations }, cle, 256);

  return new Uint8Array(bits);
}

/* ---------- Session ----------
   Cookie HttpOnly portant `email.expiration.signature`, signé HMAC-SHA256
   avec SESSION_SECRET. Rien n'est stocké côté serveur : révoquer un membre,
   c'est retirer sa ligne de `membres`, et /api/me le vérifie à chaque appel. */

async function membreConnecte(request, env) {
  const jeton = lireCookie(request, COOKIE);

  if (!jeton) {
    return null;
  }

  const [emailB64, expiration, signature] = jeton.split('.');

  if (!emailB64 || !expiration || !signature || Number(expiration) < Date.now()) {
    return null;
  }

  const attendu = await signature64(env, emailB64 + '.' + expiration);

  if (!egalConstant(base64urlVersOctets(signature), base64urlVersOctets(attendu))) {
    return null;
  }

  const email = new TextDecoder().decode(base64urlVersOctets(emailB64));
  const membre = await env.DB.prepare('SELECT 1 FROM membres WHERE email = ?').bind(email).first();

  return membre ? email : null;
}

async function exigerMembre(request, env, suite) {
  const email = await membreConnecte(request, env);

  return email ? suite(email) : json({ erreur: 'Connexion requise.' }, 401);
}

async function signerSession(env, email, expiration) {
  const charge = octetsVersBase64url(new TextEncoder().encode(email)) + '.' + expiration;

  return charge + '.' + (await signature64(env, charge));
}

async function signature64(env, message) {
  if (!env.SESSION_SECRET) {
    throw new Error('SESSION_SECRET manquant : wrangler secret put SESSION_SECRET');
  }

  const cle = await crypto.subtle.importKey('raw', new TextEncoder().encode(env.SESSION_SECRET), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const signature = await crypto.subtle.sign('HMAC', cle, new TextEncoder().encode(message));

  return octetsVersBase64url(new Uint8Array(signature));
}

function cookieSession(valeur, maxAge) {
  return COOKIE + '=' + valeur + '; Path=/api; Max-Age=' + maxAge + '; HttpOnly; Secure; SameSite=Strict';
}

function lireCookie(request, nom) {
  const entete = request.headers.get('Cookie') || '';

  for (const morceau of entete.split(';')) {
    const [cle, ...reste] = morceau.trim().split('=');
    if (cle === nom) {
      return reste.join('=');
    }
  }

  return null;
}

/* Les routes qui modifient quelque chose n'acceptent que les requêtes du site
   lui-même. Avec le cookie en SameSite=Strict, c'est une seconde ceinture
   contre une page tierce qui ferait poster un membre connecté à son insu. */
function refuserOrigineEtrangere(request, url) {
  const origine = request.headers.get('Origin');

  if (origine && origine !== url.origin) {
    return json({ erreur: 'Origine refusée.' }, 403);
  }

  return null;
}

/* ---------- Utilitaires ---------- */

async function lireJson(request) {
  try {
    return await request.json();
  } catch (e) {
    return null;
  }
}

function json(corps, statut = 200, entetes = {}) {
  return new Response(JSON.stringify(corps), {
    status: statut,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...entetes }
  });
}

function egalConstant(a, b) {
  if (a.length !== b.length) {
    return false;
  }

  let difference = 0;
  for (let i = 0; i < a.length; i++) {
    difference |= a[i] ^ b[i];
  }

  return difference === 0;
}

function hexVersOctets(hex) {
  const octets = new Uint8Array(hex.length / 2);
  for (let i = 0; i < octets.length; i++) {
    octets[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return octets;
}

function octetsVersBase64url(octets) {
  return btoa(String.fromCharCode(...octets)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64urlVersOctets(texte) {
  const base64 = texte.replace(/-/g, '+').replace(/_/g, '/');
  const binaire = atob(base64 + '='.repeat((4 - (base64.length % 4)) % 4));

  return Uint8Array.from(binaire, (c) => c.charCodeAt(0));
}
