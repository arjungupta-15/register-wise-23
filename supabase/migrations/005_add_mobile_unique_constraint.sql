-- Add unique constraint on mobile number to prevent duplicate registrations
ALTER TABLE students ADD CONSTRAINT unique_mobile UNIQUE (mobile);