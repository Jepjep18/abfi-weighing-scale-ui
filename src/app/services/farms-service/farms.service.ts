import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FarmDto } from '../../models/farm/farm.model';

@Injectable({
  providedIn: 'root'
})
export class FarmService {
  private apiUrl = 'https://localhost:7093/api/farms';

  constructor(private http: HttpClient) { }

  /**
   * Get all active farms
   */
  getAllFarms(): Observable<FarmDto[]> {
    return this.http.get<FarmDto[]>(this.apiUrl, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    });
  }

  /**
   * Get farm by ID
   */
  getFarmById(id: number): Observable<FarmDto> {
    return this.http.get<FarmDto>(`${this.apiUrl}/${id}`);
  }

  /**
   * Search farms by name
   */
  searchFarms(searchTerm: string): Observable<FarmDto[]> {
    return this.http.get<FarmDto[]>(`${this.apiUrl}/search?name=${encodeURIComponent(searchTerm)}`);
  }
}