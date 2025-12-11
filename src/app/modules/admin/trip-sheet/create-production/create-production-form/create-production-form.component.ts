import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-create-production-form',
  templateUrl: './create-production-form.component.html',
  styleUrls: ['./create-production-form.component.scss']
})
export class CreateProductionFormComponent {
  @Output() close = new EventEmitter<void>();
  @Output() productionCreated = new EventEmitter<any>();

  // Form fields
  productionName = '';
  productionType = 'standard';
  startDate: Date | null = null;
  endDate: Date | null = null;
  description = '';
  priority = 'medium';

  closeDrawer(): void {
    this.close.emit();
  }

  onSubmit(): void {
    const productionData = {
      name: this.productionName,
      type: this.productionType,
      startDate: this.startDate,
      endDate: this.endDate,
      description: this.description,
      priority: this.priority
    };

    if (this.productionName.trim()) {
      this.productionCreated.emit(productionData);
      console.log('Production created:', productionData);
      this.closeDrawer();
    }
  }
}