export interface CreateBooking {
  bookingDate: string; // ISO string date
  remarks?: string;
  items: BookingItem[];
}

export interface BookingItem {
  customerName: string;
  isPrio: boolean;
  productQuantities: { [productId: number]: number };
}

// Booking Response DTO
export interface BookingResponse {
  id: number;
  bookingDate: string;
  remarks?: string;
  createdAt: string;
  customerCount: number;
  // items?: BookingItemResponse[]; // optional if you want to include items
}

// Optional Booking Item Response
export interface BookingItemResponse {
  customerName: string;
  isPrio: boolean;
  productQuantities: { [productId: number]: number };
}

export interface ApiErrorResponse {
  message?: string;
  errors?: string[];
  detail?: string;
}

export interface ApiValidationError {
  [key: string]: string[];
}

export interface BookingRequest {
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
  bookingDate?: string; // ISO string, optional
}

export interface BookingResponse {
  id: number;
  bookingDate: string;
  remarks?: string;
  createdAt: string;
  customerCount: number;
  // items?: BookingItemResponse[]; // optional if you include details later
}

// Optional BookingItem model if you want to expand later
export interface BookingItemResponse {
  customerName: string;
  productCode: string;
  isPrio: boolean;
}



//for get by booking id endpoints

export interface BookingDetailsResponse {
  id: number;
  bookingDate: string; // ISO string
  remarks?: string;
  createdAt: string; // ISO string
  customerCount: number;
  items: BookingItemDetailsDto[];
}

export interface BookingItemDetailsDto {
  id: number;
  quantity: number;
  isPrio: boolean;
  createdAt: string; // ISO string
  customer: CustomerDetailsDto;
  productClassification: ProductClassificationDetailsDto;
}

export interface CustomerDetailsDto {
  id: number;
  customerName: string;
  customerType: string;
}

export interface ProductClassificationDetailsDto {
  id: number;
  productCode: string;
  individualWeightRange: string;
  totalWeightRangePerCrate: string;
  noOfHeadsPerGalantina: number;
  cratesWeight: string;
  isActive: boolean;
}