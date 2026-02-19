-- Create storage bucket for door photos
INSERT INTO storage.buckets (id, name, public) VALUES ('door-photos', 'door-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to door photos
CREATE POLICY "Door photos are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'door-photos');

-- Allow authenticated users to upload door photos (for admin)
CREATE POLICY "Authenticated users can upload door photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'door-photos' AND auth.role() = 'authenticated');