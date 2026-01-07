import { Component, EventEmitter, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { WeighingModalComponent } from '../weighing-modal/weighing-modal.component';
import { WeighingProductionGroup } from 'app/models/weighing-production-group/weighing-production-group.models';

@Component({
  selector: 'app-weighing-sidenav',
  templateUrl: './weighing-sidenav.component.html',
  styleUrls: ['./weighing-sidenav.component.scss'],
})
export class WeighingSidenavComponent {

  @Output() closeDrawer = new EventEmitter<void>();

  /** NEW: Emit when a weighing group is created */
  @Output() weighingGroupCreated = new EventEmitter<WeighingProductionGroup>();

  constructor(private dialog: MatDialog) {}

  openCreateModal(): void {
    // Close drawer first
    this.closeDrawer.emit();

    // Open modal
    const dialogRef = this.dialog.open(WeighingModalComponent, {
      width: '500px',
      maxWidth: '90vw',
      panelClass: 'custom-modal-class',
      disableClose: false,
      data: {}
    });

    dialogRef.afterClosed().subscribe((result: WeighingProductionGroup | undefined) => {
      if (result) {
        // ✅ Instead of updating groups here, just emit the result
        this.weighingGroupCreated.emit(result);
      }
    });
  }
}
