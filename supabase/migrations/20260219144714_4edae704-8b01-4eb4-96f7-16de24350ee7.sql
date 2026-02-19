
-- Add order_number to orders with a sequence starting at 1000
CREATE SEQUENCE public.order_number_seq START WITH 1000;

ALTER TABLE public.orders ADD COLUMN order_number INTEGER UNIQUE DEFAULT nextval('public.order_number_seq');

-- Add door_number to order_items so we know which door
ALTER TABLE public.order_items ADD COLUMN door_number TEXT NOT NULL DEFAULT '';

-- Backfill existing order_items with door_number from doors table
UPDATE public.order_items oi
SET door_number = d.door_number
FROM public.doors d
WHERE oi.door_id = d.id;

-- Backfill existing orders with order_number
UPDATE public.orders SET order_number = nextval('public.order_number_seq') WHERE order_number IS NULL;
