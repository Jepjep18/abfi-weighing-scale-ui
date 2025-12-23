import { Component, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-booking-sidenav',
  templateUrl: './booking-sidenav.component.html',
  styleUrls: ['./booking-sidenav.component.scss']
})
export class BookingSidenavComponent {
  
  @Output() closeDrawer = new EventEmitter<void>();

  constructor(private router: Router) {}

  // Navigation method for Create Booking
  navigateToCreate(): void {
    this.router.navigate(['/booking/create']);
  }

  // Action handler for other buttons
  handleAction(action: string): void {
    switch (action) {
      case 'export':
        console.log('Export action triggered');
        break;
      case 'print':
        console.log('Print action triggered');
        break;
      case 'share':
        console.log('Share action triggered');
        break;
      case 'duplicate':
        console.log('Duplicate action triggered');
        break;
    }
  }
}