export interface ProductionRequest {
  pageNumber: number;
  pageSize: number;
  searchTerm?: string;
}

// Optional: If you want to add more filters later
export interface ProductionRequestWithFilters extends ProductionRequest {
  startDateFrom?: Date;
  startDateTo?: Date;
  minTotalHeads?: number;
  sortBy?: string;
  sortDescending?: boolean;
}