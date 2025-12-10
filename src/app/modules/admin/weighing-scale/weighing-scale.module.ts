import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WeighingScaleComponent } from './weighing-scale.component';
import { RouterModule, Routes } from '@angular/router';

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
    RouterModule.forChild(routes), 
    
  ]
})
export class WeighingScaleModule { }
