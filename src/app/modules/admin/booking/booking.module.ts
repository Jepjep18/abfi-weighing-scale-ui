import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookingComponent } from './booking.component';
import { RouterModule, Routes } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { BookingSidenavComponent } from './booking-sidenav/booking-sidenav.component';
import { MatSidenavModule } from '@angular/material/sidenav';

const routes: Routes = [
  {
      path: '',
      component: BookingComponent, 
  },
];

@NgModule({
    declarations: [BookingComponent, BookingSidenavComponent],
    imports: [
        CommonModule,
        MatIconModule,
        MatSidenavModule,
        RouterModule.forChild(routes), 
    ],
})
export class BookingModule {}
