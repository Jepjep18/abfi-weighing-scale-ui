import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WeighingScaleComponent } from './weighing-scale.component';
import { RouterModule, Routes } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { WeighingScaleListComponent } from './weighing-scale-list/weighing-scale-list.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { WeighingSidenavComponent } from './weighing-sidenav/weighing-sidenav.component';
import { WeighingModalComponent } from './weighing-modal/weighing-modal.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

const routes: Routes = [
  {
      path: 'view/:id',
      component: WeighingScaleComponent, 
  },
  {
    path: '',
    component: WeighingScaleListComponent,
  }
];

@NgModule({
  declarations: [
    WeighingScaleComponent,
    WeighingScaleListComponent,
    WeighingSidenavComponent,
    WeighingModalComponent
  ],
  imports: [
    CommonModule,
    MatIconModule,
    FormsModule,
    MatSidenavModule,
    MatButtonModule,
    MatDialogModule,
    MatInputModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatSelectModule,
    MatDividerModule,
    MatTooltipModule,
    MatCheckboxModule,
    MatRadioModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes), 
    
  ]
})
export class WeighingScaleModule { }
