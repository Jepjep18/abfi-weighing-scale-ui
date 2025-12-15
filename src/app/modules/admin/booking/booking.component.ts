import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';

@Component({
  selector: 'app-booking',
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.scss']
})
export class BookingComponent implements OnInit {
  
  @ViewChild('rightDrawer') rightDrawer!: MatDrawer;

  constructor() { }

  ngOnInit(): void {
  }

  toggleRightDrawer(): void {
    this.rightDrawer.toggle();
  }

  // Optional methods if needed
  openRightDrawer(): void {
    this.rightDrawer.open();
  }

  closeRightDrawer(): void {
    this.rightDrawer.close();
  }
}