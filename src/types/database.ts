export type ListingType = 'BANK_REPOSSESSED' | 'DIRECT_OWNER' | 'DEALER';
export type VehicleStatus = 'DRAFT' | 'PUBLISHED' | 'RESERVED' | 'SOLD' | 'ARCHIVED';
export type VerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';
export type InquiryStatus = 'NEW' | 'CONTACTED' | 'VIEWING' | 'NEGOTIATING' | 'CLOSED' | 'SPAM';
export type UserRoleType = 'admin' | 'manager' | 'user';

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  created_at: string;
}

export interface Model {
  id: string;
  brand_id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface Vehicle {
  id: string;
  brand_id: string;
  model_id: string;
  variant: string | null;
  year: number;
  price: number;
  mileage: number | null;
  fuel_type: string | null;
  transmission: string | null;
  engine_size: string | null;
  body_type: string | null;
  location: string | null;
  description: string | null;
  listing_type: ListingType | string;
  status: VehicleStatus | string;
  verification_status: VerificationStatus | string;
  is_featured: boolean;
  slug: string;
  created_at: string;
  updated_at: string;
  // Joined relational fields
  brand?: Brand;
  model?: Model;
  vehicle_images?: VehicleImage[];
  vehicle_features?: VehicleFeature[];
}

export interface VehicleImage {
  id: string;
  vehicle_id: string;
  storage_path: string;
  alt_text: string | null;
  display_order: number;
  is_primary: boolean;
  created_at: string;
  // Computed public URL
  public_url?: string;
}

export interface VehicleFeature {
  id: string;
  vehicle_id: string;
  feature: string;
  display_order: number;
}

export interface Inquiry {
  id: string;
  vehicle_id: string | null;
  name: string;
  phone: string;
  email: string | null;
  message: string | null;
  status: InquiryStatus | string;
  created_at: string;
  updated_at: string;
  vehicle?: Vehicle;
}

export interface UserRole {
  user_id: string;
  role: UserRoleType | string;
  created_at: string;
}

export interface DashboardStats {
  totalVehicles: number;
  published: number;
  pendingVerification: number;
  sold: number;
  reserved: number;
  totalInquiries: number;
  featuredVehicles: number;
}
