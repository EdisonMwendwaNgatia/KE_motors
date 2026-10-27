/**
 * Formats a number to Kenyan Shilling currency format
 * e.g., 680000 -> "KSh 680,000"
 */
export function formatKSH(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return 'KSh 0';
  }
  return `KSh ${amount.toLocaleString('en-KE')}`;
}

/**
 * Generates a URL-safe slug from vehicle details
 * e.g. "Toyota", "IST Newshape", "", 2008 -> "toyota-ist-newshape-2008"
 */
export function generateSlug(
  brand: string,
  model: string,
  variant?: string | null,
  year?: number | string | null
): string {
  const parts = [brand, model, variant, year]
    .filter(Boolean)
    .map((str) => String(str).trim().toLowerCase());
  
  const raw = parts.join('-');
  
  return raw
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // remove special characters
    .replace(/\s+/g, '-')        // replace spaces with hyphens
    .replace(/-+/g, '-')         // collapse multiple hyphens
    .trim();
}

export const DEFAULT_PHONE_NUMBER = '0795492656';
export const WHATSAPP_GROUP_URL = 'https://chat.whatsapp.com/Cp4SLmBH3LyBz0LETF5v7e';

/**
 * Cleans phone number and returns a WhatsApp click-to-chat URL
 */
export function formatWhatsAppUrl(phone: string, vehicleTitle?: string): string {
  let cleaned = phone.replace(/[^0-9+]/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '254' + cleaned.slice(1);
  } else if (cleaned.startsWith('+')) {
    cleaned = cleaned.slice(1);
  }
  
  const text = vehicleTitle
    ? encodeURIComponent(`Hello, I am inquiring about the vehicle: ${vehicleTitle}`)
    : encodeURIComponent('Hello KE Motors, I am inquiring about your vehicles.');

  return `https://wa.me/${cleaned}?text=${text}`;
}

/**
 * Formats ISO date string into readable date format
 */
export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

/**
 * Helper to get full public URL for a vehicle image storage path
 */
export function getStoragePublicUrl(storagePath: string, supabaseUrl?: string): string {
  if (!storagePath) return '/placeholder-car.jpg';
  if (storagePath.startsWith('http://') || storagePath.startsWith('https://')) {
    return storagePath;
  }
  const baseUrl = supabaseUrl || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kcnueajsxgnemmxtknep.supabase.co';
  return `${baseUrl}/storage/v1/object/public/vehicle-images/${storagePath.replace(/^\//, '')}`;
}
