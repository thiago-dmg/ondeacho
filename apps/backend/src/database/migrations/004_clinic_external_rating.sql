ALTER TABLE clinics
  ADD COLUMN IF NOT EXISTS external_rating numeric(2,1),
  ADD COLUMN IF NOT EXISTS external_review_count int;

COMMENT ON COLUMN clinics.external_rating IS 'Nota agregada externa (ex.: Google Maps), quando importada.';
COMMENT ON COLUMN clinics.external_review_count IS 'Quantidade de avaliações externas usada no agregado.';
