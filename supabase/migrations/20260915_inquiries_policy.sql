-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow public insert inquiries" ON public.inquiries;
DROP POLICY IF EXISTS "Allow admin full access inquiries" ON public.inquiries;

-- Allow public users to insert new inquiries
CREATE POLICY "Allow public insert inquiries" ON public.inquiries
    FOR INSERT
    WITH CHECK (true);

-- Allow admins/managers to read and update inquiries
CREATE POLICY "Allow admin full access inquiries" ON public.inquiries
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_roles.user_id = auth.uid()
            AND user_roles.role IN ('admin', 'manager')
        )
    );
