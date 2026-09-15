import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { VehicleForm } from '@/components/vehicles/VehicleForm';
import { Brand, Model } from '@/types/database';

export const revalidate = 0;

export default async function NewVehiclePage() {
  const supabase = await createClient();

  const { data: brandsData } = await supabase.from('brands').select('*').order('name');
  const brands: Brand[] = (brandsData as any[]) || [];

  let initialModels: Model[] = [];
  if (brands.length > 0) {
    const { data: modelsData } = await supabase
      .from('models')
      .select('*')
      .eq('brand_id', brands[0].id)
      .order('name');
    initialModels = (modelsData as any[]) || [];
  }

  return (
    <div className="animate-in fade-in">
      <VehicleForm brands={brands} initialModels={initialModels} />
    </div>
  );
}
