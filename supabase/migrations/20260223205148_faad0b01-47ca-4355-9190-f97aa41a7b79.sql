
-- Add featured column for "Our Doors" homepage section
ALTER TABLE public.doors ADD COLUMN featured boolean NOT NULL DEFAULT false;
