import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PagedResponse } from 'app/models/page-response/page-response.model';
import { ProductionListDto } from 'app/models/production/production-list.model';
import { ProductionRequest } from 'app/models/production/production-request.model';
import {
  CreateProductionDto,
  ProductionDto,
  UpdateProductionEndDateDto,
  ProductionFormData,
  ProductionFarmCreateDto
} from 'app/models/production/production.model';

@Injectable({
  providedIn: 'root',
})
export class ProductionService {
  private apiUrl = 'https://localhost:7093/api/production';

  constructor(private http: HttpClient) {}

  // GET: Get all productions (paged) - EXISTING METHOD
  getProductions(
    request: ProductionRequest
  ): Observable<PagedResponse<ProductionListDto>> {
    let params = new HttpParams()
      .set('pageNumber', request.pageNumber.toString())
      .set('pageSize', request.pageSize.toString());

    if (request.searchTerm && request.searchTerm.trim() !== '') {
      params = params.set('searchTerm', request.searchTerm.trim());
    }

    return this.http.get<PagedResponse<ProductionListDto>>(this.apiUrl, {
      params,
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
    });
  }

  // POST: Create a new production - NEW METHOD
  createProduction(createDto: CreateProductionDto): Observable<ProductionDto> {
    // Format the DTO with proper date handling
    const formattedDto: CreateProductionDto = {
      ...createDto,
      // Convert Date objects to ISO string for API
      startDateTime: this.formatDateForApi(createDto.startDateTime),
      // Ensure farmDetails is properly formatted
      farmDetails: createDto.farmDetails?.map(farm => ({
        farmId: farm.farmId,
        forecastedTrips: farm.forecastedTrips,
        allocatedHeads: farm.allocatedHeads
      })) || []
    };

    return this.http.post<ProductionDto>(this.apiUrl, formattedDto, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
    });
  }

  // Helper: Convert ProductionFormData to CreateProductionDto
  convertFormToCreateDto(formData: ProductionFormData): CreateProductionDto {
    // Calculate total heads from farm allocations
    const totalHeads = formData.farmDetails.reduce((sum, farm) => sum + (farm.allocatedHeads || 0), 0);
    
    return {
      productionName: formData.productionName,
      totalHeads: totalHeads,
      startDateTime: formData.startDateTime,
      description: formData.description,
      farmDetails: formData.farmDetails.map(farm => ({
        farmId: farm.farmId,
        forecastedTrips: farm.forecastedTrips,
        allocatedHeads: farm.allocatedHeads
      }))
    };
  }

  // GET: Get production by ID - NEW METHOD
  getProductionById(id: number): Observable<ProductionDto> {
    return this.http.get<ProductionDto>(`${this.apiUrl}/${id}`, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
    });
  }

  // PUT: Update production end date - NEW METHOD
  updateProductionEndDate(id: number, endDateTime: Date | string): Observable<ProductionDto> {
    const updateDto: UpdateProductionEndDateDto = {
      endDateTime: this.formatDateForApi(endDateTime)
    };
    
    return this.http.put<ProductionDto>(`${this.apiUrl}/${id}/enddate`, updateDto, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
    });
  }

  // PUT: Update entire production - NEW METHOD
  updateProduction(id: number, production: Partial<ProductionDto>): Observable<ProductionDto> {
    // Format dates if present
    const formattedProduction = {
      ...production,
      startDateTime: this.formatDateForApi(production.startDateTime),
      endDateTime: this.formatDateForApi(production.endDateTime)
    };
    
    return this.http.put<ProductionDto>(`${this.apiUrl}/${id}`, formattedProduction, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
    });
  }

  // DELETE: Delete production - NEW METHOD
  deleteProduction(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
    });
  }

  // POST: Add farms to existing production - OPTIONAL METHOD
  addFarmsToProduction(productionId: number, farmDetails: ProductionFarmCreateDto[]): Observable<ProductionDto> {
    return this.http.post<ProductionDto>(
      `${this.apiUrl}/${productionId}/farms`, 
      { farmDetails },
      {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
        }),
      }
    );
  }

  // DELETE: Remove farm from production - OPTIONAL METHOD
  removeFarmFromProduction(productionId: number, farmId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${productionId}/farms/${farmId}`,
      {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
        }),
      }
    );
  }

  // UTILITY: Format date for API (handles Date objects, strings, and undefined)
  private formatDateForApi(date?: Date | string): string | undefined {
    if (!date) return undefined;
    
    if (date instanceof Date) {
      return date.toISOString();
    }
    
    // If it's already a string, ensure it's in ISO format
    if (typeof date === 'string') {
      const parsedDate = new Date(date);
      if (!isNaN(parsedDate.getTime())) {
        return parsedDate.toISOString();
      }
    }
    
    return undefined;
  }

  // UTILITY: Parse API date strings to Date objects
  parseApiDate(dateString?: string): Date | undefined {
    if (!dateString) return undefined;
    
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? undefined : date;
  }

  // UTILITY: Get current date in format for datetime-local input
  getCurrentDateTimeLocal(): string {
    const now = new Date();
    // Adjust for timezone offset to get local time
    const tzOffset = now.getTimezoneOffset() * 60000; // offset in milliseconds
    const localISOTime = new Date(now.getTime() - tzOffset).toISOString().slice(0, 16);
    return localISOTime;
  }
}