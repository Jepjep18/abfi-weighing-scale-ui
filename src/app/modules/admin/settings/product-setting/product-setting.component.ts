import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDrawer } from '@angular/material/sidenav';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators'; // Import from operators
import { ProductDialogComponent } from './product-dialog/product-dialog.component';
import { ProductClassificationService } from 'app/services/product-classification/product-classification.service';
import { ProductClassificationDto } from 'app/models/product-classification/product-classification.model';
import { PagedResponse } from 'app/models/page-response/page-response.model';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-product-setting',
  templateUrl: './product-setting.component.html',
  styleUrls: ['./product-setting.component.scss']
})
export class ProductSettingComponent implements OnInit, AfterViewInit, OnDestroy {
  displayedColumns: string[] = [
    'productCode',
    'individualWeightRange',
    'totalWeightRangePerCrate',
    'noOfHeadsPerGalantina',
    'cratesWeight',
    'status',
    'actions'
  ];
  
  dataSource: MatTableDataSource<ProductClassificationDto> = new MatTableDataSource<ProductClassificationDto>([]);
  
  // Pagination properties
  currentPage: number = 1;
  totalPages: number = 1;
  pageSize: number = 10;
  totalCount: number = 0;
  hasPrevious: boolean = false;
  hasNext: boolean = false;
  
  // Summary statistics
  totalProducts: number = 0;
  activeProducts: number = 0;
  inactiveProducts: number = 0;
  
  // Loading state
  isLoading: boolean = false;
  
  // Search control
  searchControl = new FormControl('');
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('rightDrawer') rightDrawer!: MatDrawer;
  
  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  constructor(
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private productService: ProductClassificationService
  ) {}

  ngOnInit(): void {
    this.setupSearch();
    this.loadProducts();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.searchSubject.complete();
  }

  /**
   * Setup search with debounce
   */
  private setupSearch(): void {
    this.searchSubject.pipe(
      takeUntil(this.destroy$),
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(searchTerm => {
      this.currentPage = 1;
      this.loadProducts();
    });

    this.searchControl.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(value => {
        this.searchSubject.next(value || '');
      });
  }

  /**
   * Load products from API
   */
  loadProducts(): void {
    this.isLoading = true;
    
    this.productService.getPaged({
      page: this.currentPage,
      size: this.pageSize,
      search: this.searchControl.value || '',
      sortBy: this.sort?.active || 'productCode',
      sortDirection: this.sort?.direction === 'desc' ? 'desc' : 'asc'
    }).pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: PagedResponse<ProductClassificationDto>) => {
          this.handleSuccessResponse(response);
        },
        error: (error) => {
          this.handleError('Failed to load products', error);
        }
      });
  }

  /**
   * Handle successful API response
   */
  private handleSuccessResponse(response: PagedResponse<ProductClassificationDto>): void {
    this.dataSource.data = response.items;
    this.currentPage = response.currentPage;
    this.totalPages = response.totalPages;
    this.pageSize = response.pageSize;
    this.totalCount = response.totalCount;
    this.hasPrevious = response.hasPrevious;
    this.hasNext = response.hasNext;
    
    this.calculateSummaryStatistics();
    this.isLoading = false;
  }

  /**
   * Handle API errors
   */
  private handleError(message: string, error: any): void {
    console.error(message, error);
    this.showSnackBar(`${message}: ${error.message || 'Unknown error'}`);
    this.isLoading = false;
  }

  /**
   * Calculate summary statistics from current data
   */
  calculateSummaryStatistics(): void {
    const items = this.dataSource.data;
    this.totalProducts = items.length;
    this.activeProducts = items.filter(p => p.isActive).length;
    this.inactiveProducts = this.totalProducts - this.activeProducts;
  }

  /**
   * Apply filter for client-side filtering (if needed)
   */
  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.searchControl.setValue(filterValue);
  }

  /**
   * Calculate showing from value
   */
  getShowingFrom(): number {
    return Math.min((this.currentPage - 1) * this.pageSize + 1, this.totalCount);
  }

  /**
   * Calculate showing to value
   */
  getShowingTo(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalCount);
  }

  /**
   * Generate pagination pages array
   */
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
      
      pages.push(this.totalPages);
    }
    
    return pages;
  }

  /**
   * Handle page change
   */
  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.loadProducts();
    }
  }

  /**
   * Open add product dialog
   */
  openAddDialog(): void {
    const dialogRef = this.dialog.open(ProductDialogComponent, {
      width: '400px',
      data: { mode: 'add' }
    });

    dialogRef.afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        if (result) {
          this.createProduct(result);
        }
      });
  }

  /**
   * Create new product
   */
  private createProduct(productData: any): void {
    this.productService.create(productData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.showSnackBar('Product added successfully!');
          this.loadProducts();
        },
        error: (error) => {
          this.handleError('Failed to add product', error);
        }
      });
  }

  /**
   * Open edit product dialog
   */
  openEditDialog(product: ProductClassificationDto): void {
    const dialogRef = this.dialog.open(ProductDialogComponent, {
      width: '600px',
      data: { mode: 'edit', product: { ...product } }
    });

    dialogRef.afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        if (result) {
          this.updateProduct(product.id, result);
        }
      });
  }

  /**
   * Update existing product
   */
  private updateProduct(id: number, productData: any): void {
    this.productService.update(id, productData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.showSnackBar('Product updated successfully!');
          this.loadProducts();
        },
        error: (error) => {
          this.handleError('Failed to update product', error);
        }
      });
  }

  /**
   * Delete product
   */
  deleteProduct(product: ProductClassificationDto): void {
    if (confirm(`Are you sure you want to delete "${product.productCode}"?`)) {
      this.productService.delete(product.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.showSnackBar('Product deleted successfully!');
            this.loadProducts();
          },
          error: (error) => {
            this.handleError('Failed to delete product', error);
          }
        });
    }
  }

  /**
   * Toggle product status
   */
  toggleProductStatus(product: ProductClassificationDto): void {
    const newStatus = !product.isActive;
    const statusText = newStatus ? 'activate' : 'deactivate';
    
    if (confirm(`Are you sure you want to ${statusText} "${product.productCode}"?`)) {
      this.productService.updateStatus(product.id, newStatus)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.showSnackBar(`Product ${newStatus ? 'activated' : 'deactivated'} successfully!`);
            this.loadProducts();
          },
          error: (error) => {
            this.handleError(`Failed to ${statusText} product`, error);
          }
        });
    }
  }

  /**
   * Export products
   */
  onExportProducts(): void {
    this.showSnackBar('Export functionality coming soon!');
    // TODO: Implement export when backend is ready
    // this.productService.exportToCsv().subscribe(...);
  }

  /**
   * Import products
   */
  onImportProducts(): void {
    this.showSnackBar('Import functionality coming soon!');
  }

  /**
   * Show snackbar notification
   */
  private showSnackBar(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: ['snackbar-success']
    });
  }

  /**
   * Refresh data
   */
  refresh(): void {
    this.loadProducts();
  }
}