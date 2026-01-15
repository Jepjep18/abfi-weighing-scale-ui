import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { ProductClassification, ProductClassificationDto, CreateProductClassificationDto, UpdateProductClassificationDto } from '../../models/product-classification/product-classification.model';
import { PagedResponse, PagedRequest } from '../../models/page-response/page-response.model';

export interface ProductClassificationFilter {
  page?: number;
  size?: number;
  search?: string;
  isActive?: boolean;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

@Injectable({
  providedIn: 'root'
})
export class ProductClassificationService {
  private readonly apiUrl = 'https://localhost:7093/api/ProductClassification';

  constructor(private http: HttpClient) {}

  /**
   * Get all product classifications (simplified - for dropdowns, etc.)
   */
  getAll(): Observable<ProductClassification[]> {
    return this.http.get<ProductClassification[]>(this.apiUrl).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Get paged product classifications with search and filters
   */
  getPaged(filter: ProductClassificationFilter = {}): Observable<PagedResponse<ProductClassificationDto>> {
    // Set default values
    const page = filter.page || 1;
    const size = filter.size || 10;
    const search = filter.search || '';
    const isActive = filter.isActive;
    const sortBy = filter.sortBy || 'productCode';
    const sortDirection = filter.sortDirection || 'asc';

    // Build query parameters
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (search) {
      params = params.set('search', search);
    }

    // Note: You might need to extend your backend to support additional filters
    // For now, we'll use the search endpoint for basic search
    return this.http.get<PagedResponse<ProductClassificationDto>>(`${this.apiUrl}/paged`, { params }).pipe(
      tap(response => {
        console.log('Fetched paged product classifications:', response);
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Get a single product classification by ID
   */
  getById(id: number): Observable<ProductClassificationDto> {
    return this.http.get<ProductClassificationDto>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Create a new product classification
   */
  create(product: CreateProductClassificationDto): Observable<ProductClassificationDto> {
    return this.http.post<ProductClassificationDto>(this.apiUrl, product).pipe(
      tap(newProduct => {
        console.log('Created new product classification:', newProduct);
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Update an existing product classification
   */
  update(id: number, product: UpdateProductClassificationDto): Observable<ProductClassificationDto> {
    return this.http.put<ProductClassificationDto>(`${this.apiUrl}/${id}`, product).pipe(
      tap(updatedProduct => {
        console.log('Updated product classification:', updatedProduct);
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Update product classification status (activate/deactivate)
   */
  updateStatus(id: number, isActive: boolean): Observable<ProductClassificationDto> {
    return this.http.patch<ProductClassificationDto>(`${this.apiUrl}/${id}/status`, { isActive }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Delete a product classification
   */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        console.log('Deleted product classification with ID:', id);
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Search product classifications with custom parameters
   */
  search(searchTerm: string, page: number = 1, size: number = 10): Observable<PagedResponse<ProductClassificationDto>> {
    return this.getPaged({ search: searchTerm, page, size });
  }

  /**
   * Get active product classifications only
   */
  getActive(): Observable<ProductClassificationDto[]> {
    // If your backend doesn't have this endpoint, you can filter client-side
    return this.getPaged({ isActive: true, size: 100 }).pipe(
      map(response => response.items)
    );
  }

  /**
   * Get inactive product classifications only
   */
  getInactive(): Observable<ProductClassificationDto[]> {
    return this.getPaged({ isActive: false, size: 100 }).pipe(
      map(response => response.items)
    );
  }

  /**
   * Validate if product code is unique
   */
  validateProductCode(productCode: string, excludeId?: number): Observable<boolean> {
    return this.getAll().pipe(
      map(products => {
        const matchingProduct = products.find(p => 
          p.productCode?.toLowerCase() === productCode.toLowerCase()
        );
        return !matchingProduct || matchingProduct.id === excludeId;
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Export product classifications to CSV
   */
  exportToCsv(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/export/csv`, {
      responseType: 'blob',
      headers: {
        'Accept': 'text/csv'
      }
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Handle HTTP errors
   */
  private handleError(error: any): Observable<never> {
    let errorMessage = 'An error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
      
      if (error.error?.message) {
        errorMessage = error.error.message;
      } else if (error.error?.Message) {
        errorMessage = error.error.Message;
      }
    }
    
    console.error('ProductClassificationService error:', error);
    return throwError(() => new Error(errorMessage));
  }

  /**
   * Helper to build query parameters
   */
  private buildQueryParams(filter: ProductClassificationFilter): HttpParams {
    let params = new HttpParams();
    
    if (filter.page !== undefined) {
      params = params.set('page', filter.page.toString());
    }
    
    if (filter.size !== undefined) {
      params = params.set('size', filter.size.toString());
    }
    
    if (filter.search) {
      params = params.set('search', filter.search);
    }
    
    if (filter.isActive !== undefined) {
      params = params.set('isActive', filter.isActive.toString());
    }
    
    if (filter.sortBy) {
      params = params.set('sortBy', filter.sortBy);
    }
    
    if (filter.sortDirection) {
      params = params.set('sortDirection', filter.sortDirection);
    }
    
    return params;
  }

  /**
   * Get statistics about product classifications
   */
  
}