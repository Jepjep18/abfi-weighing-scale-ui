import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';

import { WeighingProdGroupService } from 'app/services/weighing-prod-group-service/weighing-prod-group.service';
import {
    WeighingProductionGroup,
    PagedResponse,
} from 'app/models/weighing-production-group/weighing-production-group.models';
import { WeighingSidenavComponent } from '../weighing-sidenav/weighing-sidenav.component';
import { MatDrawer } from '@angular/material/sidenav';

@Component({
    selector: 'app-weighing-scale-list',
    templateUrl: './weighing-scale-list.component.html',
    styleUrls: ['./weighing-scale-list.component.scss'],
})
export class WeighingScaleListComponent implements OnInit {
    @ViewChild('rightDrawer') rightDrawer!: MatDrawer;

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

        this.weighingProdGroupService
            .getAll({
                pageNumber: this.currentPage,
                pageSize: this.pageSize,
            })
            .subscribe({
                next: (response: PagedResponse<WeighingProductionGroup>) => {
                    this.groups = response.items;
                    this.currentPage = response.currentPage;
                    this.totalPages = response.totalPages;
                    this.totalCount = response.totalCount;
                    this.isLoading = false;
                },
                error: (err) => {
                    console.error('Error loading groups:', err);
                    this.isLoading = false;
                },
            });
    }

    toggleRightDrawer(): void {
        this.rightDrawer.toggle();
    }

    weighingSidenavComponentToggle(): void {
    this.toggleRightDrawer();
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

    shouldShowPagination(): boolean {
        return this.totalCount > 0;
    }

    viewGroup(id: number): void {
        this.router.navigate(['/weighing-scale/view', id]);
    }

    getStatusLabel(group: WeighingProductionGroup): string {
        return group.production.endDateTime ? 'Completed' : 'Ongoing';
    }

    getStatusClass(group: WeighingProductionGroup): string {
        return group.production.endDateTime
            ? 'bg-green-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
            : 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
    }

    onWeighingGroupCreated(newGroup: WeighingProductionGroup): void {
        // Prepend new group
        this.groups = [newGroup, ...this.groups];

        // Update total count / pages if needed
        this.totalCount += 1;
        this.totalPages = Math.ceil(this.totalCount / this.pageSize);

        // Optional: scroll table to top
        const tableContainer = document.querySelector('.overflow-x-auto');
        if (tableContainer) tableContainer.scrollTop = 0;
    }
}
