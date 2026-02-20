
-- Add in_stock boolean column to doors
ALTER TABLE public.doors ADD COLUMN in_stock boolean NOT NULL DEFAULT true;

-- Drop quantity columns
ALTER TABLE public.doors DROP COLUMN quantity_left;
ALTER TABLE public.doors DROP COLUMN quantity_right;
