export interface CreateBooking {
  bookingDate: string; 
  remarks?: string;
  items: BookingItem[];
}

export interface BookingItem {
  customerId: number; 
  isPrio: boolean;
  advancePayment?: AdvancePayment | null; 
  productQuantities: { [productId: number]: number };
}

export interface AdvancePayment {
  advanceAmount: number;
  paymentDate: string; 
  paymentMethod: string;
  referenceNumber?: string | null;
}

// Booking Response DTO
export interface BookingResponse {
  id: number;
  bookingDate: string;
  remarks?: string;
  createdAt: string;
  items: BookingResponseItem[];
  customerAdvances?: CustomerAdvance[]; // If returned in response
}

// Optional Booking Item Response
export interface BookingResponseItem {
  id: number;
  customerId: number;
  customerName: string; // Might be populated in response
  isPrio: boolean;
  productClassificationId: number;
  productName?: string; // If you want to display
  quantity: number;
  createdAt: string;
}

export interface CustomerAdvance {
  id: number;
  customerId: number;
  customerName?: string;
  advanceAmount: number;
  paymentDate: string;
  paymentMethod: string;
  referenceNumber?: string;
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