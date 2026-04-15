-- Usuários base
INSERT INTO users (name, email, password_hash, role)
VALUES
  ('Administrador OndeAcho', 'admin@ondeacho.app', '$2b$10$1dVtUQAHNX9p4d6MVKDvaOv3JsfLXIrWhborxi6fnXisaMglRw7q.', 'admin'),
  ('Responsável Exemplo', 'responsavel@ondeacho.app', '$2b$10$1dVtUQAHNX9p4d6MVKDvaOv3JsfLXIrWhborxi6fnXisaMglRw7q.', 'responsavel')
ON CONFLICT (email) DO NOTHING;

-- Especialidades
INSERT INTO specialties (slug, name)
VALUES
  ('fonoaudiologo', 'Fonoaudiólogo'),
  ('psicologo', 'Psicólogo'),
  ('terapeuta-ocupacional', 'Terapeuta Ocupacional'),
  ('psicopedagogo', 'Psicopedagogo'),
  ('neurologista', 'Neurologista'),
  ('psiquiatra-infantil', 'Psiquiatra Infantil'),
  ('clinica-multidisciplinar', 'Clínica multidisciplinar')
ON CONFLICT (slug) DO NOTHING;

-- Convênios
INSERT INTO insurances (slug, name)
VALUES
  ('amil', 'Amil'),
  ('bradesco-saude', 'Bradesco Saúde'),
  ('sulamerica', 'SulAmérica'),
  ('unimed', 'Unimed')
ON CONFLICT (slug) DO NOTHING;

-- Clínicas
INSERT INTO clinics (name, description, city, neighborhood, accepts_online, supports_tea_tdh, rating)
VALUES
  (
    'Clínica Horizonte Azul',
    'Atendimento multidisciplinar com foco em desenvolvimento infantil para TEA e TDAH.',
    'São Paulo',
    'Moema',
    true,
    true,
    4.8
  ),
  (
    'Espaço Integrar Kids',
    'Equipe especializada em intervenção precoce e suporte familiar.',
    'Campinas',
    'Cambuí',
    true,
    true,
    4.6
  )
ON CONFLICT DO NOTHING;

-- Profissionais
INSERT INTO professionals (name, city, neighborhood, accepts_online, supports_tea_tdh, rating)
VALUES
  ('Dra. Mariana Alves', 'São Paulo', 'Vila Mariana', true, true, 4.9),
  ('Dr. Rafael Costa', 'Campinas', 'Taquaral', false, true, 4.7)
ON CONFLICT DO NOTHING;

-- Relações clínica x especialidades/convênios
INSERT INTO clinic_specialties (clinic_id, specialty_id)
SELECT c.id, s.id
FROM clinics c
JOIN specialties s ON s.slug IN ('fonoaudiologo', 'psicologo', 'terapeuta-ocupacional')
WHERE c.name = 'Clínica Horizonte Azul'
ON CONFLICT DO NOTHING;

INSERT INTO clinic_specialties (clinic_id, specialty_id)
SELECT c.id, s.id
FROM clinics c
JOIN specialties s ON s.slug IN ('psicopedagogo', 'clinica-multidisciplinar')
WHERE c.name = 'Espaço Integrar Kids'
ON CONFLICT DO NOTHING;

INSERT INTO clinic_insurances (clinic_id, insurance_id)
SELECT c.id, i.id
FROM clinics c
JOIN insurances i ON i.slug IN ('amil', 'unimed')
WHERE c.name = 'Clínica Horizonte Azul'
ON CONFLICT DO NOTHING;

INSERT INTO clinic_insurances (clinic_id, insurance_id)
SELECT c.id, i.id
FROM clinics c
JOIN insurances i ON i.slug IN ('bradesco-saude', 'sulamerica')
WHERE c.name = 'Espaço Integrar Kids'
ON CONFLICT DO NOTHING;

-- Relações profissional x especialidades/convênios
INSERT INTO professional_specialties (professional_id, specialty_id)
SELECT p.id, s.id
FROM professionals p
JOIN specialties s ON s.slug IN ('psicologo')
WHERE p.name = 'Dra. Mariana Alves'
ON CONFLICT DO NOTHING;

INSERT INTO professional_specialties (professional_id, specialty_id)
SELECT p.id, s.id
FROM professionals p
JOIN specialties s ON s.slug IN ('neurologista')
WHERE p.name = 'Dr. Rafael Costa'
ON CONFLICT DO NOTHING;

INSERT INTO professional_insurances (professional_id, insurance_id)
SELECT p.id, i.id
FROM professionals p
JOIN insurances i ON i.slug IN ('amil')
WHERE p.name = 'Dra. Mariana Alves'
ON CONFLICT DO NOTHING;

INSERT INTO professional_insurances (professional_id, insurance_id)
SELECT p.id, i.id
FROM professionals p
JOIN insurances i ON i.slug IN ('unimed')
WHERE p.name = 'Dr. Rafael Costa'
ON CONFLICT DO NOTHING;
