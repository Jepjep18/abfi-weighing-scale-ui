import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-product-drawer',
  templateUrl: './product-drawer.component.html',
  styleUrls: ['./product-drawer.component.scss']
})
export class ProductDrawerComponent implements OnInit {
  @Input() totalProducts: number = 0;
  @Input() activeProducts: number = 0;
  
  @Output() addProduct = new EventEmitter<void>();
  @Output() exportProducts = new EventEmitter<void>();
  @Output() importProducts = new EventEmitter<void>();
  @Output() closeDrawer = new EventEmitter<void>();
  
  selectedStatus: string = 'all';

  constructor() { }

  ngOnInit(): void {
  }

  onAddProduct(): void {
    this.addProduct.emit();
  }

  onExportProducts(): void {
    this.exportProducts.emit();
  }

  onImportProducts(): void {
    this.importProducts.emit();
  }

  handleAction(action: string): void {
    switch (action) {
      case 'bulk_edit':
        // TODO: Implement bulk edit
        console.log('Bulk edit action');
        break;
      case 'archive':
        // TODO: Implement archive
        console.log('Archive action');
        break;
      case 'guide':
        // TODO: Implement guide
        console.log('Guide action');
        break;
      case 'support':
        // TODO: Implement support
        console.log('Support action');
        break;
      case 'faq':
        // TODO: Implement FAQ
        console.log('FAQ action');
        break;
    }
  }
}