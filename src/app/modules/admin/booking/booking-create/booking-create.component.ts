import { Component, OnInit } from '@angular/core';

interface Customer {
  name: string;
  type: 'DISTRIBUTOR' | 'DEALER' | 'NEW_ACCOUNT' | 'ADDAO' | 'LOTS';
  locations?: string[];
  balance: number;
  priority?: string;
  isWAP?: boolean;
}

interface BookingData {
  [key: string]: number;
}

@Component({
  selector: 'app-booking-create',
  templateUrl: './booking-create.component.html',
  styleUrls: ['./booking-create.component.scss']
})
export class BookingCreateComponent implements OnInit {
  // Product categories with their size ranges
  productCategories = [
    { name: '1.5', label: '1.5' },
    { name: '1SF', label: '1SF' },
    { name: '1.2', label: '1.2' },
    { name: '1.2F', label: '1.2F' },
    { name: '1.1', label: '1.1' },
    { name: '1F', label: '1F' },
    { name: '9.1', label: '9.1' },
    { name: '9F', label: '9F' },
    { name: '8.S', label: '8.S' },
    { name: '7.8', label: '7.8' },
    { name: '6.7', label: '6.7' },
    { name: 'CBL', label: 'CBL' },
    { name: 'CBM', label: 'CBM' },
    { name: 'CBS', label: 'CBS' },
    { name: 'SQ', label: 'SQ' },
    { name: 'WB', label: 'WB' },
    { name: 'KCWJO', label: 'KCWJO' }
  ];

  customers: Customer[] = [
    // Distributors
    { name: 'UV', type: 'DISTRIBUTOR', balance: 0 },
    { name: 'GALANG', type: 'DISTRIBUTOR', balance: 0 },
    { name: 'DCAT', type: 'DISTRIBUTOR', balance: 0 },
    { name: 'TICAO', type: 'DISTRIBUTOR', 
      locations: ['Manggagoy', 'Valencia', 'Trento', 'San Francisco'], balance: 0 },
    
    // Dealer A
    { name: 'SAMAL', type: 'DEALER', priority: 'Prio for allocation', balance: 0 },
    { name: 'B-LOTS NORTE', type: 'DEALER', priority: 'Prio for allocation', balance: 0 },
    { name: 'S DAVAO', type: 'DEALER', priority: 'Prio for allocation', balance: 0 },
    { name: 'SAMAL', type: 'DEALER', priority: 'Prio for allocation', balance: 0 },
    { name: 'B.MANGAGOY', type: 'DEALER', priority: 'Prio for allocation', balance: 0 },
    { name: 'CAUBE', type: 'DEALER', priority: 'Prio for allocation', balance: 0 },
    { name: 'MACARANG', type: 'DEALER', priority: 'Prio for allocation', balance: 0 },
    { name: 'LAPROBIS', type: 'DEALER', priority: 'Prio for allocation', balance: 0 },
    { name: 'VILLANUEVA', type: 'DEALER', balance: 0 },
    { name: 'SIACATAN', type: 'DEALER', balance: 0 },
    { name: 'PAGSIAT', type: 'DEALER', priority: 'Prio for allocation', balance: 0 },
    { name: 'GOMEZ', type: 'DEALER', balance: 0 },
    { name: 'STA ANA', type: 'DEALER', balance: 0 },
    { name: 'ARANCES', type: 'DEALER', balance: 0 },
    { name: 'POSALDOS', type: 'DEALER', balance: 0 },
    { name: 'PORK & CHOP', type: 'DEALER', balance: 0 },
    { name: 'RECALDE', type: 'DEALER', balance: 0 },
    { name: 'BSI', type: 'DEALER', balance: 0 },
    { name: 'BELENENCIA', type: 'DEALER', priority: 'Prio for allocation', balance: 0 },
    { name: 'ALCOSBRE', type: 'DEALER', balance: 0 },
    { name: 'CATAO', type: 'DEALER', priority: 'Prio for allocation', balance: 0 },
    { name: 'ANIBONG', type: 'DEALER', balance: 0 },
    { name: 'BALINIT', type: 'DEALER', priority: 'Prio for allocation', balance: 0 },
    { name: 'ORDANEZA', type: 'DEALER', priority: 'Prio for allocation', balance: 0 },
    { name: 'LEJARSO', type: 'DEALER', priority: 'Prio for allocation not less than 100kgs', balance: 0 },
    
    // New Account
    { name: 'MICABALO', type: 'NEW_ACCOUNT', balance: 0 },
    { name: 'DICME DIONSON', type: 'NEW_ACCOUNT', isWAP: true, balance: 0 },
    { name: 'DANIEL EBANGUILLADOR', type: 'NEW_ACCOUNT', priority: 'Prio for allocation not less than 100kgs', balance: 0 },
    { name: 'THEA', type: 'NEW_ACCOUNT', balance: 0 },
    
    // ADDAO
    { name: 'ABNA', type: 'ADDAO', balance: 0 },
    { name: 'CARLON', type: 'ADDAO', balance: 0 },
    { name: 'GALUNERA', type: 'ADDAO', balance: 0 },
    { name: 'BAUTISTA', type: 'ADDAO', balance: 0 },
    { name: 'AMODIA', type: 'ADDAO', balance: 0 },
    
    // LOTS
    { name: 'LOTS LANANG', type: 'LOTS', balance: 0 },
    { name: 'LOTS MAA', type: 'LOTS', balance: 0 }
  ];

  bookingData: Map<string, BookingData> = new Map();
  selectedCustomer: Customer | null = null;
  searchTerm = '';
  filterType: string = 'ALL';

  ngOnInit(): void {
    // Initialize booking data
    this.customers.forEach(customer => {
      this.bookingData.set(customer.name, {});
    });
  }

  get filteredCustomers(): Customer[] {
    let filtered = this.customers;
    
    if (this.filterType !== 'ALL') {
      filtered = filtered.filter(c => c.type === this.filterType);
    }
    
    if (this.searchTerm) {
      filtered = filtered.filter(c => 
        c.name.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  }

  get distributorCount(): number {
    return this.customers.filter(c => c.type === 'DISTRIBUTOR').length;
  }

  get dealerCount(): number {
    return this.customers.filter(c => c.type === 'DEALER').length;
  }

  selectCustomer(customer: Customer): void {
    this.selectedCustomer = customer;
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
    this.bookingData.forEach(data => {
      total += data[category] || 0;
    });
    return total;
  }

  getGrandTotal(): number {
    let total = 0;
    this.bookingData.forEach(data => {
      total += Object.values(data).reduce((sum, val) => sum + val, 0);
    });
    return total;
  }

  clearBooking(customerName: string): void {
    this.bookingData.set(customerName, {});
  }

  exportData(): void {
    // Export functionality
    console.log('Exporting data...', this.bookingData);
  }

  saveBooking(): void {
    // Save functionality
    console.log('Saving booking...', this.bookingData);
  }
}