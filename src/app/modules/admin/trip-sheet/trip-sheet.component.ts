import { Component, ViewChild } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';

@Component({
  selector: 'app-trip-sheet',
  templateUrl: './trip-sheet.component.html',
  styleUrls: ['./trip-sheet.component.scss']
})
export class TripSheetComponent {
  @ViewChild('matDrawer') matDrawer!: MatDrawer;

  toggleDrawer(): void {
    this.matDrawer.toggle();
  }

  closeDrawer(): void {
    this.matDrawer.close();
  }
}