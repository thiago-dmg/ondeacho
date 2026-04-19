-- IDs de catálogo + texto "outros" na sugestão (web guiada)
ALTER TABLE clinic_suggestions
  ADD COLUMN IF NOT EXISTS specialty_ids uuid[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS specialty_other varchar(500) NULL,
  ADD COLUMN IF NOT EXISTS insurance_ids uuid[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS insurance_other varchar(500) NULL,
  ADD COLUMN IF NOT EXISTS linked_clinic_id uuid NULL REFERENCES clinics(id) ON DELETE SET NULL;
