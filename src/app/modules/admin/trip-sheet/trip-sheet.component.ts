import { Component, ViewChild } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';

@Component({
  selector: 'app-trip-sheet',
  templateUrl: './trip-sheet.component.html',
  styleUrls: ['./trip-sheet.component.scss']
})
export class TripSheetComponent {
  @ViewChild('createProductionDrawer') createProductionDrawer!: MatDrawer;
  @ViewChild('rightDrawer') rightDrawer!: MatDrawer;

  isCreateProductionDrawerOpen = false;

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
    // Add your logic here to handle the created production
    // For example: add to list, show success message, refresh data, etc.
  }
}