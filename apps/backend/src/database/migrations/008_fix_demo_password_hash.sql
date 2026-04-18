-- Hash anterior não correspondia à senha documentada Admin@123 (seed/comentários enganadores).
UPDATE users
SET password_hash = '$2b$10$7FJp9pmUYCGjb3VeqAYXiOBWGGtQgLVHqFqCHrzL01KXZl9n6PCum'
WHERE email IN ('admin@ondeacho.app', 'responsavel@ondeacho.app');
