import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WeighingScaleComponent } from './weighing-scale.component';
import { RouterModule, Routes } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { WeighingScaleListComponent } from './weighing-scale-list/weighing-scale-list.component';

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
    WeighingScaleListComponent
  ],
  imports: [
    CommonModule,
    MatIconModule,
    FormsModule,
    RouterModule.forChild(routes), 
    
  ]
})
export class WeighingScaleModule { }
