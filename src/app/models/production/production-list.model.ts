export interface ProductionListDto {
  id: string;
  productionName: string;
  totalHeads: number;
  startDateTime: Date;
  endDateTime?: Date;
  createdAt: Date;
  farmCount: number;
  farmNames: string[];
}