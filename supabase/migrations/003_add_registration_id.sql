-- Add registration_id column to students table
ALTER TABLE students ADD COLUMN registration_id SERIAL;

-- Create a sequence starting from 10000
CREATE SEQUENCE registration_id_seq START 10000;

-- Update the registration_id column to use the sequence
ALTER TABLE students ALTER COLUMN registration_id SET DEFAULT nextval('registration_id_seq');

-- Update existing records to have registration IDs starting from 10000
UPDATE students SET registration_id = nextval('registration_id_seq') WHERE registration_id IS NULL;

-- Make registration_id unique
ALTER TABLE students ADD CONSTRAINT unique_registration_id UNIQUE (registration_id);