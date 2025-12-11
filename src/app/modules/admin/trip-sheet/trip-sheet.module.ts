import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TripSheetComponent } from './trip-sheet.component';
import { RouterModule, Routes } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { TripSheetSideNavComponent } from './trip-sheet-side-nav/trip-sheet-side-nav/trip-sheet-side-nav.component';
import { FormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatNativeDateModule } from '@angular/material/core';


const routes: Routes = [
  {
      path: '',
      component: TripSheetComponent, 
  },
];

@NgModule({
  declarations: [
    TripSheetComponent,
    TripSheetSideNavComponent
  ],
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    FormsModule,
    MatDatepickerModule,
    MatInputModule,
    MatSelectModule,
    MatNativeDateModule,
    RouterModule.forChild(routes), 
  ]
})
export class TripSheetModule { }