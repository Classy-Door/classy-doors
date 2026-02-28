
CREATE OR REPLACE FUNCTION public.check_phone_exists(phone_input text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN EXISTS (SELECT 1 FROM public.profiles WHERE phone = phone_input);
END;
$function$;

CREATE OR REPLACE FUNCTION public.check_email_exists(email_input text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN EXISTS (SELECT 1 FROM public.profiles WHERE email = email_input);
END;
$function$;
