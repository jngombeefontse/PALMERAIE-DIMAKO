-- =====================================================
-- PALMERAIE DIMAKO — SCHÉMA BASE DE DONNÉES SUPABASE
-- Exécuter ce script dans Supabase > SQL Editor
-- =====================================================

CREATE TABLE IF NOT EXISTS production (
  id         BIGSERIAL PRIMARY KEY,
  annee      INT NOT NULL DEFAULT 2026,
  mois       TEXT NOT NULL,
  regimes    INT DEFAULT 0,
  futs       INT DEFAULT 0,
  huile_l    NUMERIC(10,2) DEFAULT 0,
  dons       NUMERIC(12,2) DEFAULT 0,
  salaires   NUMERIC(12,2) DEFAULT 0,
  autres     NUMERIC(12,2) DEFAULT 0,
  obs        TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(annee, mois)
);

CREATE TABLE IF NOT EXISTS boutique_dimako (
  id         BIGSERIAL PRIMARY KEY,
  annee      INT NOT NULL DEFAULT 2026,
  mois       TEXT NOT NULL,
  recup      NUMERIC(10,2) DEFAULT 0,
  sortie     INT DEFAULT 0,
  vendu      INT DEFAULT 0,
  recouvrir  INT DEFAULT 0,
  stocks     INT DEFAULT 0,
  retour     INT DEFAULT 0,
  recettes   NUMERIC(12,2) DEFAULT 0,
  depenses   NUMERIC(12,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(annee, mois)
);

CREATE TABLE IF NOT EXISTS boutique_bertoua (
  id         BIGSERIAL PRIMARY KEY,
  annee      INT NOT NULL DEFAULT 2026,
  mois       TEXT NOT NULL,
  recup      NUMERIC(10,2) DEFAULT 0,
  sortie     INT DEFAULT 0,
  vendu      INT DEFAULT 0,
  recouvrir  INT DEFAULT 0,
  stocks     INT DEFAULT 0,
  retour     INT DEFAULT 0,
  recettes   NUMERIC(12,2) DEFAULT 0,
  depenses   NUMERIC(12,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(annee, mois)
);

CREATE TABLE IF NOT EXISTS employes (
  id            BIGSERIAL PRIMARY KEY,
  nom           TEXT NOT NULL,
  poste         TEXT NOT NULL,
  tel           TEXT DEFAULT '',
  salaire       NUMERIC(12,2) DEFAULT 0,
  date_embauche DATE,
  login         TEXT DEFAULT '',
  actif         BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS depenses (
  id          BIGSERIAL PRIMARY KEY,
  annee       INT NOT NULL DEFAULT 2026,
  mois        TEXT NOT NULL,
  categorie   TEXT NOT NULL,
  description TEXT DEFAULT '',
  montant     NUMERIC(12,2) NOT NULL,
  paye_par    TEXT DEFAULT '',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Sécurité Row Level (accès via clé anon publique)
ALTER TABLE production       ENABLE ROW LEVEL SECURITY;
ALTER TABLE boutique_dimako  ENABLE ROW LEVEL SECURITY;
ALTER TABLE boutique_bertoua ENABLE ROW LEVEL SECURITY;
ALTER TABLE employes         ENABLE ROW LEVEL SECURITY;
ALTER TABLE depenses         ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_all" ON production       FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON boutique_dimako  FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON boutique_bertoua FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON employes         FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON depenses         FOR ALL USING (true) WITH CHECK (true);

-- Employés initiaux
INSERT INTO employes (nom, poste, tel, salaire, login) VALUES
  ('Ttne Odette', 'Responsable boutique Dimako',  '+237 6XX XXX XXX', 80000, 'odette'),
  ('Fr Alain',    'Responsable boutique Bertoua', '+237 6XX XXX XXX', 80000, 'alain')
ON CONFLICT DO NOTHING;

SELECT 'Schema créé avec succès' AS statut;
