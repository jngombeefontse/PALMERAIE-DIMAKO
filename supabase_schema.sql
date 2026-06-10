-- =====================================================
-- PALMERAIE DIMAKO — SCHÉMA SUPABASE
-- Exécutez ce script dans Supabase > SQL Editor
-- =====================================================

-- Table principale des saisies (production + boutiques)
CREATE TABLE IF NOT EXISTS saisies (
  id           BIGSERIAL PRIMARY KEY,
  annee        INT NOT NULL DEFAULT 2026,
  mois         TEXT NOT NULL,
  zone         TEXT NOT NULL, -- 'production', 'dimako', 'bertoua'

  -- Production
  date_debut   TEXT,
  date_fin     TEXT,
  regimes      NUMERIC DEFAULT 0,
  futs200      NUMERIC DEFAULT 0,
  futs250      NUMERIC DEFAULT 0,
  huile        NUMERIC DEFAULT 0,
  dons         NUMERIC DEFAULT 0,
  obs          TEXT DEFAULT '',

  -- Boutiques
  recup_l      NUMERIC DEFAULT 0,
  sortie       NUMERIC DEFAULT 0,
  retour       NUMERIC DEFAULT 0,

  -- JSON
  depenses     TEXT DEFAULT '[]',
  recettes     TEXT DEFAULT '[]',
  recouvrir    TEXT DEFAULT '[]',

  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(annee, mois, zone)
);

-- Table des notes journalières
CREATE TABLE IF NOT EXISTS notes (
  id         BIGSERIAL PRIMARY KEY,
  date       TEXT,
  zone       TEXT,
  auteur     TEXT,
  texte      TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sécurité
ALTER TABLE saisies ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes   ENABLE ROW LEVEL SECURITY;
CREATE POLICY "acces_public_saisies" ON saisies FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "acces_public_notes"   ON notes   FOR ALL USING (true) WITH CHECK (true);

SELECT 'Schéma créé avec succès ✓' AS resultat;
