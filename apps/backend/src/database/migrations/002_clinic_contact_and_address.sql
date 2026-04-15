ALTER TABLE clinics
ADD COLUMN IF NOT EXISTS address_line varchar(200),
ADD COLUMN IF NOT EXISTS address_number varchar(20),
ADD COLUMN IF NOT EXISTS zipcode varchar(10),
ADD COLUMN IF NOT EXISTS phone varchar(20),
ADD COLUMN IF NOT EXISTS whatsapp_phone varchar(20);
