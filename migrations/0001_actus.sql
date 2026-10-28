-- Membres du bureau autorisés à poster. Le code est haché (PBKDF2-SHA256),
-- jamais stocké en clair : voir scripts/ajouter-membre.mjs.
CREATE TABLE membres (
  email      TEXT PRIMARY KEY,
  code_hash  TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Une actualité. `photos` est un tableau JSON d'identifiants de clés KV.
CREATE TABLE actus (
  id         TEXT PRIMARY KEY,
  date       TEXT NOT NULL,
  categorie  TEXT NOT NULL,
  titre      TEXT NOT NULL,
  texte      TEXT NOT NULL,
  photos     TEXT NOT NULL DEFAULT '[]',
  auteur     TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX actus_par_date ON actus (date DESC, created_at DESC);
