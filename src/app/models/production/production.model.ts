// CREATE DTOs
export interface CreateProductionDto {
  productionName?: string;
  totalHeads?: number;
  startDateTime?: Date | string;
  description?: string;
  farmDetails: ProductionFarmCreateDto[];
}

export interface ProductionFarmCreateDto {
  farmId: number;
  forecastedTrips?: number; // Correct spelling
  allocatedHeads?: number;
}

// UPDATE DTOs
export interface UpdateProductionEndDateDto {
  endDateTime?: Date | string;
}

// RESPONSE DTOs
export interface ProductionDto {
  id: number;
  productionName?: string;
  totalHeads?: number;
  startDateTime?: Date;
  endDateTime?: Date;
  description?: string;
  createdAt?: Date;
  status?: string;
  farmDetails?: ProductionFarmDto[];
}

export interface ProductionFarmDto {
  farmId: number;
  farmName?: string;
  forecastedTrips?: number;
  allocatedHeads?: number;
  actualHeads?: number;
  completedTrips?: number;
}

// FORM DATA DTOs (Frontend only)
export interface ProductionFormData {
  productionName: string;
  startDateTime: Date | string;
  description?: string;
  farmDetails: FarmDetail[];
}

export interface FarmDetail {
  farmId: number;
  farmName: string;
  forecastedTrips: number;
  allocatedHeads: number;
}

// KEEP YOUR EXISTING MODELS - just add these interfaces
export interface ProductionListDto {
  id: number;
  productionName: string;
  totalHeads: number;
  startDateTime: Date;
  endDateTime?: Date;
  description?: string;
  status: string;
  createdAt: Date;
  farmCount: number;
}

export interface ProductionRequest {
  pageNumber: number;
  pageSize: number;
  searchTerm?: string;
}