import { MetadataRoute } from 'next';
import { createClient } from '@/lib/supabase/server';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://kemotors.co.ke';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();

  // Base static routes
  const routes = [
    '',
    '/marketplace',
    '/brands',
    '/sell',
    '/about',
    '/contact',
    '/favorites',
  ].map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));

  // Dynamic vehicle pages
  const { data: vehicles } = await supabase
    .from('vehicles')
    .select('slug, updated_at')
    .eq('status', 'PUBLISHED')
    .eq('verification_status', 'VERIFIED');

  const vehicleRoutes = (vehicles || []).map((v) => ({
    url: `${BASE_URL}/cars/${v.slug}`,
    lastModified: v.updated_at ? new Date(v.updated_at) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }));

  // Dynamic brand pages
  const { data: brands } = await supabase.from('brands').select('slug');

  const brandRoutes = (brands || []).map((b) => ({
    url: `${BASE_URL}/brands/${b.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return [...routes, ...vehicleRoutes, ...brandRoutes];
}
