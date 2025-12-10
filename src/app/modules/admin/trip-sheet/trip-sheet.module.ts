import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TripSheetComponent } from './trip-sheet.component';
import { RouterModule, Routes } from '@angular/router';

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
    RouterModule.forChild(routes), 
    
  ]
})
export class TripSheetModule { }
