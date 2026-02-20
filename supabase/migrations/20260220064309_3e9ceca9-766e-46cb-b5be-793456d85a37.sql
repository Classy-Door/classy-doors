
CREATE OR REPLACE FUNCTION public.get_email_by_phone(phone_input text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  found_email text;
BEGIN
  SELECT email INTO found_email FROM public.profiles WHERE phone = phone_input LIMIT 1;
  RETURN found_email;
END;
$$;
