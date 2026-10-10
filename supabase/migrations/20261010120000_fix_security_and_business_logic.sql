-- Migration: 20261010120000_fix_security_and_business_logic.sql
-- Description:
-- 1. Restore get_email_by_phone to allow unauthenticated phone login
-- 2. Drop destructive delete_order_items_on_done trigger so past orders retain their item breakdown
-- 3. Enforce authoritative pricing on order_items from doors table and recalculate order total server-side
-- 4. Ensure user address provided during signup is saved into profiles

-- 1. Fix phone login: Allow unauthenticated users to resolve email from phone for password login
CREATE OR REPLACE FUNCTION public.get_email_by_phone(phone_input text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  found_email text;
BEGIN
  SELECT email INTO found_email FROM public.profiles WHERE phone = phone_input LIMIT 1;
  RETURN found_email;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_email_by_phone(text) TO anon, authenticated;

-- 2. Prevent deletion of order items when orders are completed
DROP TRIGGER IF EXISTS on_order_done_delete_items ON public.orders;
DROP FUNCTION IF EXISTS public.delete_order_items_on_done();

-- 3. Enforce door catalog price on order_items and auto-calculate order total
CREATE OR REPLACE FUNCTION public.enforce_order_item_price()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  actual_price NUMERIC(10,2);
BEGIN
  SELECT price INTO actual_price FROM public.doors WHERE id = NEW.door_id;
  IF actual_price IS NOT NULL THEN
    NEW.price := actual_price;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_order_item_price ON public.order_items;
CREATE TRIGGER trg_enforce_order_item_price
  BEFORE INSERT OR UPDATE ON public.order_items
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_order_item_price();

CREATE OR REPLACE FUNCTION public.recalculate_order_total()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_order_id UUID;
  new_total NUMERIC(10,2);
BEGIN
  IF TG_OP = 'DELETE' THEN
    target_order_id := OLD.order_id;
  ELSE
    target_order_id := NEW.order_id;
  END IF;

  SELECT COALESCE(SUM(price * quantity), 0) INTO new_total
  FROM public.order_items
  WHERE order_id = target_order_id;

  UPDATE public.orders
  SET total = new_total
  WHERE id = target_order_id;

  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_recalculate_order_total ON public.order_items;
CREATE TRIGGER trg_recalculate_order_total
  AFTER INSERT OR UPDATE OR DELETE ON public.order_items
  FOR EACH ROW
  EXECUTE FUNCTION public.recalculate_order_total();

-- 4. Include address in auto-created profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, phone, address)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'address', '')
  );
  RETURN NEW;
END;
$$;
