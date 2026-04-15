CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(120) NOT NULL,
  email varchar(160) NOT NULL UNIQUE,
  password_hash varchar(255) NOT NULL,
  role varchar(20) NOT NULL CHECK (role IN ('responsavel', 'clinica', 'owner', 'admin')),
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS clinics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(160) NOT NULL,
  description text,
  city varchar(120) NOT NULL,
  neighborhood varchar(120),
  address_line varchar(200),
  address_number varchar(20),
  zipcode varchar(10),
  phone varchar(20),
  whatsapp_phone varchar(20),
  added_by_community boolean NOT NULL DEFAULT false,
  is_claimed boolean NOT NULL DEFAULT false,
  is_verified boolean NOT NULL DEFAULT false,
  accepts_online boolean NOT NULL DEFAULT false,
  supports_tea_tdh boolean NOT NULL DEFAULT true,
  rating numeric(2,1) NOT NULL DEFAULT 0,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating int NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment text NOT NULL,
  status varchar(20) NOT NULL DEFAULT 'pending',
  created_at timestamp NOT NULL DEFAULT now(),
  UNIQUE (clinic_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_clinics_city ON clinics(city);
CREATE INDEX IF NOT EXISTS idx_clinics_rating ON clinics(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_clinic ON reviews(clinic_id);

CREATE TABLE IF NOT EXISTS specialties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug varchar(60) NOT NULL UNIQUE,
  name varchar(120) NOT NULL,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS insurances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug varchar(60) NOT NULL UNIQUE,
  name varchar(120) NOT NULL,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS professionals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(160) NOT NULL,
  clinic_id uuid REFERENCES clinics(id) ON DELETE SET NULL,
  city varchar(120) NOT NULL,
  neighborhood varchar(120),
  phone varchar(20),
  whatsapp_phone varchar(20),
  added_by_community boolean NOT NULL DEFAULT false,
  is_claimed boolean NOT NULL DEFAULT false,
  is_verified boolean NOT NULL DEFAULT false,
  accepts_online boolean NOT NULL DEFAULT false,
  supports_tea_tdh boolean NOT NULL DEFAULT true,
  rating numeric(2,1) NOT NULL DEFAULT 0,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS clinic_specialties (
  clinic_id uuid NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  specialty_id uuid NOT NULL REFERENCES specialties(id) ON DELETE CASCADE,
  PRIMARY KEY (clinic_id, specialty_id)
);

CREATE TABLE IF NOT EXISTS clinic_insurances (
  clinic_id uuid NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  insurance_id uuid NOT NULL REFERENCES insurances(id) ON DELETE CASCADE,
  PRIMARY KEY (clinic_id, insurance_id)
);

CREATE TABLE IF NOT EXISTS professional_specialties (
  professional_id uuid NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
  specialty_id uuid NOT NULL REFERENCES specialties(id) ON DELETE CASCADE,
  PRIMARY KEY (professional_id, specialty_id)
);

CREATE TABLE IF NOT EXISTS professional_insurances (
  professional_id uuid NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
  insurance_id uuid NOT NULL REFERENCES insurances(id) ON DELETE CASCADE,
  PRIMARY KEY (professional_id, insurance_id)
);

CREATE TABLE IF NOT EXISTS favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  clinic_id uuid NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  created_at timestamp NOT NULL DEFAULT now(),
  UNIQUE (user_id, clinic_id)
);

CREATE TABLE IF NOT EXISTS contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  clinic_id uuid NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  message text,
  preferred_channel varchar(20) NOT NULL DEFAULT 'whatsapp',
  created_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS clinic_suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  suggested_by_user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  suggested_by_name varchar(120) NOT NULL,
  target_type varchar(20) NOT NULL CHECK (target_type IN ('clinica', 'profissional')),
  name varchar(160) NOT NULL,
  city varchar(120) NOT NULL,
  neighborhood varchar(120),
  address_line varchar(200),
  phone varchar(20),
  whatsapp_phone varchar(20),
  specialty_names text[] NOT NULL DEFAULT '{}',
  insurance_names text[] NOT NULL DEFAULT '{}',
  observations text,
  status varchar(20) NOT NULL DEFAULT 'PENDENTE',
  reviewed_by_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  reviewed_at timestamp,
  approved_clinic_id uuid REFERENCES clinics(id) ON DELETE SET NULL,
  approved_professional_id uuid REFERENCES professionals(id) ON DELETE SET NULL,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS profile_claim_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  clinic_id uuid REFERENCES clinics(id) ON DELETE CASCADE,
  professional_id uuid REFERENCES professionals(id) ON DELETE CASCADE,
  requester_name varchar(120) NOT NULL,
  requester_email varchar(160) NOT NULL,
  requester_phone varchar(20) NOT NULL,
  message text,
  status varchar(20) NOT NULL DEFAULT 'PENDENTE',
  reviewed_by_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  reviewed_at timestamp,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS profile_owners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  clinic_id uuid REFERENCES clinics(id) ON DELETE CASCADE,
  professional_id uuid REFERENCES professionals(id) ON DELETE CASCADE,
  created_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type varchar(40) NOT NULL,
  entity_id uuid NOT NULL,
  from_status varchar(20) NOT NULL,
  to_status varchar(20) NOT NULL,
  acted_by_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  note text,
  created_at timestamp NOT NULL DEFAULT now()
);
