#!/usr/bin/env node
/* Ajoute (ou remplace) un membre du bureau autorisé à poster des actualités.

     node scripts/ajouter-membre.mjs prenom.nom@exemple.fr            # base de production
     node scripts/ajouter-membre.mjs prenom.nom@exemple.fr --local    # base locale de `wrangler dev`

   Le script tire un code, l'affiche une seule fois, et n'enregistre que son
   hachage PBKDF2-SHA256 (même format que celui vérifié par src/index.js).
   Pour retirer un membre :

     npx wrangler d1 execute usmamvb-actus --remote --command "DELETE FROM membres WHERE email = 'x@y.fr'"
*/

import { randomBytes, pbkdf2Sync } from 'node:crypto';
import { spawnSync } from 'node:child_process';

const BASE = 'usmamvb-actus';
const ITERATIONS = 100000;
const ALPHABET = 'abcdefghjkmnpqrstuvwxyz23456789';

const email = (process.argv[2] || '').trim().toLowerCase();
const cible = process.argv.includes('--local') ? '--local' : '--remote';

if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  console.error('Usage : node scripts/ajouter-membre.mjs <email> [--local]');
  process.exit(1);
}

const code = tirerCode();
const hash = hacher(code);
const sql = `INSERT OR REPLACE INTO membres (email, code_hash) VALUES ('${email}', '${hash}');`;

/* `--command` et non `--file` : l'import de fichier passe par une route de
   l'API que le jeton OAuth de `wrangler login` n'a pas le droit d'appeler.
   La commande est assemblée en une seule chaîne, le SQL entre guillemets
   doubles : il ne contient que des apostrophes et des hexadécimaux. */
const commande = 'npx wrangler d1 execute ' + BASE + ' ' + cible + ' --command "' + sql + '"';

const resultat = spawnSync(commande, {
  stdio: 'inherit',
  shell: true
});

if (resultat.status !== 0) {
  process.exit(resultat.status || 1);
}

console.log('');
console.log('Membre enregistré : ' + email);
console.log('Code à lui transmettre (affiché une seule fois) : ' + code);

function tirerCode() {
  const octets = randomBytes(12);
  let code = '';

  for (let i = 0; i < octets.length; i++) {
    code += ALPHABET[octets[i] % ALPHABET.length];
    if (i % 4 === 3 && i < octets.length - 1) {
      code += '-';
    }
  }

  return code;
}

function hacher(code) {
  const sel = randomBytes(16);
  const hash = pbkdf2Sync(code, sel, ITERATIONS, 32, 'sha256');

  return ['pbkdf2', ITERATIONS, sel.toString('hex'), hash.toString('hex')].join('$');
}
