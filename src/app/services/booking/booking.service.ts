import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { BookingRequest, BookingResponse, CreateBooking, BookingDetailsResponse, ApiErrorResponse  } from '../../models/booking/booking.model';
import { PagedResponse } from '../../models/page-response/page-response.model';
import { catchError } from 'rxjs/operators';

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

  getBooking(id: number): Observable<BookingDetailsResponse> {
    if (id <= 0) {
      return throwError(() => ({ 
        message: 'Invalid booking ID' 
      } as ApiErrorResponse));
    }

    return this.http.get<BookingDetailsResponse>(`${this.baseUrl}/${id}`)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          return this.handleError(error, 'Error loading booking details');
        })
      );
  }


  private handleError(error: HttpErrorResponse, defaultMessage: string): Observable<never> {
    let apiError: ApiErrorResponse = {
      message: defaultMessage
    };

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      apiError.message = error.error.message;
    } else {
      // Server-side error
      switch (error.status) {
        case 400:
          apiError = error.error || { message: 'Bad request' };
          break;
        case 404:
          apiError = error.error || { message: 'Resource not found' };
          break;
        case 500:
          apiError = { message: 'Internal server error' };
          break;
        default:
          apiError = error.error || { 
            message: `Error: ${error.status} - ${error.message}` 
          };
      }
    }

    console.error('BookingService error:', error);
    return throwError(() => apiError);
  }
}
