export interface ProductClassification {
  id: number;
  productCode: string | null;
  individualWeightRange: string;
  totalWeightRangePerCrate: string;
  noOfHeadsPerGalantina: number;
  cratesWeight: string;
  isActive: boolean;
}
