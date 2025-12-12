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
import { MatRadioModule } from '@angular/material/radio';

import { CreateProductionFormComponent } from './create-production/create-production-form/create-production-form.component';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { TripSheetViewComponent } from './trip-sheet-view/trip-sheet-view.component';


const routes: Routes = [
  {
      path: '',
      component: TripSheetComponent, 
  },
  {
    path: 'view/:id',
    component: TripSheetViewComponent,
  }
];

@NgModule({
  declarations: [
    TripSheetComponent,
    TripSheetSideNavComponent,
    CreateProductionFormComponent,
    TripSheetViewComponent,
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
    MatRadioModule,
    MatNativeDateModule,
    MatSnackBarModule,
    
    RouterModule.forChild(routes), 
  ]
})
export class TripSheetModule { }