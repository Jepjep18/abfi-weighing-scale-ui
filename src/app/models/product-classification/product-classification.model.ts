export interface ProductClassification {
  id: number;
  productCode: string | null;
  individualWeightRange: string;
  totalWeightRangePerCrate: string;
  noOfHeadsPerGalantina: number;
  cratesWeight: string;
  isActive: boolean;
}

export interface ProductClassificationDto {
  id: number;
  productCode: string;
  individualWeightRange: string;
  totalWeightRangePerCrate: string;
  noOfHeadsPerGalantina: number;
  cratesWeight: string;
  isActive: boolean;
  createdAt: Date;
  lastUpdatedAt: Date | null;
}

export interface CreateProductClassificationDto {
  productCode: string;
  individualWeightRange: string;
  totalWeightRangePerCrate: string;
  noOfHeadsPerGalantina: number;
  cratesWeight: string;
  isActive: boolean;
}

export interface UpdateProductClassificationDto {
  productCode?: string;
  individualWeightRange?: string;
  totalWeightRangePerCrate?: string;
  noOfHeadsPerGalantina?: number;
  cratesWeight?: string;
  isActive?: boolean;
}