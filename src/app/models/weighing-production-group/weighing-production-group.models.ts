export interface PagedResponse<T> {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalCount: number;
  hasPrevious: boolean;
  hasNext: boolean;
  items: T[];
}

export interface WeighingProductionGroup {
  id: number;
  productionId: number;
  createdAt: string;
  production: Production;
}

export interface Production {
  id: number;
  productionName: string;
  totalHeads: number;
  startDateTime: string;
  endDateTime: string | null;
  description: string | null;
  farmDetails: ProductionFarmDetail[];
}

export interface ProductionFarmDetail {
  id: number;
  productionId: number;
  farmId: number;
  farmName: string;
  forecastedTrips: number;
  allocatedHeads: number;
  createdAt: string;
}

export interface ProductionRequest {
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
}

export interface CreateWeighingProductionGroupDto {
  productionId: number;
}

