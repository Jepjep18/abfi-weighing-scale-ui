// app/models/production/production-list.model.ts

export interface ProductionFarmDetailDto {
  id: number;
  productionId: number;
  farmId: number;
  farmName: string;
  forecastedTrips: number;
  allocatedHeads: number;
  createdAt: Date;
}

export interface ProductionListDto {
  id: number; 
  productionName: string | null;
  totalHeads: number | null;
  startDateTime: Date | null;
  endDateTime?: Date | null;
  createdAt: Date | null;
  farmCount: number;
  // farmNames: string[];
  farmDetails: ProductionFarmDetailDto[];
}