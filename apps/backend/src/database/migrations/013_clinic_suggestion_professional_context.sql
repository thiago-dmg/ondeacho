-- Contexto extra para sugestões do tipo profissional (CRM, vínculo com clínica, modo de atendimento)
ALTER TABLE clinic_suggestions
  ADD COLUMN IF NOT EXISTS linked_clinic_name varchar(200) NULL,
  ADD COLUMN IF NOT EXISTS professional_crm varchar(80) NULL,
  ADD COLUMN IF NOT EXISTS professional_attendance varchar(40) NULL
    CHECK (
      professional_attendance IS NULL
      OR professional_attendance IN ('at_clinic', 'own_office', 'other_location')
    );
