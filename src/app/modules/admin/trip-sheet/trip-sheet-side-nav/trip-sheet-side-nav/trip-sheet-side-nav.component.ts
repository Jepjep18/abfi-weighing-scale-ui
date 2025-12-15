import { Component, EventEmitter, Output, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';

interface AdvancedFilters {
  status: string;
  startDate: Date | null;
  endDate: Date | null;
}

@Component({
  selector: 'app-trip-sheet-side-nav',
  templateUrl: './trip-sheet-side-nav.component.html',
  styleUrls: ['./trip-sheet-side-nav.component.scss']
})
export class TripSheetSideNavComponent implements OnInit, OnChanges {
  @Output() close = new EventEmitter<void>();
  @Output() createProductionClicked = new EventEmitter<void>();
  @Output() search = new EventEmitter<string>();
  @Output() clearSearch = new EventEmitter<void>();
  @Output() pageSizeChange = new EventEmitter<number>();
  @Output() pageChange = new EventEmitter<number>();
  @Output() advancedFilterChange = new EventEmitter<AdvancedFilters>();
  
  // Inputs from parent component
  @Input() totalCount = 0;
  @Input() totalPages = 0;
  @Input() currentPage = 1;
  @Input() pageSize = 10;
  @Input() searchTerm = '';
  
  // Local properties
  searchQuery = '';
  selectedStatus = 'all';
  startDate: Date | null = null;
  endDate: Date | null = null;

  ngOnInit(): void {
    // Initialize search query from input
    this.searchQuery = this.searchTerm;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['searchTerm']) {
      this.searchQuery = changes['searchTerm'].currentValue;
    }
  }

  // Helper methods for pagination display
  getStartIndex(): number {
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  getEndIndex(): number {
    const end = this.currentPage * this.pageSize;
    return Math.min(end, this.totalCount);
  }

  getPages(): (number | string)[] {
    const pages: (number | string)[] = [];
    const maxVisible = 5;
    
    if (this.totalPages <= maxVisible) {
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      
      if (this.currentPage > 3) {
        pages.push('...');
      }
      
      const start = Math.max(2, this.currentPage - 1);
      const end = Math.min(this.totalPages - 1, this.currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (this.currentPage < this.totalPages - 2) {
        pages.push('...');
      }
      
      if (this.totalPages > 1) {
        pages.push(this.totalPages);
      }
    }
    
    return pages;
  }

  closeDrawer(): void {
    this.close.emit();
  }

  createProduction(): void {
    this.createProductionClicked.emit();
  }

  // Search functionality
  onSearch(): void {
    this.search.emit(this.searchQuery);
  }

  onClearSearch(): void {
    this.searchQuery = '';
    this.clearSearch.emit();
  }

  // Pagination functionality
  onPageSizeChange(): void {
    this.pageSizeChange.emit(this.pageSize);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.pageChange.emit(page);
    }
  }

  // Advanced filters
  onStatusChange(): void {
    // Auto-apply status filter when changed
    this.applyAdvancedFilters();
  }

  applyAdvancedFilters(): void {
    const filters: AdvancedFilters = {
      status: this.selectedStatus,
      startDate: this.startDate,
      endDate: this.endDate
    };
    
    this.advancedFilterChange.emit(filters);
    console.log('Advanced filters applied:', filters);
  }

  clearAdvancedFilters(): void {
    this.selectedStatus = 'all';
    this.startDate = null;
    this.endDate = null;
    
    // Emit cleared filters
    this.advancedFilterChange.emit({
      status: 'all',
      startDate: null,
      endDate: null
    });
    
    console.log('Advanced filters cleared');
  }

  // Quick Actions
  handleAction(actionType: string): void {
    switch (actionType) {
      case 'export':
        this.handleExport();
        break;
      case 'print':
        this.handlePrint();
        break;
      case 'share':
        this.handleShare();
        break;
      case 'duplicate':
        this.handleDuplicate();
        break;
      case 'settings':
        this.handleSettings();
        break;
      case 'delete-all':
        this.handleDeleteAll();
        break;
    }
  }

  // Action handlers
  private handleExport(): void {
    console.log('Exporting trip sheets...');
  }

  private handlePrint(): void {
    console.log('Printing trip sheets...');
    window.print();
  }

  private handleShare(): void {
    console.log('Sharing trip sheets...');
  }

  private handleDuplicate(): void {
    console.log('Duplicating selected trip sheets...');
  }

  private handleSettings(): void {
    console.log('Opening settings...');
  }

  private handleDeleteAll(): void {
    if (confirm('Are you sure you want to clear all trip sheets? This action cannot be undone.')) {
      console.log('Clearing all trip sheets...');
    }
  }
}