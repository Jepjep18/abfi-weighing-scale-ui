import { Component, ViewChild, OnInit } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';
import { ProductionService } from 'app/services/production-service/production.service';
import { ProductionListDto } from 'app/models/production/production-list.model';
import { PagedResponse } from 'app/models/page-response/page-response.model';
import { ProductionRequest } from 'app/models/production/production-request.model';

@Component({
  selector: 'app-trip-sheet',
  templateUrl: './trip-sheet.component.html',
  styleUrls: ['./trip-sheet.component.scss']
})
export class TripSheetComponent implements OnInit {
  @ViewChild('createProductionDrawer') createProductionDrawer!: MatDrawer;
  @ViewChild('rightDrawer') rightDrawer!: MatDrawer;

  isCreateProductionDrawerOpen = false;
  
  // Production list properties
  productions: ProductionListDto[] = [];
  isLoading = false;
  errorMessage = '';
  
  // Pagination properties
  currentPage = 1;
  pageSize = 10;
  totalCount = 0;
  totalPages = 0;
  searchTerm = '';

  constructor(private productionService: ProductionService) {}

  ngOnInit(): void {
    // Load productions when component initializes
    this.loadProductions();
  }

  // Load productions from API
  loadProductions(): void {
    this.isLoading = true;
    this.errorMessage = '';

    const request: ProductionRequest = {
      pageNumber: this.currentPage,
      pageSize: this.pageSize,
      searchTerm: this.searchTerm
    };

    this.productionService.getProductions(request).subscribe({
      next: (response: PagedResponse<ProductionListDto>) => {
        this.productions = response.items;
        this.currentPage = response.currentPage;
        this.totalCount = response.totalCount;
        this.totalPages = response.totalPages;
        this.isLoading = false;
        
        console.log('Productions loaded:', response);
      },
      error: (error) => {
        this.errorMessage = 'Failed to load productions. Please try again.';
        this.isLoading = false;
        console.error('Error loading productions:', error);
      }
    });
  }

  // Search handler
  onSearch(): void {
    this.currentPage = 1; // Reset to first page when searching
    this.loadProductions();
  }

  // Clear search
  clearSearch(): void {
    this.searchTerm = '';
    this.currentPage = 1;
    this.loadProductions();
  }

  // Page change handler
  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadProductions();
  }

  // Page size change handler
  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.currentPage = 1; // Reset to first page when changing page size
    this.loadProductions();
  }

  // Refresh data after creating a new production
  refreshProductions(): void {
    this.loadProductions();
  }

  // Left drawer methods (Create Production Form)
  openCreateProductionDrawer(): void {
    this.isCreateProductionDrawerOpen = true;
    this.createProductionDrawer.open();
    // Optionally close the right drawer when opening left drawer
    this.closeRightDrawer();
  }

  closeCreateProductionDrawer(): void {
    this.isCreateProductionDrawerOpen = false;
    this.createProductionDrawer.close();
  }

  // Right drawer methods (Side Nav)
  toggleRightDrawer(): void {
    this.rightDrawer.toggle();
  }

  closeRightDrawer(): void {
    this.rightDrawer.close();
  }

  // Event handler for production creation
  onProductionCreated(productionData: any): void {
    console.log('Production created:', productionData);
    // Refresh the production list
    this.refreshProductions();
    // Close the drawer
    this.closeCreateProductionDrawer();
    
    // You could also add a success message here
    // this.showSuccessMessage('Production created successfully!');
  }
  
  // Helper method to get page numbers for pagination display
  getPages(): (number | string)[] {
    const pages: (number | string)[] = [];
    const maxVisible = 5; // Maximum pages to show
    
    if (this.totalPages <= maxVisible) {
      // Show all pages
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show first, last, and pages around current
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
}