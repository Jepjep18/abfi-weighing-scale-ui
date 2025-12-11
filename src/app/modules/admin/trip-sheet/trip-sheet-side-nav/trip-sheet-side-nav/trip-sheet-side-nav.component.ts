import { Component, EventEmitter, Output } from '@angular/core';

interface Stats {
  total: number;
  thisMonth: number;
  inProgress: number;
  completed: number;
}

@Component({
  selector: 'app-trip-sheet-side-nav',
  templateUrl: './trip-sheet-side-nav.component.html',
  styleUrls: ['./trip-sheet-side-nav.component.scss']
})
export class TripSheetSideNavComponent {
  @Output() close = new EventEmitter<void>();
  @Output() createProductionClicked = new EventEmitter<void>(); // Renamed to avoid conflict

  // Filter states
  selectedStatus = 'all';
  searchQuery = '';
  startDate: Date | null = null;
  endDate: Date | null = null;

  // Statistics data
  stats: Stats = {
    total: 124,
    thisMonth: 12,
    inProgress: 8,
    completed: 89
  };

  closeDrawer(): void {
    this.close.emit();
  }

  createProduction(): void {
    console.log('Create production clicked');
    this.createProductionClicked.emit(); // Updated to use renamed emitter
  }

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

  applyFilters(): void {
    const filters = {
      status: this.selectedStatus,
      startDate: this.startDate,
      endDate: this.endDate,
      searchQuery: this.searchQuery
    };
    
    console.log('Filters applied:', filters);
  }

  clearFilters(): void {
    this.selectedStatus = 'all';
    this.searchQuery = '';
    this.startDate = null;
    this.endDate = null;
    console.log('Filters cleared');
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