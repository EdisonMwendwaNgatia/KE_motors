-- Migration script for vehicle_features table
CREATE TABLE IF NOT EXISTS public.vehicle_features (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
    feature TEXT NOT NULL,
    display_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookup by vehicle_id
CREATE INDEX IF NOT EXISTS idx_vehicle_features_vehicle_id ON public.vehicle_features(vehicle_id);

-- Enable Row Level Security
ALTER TABLE public.vehicle_features ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow public read vehicle_features" ON public.vehicle_features;
DROP POLICY IF EXISTS "Allow admin full access vehicle_features" ON public.vehicle_features;

-- Allow public read access
CREATE POLICY "Allow public read vehicle_features" ON public.vehicle_features
    FOR SELECT USING (true);

-- Allow authenticated admins and managers full access
CREATE POLICY "Allow admin full access vehicle_features" ON public.vehicle_features
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_roles.user_id = auth.uid()
            AND user_roles.role IN ('admin', 'manager')
        )
    );
