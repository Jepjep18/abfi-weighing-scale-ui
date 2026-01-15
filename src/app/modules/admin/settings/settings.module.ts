import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

// Angular Material Imports
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSelectModule } from '@angular/material/select';
import { MatMenuModule } from '@angular/material/menu';

// Components
import { ProductSettingComponent } from './product-setting/product-setting.component';
import { ProductDialogComponent } from './product-setting/product-dialog/product-dialog.component';
import { ProductDrawerComponent } from './product-setting/product-drawer/product-drawer.component';

const routes: Routes = [
  {
    path: '',
    component: ProductSettingComponent
  }
];

@NgModule({
  declarations: [
    ProductSettingComponent,
    ProductDialogComponent,
    ProductDrawerComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ReactiveFormsModule,
    
    // Angular Material Modules
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSlideToggleModule,
    MatCardModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatSidenavModule,
    MatSelectModule,
    MatMenuModule
  ]
})
export class SettingsModule { }