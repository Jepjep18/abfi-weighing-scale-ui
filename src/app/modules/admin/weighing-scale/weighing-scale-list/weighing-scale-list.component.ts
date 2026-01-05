import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { WeighingProdGroupService } from 'app/services/weighing-prod-group-service/weighing-prod-group.service';
import {
  WeighingProductionGroup,
  PagedResponse
} from 'app/models/weighing-production-group/weighing-production-group.models';

@Component({
  selector: 'app-weighing-scale-list',
  templateUrl: './weighing-scale-list.component.html',
  styleUrls: ['./weighing-scale-list.component.scss']
})
export class WeighingScaleListComponent implements OnInit {

  groups: WeighingProductionGroup[] = [];

  currentPage = 1;
  pageSize = 10;
  totalCount = 0;
  totalPages = 0;

  isLoading = false;

  constructor(
    private weighingProdGroupService: WeighingProdGroupService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadGroups();
  }

  loadGroups(): void {
    this.isLoading = true;

    this.weighingProdGroupService.getAll({
      pageNumber: this.currentPage,
      pageSize: this.pageSize
    }).subscribe({
      next: (response: PagedResponse<WeighingProductionGroup>) => {
        this.groups = response.items;
        this.currentPage = response.currentPage;
        this.totalPages = response.totalPages;
        this.totalCount = response.totalCount;
        this.isLoading = false;
        
        // Debug log to check values
        console.log('Pagination data:', {
          totalCount: this.totalCount,
          totalPages: this.totalPages,
          currentPage: this.currentPage,
          pageSize: this.pageSize,
          itemsCount: this.groups.length
        });
      },
      error: (err) => {
        console.error('Error loading groups:', err);
        this.isLoading = false;
      }
    });
  }

  onPageChange(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.loadGroups();
  }

  getShowingFrom(): number {
    return this.totalCount === 0
      ? 0
      : (this.currentPage - 1) * this.pageSize + 1;
  }

  getShowingTo(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalCount);
  }

  // Helper to determine if pagination should show
  shouldShowPagination(): boolean {
    return this.totalPages > 1;
  }

  // Navigate to view page
  viewGroup(id: number): void {
    this.router.navigate(['/weighing-scale/view', id]);
  }
}