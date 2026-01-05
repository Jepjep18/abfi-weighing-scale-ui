import { Component, OnInit } from '@angular/core';
import { ProductClassificationService } from '../../../../services/product-classification/product-classification.service';
import { CustomerDto } from 'app/models/customer/customer.model';
import { CustomerService } from 'app/services/customer/customer.service';
import { CreateBooking } from 'app/models/booking/booking.model';
import { BookingService } from 'app/services/booking/booking.service';
import { ToastService } from 'app/services/toast/toast.service';

interface ProductCategory {
    name: string;
    label: string;
    id: number;
}

interface Customer {
    name: string;
    type: string; // Changed from specific union to string to allow dynamic types
    priority?: string;
    isWAP?: boolean;
    id?: number;
    isNew?: boolean;
    advancePayment?: number;
    isPrio?: boolean;
}

interface BookingData {
    [key: string]: number;
}

@Component({
    selector: 'app-booking-create',
    templateUrl: './booking-create.component.html',
    styleUrls: ['./booking-create.component.scss'],
})
export class BookingCreateComponent implements OnInit {
    productCategories: ProductCategory[] = [];
    productCodeToIdMap: Map<string, number> = new Map();

    customers: Customer[] = [];

    bookingData: Map<string, BookingData> = new Map();
    advancePaymentData: Map<string, number> = new Map();
    isPrioData: Map<string, boolean> = new Map();

    searchTerm = '';
    filterType: string = 'ALL';
    viewMode: 'table' | 'compact' = 'table';

    isLoading = true;
    loadingError = false;
    isSaving = false;

    isAddingNewCustomer = false;
    newCustomer: Customer = {
        name: '',
        type: 'DEALER',
        isNew: true,
        advancePayment: 0,
        isPrio: false,
    };
    newCustomerQuantities: { [key: string]: number } = {};

    remarks = '';
    showRemarksModal = false;

    constructor(
        private customerService: CustomerService,
        private productClassificationService: ProductClassificationService,
        private bookingService: BookingService,
        private toastService: ToastService
    ) {}

    ngOnInit(): void {
        this.loadData();
    }

    loadData(): void {
        this.isLoading = true;

        this.productClassificationService.getAll().subscribe({
            next: (classifications: any[]) => {
                this.productCategories = classifications
                    .filter((pc) => pc.productCode && pc.id)
                    .map((pc) => {
                        this.productCodeToIdMap.set(pc.productCode, pc.id);
                        return {
                            name: pc.productCode,
                            label: pc.productCode,
                            id: pc.id,
                        };
                    });

                this.productCategories.forEach((cat) => {
                    this.newCustomerQuantities[cat.name] = 0;
                });

                this.loadCustomers();
            },
            error: (error) => {
                console.error('Error loading product classifications:', error);
                this.toastService.error('Failed to load product classifications');
                this.loadingError = true;
                this.isLoading = false;
            },
        });
    }

    loadCustomers(): void {
        this.customerService.getAllCustomers().subscribe({
            next: (customerDtos: CustomerDto[]) => {
                this.customers = customerDtos.map((dto) => {
                    let type = 'DEALER'; // Default type

                    if (dto.customerType) {
                        const upperType = dto.customerType.toUpperCase();
                        type = upperType;
                    }

                    const customer: Customer = {
                        name: dto.customerName,
                        type: type,
                        id: dto.id,
                        advancePayment: 0,
                    };

                    this.bookingData.set(customer.name, {});
                    this.advancePaymentData.set(customer.name, 0);
                    this.isPrioData.set(customer.name, false);

                    this.addCustomerPriority(customer);

                    return customer;
                });

                this.isLoading = false;
            },
            error: (error) => {
                console.error('Error loading customers:', error);
                this.toastService.error('Failed to load customers');
                this.loadingError = true;
                this.isLoading = false;
            },
        });
    }

    /**
     * Get all unique customer types from loaded customers
     * Always includes 'ALL' as the first option
     */
    get customerTypes(): string[] {
        const uniqueTypes = new Set<string>();
        
        // Always include 'ALL' first
        uniqueTypes.add('ALL');
        
        // Add all unique types from customers
        this.customers.forEach(customer => {
            if (customer.type && customer.type.trim() !== '') {
                uniqueTypes.add(customer.type);
            }
        });
        
        // Convert Set to Array and sort for consistent ordering
        const typesArray = Array.from(uniqueTypes);
        
        // Sort: 'ALL' always first, then alphabetical
        return typesArray.sort((a, b) => {
            if (a === 'ALL') return -1;
            if (b === 'ALL') return 1;
            return a.localeCompare(b);
        });
    }

    /**
     * Get display label for customer type
     * Formats the type for display (e.g., 'NEW_ACCOUNT' becomes 'New Accounts')
     */
    getCustomerTypeLabel(type: string): string {
        // Define labels for known types
        const labels: { [key: string]: string } = {
            'ALL': 'All',
            'DISTRIBUTOR': 'Distributors',
            'DEALER': 'Dealers',
            'NEW_ACCOUNT': 'New Accounts',
            'ADDAO': 'ADDAO',
            'LOTS': 'LOTS',
            'DISTRIBUTER': 'Distributers', // Handle typo in your data
            'TEST': 'Test',
            'WAP': 'WAP'
        };
        
        // Return mapped label if exists, otherwise format the string nicely
        if (labels[type]) {
            return labels[type];
        }
        
        // Format unknown types: convert to title case and replace underscores
        return type
            .toLowerCase()
            .replace(/_/g, ' ')
            .replace(/\b\w/g, char => char.toUpperCase());
    }

    /**
     * Get count of customers for a specific type
     */
    getCustomerCount(type: string): number {
        if (type === 'ALL') {
            return this.customers.length;
        }
        return this.customers.filter(c => c.type === type).length;
    }

    private addCustomerPriority(customer: Customer): void {
        const priorityCustomers = ['SAMAL', 'B-LOTS NORTE', 'S DAVAO', 'B.MANGAGOY', 'CAUBE'];
        const highPriorityCustomers = ['LEJARSO', 'DANIEL EBANGUILLADOR'];

        if (priorityCustomers.includes(customer.name)) {
            customer.priority = 'Prio for allocation';
            this.isPrioData.set(customer.name, true);
        } else if (highPriorityCustomers.includes(customer.name)) {
            customer.priority = 'Prio for allocation not less than 100kgs';
            this.isPrioData.set(customer.name, true);
        }

        if (customer.name === 'DICME DIONSON') {
            customer.isWAP = true;
        }
    }

    // Check if customer has any booking
    hasBooking(customerName: string): boolean {
        const data = this.bookingData.get(customerName);
        const hasQuantity = data && Object.values(data).some(q => q > 0);
        const hasAdvance = (this.advancePaymentData.get(customerName) || 0) > 0;
        return hasQuantity || hasAdvance;
    }

    // Get visible categories (filter out empty ones in compact mode)
    getVisibleCategories(): ProductCategory[] {
        if (this.viewMode === 'compact') {
            return this.productCategories.filter(cat => {
                return this.customers.some(customer => 
                    this.getQuantity(customer.name, cat.name) > 0
                );
            });
        }
        return this.productCategories;
    }

    updateAdvancePayment(customerName: string, value: string): void {
        const numValue = parseInt(value) || 0;
        this.advancePaymentData.set(customerName, numValue);
    }

    getAdvancePayment(customerName: string): number {
        return this.advancePaymentData.get(customerName) || 0;
    }

    getTotalAdvancePayment(): number {
        let total = 0;
        this.advancePaymentData.forEach((payment) => {
            total += payment;
        });
        return total;
    }

    updateIsPrio(customerName: string, isPrio: boolean): void {
        this.isPrioData.set(customerName, isPrio);
    }

    getIsPrio(customerName: string): boolean {
        return this.isPrioData.get(customerName) || false;
    }

    addNewCustomer(): void {
        this.isAddingNewCustomer = true;
        this.newCustomer = {
            name: '',
            type: 'DEALER',
            isNew: true,
            advancePayment: 0,
            isPrio: false,
        };

        this.productCategories.forEach((cat) => {
            this.newCustomerQuantities[cat.name] = 0;
        });

        setTimeout(() => {
            const tableContainer = document.querySelector('.overflow-auto');
            if (tableContainer) {
                tableContainer.scrollTop = 0;
            }
        }, 100);
    }

    saveNewCustomer(): void {
        if (!this.newCustomer.name.trim()) {
            this.toastService.warning('Please enter a customer name');
            return;
        }

        const existingCustomer = this.customers.find(
            (c) => c.name.toLowerCase() === this.newCustomer.name.toLowerCase()
        );

        if (existingCustomer) {
            this.toastService.warning('A customer with this name already exists');
            return;
        }

        const customerPayload = {
            customerName: this.newCustomer.name.trim(),
            customerType: this.newCustomer.type,
        };

        this.toastService.info('Creating customer...');

        this.customerService.createCustomer(customerPayload).subscribe({
            next: (createdCustomer) => {
                const customerToAdd: Customer = {
                    id: createdCustomer.id,
                    name: createdCustomer.customerName,
                    type: createdCustomer.customerType,
                    isWAP: this.newCustomer.isWAP || false,
                    isNew: false,
                    advancePayment: this.newCustomer.advancePayment || 0,
                    isPrio: this.newCustomer.isPrio || false,
                };

                this.customers.unshift(customerToAdd);
                this.bookingData.set(customerToAdd.name, {});
                this.advancePaymentData.set(customerToAdd.name, customerToAdd.advancePayment || 0);
                this.isPrioData.set(customerToAdd.name, customerToAdd.isPrio || false);

                Object.entries(this.newCustomerQuantities).forEach(([category, quantity]) => {
                    if (quantity > 0) {
                        this.updateQuantity(customerToAdd.name, category, quantity.toString());
                    }
                });

                this.cancelAddCustomer();
                this.toastService.success(`Customer "${customerToAdd.name}" created successfully!`);
            },
            error: (error) => {
                console.error('Error creating customer:', error);

                if (error.status === 405) {
                    console.warn('POST method not allowed. Trying local save instead...');
                    this.saveNewCustomerLocally();
                    return;
                }

                let errorMessage = 'Failed to create customer';

                if (error.error) {
                    if (typeof error.error === 'string') {
                        errorMessage = error.error;
                    } else if (error.error.message) {
                        errorMessage = error.error.message;
                    } else if (error.error.errors) {
                        const errors = Object.entries(error.error.errors)
                            .map(([key, value]) => 
                                `${key}: ${Array.isArray(value) ? value.join(', ') : value}`
                            )
                            .join('\n');
                        errorMessage = `Validation errors:\n${errors}`;
                    }
                } else if (error.message) {
                    errorMessage = error.message;
                }

                this.toastService.error(errorMessage);
            },
        });
    }

    private saveNewCustomerLocally(): void {
        const tempId = Date.now();

        const customerToAdd: Customer = {
            id: tempId,
            name: this.newCustomer.name,
            type: this.newCustomer.type,
            isWAP: this.newCustomer.isWAP || false,
            isNew: true,
            advancePayment: this.newCustomer.advancePayment || 0,
            isPrio: this.newCustomer.isPrio || false,
        };

        this.customers.unshift(customerToAdd);
        this.bookingData.set(customerToAdd.name, {});
        this.advancePaymentData.set(customerToAdd.name, customerToAdd.advancePayment || 0);
        this.isPrioData.set(customerToAdd.name, customerToAdd.isPrio || false);

        Object.entries(this.newCustomerQuantities).forEach(([category, quantity]) => {
            if (quantity > 0) {
                this.updateQuantity(customerToAdd.name, category, quantity.toString());
            }
        });

        this.cancelAddCustomer();
        this.toastService.warning(
            `Customer "${customerToAdd.name}" saved locally only (API unavailable)`
        );
    }

    cancelAddCustomer(): void {
        this.isAddingNewCustomer = false;
        this.newCustomer = {
            name: '',
            type: 'DEALER',
            isNew: true,
            advancePayment: 0,
            isPrio: false,
        };

        this.productCategories.forEach((cat) => {
            this.newCustomerQuantities[cat.name] = 0;
        });
    }

    getNewCustomerTotal(): number {
        return Object.values(this.newCustomerQuantities).reduce((sum, val) => sum + val, 0);
    }

    get filteredCustomers(): Customer[] {
        let filtered = this.customers;

        if (this.filterType !== 'ALL') {
            filtered = filtered.filter((c) => c.type === this.filterType);
        }

        if (this.searchTerm) {
            filtered = filtered.filter((c) =>
                c.name.toLowerCase().includes(this.searchTerm.toLowerCase())
            );
        }

        return filtered;
    }

    get distributorCount(): number {
        return this.customers.filter((c) => c.type === 'DISTRIBUTOR').length;
    }

    get dealerCount(): number {
        return this.customers.filter((c) => c.type === 'DEALER').length;
    }

    // Get count of customers with active bookings
    getActiveBookingsCount(): number {
        let count = 0;
        this.customers.forEach(customer => {
            if (this.hasBooking(customer.name)) {
                count++;
            }
        });
        return count;
    }

    // Get count of customers with bookings for a specific type
    getBookingsCountForType(type: string): number {
        let count = 0;
        this.customers.forEach(customer => {
            if (customer.type === type && this.hasBooking(customer.name)) {
                count++;
            }
        });
        return count;
    }

    updateQuantity(customerName: string, category: string, value: string): void {
        const data = this.bookingData.get(customerName);
        if (data) {
            const numValue = parseInt(value) || 0;
            if (numValue > 0) {
                data[category] = numValue;
            } else {
                delete data[category];
            }
        }
    }

    getQuantity(customerName: string, category: string): number {
        const data = this.bookingData.get(customerName);
        return data?.[category] || 0;
    }

    getTotalForCustomer(customerName: string): number {
        const data = this.bookingData.get(customerName);
        if (!data) return 0;
        return Object.values(data).reduce((sum, val) => sum + val, 0);
    }

    getTotalForCategory(category: string): number {
        let total = 0;
        this.bookingData.forEach((data) => {
            total += data[category] || 0;
        });
        return total;
    }

    getGrandTotal(): number {
        let total = 0;
        this.bookingData.forEach((data) => {
            total += Object.values(data).reduce((sum, val) => sum + val, 0);
        });
        return total;
    }

    clearBooking(customerName: string): void {
        this.bookingData.set(customerName, {});
        this.advancePaymentData.set(customerName, 0);
        this.toastService.info(`Booking cleared for ${customerName}`);
    }

    exportData(): void {
        const exportData: any[] = [];
        this.customers.forEach((customer) => {
            const data = this.bookingData.get(customer.name);
            const advancePayment = this.advancePaymentData.get(customer.name) || 0;
            const isPrio = this.isPrioData.get(customer.name) || false;

            if ((data && Object.keys(data).length > 0) || advancePayment > 0) {
                exportData.push({
                    customerId: customer.id,
                    customerName: customer.name,
                    customerType: customer.type,
                    isPrio: isPrio,
                    ...data,
                    total: this.getTotalForCustomer(customer.name),
                    advancePayment: advancePayment,
                });
            }
        });

        console.table(exportData);
        this.toastService.success('Data exported to console (F12)');
    }

    saveBooking(): void {
        let hasBookingData = false;
        this.bookingData.forEach((data) => {
            if (Object.keys(data).length > 0) {
                hasBookingData = true;
            }
        });

        if (!hasBookingData) {
            this.toastService.warning(
                'No booking data to save. Please add quantities for at least one customer.'
            );
            return;
        }

        this.showRemarksModal = true;
    }

    confirmSaveBooking(): void {
        if (this.isSaving) {
            return;
        }

        const customerBookingsMap = new Map<number, any>();

        this.customers.forEach((customer) => {
            const data = this.bookingData.get(customer.name);
            const advancePayment = this.advancePaymentData.get(customer.name) || 0;
            const isPrio = this.isPrioData.get(customer.name) || false;

            if (data && Object.keys(data).length > 0 && customer.id) {
                if (!customerBookingsMap.has(customer.id)) {
                    customerBookingsMap.set(customer.id, {
                        customerId: customer.id,
                        isPrio: isPrio,
                        advancePayment: advancePayment > 0 ? { advanceAmount: advancePayment } : null,
                        productQuantities: {},
                    });
                }

                const bookingItem = customerBookingsMap.get(customer.id);
                Object.entries(data).forEach(([productCode, quantity]) => {
                    if (quantity > 0) {
                        const productId = this.productCodeToIdMap.get(productCode);
                        if (productId) {
                            bookingItem.productQuantities[productId] =
                                (bookingItem.productQuantities[productId] || 0) + quantity;
                        } else {
                            this.toastService.warning(
                                `Product code "${productCode}" not found in system`
                            );
                        }
                    }
                });
            }
        });

        const bookingItems = Array.from(customerBookingsMap.values()).filter(
            (item) => Object.keys(item.productQuantities).length > 0
        );

        if (bookingItems.length === 0) {
            this.toastService.warning(
                'No booking data to save. Please add quantities for at least one customer.'
            );
            return;
        }

        const createBookingDto: CreateBooking = {
            bookingDate: new Date().toISOString(),
            remarks: this.remarks || '',
            items: bookingItems,
        };

        this.isSaving = true;
        this.toastService.info('Saving booking...');

        this.bookingService.createBooking(createBookingDto).subscribe({
            next: (response) => {
                const totalItems = bookingItems.reduce((total: number, item: any) => {
                    const quantities = Object.values(item.productQuantities) as number[];
                    return total + quantities.reduce((sum: number, qty: number) => sum + qty, 0);
                }, 0);

                const totalCustomers = bookingItems.length;
                const totalAdvance = bookingItems.reduce((total: number, item: any) => {
                    return total + (item.advancePayment?.advanceAmount || 0);
                }, 0);

                this.toastService.success(
                    `Booking saved successfully!\n` +
                    `Summary:\n` +
                    `• ${totalCustomers} customer${totalCustomers > 1 ? 's' : ''}\n` +
                    `• ${totalItems} total items\n` +
                    `• ₱${totalAdvance.toLocaleString()} total advance payment`
                );

                this.remarks = '';
                this.clearAllBookings();
                this.isSaving = false;
            },
            error: (error) => {
                console.error('Error saving booking:', error);
                this.isSaving = false;

                let errorMessage = 'Error saving booking';

                if (error.error?.errors) {
                    const errorMessages = Object.entries(error.error.errors)
                        .map(([key, value]) => 
                            `${key}: ${Array.isArray(value) ? value.join(', ') : value}`
                        )
                        .join('\n');
                    errorMessage = `Validation errors:\n${errorMessages}`;
                } else if (error.error?.title) {
                    errorMessage = `${error.error.title}: ${error.error.detail || ''}`;
                } else if (error.error?.message) {
                    errorMessage = error.error.message;
                }

                this.toastService.error(errorMessage);
            },
        });
    }

    cancelSaveBooking(): void {
        this.showRemarksModal = false;
        this.remarks = '';
    }

    clearAllBookings(): void {
        this.customers.forEach((customer) => {
            this.bookingData.set(customer.name, {});
            this.advancePaymentData.set(customer.name, 0);
            this.isPrioData.set(customer.name, false);
        });
        this.toastService.info('All bookings cleared');
    }

    retryLoad(): void {
        this.loadingError = false;
        this.loadData();
    }
}