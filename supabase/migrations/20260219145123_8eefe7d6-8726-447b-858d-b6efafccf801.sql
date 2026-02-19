
ALTER TABLE public.order_items ADD COLUMN order_number INTEGER;

-- Backfill existing order_items with order_number from orders table
UPDATE public.order_items oi
SET order_number = o.order_number
FROM public.orders o
WHERE oi.order_id = o.id;
