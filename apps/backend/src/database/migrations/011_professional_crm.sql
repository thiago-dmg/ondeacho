-- CRM (Conselho Regional de Medicina ou equivalente), opcional por profissional
ALTER TABLE professionals
  ADD COLUMN IF NOT EXISTS crm varchar(64) NULL;
