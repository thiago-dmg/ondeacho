-- Nota só vem de avaliações aprovadas no app; remove colunas de “nota externa” (ex.: Google).
ALTER TABLE clinics DROP COLUMN IF EXISTS external_review_count;
ALTER TABLE clinics DROP COLUMN IF EXISTS external_rating;
