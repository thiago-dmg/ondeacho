ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users
ADD CONSTRAINT users_role_check CHECK (role IN ('responsavel', 'clinica', 'owner', 'admin'));

ALTER TABLE clinics
ADD COLUMN IF NOT EXISTS added_by_community boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS is_claimed boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS is_verified boolean NOT NULL DEFAULT false;

ALTER TABLE professionals
ADD COLUMN IF NOT EXISTS phone varchar(20),
ADD COLUMN IF NOT EXISTS whatsapp_phone varchar(20),
ADD COLUMN IF NOT EXISTS added_by_community boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS is_claimed boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS is_verified boolean NOT NULL DEFAULT false;

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
