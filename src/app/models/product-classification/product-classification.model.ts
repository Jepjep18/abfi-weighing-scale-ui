export interface ProductClassification {
  id: number;
  productCode: string | null;
  individualWeightRange: string;
  totalWeightRangePerCrate: string;
  noOfHeadsPerGalantina: number;
  cratesWeight: string;
  isActive: boolean;
  createdAt: string;
  lastUpdatedAt?: string;
}

export interface CreateProductClassicationDto {
productCode: string;
individualWeightRange: string;
totalWeightRangePerCrate: string;
noOfHeadsPerGalantina?: number;
cratesWeight: string;
isActive?: boolean;
}

export interface UpdateProductClassificationDto extends CreateProductClassicationDto{

}

export interface ProductClassificationListDto {
    id: number;
    productCode?: string;
}

export interface ProductClassificationFileUploadDto {
    file: File;
}
