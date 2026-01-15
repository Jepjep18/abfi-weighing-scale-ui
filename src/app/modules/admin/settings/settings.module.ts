import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router'; // Import RouterModule
import { ProductSettingComponent } from './product-setting/product-setting.component';

const routes: Routes = [
  {
    path: '',
    component: ProductSettingComponent
  },
  // You can add more routes here if needed
  // {
  //   path: 'other-setting',
  //   component: OtherSettingComponent
  // }
];

@NgModule({
  declarations: [
    ProductSettingComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes) // Use forChild for feature modules
  ]
})
export class SettingsModule { }