import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  CreateWeighingProductionGroupDto,
  PagedResponse,
  WeighingProductionGroup
} from 'app/models/weighing-production-group/weighing-production-group.models';
import { ProductionRequest } from 'app/models/weighing-production-group/weighing-production-group.models';

@Injectable({
  providedIn: 'root'
})
export class WeighingProdGroupService {

  private readonly baseUrl =
    'https://localhost:7093/api/WeighingProductionGroups';

  constructor(private http: HttpClient) {}

  getAll(
    request: ProductionRequest
  ): Observable<PagedResponse<WeighingProductionGroup>> {

    let params = new HttpParams();

    if (request.pageNumber !== undefined) {
      params = params.set('pageNumber', request.pageNumber);
    }

    if (request.pageSize !== undefined) {
      params = params.set('pageSize', request.pageSize);
    }

    if (request.searchTerm) {
      params = params.set('searchTerm', request.searchTerm);
    }

    return this.http.get<PagedResponse<WeighingProductionGroup>>(
      this.baseUrl,
      { params }
    );
  }

  create(
    payload: CreateWeighingProductionGroupDto
  ): Observable<WeighingProductionGroup> {

    return this.http.post<WeighingProductionGroup>(
      this.baseUrl,
      payload
    );
  }
}
