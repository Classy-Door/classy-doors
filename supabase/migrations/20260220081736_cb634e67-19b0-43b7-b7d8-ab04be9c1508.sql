
CREATE OR REPLACE FUNCTION public.delete_order_items_on_done()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'done' AND OLD.status <> 'done' THEN
    DELETE FROM public.order_items WHERE order_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_order_done_delete_items
  AFTER UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.delete_order_items_on_done();
