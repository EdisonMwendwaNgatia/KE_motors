import { ListingType, VehicleStatus, VerificationStatus } from './database';

export interface VehicleFilterParams {
  search?: string;
  brand_id?: string;
  model_id?: string;
  year?: string;
  minPrice?: string;
  maxPrice?: string;
  listing_type?: ListingType | '';
  status?: VehicleStatus | '';
  verification_status?: VerificationStatus | '';
  is_featured?: string; // 'true' | 'false' | ''
  sortBy?: 'created_at' | 'price' | 'year';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface VehicleFormData {
  brand_id: string;
  model_id: string;
  variant: string;
  year: number;
  price: number;
  mileage: number | null;
  fuel_type: string;
  transmission: string;
  engine_size: string;
  body_type: string;
  location: string;
  description: string;
  listing_type: ListingType;
  status: VehicleStatus;
  verification_status: VerificationStatus;
  is_featured: boolean;
  features: string[];
}
