
-- Fix 1: Secure get_email_by_phone - require authentication
CREATE OR REPLACE FUNCTION public.get_email_by_phone(phone_input text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  found_email text;
BEGIN
  -- Only allow authenticated users
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  
  SELECT email INTO found_email FROM public.profiles WHERE phone = phone_input LIMIT 1;
  RETURN found_email;
END;
$$;

-- Fix 2: Storage - restrict uploads to admins only
DROP POLICY IF EXISTS "Authenticated users can upload door photos" ON storage.objects;

CREATE POLICY "Admins can upload door photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'door-photos' 
  AND auth.role() = 'authenticated'
  AND public.has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can update door photos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'door-photos'
  AND auth.role() = 'authenticated' 
  AND public.has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can delete door photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'door-photos'
  AND auth.role() = 'authenticated'
  AND public.has_role(auth.uid(), 'admin'::app_role)
);

-- Fix 3: Explicit deny policies for user_roles modifications
CREATE POLICY "Prevent user role insertions"
  ON public.user_roles FOR INSERT
  TO authenticated
  WITH CHECK (false);

CREATE POLICY "Prevent user role updates"
  ON public.user_roles FOR UPDATE
  TO authenticated
  USING (false);

CREATE POLICY "Prevent user role deletions"
  ON public.user_roles FOR DELETE
  TO authenticated
  USING (false);

-- Fix 4: Server-side validation for doors table
CREATE OR REPLACE FUNCTION public.validate_door_data()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.price < 0 OR NEW.price > 999999999 THEN
    RAISE EXCEPTION 'Price must be between 0 and 999999999';
  END IF;
  
  IF char_length(COALESCE(NEW.description, '')) > 1000 THEN
    RAISE EXCEPTION 'Description cannot exceed 1000 characters';
  END IF;
  
  IF char_length(COALESCE(NEW.door_number, '')) > 50 THEN
    RAISE EXCEPTION 'Door number cannot exceed 50 characters';
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_door_before_insert_update
  BEFORE INSERT OR UPDATE ON public.doors
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_door_data();
