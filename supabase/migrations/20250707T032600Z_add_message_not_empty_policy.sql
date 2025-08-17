-- Drop old permissive INSERT policy
DROP POLICY IF EXISTS "Allow Public Contact Form Inserts ANON"
  ON public.contact_messages;

-- Create stricter INSERT policy for anon role
CREATE POLICY "Allow Public Contact Form Inserts ANON"
  ON public.contact_messages
  FOR INSERT
  TO anon
  WITH CHECK (
    char_length(trim(message)) > 0
  );