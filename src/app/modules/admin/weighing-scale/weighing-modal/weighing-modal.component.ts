import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { ProductionService } from 'app/services/production-service/production.service';
import { WeighingProdGroupService } from 'app/services/weighing-prod-group-service/weighing-prod-group.service';
import { ToastService } from 'app/services/toast/toast.service'; 

import { ProductionListDto } from 'app/models/production/production-list.model';
import { WeighingProductionGroup } from 'app/models/weighing-production-group/weighing-production-group.models';

@Component({
  selector: 'app-weighing-modal',
  templateUrl: './weighing-modal.component.html',
  styleUrls: ['./weighing-modal.component.scss']
})
export class WeighingModalComponent implements OnInit {

  weighingGroupForm: FormGroup;

  productions: ProductionListDto[] = [];
  selectedProduction?: ProductionListDto;

  isLoading = false;
  isSubmitting = false;
  hasError = false;
  errorMessage = '';

  constructor(
    private dialogRef: MatDialogRef<WeighingModalComponent>,
    private fb: FormBuilder,
    private productionService: ProductionService,
    private weighingProdGroupService: WeighingProdGroupService,
    private toastService: ToastService // <-- inject toast service
  ) {
    this.weighingGroupForm = this.fb.group({
      productionId: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadProductions();

    this.weighingGroupForm
      .get('productionId')!
      .valueChanges.subscribe((id: number) => {
        this.selectedProduction = this.productions.find(p => p.id === id);
      });
  }

  loadProductions(): void {
    this.isLoading = true;

    this.productionService.getProductions({
      pageNumber: 1,
      pageSize: 1000
    }).subscribe({
      next: (res) => {
        this.productions = res.items;
        this.isLoading = false;
      },
      error: () => {
        this.hasError = true;
        this.errorMessage = 'Failed to load productions';
        this.isLoading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.weighingGroupForm.invalid || this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;
    this.hasError = false;

    const productionId = this.weighingGroupForm.value.productionId;

    this.weighingProdGroupService.create({ productionId }).subscribe({
      next: (created: WeighingProductionGroup) => {
        // ✅ Show success toast
        this.toastService.success(
          `Weighing Group for production "${this.selectedProduction?.productionName}" created successfully!`
        );

        // Close the modal and return the created object
        this.dialogRef.close(created);
      },
      error: () => {
        this.hasError = true;
        this.errorMessage = 'Failed to create weighing group';
        this.isSubmitting = false;

        // ✅ Show error toast
        this.toastService.error('Failed to create weighing group. Please try again.');
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
