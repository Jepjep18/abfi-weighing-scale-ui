import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TripSheetComponent } from './trip-sheet.component';
import { RouterModule, Routes } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';

const routes: Routes = [
  {
      path: '',
      component: TripSheetComponent, 
  },
];

@NgModule({
  declarations: [
    TripSheetComponent
  ],
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule, // ← Add this import
    RouterModule.forChild(routes), 
  ]
})
export class TripSheetModule { }