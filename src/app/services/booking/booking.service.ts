import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BookingRequest, BookingResponse, CreateBooking } from '../../models/booking/booking.model';
import { PagedResponse } from '../../models/page-response/page-response.model';

@Injectable({
  providedIn: 'root'
})
export class BookingService {

  private baseUrl = 'https://localhost:7093/api/Booking'; // your API URL

  constructor(private http: HttpClient) { }

  getBookings(request: BookingRequest): Observable<PagedResponse<BookingResponse>> {
    let params = new HttpParams();

    if (request.pageNumber) params = params.set('pageNumber', request.pageNumber.toString());
    if (request.pageSize) params = params.set('pageSize', request.pageSize.toString());
    if (request.searchTerm) params = params.set('searchTerm', request.searchTerm);
    if (request.bookingDate) params = params.set('bookingDate', request.bookingDate);

    return this.http.get<PagedResponse<BookingResponse>>(this.baseUrl, { params });
  }

  createBooking(createBookingDto: CreateBooking): Observable<BookingResponse> {
    return this.http.post<BookingResponse>(this.baseUrl, createBookingDto);
  }
}
