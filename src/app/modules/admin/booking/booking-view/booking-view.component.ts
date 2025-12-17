import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BookingService } from '../../../../services/booking/booking.service';
import { ApiErrorResponse , BookingDetailsResponse } from '../../../../models/booking/booking.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-booking-view',
  templateUrl: './booking-view.component.html',
  styleUrls: ['./booking-view.component.scss']
})
export class BookingViewComponent implements OnInit {
  bookingId: number = 0;
  bookingDetails: BookingDetailsResponse | null = null;
  isLoading: boolean = false;
  error: ApiErrorResponse | null = null;
  activeTab: 'details' | 'items' = 'details';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private bookingService: BookingService
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.bookingId = +id;
        this.loadBookingDetails();
      } else {
        this.error = { message: 'Invalid booking ID' };
      }
    });
  }

  loadBookingDetails(): void {
    if (this.bookingId <= 0) {
      this.error = { message: 'Invalid booking ID' };
      return;
    }

    this.isLoading = true;
    this.error = null;
    this.bookingDetails = null;

    this.bookingService.getBooking(this.bookingId).subscribe({
      next: (details) => {
        this.bookingDetails = details;
        this.isLoading = false;
      },
      error: (error: ApiErrorResponse) => {
        this.error = error;
        this.isLoading = false;
        console.error('Error loading booking details:', error);
      }
    });
  }

  retry(): void {
    this.loadBookingDetails();
  }

  goBack(): void {
    this.router.navigate(['/bookings']); // Adjust the route as needed
  }

  setActiveTab(tab: 'details' | 'items'): void {
    this.activeTab = tab;
  }

  // Formatting helpers
  getFormattedDate(dateString: string): string {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  }

  getFormattedDateTime(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  }

  getFormattedTime(dateString: string): string {
    try {
      return new Date(dateString).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  }

  // Calculations
  getTotalQuantity(): number {
    if (!this.bookingDetails?.items) return 0;
    return this.bookingDetails.items.reduce((total, item) => total + item.quantity, 0);
  }

  getPrioItemsCount(): number {
    if (!this.bookingDetails?.items) return 0;
    return this.bookingDetails.items.filter(item => item.isPrio).length;
  }

  getRegularItemsCount(): number {
    if (!this.bookingDetails?.items) return 0;
    return this.bookingDetails.items.filter(item => !item.isPrio).length;
  }

  getUniqueCustomers(): string[] {
    if (!this.bookingDetails?.items) return [];
    const customers = this.bookingDetails.items
      .map(item => item.customer?.customerName)
      .filter(name => name && name.trim() !== '') as string[];
    return [...new Set(customers)];
  }

  getUniqueProducts(): string[] {
    if (!this.bookingDetails?.items) return [];
    const products = this.bookingDetails.items
      .map(item => item.productClassification?.productCode)
      .filter(code => code && code.trim() !== '') as string[];
    return [...new Set(products)];
  }

  // Calculate total for priority items
  getPrioItemsTotal(): number {
    if (!this.bookingDetails?.items) return 0;
    return this.bookingDetails.items
      .filter(item => item.isPrio)
      .reduce((total, item) => total + item.quantity, 0);
  }

  // Calculate total for regular items
  getRegularItemsTotal(): number {
    if (!this.bookingDetails?.items) return 0;
    return this.bookingDetails.items
      .filter(item => !item.isPrio)
      .reduce((total, item) => total + item.quantity, 0);
  }
}