-- Migration: 20261010120000_fix_security_and_business_logic.sql
-- Description:
-- 1. Secure phone login and prevent anonymous PII/email harvesting
-- 2. Remove automatic admin privilege assignment on signup trigger
-- 3. Drop destructive delete_order_items_on_done trigger so past orders retain their item breakdown
-- 4. Enforce authoritative pricing on order_items from doors table and recalculate order total server-side
-- 5. Prevent negative quantity or overflow order injection
-- 6. Prevent database payload bloat / DoS on profiles table
-- 7. Ensure user address provided during signup is saved into profiles

-- 1. Remove hardcoded admin auto-grant trigger to prevent privilege escalation
DROP TRIGGER IF EXISTS on_admin_signup ON auth.users;
DROP FUNCTION IF EXISTS public.assign_admin_on_signup();

-- Ensure admin role exists for authorized admin user safely without trigger
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role FROM auth.users WHERE email = 'classydoor2025admin@gmail.com'
ON CONFLICT DO NOTHING;

-- 2. Secure get_email_by_phone: Revoke anonymous access to prevent PII harvesting
-- (The phone-login Edge Function handles unauthenticated phone logins internally with service role)
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

GRANT EXECUTE ON FUNCTION public.get_email_by_phone(text) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.get_email_by_phone(text) FROM anon;

-- 3. Prevent deletion of order items when orders are completed
DROP TRIGGER IF EXISTS on_order_done_delete_items ON public.orders;
DROP FUNCTION IF EXISTS public.delete_order_items_on_done();

-- 4. Anti-Tampering: Enforce positive quantity, door catalog price, and recalculate total
ALTER TABLE public.order_items 
  DROP CONSTRAINT IF EXISTS check_order_items_quantity_range,
  ADD CONSTRAINT check_order_items_quantity_range CHECK (quantity > 0 AND quantity <= 1000);

ALTER TABLE public.orders 
  DROP CONSTRAINT IF EXISTS check_orders_total_non_negative,
  ADD CONSTRAINT check_orders_total_non_negative CHECK (total >= 0);

CREATE OR REPLACE FUNCTION public.enforce_order_item_price()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  actual_price NUMERIC(10,2);
BEGIN
  IF NEW.quantity <= 0 OR NEW.quantity > 1000 THEN
    RAISE EXCEPTION 'Quantity must be between 1 and 1000';
  END IF;

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

-- 5. Profile input validation & payload overflow prevention
CREATE OR REPLACE FUNCTION public.validate_profile_data()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF char_length(COALESCE(NEW.full_name, '')) > 100 THEN
    RAISE EXCEPTION 'Full name cannot exceed 100 characters';
  END IF;
  IF char_length(COALESCE(NEW.phone, '')) > 25 THEN
    RAISE EXCEPTION 'Phone cannot exceed 25 characters';
  END IF;
  IF char_length(COALESCE(NEW.address, '')) > 500 THEN
    RAISE EXCEPTION 'Address cannot exceed 500 characters';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validate_profile_before_insert_update ON public.profiles;
CREATE TRIGGER validate_profile_before_insert_update
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_profile_data();

-- 6. Include address in auto-created profile on user signup
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
