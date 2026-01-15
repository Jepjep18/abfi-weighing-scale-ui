import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDrawer } from '@angular/material/sidenav';
import { ProductDialogComponent } from './product-dialog/product-dialog.component';

export interface Product {
  id: number;
  productCode: string;
  individualWeightRange: string;
  totalWeightRangePerCrate: string;
  noOfHeadsPerGalantina: number;
  cratesWeight: string;
  isActive: boolean;
  createdAt: string;
  lastUpdatedAt: string | null;
}

@Component({
  selector: 'app-product-setting',
  templateUrl: './product-setting.component.html',
  styleUrls: ['./product-setting.component.scss']
})
export class ProductSettingComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = [
    'productCode',
    'individualWeightRange',
    'totalWeightRangePerCrate',
    'noOfHeadsPerGalantina',
    'cratesWeight',
    'status',
    'actions'
  ];
  
  dataSource: MatTableDataSource<Product>;
  
  // Pagination properties
  currentPage: number = 1;
  totalPages: number = 4;
  pageSize: number = 10;
  totalCount: number = 40;
  hasPrevious: boolean = false;
  hasNext: boolean = true;
  
  // Summary statistics
  totalProducts: number = 0;
  activeProducts: number = 0;
  inactiveProducts: number = 0;
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('rightDrawer') rightDrawer!: MatDrawer;
  
  // Mock data based on your JSON
  mockProducts: Product[] = [
    {
      "id": 5,
      "productCode": "1.2 CHOICE",
      "individualWeightRange": "1.198KG - 1.489KG",
      "totalWeightRangePerCrate": "18KGS - 22.5 KGS",
      "noOfHeadsPerGalantina": 15,
      "cratesWeight": "2KGS - 2.3KGS",
      "isActive": true,
      "createdAt": "2024-01-15T08:30:00",
      "lastUpdatedAt": null
    },
    {
      "id": 6,
      "productCode": "1.2 FARMERS",
      "individualWeightRange": "1.198KG - 1.489KG",
      "totalWeightRangePerCrate": "18KGS - 22.5 KGS",
      "noOfHeadsPerGalantina": 15,
      "cratesWeight": "2KGS - 2.3KGS",
      "isActive": true,
      "createdAt": "2024-01-15T08:30:00",
      "lastUpdatedAt": null
    },
    {
      "id": 4,
      "productCode": "1.2 LB",
      "individualWeightRange": "1.198KG - 1.489KG",
      "totalWeightRangePerCrate": "18KGS - 22.5 KGS",
      "noOfHeadsPerGalantina": 15,
      "cratesWeight": "2KGS - 2.3KGS",
      "isActive": true,
      "createdAt": "2024-01-15T08:30:00",
      "lastUpdatedAt": null
    },
    {
      "id": 7,
      "productCode": "1.2 PLAIN POLY",
      "individualWeightRange": "1.198KG - 1.489KG",
      "totalWeightRangePerCrate": "18KGS - 22.5 KGS",
      "noOfHeadsPerGalantina": 15,
      "cratesWeight": "2KGS - 2.3KGS",
      "isActive": true,
      "createdAt": "2024-01-15T08:30:00",
      "lastUpdatedAt": null
    },
    {
      "id": 3,
      "productCode": "1.5 FARMERS",
      "individualWeightRange": "1.49KG -UP",
      "totalWeightRangePerCrate": "14.9 UP",
      "noOfHeadsPerGalantina": 10,
      "cratesWeight": "2KGS - 2.3KGS",
      "isActive": true,
      "createdAt": "2024-01-15T08:30:00",
      "lastUpdatedAt": null
    },
    {
      "id": 1,
      "productCode": "1.5 LB",
      "individualWeightRange": "1.49KG -UP",
      "totalWeightRangePerCrate": "14.9 UP",
      "noOfHeadsPerGalantina": 10,
      "cratesWeight": "2KGS - 2.3KGS",
      "isActive": true,
      "createdAt": "2024-01-15T08:30:00",
      "lastUpdatedAt": null
    },
    {
      "id": 2,
      "productCode": "1.5 PLAIN POLY",
      "individualWeightRange": "1.49KG -UP",
      "totalWeightRangePerCrate": "14.9KGS - UP",
      "noOfHeadsPerGalantina": 10,
      "cratesWeight": "2KGS - 2.3KGS",
      "isActive": true,
      "createdAt": "2024-01-15T08:30:00",
      "lastUpdatedAt": null
    },
    {
      "id": 9,
      "productCode": "1-1.1 CHOICE",
      "individualWeightRange": "1.070KGS - 1.197KGS",
      "totalWeightRangePerCrate": "15.8KGS - 17.8KGS",
      "noOfHeadsPerGalantina": 15,
      "cratesWeight": "2KGS - 2.3KGS",
      "isActive": true,
      "createdAt": "2024-01-15T08:30:00",
      "lastUpdatedAt": null
    },
    {
      "id": 10,
      "productCode": "1-1.1 FARMERS",
      "individualWeightRange": "1.070KGS - 1.197KGS",
      "totalWeightRangePerCrate": "15.8KGS - 17.8KGS",
      "noOfHeadsPerGalantina": 15,
      "cratesWeight": "2KGS - 2.3KGS",
      "isActive": true,
      "createdAt": "2024-01-15T08:30:00",
      "lastUpdatedAt": null
    },
    {
      "id": 8,
      "productCode": "1-1.1 LB",
      "individualWeightRange": "1.070KGS - 1.197KGS",
      "totalWeightRangePerCrate": "15.8KGS - 17.8KGS",
      "noOfHeadsPerGalantina": 15,
      "cratesWeight": "2KGS - 2.3KGS",
      "isActive": true,
      "createdAt": "2024-01-15T08:30:00",
      "lastUpdatedAt": null
    }
  ];

  constructor(
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.dataSource = new MatTableDataSource(this.mockProducts);
    this.calculateSummaryStatistics();
  }

  ngOnInit(): void {}

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  calculateSummaryStatistics(): void {
    this.totalProducts = this.mockProducts.length;
    this.activeProducts = this.mockProducts.filter(p => p.isActive).length;
    this.inactiveProducts = this.totalProducts - this.activeProducts;
  }

  getShowingFrom(): number {
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  getShowingTo(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalCount);
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
      
      pages.push(this.totalPages);
    }
    
    return pages;
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      // In a real app, you would fetch data for this page
      this.showSnackBar(`Loading page ${page}...`);
    }
  }

  openAddDialog(): void {
    const dialogRef = this.dialog.open(ProductDialogComponent, {
      width: '600px',
      data: { mode: 'add' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const newProduct: Product = {
          ...result,
          id: this.mockProducts.length + 1,
          createdAt: new Date().toISOString(),
          lastUpdatedAt: null
        };
        
        this.mockProducts.unshift(newProduct);
        this.dataSource.data = [...this.mockProducts];
        this.calculateSummaryStatistics();
        this.totalCount = this.mockProducts.length;
        this.showSnackBar('Product added successfully!');
      }
    });
  }

  openEditDialog(product: Product): void {
    const dialogRef = this.dialog.open(ProductDialogComponent, {
      width: '600px',
      data: { mode: 'edit', product: { ...product } }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const index = this.mockProducts.findIndex(p => p.id === product.id);
        if (index !== -1) {
          this.mockProducts[index] = {
            ...result,
            id: product.id,
            lastUpdatedAt: new Date().toISOString()
          };
          this.dataSource.data = [...this.mockProducts];
          this.calculateSummaryStatistics();
          this.showSnackBar('Product updated successfully!');
        }
      }
    });
  }

  deleteProduct(product: Product): void {
    if (confirm(`Are you sure you want to delete "${product.productCode}"?`)) {
      const index = this.mockProducts.findIndex(p => p.id === product.id);
      if (index !== -1) {
        this.mockProducts.splice(index, 1);
        this.dataSource.data = [...this.mockProducts];
        this.calculateSummaryStatistics();
        this.totalCount = this.mockProducts.length;
        this.showSnackBar('Product deleted successfully!');
      }
    }
  }

  toggleProductStatus(product: Product): void {
    product.isActive = !product.isActive;
    product.lastUpdatedAt = new Date().toISOString();
    this.dataSource.data = [...this.mockProducts];
    this.calculateSummaryStatistics();
    this.showSnackBar(`Product ${product.isActive ? 'activated' : 'deactivated'}!`);
  }

  private showSnackBar(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'right',
      verticalPosition: 'top'
    });
  }
}