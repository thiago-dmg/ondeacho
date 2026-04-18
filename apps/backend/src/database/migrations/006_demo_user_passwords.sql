-- Senha de demonstração: Admin@123 (bcrypt). Alinha contas seed se o banco foi criado sem seed ou com hash antigo.
UPDATE users
SET password_hash = '$2b$10$1dVtUQAHNX9p4d6MVKDvaOv3JsfLXIrWhborxi6fnXisaMglRw7q.'
WHERE email IN ('admin@ondeacho.app', 'responsavel@ondeacho.app');
