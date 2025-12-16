import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProductClassification } from '../../models/product-classification/product-classification.model';

@Injectable({
  providedIn: 'root'
})
export class ProductClassificationService {

  private readonly apiUrl = 'https://localhost:7093/api/ProductClassification';

  constructor(private http: HttpClient) {}

  /**
   * Get all product classifications (Id + ProductCode only)
   */
  getAll(): Observable<ProductClassification[]> {
    return this.http.get<ProductClassification[]>(this.apiUrl);
  }
}
