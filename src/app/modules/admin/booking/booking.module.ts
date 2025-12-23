import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookingComponent } from './booking.component';
import { RouterModule, Routes } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { BookingSidenavComponent } from './booking-sidenav/booking-sidenav.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatList, MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { BookingViewComponent } from './booking-view/booking-view.component';
import { BookingCreateComponent } from './booking-create/booking-create.component';

const routes: Routes = [
  {
      path: '',
      component: BookingComponent, 
  },
  {
    path: 'view/:id',
    component: BookingViewComponent,
  },
  {
    path: 'create',
    component: BookingCreateComponent,
  }
];

@NgModule({
    declarations: [BookingComponent, BookingSidenavComponent, BookingViewComponent, BookingCreateComponent],
    imports: [
    // Core Angular Modules (MUST BE FIRST)
    CommonModule,
    RouterModule.forChild(routes),
    
    // CRITICAL: These two modules fix your error
    FormsModule,              // For ngModel, ngForm
    ReactiveFormsModule,      // For formGroup, formControlName, formArrayName
    HttpClientModule,         // For HttpClient service
    
    // Material Modules
    MatIconModule,
    MatSidenavModule,
    MatListModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCheckboxModule,
    MatTableModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatDividerModule
  ],
})
export class BookingModule {}
