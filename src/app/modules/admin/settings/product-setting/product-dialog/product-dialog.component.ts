import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-product-dialog',
  templateUrl: './product-dialog.component.html',
  styleUrls: ['./product-dialog.component.scss']
})
export class ProductDialogComponent implements OnInit {
  productForm: FormGroup;
  mode: 'add' | 'edit';

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<ProductDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.mode = data.mode;
    
    this.productForm = this.fb.group({
      productCode: ['', [Validators.required, Validators.maxLength(50)]],
      individualWeightRange: ['', [Validators.required]],
      totalWeightRangePerCrate: ['', [Validators.required]],
      noOfHeadsPerGalantina: [0, [Validators.required, Validators.min(1)]],
      cratesWeight: ['', [Validators.required]],
      isActive: [true]
    });

    if (this.mode === 'edit' && data.product) {
      this.productForm.patchValue(data.product);
    }
  }

  ngOnInit(): void {}

  onSubmit(): void {
    if (this.productForm.valid) {
      this.dialogRef.close(this.productForm.value);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}