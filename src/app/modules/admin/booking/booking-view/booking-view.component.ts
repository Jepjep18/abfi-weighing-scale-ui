import { Component, OnInit, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BookingService } from '../../../../services/booking/booking.service';
import { ApiErrorResponse, BookingDetailsResponse } from '../../../../models/booking/booking.model';

interface Customer {
  name: string;
  type: string;
  isNew?: boolean;
  priority?: string;
  isWAP?: boolean;
}

interface ProductCategory {
  name: string;
  label: string;
}

interface BookingItem {
  [customerName: string]: {
    quantities: { [category: string]: number };
    advancePayment: number;
    isPrio: boolean;
    type: string;
  };
}

interface Allocation {
  [customerName: string]: {
    [category: string]: {
      allocated: number;
      remaining: number;
      original: number;
    }
  };
}

interface HistoryState {
  allocations: Allocation;
  timestamp: number;
}

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
  
  // UI variables
  searchTerm: string = '';
  filterType: string = 'ALL';
  viewMode: 'table' | 'compact' = 'table';
  customerTypes = ['ALL', 'DEALER', 'DISTRIBUTOR', 'NEW_ACCOUNT', 'ADDAO', 'LOTS', 'WAP'];
  
  // Data structures
  allCustomers: Customer[] = [];
  filteredCustomers: Customer[] = [];
  productCategories: ProductCategory[] = [];
  bookingItems: BookingItem = {};
  
  // Allocation data
  allocations: Allocation = {};
  editingAllocation: { customerName: string; category: string; } | null = null;
  tempAllocationValue: number = 0;
  
  // History for undo/redo
  private history: HistoryState[] = [];
  private historyIndex: number = -1;
  private readonly MAX_HISTORY = 50;
  
  // Summary counts
  distributorCount: number = 0;
  dealerCount: number = 0;
  totalQuantity: number = 0;
  totalAdvance: number = 0;
  totalAllocated: number = 0;

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

  // Keyboard shortcuts
  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    // Ctrl/Cmd + Z for undo
    if ((event.ctrlKey || event.metaKey) && event.key === 'z' && !event.shiftKey) {
      event.preventDefault();
      this.undo();
    }
    // Ctrl/Cmd + Shift + Z or Ctrl/Cmd + Y for redo
    if (((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'z') ||
        ((event.ctrlKey || event.metaKey) && event.key === 'y')) {
      event.preventDefault();
      this.redo();
    }
  }

  loadBookingDetails(): void {
    if (this.bookingId <= 0) {
      this.error = { message: 'Invalid booking ID' };
      return;
    }

    this.isLoading = true;
    this.error = null;
    this.bookingDetails = null;
    this.allCustomers = [];
    this.filteredCustomers = [];
    this.bookingItems = {};
    this.allocations = {};
    this.history = [];
    this.historyIndex = -1;

    this.bookingService.getBooking(this.bookingId).subscribe({
      next: (details) => {
        this.bookingDetails = details;
        this.processBookingData(details);
        this.isLoading = false;
        // Save initial state to history
        this.saveToHistory();
      },
      error: (error: ApiErrorResponse) => {
        this.error = error;
        this.isLoading = false;
        console.error('Error loading booking details:', error);
      }
    });
  }

  processBookingData(details: BookingDetailsResponse): void {
    const uniqueCustomers = new Map<string, Customer>();
    const productCodes = new Set<string>();
    
    // Process each booking item
    details.items.forEach(item => {
      const customerName = item.customer.customerName;
      const productCode = item.productClassification.productCode;
      const customerType = this.formatCustomerType(item.customer.customerType);
      
      // Add product code to set
      productCodes.add(productCode);
      
      // Create or update customer
      if (!uniqueCustomers.has(customerName)) {
        uniqueCustomers.set(customerName, {
          name: customerName,
          type: customerType,
          isNew: false,
          priority: ''
        });
      }
      
      // Initialize booking items structure
      if (!this.bookingItems[customerName]) {
        this.bookingItems[customerName] = {
          quantities: {},
          advancePayment: 0,
          isPrio: false,
          type: customerType
        };
      }
      
      // Initialize allocations structure
      if (!this.allocations[customerName]) {
        this.allocations[customerName] = {};
      }
      
      // Set priority if any item is priority
      if (item.isPrio) {
        this.bookingItems[customerName].isPrio = true;
      }
      
      // Set quantity for this product category
      const quantity = item.quantity;
      this.bookingItems[customerName].quantities[productCode] = quantity;
      
      // Initialize allocation for this category
      this.allocations[customerName][productCode] = {
        allocated: 0,
        remaining: quantity,
        original: quantity
      };
    });
    
    // Convert map to array and sort alphabetically
    this.allCustomers = Array.from(uniqueCustomers.values())
      .sort((a, b) => a.name.localeCompare(b.name));
    
    // Initialize filtered customers
    this.filteredCustomers = [...this.allCustomers];
    
    // Create product categories from unique product codes
    this.productCategories = Array.from(productCodes).map(code => ({
      name: code,
      label: code
    }));
    
    // Calculate summary counts
    this.calculateSummaryCounts();
  }

  formatCustomerType(type: string): string {
    switch(type?.toUpperCase()) {
      case 'DISTRIBUTOR': return 'DISTRIBUTOR';
      case 'DEALER': return 'DEALER';
      case 'NEW ACCOUNT': return 'NEW_ACCOUNT';
      case 'ADDAO': return 'ADDAO';
      case 'LOTS': return 'LOTS';
      case 'WAP': return 'WAP';
      default: return type?.toUpperCase() || 'DEALER';
    }
  }

  calculateSummaryCounts(): void {
    this.distributorCount = this.allCustomers.filter(c => c.type === 'DISTRIBUTOR').length;
    this.dealerCount = this.allCustomers.filter(c => c.type === 'DEALER').length;
    
    // Calculate totals
    this.totalQuantity = 0;
    this.totalAdvance = 0;
    this.totalAllocated = 0;
    
    Object.values(this.bookingItems).forEach(customerData => {
      Object.values(customerData.quantities).forEach(quantity => {
        this.totalQuantity += quantity;
      });
      this.totalAdvance += customerData.advancePayment;
    });
    
    // Calculate total allocated
    Object.values(this.allocations).forEach(customerAllocations => {
      Object.values(customerAllocations).forEach(allocation => {
        this.totalAllocated += allocation.allocated;
      });
    });
  }

  // History management for undo/redo
  private saveToHistory(): void {
    // Remove any states after current index (when user made changes after undo)
    this.history = this.history.slice(0, this.historyIndex + 1);
    
    // Deep clone allocations to avoid reference issues
    const state: HistoryState = {
      allocations: JSON.parse(JSON.stringify(this.allocations)),
      timestamp: Date.now()
    };
    
    this.history.push(state);
    this.historyIndex++;
    
    // Limit history size
    if (this.history.length > this.MAX_HISTORY) {
      this.history.shift();
      this.historyIndex--;
    }
  }

  canUndo(): boolean {
    return this.historyIndex > 0;
  }

  canRedo(): boolean {
    return this.historyIndex < this.history.length - 1;
  }

  undo(): void {
    if (this.canUndo()) {
      this.historyIndex--;
      this.allocations = JSON.parse(JSON.stringify(this.history[this.historyIndex].allocations));
      this.calculateSummaryCounts();
      console.log('Undo: Restored state from', new Date(this.history[this.historyIndex].timestamp));
    }
  }

  redo(): void {
    if (this.canRedo()) {
      this.historyIndex++;
      this.allocations = JSON.parse(JSON.stringify(this.history[this.historyIndex].allocations));
      this.calculateSummaryCounts();
      console.log('Redo: Restored state from', new Date(this.history[this.historyIndex].timestamp));
    }
  }

  // Allocation methods
  startAllocation(customerName: string, category: string): void {
    this.editingAllocation = { customerName, category };
    const allocation = this.getAllocation(customerName, category);
    this.tempAllocationValue = allocation?.allocated || 0;
  }

  saveAllocation(): void {
    if (!this.editingAllocation) return;
    
    const { customerName, category } = this.editingAllocation;
    const allocation = this.getAllocation(customerName, category);
    
    if (allocation) {
      // Validate input
      let newAllocation = Math.max(0, Math.min(this.tempAllocationValue, allocation.original));
      
      // Only save if value changed
      if (newAllocation !== allocation.allocated) {
        const remaining = allocation.original - newAllocation;
        
        allocation.allocated = newAllocation;
        allocation.remaining = remaining;
        
        // Save to history
        this.saveToHistory();
        
        // Recalculate totals
        this.calculateSummaryCounts();
      }
    }
    
    this.cancelAllocation();
  }

  cancelAllocation(): void {
    this.editingAllocation = null;
    this.tempAllocationValue = 0;
  }

  setAllocationPercent(percent: number): void {
    if (!this.editingAllocation) return;
    
    const { customerName, category } = this.editingAllocation;
    const allocation = this.getAllocation(customerName, category);
    
    if (allocation) {
      this.tempAllocationValue = Math.round((allocation.original * percent) / 100);
    }
  }

  // Bulk allocation methods
  bulkAllocate(customerName: string, percent: number): void {
    const customerAllocations = this.allocations[customerName];
    if (!customerAllocations) return;
    
    let hasChanges = false;
    
    // Apply percentage to all categories for this customer
    Object.keys(customerAllocations).forEach(category => {
      const allocation = customerAllocations[category];
      const newAllocation = Math.round((allocation.original * percent) / 100);
      
      if (newAllocation !== allocation.allocated) {
        allocation.allocated = newAllocation;
        allocation.remaining = allocation.original - newAllocation;
        hasChanges = true;
      }
    });
    
    if (hasChanges) {
      this.saveToHistory();
      this.calculateSummaryCounts();
    }
  }

  bulkClear(customerName: string): void {
    const customerAllocations = this.allocations[customerName];
    if (!customerAllocations) return;
    
    let hasChanges = false;
    
    // Clear all allocations for this customer
    Object.keys(customerAllocations).forEach(category => {
      const allocation = customerAllocations[category];
      
      if (allocation.allocated !== 0) {
        allocation.allocated = 0;
        allocation.remaining = allocation.original;
        hasChanges = true;
      }
    });
    
    if (hasChanges) {
      this.saveToHistory();
      this.calculateSummaryCounts();
    }
  }

  getAllocation(customerName: string, category: string) {
    return this.allocations[customerName]?.[category];
  }

  getOriginalQuantity(customerName: string, category: string): number {
    return this.bookingItems[customerName]?.quantities[category] || 0;
  }

  getAllocatedQuantity(customerName: string, category: string): number {
    return this.getAllocation(customerName, category)?.allocated || 0;
  }

  getRemainingQuantity(customerName: string, category: string): number {
    return this.getAllocation(customerName, category)?.remaining || 0;
  }

  // UI helper methods
  getCustomerTypeLabel(type: string): string {
    const labels: {[key: string]: string} = {
      'ALL': 'All Customers',
      'DEALER': 'Dealers',
      'DISTRIBUTOR': 'Distributors',
      'NEW_ACCOUNT': 'New Accounts',
      'ADDAO': 'ADDAO',
      'LOTS': 'LOTS',
      'WAP': 'WAP'
    };
    return labels[type] || type;
  }

  getVisibleCategories(): ProductCategory[] {
    return this.productCategories;
  }

  getTotalForCustomer(customerName: string): number {
    const customerData = this.bookingItems[customerName];
    if (!customerData) return 0;
    
    return Object.values(customerData.quantities).reduce((sum, qty) => sum + qty, 0);
  }

  getTotalAllocatedForCustomer(customerName: string): number {
    const allocations = this.allocations[customerName];
    if (!allocations) return 0;
    
    return Object.values(allocations).reduce((sum, alloc) => sum + alloc.allocated, 0);
  }

  getTotalRemainingForCustomer(customerName: string): number {
    const allocations = this.allocations[customerName];
    if (!allocations) return 0;
    
    return Object.values(allocations).reduce((sum, alloc) => sum + alloc.remaining, 0);
  }

  getTotalForCategory(categoryName: string): number {
    let total = 0;
    Object.values(this.bookingItems).forEach(customerData => {
      total += customerData.quantities[categoryName] || 0;
    });
    return total;
  }

  getTotalAllocatedForCategory(categoryName: string): number {
    let total = 0;
    Object.values(this.allocations).forEach(customerAllocations => {
      const allocation = customerAllocations[categoryName];
      if (allocation) {
        total += allocation.allocated;
      }
    });
    return total;
  }

  getTotalRemainingForCategory(categoryName: string): number {
    let total = 0;
    Object.values(this.allocations).forEach(customerAllocations => {
      const allocation = customerAllocations[categoryName];
      if (allocation) {
        total += allocation.remaining;
      }
    });
    return total;
  }

  getGrandTotal(): number {
    return this.totalQuantity;
  }

  getTotalAllocated(): number {
    return this.totalAllocated;
  }

  getTotalRemaining(): number {
    return this.totalQuantity - this.totalAllocated;
  }

  getAdvancePayment(customerName: string): number {
    return this.bookingItems[customerName]?.advancePayment || 0;
  }

  getIsPrio(customerName: string): boolean {
    return this.bookingItems[customerName]?.isPrio || false;
  }

  hasBooking(customerName: string): boolean {
    const customerData = this.bookingItems[customerName];
    if (!customerData) return false;
    
    return Object.values(customerData.quantities).some(qty => qty > 0);
  }

  // Filtering methods
  applyFilters(): void {
    this.filteredCustomers = this.allCustomers.filter(customer => {
      const matchesSearch = !this.searchTerm || 
        customer.name.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesType = this.filterType === 'ALL' || customer.type === this.filterType;
      return matchesSearch && matchesType;
    });
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  // Navigation
  retry(): void {
    this.loadBookingDetails();
  }

  goBack(): void {
    this.router.navigate(['/bookings']);
  }

  // Check if a specific cell is being edited
  isEditingAllocation(customerName: string, category: string): boolean {
    return this.editingAllocation?.customerName === customerName && 
           this.editingAllocation?.category === category;
  }
}