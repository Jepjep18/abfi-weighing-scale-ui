import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';
import { ProductClassificationService } from '../../../services/product-classification/product-classification.service';
import { ProductClassification } from '../../../models/product-classification/product-classification.model';
import { BookingService } from '../../../services/booking/booking.service';
import {
    BookingResponse,
    BookingRequest,
    CreateBooking,
    BookingItem,
} from '../../../models/booking/booking.model';
import { PagedResponse } from '../../../models/page-response/page-response.model';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ToastService } from '../../../services/toast/toast.service';

@Component({
    selector: 'app-booking',
    templateUrl: './booking.component.html',
    styleUrls: ['./booking.component.scss'],
})
export class BookingComponent implements OnInit {
    @ViewChild('rightDrawer') rightDrawer!: MatDrawer;

    phTime: string = '';
    phDate: string = '';
    private timeInterval: any;
    productClassifications: ProductClassification[] = [];
    isLoadingProductClassifications = false;
    isCreatingBooking = false;

    // Booking list
    bookings: BookingResponse[] = [];
    isLoadingBookings = false;

    // Pagination
    currentPage = 1;
    totalPages = 0;
    pageSize = 10;
    totalCount = 0;

    // Optional filters
    searchTerm: string = '';
    bookingDate: string = '';

    // Form
    bookingForm!: FormGroup;

    constructor(
        private productClassificationService: ProductClassificationService,
        private bookingService: BookingService,
        private fb: FormBuilder,
        private toast: ToastService
    ) {}

    ngOnInit(): void {
        this.updatePhTime();
        // Update time every second
        this.timeInterval = setInterval(() => {
            this.updatePhTime();
        }, 1000);

        this.loadProductClassifications();
        this.loadBookings();
        this.initForm();
    }

    ngOnDestroy() {
        // Clean up the interval when component is destroyed
        if (this.timeInterval) {
            clearInterval(this.timeInterval);
        }
    }

    private initForm(): void {
        // Set default booking date to today in PH timezone
        const today = new Date();
        const phDate = new Date(
            today.toLocaleString('en-US', { timeZone: 'Asia/Manila' })
        );
        const formattedDate = phDate.toISOString().split('T')[0];

        this.bookingForm = this.fb.group({
            bookingDate: [formattedDate, Validators.required],
            remarks: [''],
            items: this.fb.array([], Validators.required), // At least one customer required
        });

        // Add initial customer
        this.addCustomer();
    }

    // Getter for form controls
    get bookingDateControl() {
        return this.bookingForm.get('bookingDate');
    }

    get remarksControl() {
        return this.bookingForm.get('remarks');
    }

    get items(): FormArray {
        return this.bookingForm.get('items') as FormArray;
    }

    // Customer methods
    addCustomer(): void {
        const customerGroup = this.fb.group({
            customerName: ['', [Validators.required, Validators.minLength(1)]],
            customerType: ['', [Validators.required, Validators.minLength(1)]],
            isPrio: [false],
            productQuantities: this.fb.array([], Validators.required), // At least one product required
        });

        this.items.push(customerGroup);
    }

    removeCustomer(index: number): void {
        if (this.items.length > 1) {
            this.items.removeAt(index);
        }
    }

    // Product methods for a specific customer
    getProductQuantities(customerIndex: number): FormArray {
        return this.items
            .at(customerIndex)
            .get('productQuantities') as FormArray;
    }

    addProduct(customerIndex: number): void {
        const productGroup = this.fb.group({
            productId: ['', Validators.required],
            quantity: ['', [Validators.required, Validators.min(0.01)]],
        });

        this.getProductQuantities(customerIndex).push(productGroup);
    }

    removeProduct(customerIndex: number, productIndex: number): void {
        const productQuantities = this.getProductQuantities(customerIndex);
        if (productQuantities.length > 1) {
            productQuantities.removeAt(productIndex);
        } else {
            // If last product, clear values instead of removing
            productQuantities.at(productIndex).patchValue({
                productId: '',
                quantity: '',
            });
        }
    }

    // Form submission
    onSubmit(): void {
        if (this.bookingForm.invalid) {
            this.markFormGroupTouched(this.bookingForm);
            return;
        }

        // Validate each customer has at least one valid product
        const formItems = this.items.value;
        let isValid = true;

        for (let i = 0; i < formItems.length; i++) {
            const products = formItems[i].productQuantities;
            if (
                !products ||
                products.length === 0 ||
                products.every((p: any) => !p.productId || p.quantity <= 0)
            ) {
                alert(
                    `Customer ${
                        i + 1
                    } must have at least one product with valid quantity.`
                );
                isValid = false;
                break;
            }
        }

        if (!isValid) return;

        // Prepare data for API
        const formValue = this.bookingForm.value;
        const createBookingDto: CreateBooking = {
            bookingDate: this.formatBookingDate(formValue.bookingDate),
            remarks: formValue.remarks || '',
            items: formValue.items.map((item: any) => ({
                customerName: item.customerName,
                customerType: item.customerType,
                isPrio: item.isPrio,
                productQuantities: this.convertToProductQuantities(
                    item.productQuantities
                ),
            })),
        };

        this.createBooking(createBookingDto);
    }

    private convertToProductQuantities(productArray: any[]): {
        [key: number]: number;
    } {
        const quantities: { [key: number]: number } = {};

        productArray.forEach((product) => {
            if (product.productId && product.quantity > 0) {
                quantities[parseInt(product.productId)] = parseFloat(
                    product.quantity
                );
            }
        });

        return quantities;
    }

    private formatBookingDate(dateString: string): string {
        // Convert date string to ISO string with timezone
        const date = new Date(dateString);
        // Set to Philippine timezone and default time to 00:00:00
        const phDate = new Date(
            date.toLocaleString('en-US', { timeZone: 'Asia/Manila' })
        );
        phDate.setHours(0, 0, 0, 0);
        return phDate.toISOString();
    }

    private createBooking(createBookingDto: CreateBooking): void {
        this.isCreatingBooking = true;

        this.bookingService.createBooking(createBookingDto).subscribe({
            next: () => {
                this.isCreatingBooking = false;

                // ✅ Success toast
                this.toast.success('Booking created successfully!');

                // Reset form
                this.bookingForm.reset();
                this.items.clear();
                this.addCustomer();

                // Set default date (PH time)
                const today = new Date();
                const phDate = new Date(
                    today.toLocaleString('en-US', { timeZone: 'Asia/Manila' })
                );
                const formattedDate = phDate.toISOString().split('T')[0];
                this.bookingForm.patchValue({ bookingDate: formattedDate });

                // Reload bookings
                this.loadBookings();

                // Close drawer
                this.closeRightDrawer();
            },
            error: (error) => {
                this.isCreatingBooking = false;
                console.error('Failed to create booking', error);

                // ❌ Validation errors
                if (error.error?.errors?.length) {
                    error.error.errors.forEach((err: string) =>
                        this.toast.error(err)
                    );
                    return;
                }

                // ❌ API message
                if (error.error?.message) {
                    this.toast.error(error.error.message);
                    return;
                }

                // ❌ Fallback
                this.toast.error('Failed to create booking. Please try again.');
            },
        });
    }

    resetForm(): void {
        this.bookingForm.reset();
        this.items.clear();
        this.addCustomer();

        // Set default date
        const today = new Date();
        const phDate = new Date(
            today.toLocaleString('en-US', { timeZone: 'Asia/Manila' })
        );
        const formattedDate = phDate.toISOString().split('T')[0];
        this.bookingForm.patchValue({
            bookingDate: formattedDate,
            remarks: '',
        });
    }

    // Helper method to mark all form controls as touched
    private markFormGroupTouched(formGroup: FormGroup | FormArray): void {
        Object.values(formGroup.controls).forEach((control) => {
            control.markAsTouched();
            if (control instanceof FormGroup || control instanceof FormArray) {
                this.markFormGroupTouched(control);
            }
        });
    }

    // Calculate totals
    getTotalQuantity(): number {
        let total = 0;
        this.items.value.forEach((item: any) => {
            item.productQuantities?.forEach((product: any) => {
                if (product.quantity) {
                    total += parseFloat(product.quantity);
                }
            });
        });
        return parseFloat(total.toFixed(2));
    }

    toggleRightDrawer(): void {
        this.rightDrawer.toggle();
    }

    openRightDrawer(): void {
        this.rightDrawer.open();
    }

    closeRightDrawer(): void {
        this.rightDrawer.close();
    }

    private updatePhTime() {
        const now = new Date();
        const options: Intl.DateTimeFormatOptions = {
            timeZone: 'Asia/Manila',
            hour12: true,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        };

        const dateOptions: Intl.DateTimeFormatOptions = {
            timeZone: 'Asia/Manila',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        };

        this.phTime = now.toLocaleTimeString('en-US', options);
        this.phDate = now.toLocaleDateString('en-US', dateOptions);
    }

    private loadProductClassifications(): void {
        this.isLoadingProductClassifications = true;

        this.productClassificationService.getAll().subscribe({
            next: (data) => {
                this.productClassifications = data;
                this.isLoadingProductClassifications = false;
            },
            error: (err) => {
                console.error('Failed to load product classifications', err);
                this.isLoadingProductClassifications = false;
            },
        });
    }

    loadBookings(page: number = 1): void {
        this.isLoadingBookings = true;

        const request: BookingRequest = {
            pageNumber: page,
            pageSize: this.pageSize,
            searchTerm: this.searchTerm,
            bookingDate: this.bookingDate || undefined,
        };

        this.bookingService.getBookings(request).subscribe({
            next: (res: PagedResponse<BookingResponse>) => {
                this.bookings = res.items;
                this.currentPage = res.currentPage;
                this.totalPages = res.totalPages;
                this.totalCount = res.totalCount;
                this.isLoadingBookings = false;
            },
            error: (err) => {
                console.error('Failed to load bookings', err);
                this.isLoadingBookings = false;
            },
        });
    }

    onSearch(): void {
        this.currentPage = 1;
        this.loadBookings();
    }

    onDateChange(date: string): void {
        this.bookingDate = date;
        this.currentPage = 1;
        this.loadBookings();
    }

    

    // Page change handler
    onPageChange(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.loadBookings(page);
}

    // Page size change handler
    onPageSizeChange(size: number): void {
        this.pageSize = size;
        this.currentPage = 1; // Reset to first page when changing page size
        this.loadBookings();
    }

    // Add this method to your BookingComponent class
    getShowingTo(): number {
        const to = this.currentPage * this.pageSize;
        return Math.min(to, this.totalCount);
    }

    getShowingFrom(): number {
        return (this.currentPage - 1) * this.pageSize + 1;
    }

    // Add this method for pagination numbers
    getPages(): (number | string)[] {
        const pages: (number | string)[] = [];

        // Always show first page
        pages.push(1);

        // If total pages is 1, return just [1]
        if (this.totalPages === 1) {
            return pages;
        }

        // Show ellipsis after first page if current page > 4
        if (this.currentPage > 4) {
            pages.push('...');
        }

        // Determine which pages to show around current page
        let start = Math.max(2, this.currentPage - 1);
        let end = Math.min(this.totalPages - 1, this.currentPage + 1);

        // Adjust if we're near the beginning
        if (this.currentPage <= 3) {
            end = Math.min(4, this.totalPages - 1);
        }

        // Adjust if we're near the end
        if (this.currentPage >= this.totalPages - 2) {
            start = Math.max(2, this.totalPages - 3);
        }

        // Add the middle pages
        for (let i = start; i <= end; i++) {
            pages.push(i);
        }

        // Show ellipsis before last page if current page < totalPages - 3
        if (this.currentPage < this.totalPages - 3) {
            pages.push('...');
        }

        // Always show last page if there's more than 1 page
        if (this.totalPages > 1) {
            pages.push(this.totalPages);
        }

        return pages;
    }
}
