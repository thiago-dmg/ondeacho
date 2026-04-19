-- Site e redes sociais opcionais (preenchidos pelo admin ou pelo proprietário após reivindicação).
ALTER TABLE clinics
  ADD COLUMN IF NOT EXISTS website_url varchar(500),
  ADD COLUMN IF NOT EXISTS instagram_url varchar(500),
  ADD COLUMN IF NOT EXISTS facebook_url varchar(500);
