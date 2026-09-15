import React from 'react';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { VehicleForm } from '@/components/vehicles/VehicleForm';
import { Brand, Model, Vehicle, VehicleImage, VehicleFeature } from '@/types/database';

export const revalidate = 0;

interface EditVehiclePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditVehiclePage({ params }: EditVehiclePageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // 1. Fetch primary vehicle record
  const { data: vehicleData, error: vehicleError } = await supabase
    .from('vehicles')
    .select(`
      *,
      brand:brands(*),
      model:models(*)
    `)
    .eq('id', id)
    .maybeSingle();

  if (vehicleError) {
    console.error('Error fetching vehicle by ID:', vehicleError);
  }

  if (!vehicleData) {
    notFound();
  }

  const vehicle: Vehicle = vehicleData as any;

  // 2. Fetch images
  const { data: imagesData } = await supabase
    .from('vehicle_images')
    .select('*')
    .eq('vehicle_id', id)
    .order('display_order', { ascending: true });

  vehicle.vehicle_images = (imagesData as VehicleImage[]) || [];

  // 3. Fetch features safely (graceful fallback if table does not exist yet)
  try {
    const { data: featuresData } = await supabase
      .from('vehicle_features')
      .select('*')
      .eq('vehicle_id', id)
      .order('display_order', { ascending: true });

    vehicle.vehicle_features = (featuresData as VehicleFeature[]) || [];
  } catch (featErr) {
    console.warn('Could not fetch vehicle_features:', featErr);
    vehicle.vehicle_features = [];
  }

  // 4. Fetch all brands
  const { data: brandsData } = await supabase.from('brands').select('*').order('name');
  const brands: Brand[] = (brandsData as any[]) || [];

  // 5. Fetch models for the vehicle's brand
  let initialModels: Model[] = [];
  if (vehicle.brand_id) {
    const { data: modelsData } = await supabase
      .from('models')
      .select('*')
      .eq('brand_id', vehicle.brand_id)
      .order('name');
    initialModels = (modelsData as any[]) || [];
  }

  return (
    <div className="animate-in fade-in">
      <VehicleForm
        initialVehicle={vehicle}
        brands={brands}
        initialModels={initialModels}
      />
    </div>
  );
}
