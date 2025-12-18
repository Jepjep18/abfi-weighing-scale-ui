import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WeighingScaleComponent } from './weighing-scale.component';
import { RouterModule, Routes } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';

const routes: Routes = [
  {
      path: '',
      component: WeighingScaleComponent, 
  },
];

@NgModule({
  declarations: [
    WeighingScaleComponent
  ],
  imports: [
    CommonModule,
    MatIconModule,
    FormsModule,
    RouterModule.forChild(routes), 
    
  ]
})
export class WeighingScaleModule { }
