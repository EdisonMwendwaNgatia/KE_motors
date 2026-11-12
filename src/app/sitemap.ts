import { MetadataRoute } from 'next';
import { createClient } from '@/lib/supabase/server';
import { SITE_URL } from '@/lib/site';

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
  ].map((route) => ({
    url: `${SITE_URL}${route}`,
  }));

  // Dynamic vehicle pages
  const { data: vehicles } = await supabase
    .from('vehicles')
    .select('slug, updated_at, brand_id')
    .eq('status', 'PUBLISHED')
    .eq('verification_status', 'VERIFIED');

  const vehicleRoutes = (vehicles || []).map((v) => ({
    url: `${SITE_URL}/cars/${v.slug}`,
    ...(v.updated_at ? { lastModified: new Date(v.updated_at) } : {}),
  }));

  // Dynamic brand pages
  const activeBrandIds = new Set((vehicles || []).map((vehicle) => vehicle.brand_id));
  const { data: brands } = await supabase.from('brands').select('id, slug');

  const brandRoutes = (brands || [])
    .filter((brand) => activeBrandIds.has(brand.id))
    .map((b) => ({
      url: `${SITE_URL}/brands/${b.slug}`,
    }));

  return [...routes, ...vehicleRoutes, ...brandRoutes];
}
