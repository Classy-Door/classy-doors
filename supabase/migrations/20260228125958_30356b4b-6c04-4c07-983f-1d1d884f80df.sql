CREATE POLICY "Users can cancel own pending orders"
ON public.orders
FOR UPDATE
USING (auth.uid() = user_id AND status = 'pending')
WITH CHECK (auth.uid() = user_id AND status = 'canceled');