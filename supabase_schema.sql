-- =====================================================
-- PALMERAIE DIMAKO — SCHÉMA SUPABASE COMPLET
-- Exécutez ce script dans Supabase > SQL Editor
-- =====================================================

-- Table saisies (production + boutiques)
CREATE TABLE IF NOT EXISTS saisies (
  id           BIGSERIAL PRIMARY KEY,
  annee        INT NOT NULL DEFAULT 2026,
  mois         TEXT NOT NULL,
  zone         TEXT NOT NULL,
  date_debut   TEXT,
  date_fin     TEXT,
  regimes      NUMERIC DEFAULT 0,
  futs200      NUMERIC DEFAULT 0,
  futs250      NUMERIC DEFAULT 0,
  huile        NUMERIC DEFAULT 0,
  dons         NUMERIC DEFAULT 0,
  obs          TEXT DEFAULT '',
  recup_l      NUMERIC DEFAULT 0,
  sortie       NUMERIC DEFAULT 0,
  retour       NUMERIC DEFAULT 0,
  depenses     TEXT DEFAULT '[]',
  recettes     TEXT DEFAULT '[]',
  recouvrir    TEXT DEFAULT '[]',
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(annee, mois, zone)
);

-- Table notes journalières
CREATE TABLE IF NOT EXISTS notes (
  id         BIGSERIAL PRIMARY KEY,
  date       TEXT,
  zone       TEXT,
  auteur     TEXT,
  texte      TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sécurité tables
ALTER TABLE saisies ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes   ENABLE ROW LEVEL SECURITY;
CREATE POLICY "acces_public_saisies" ON saisies FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "acces_public_notes"   ON notes   FOR ALL USING (true) WITH CHECK (true);

-- =====================================================
-- STORAGE : bucket pdfs-palmeraie
-- (créez le bucket manuellement dans Storage si pas encore fait)
-- Puis exécutez cette politique :
-- =====================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('pdfs-palmeraie', 'pdfs-palmeraie', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "acces_public_pdfs_upload"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'pdfs-palmeraie');

CREATE POLICY "acces_public_pdfs_read"
ON storage.objects FOR SELECT
USING (bucket_id = 'pdfs-palmeraie');

SELECT 'Schéma créé avec succès ✓' AS resultat;
