import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FarmService } from 'app/services/farms-service/farms.service';
import { ProductionService } from 'app/services/production-service/production.service'; // Add this import
import { FarmDto } from 'app/models/farm/farm.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProductionFormData } from 'app/models/production/production.model';

@Component({
    selector: 'app-create-production-form',
    templateUrl: './create-production-form.component.html',
    styleUrls: ['./create-production-form.component.scss'],
})
export class CreateProductionFormComponent implements OnInit {
    @Output() close = new EventEmitter<void>();
    @Output() productionCreated = new EventEmitter<any>();

    // Production basic info
    productionName: string = '';
    totalHeads: number | null = null;
    startDateTime: string = ''; // Change to string for datetime-local input
    description: string = '';
    isSubmitting: boolean = false; // Add loading state for submission

    // Farms selection
    farms: FarmDto[] = [];
    selectedFarms: FarmDto[] = [];
    searchFarmText: string = '';
    isLoadingFarms: boolean = false;

    // Farm details
    farmDetails: FarmDetail[] = [];

    constructor(
        private farmService: FarmService,
        private productionService: ProductionService, // Add this
        private snackBar: MatSnackBar
    ) {}

    ngOnInit(): void {
        this.loadFarms();
        // Set default start time to current hour
        this.setDefaultStartTime();
    }

    // Set default start time (current hour)
    setDefaultStartTime(): void {
        const now = new Date();
        now.setMinutes(0);
        now.setSeconds(0);
        
        // Format for datetime-local input (YYYY-MM-DDTHH:mm)
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        
        this.startDateTime = `${year}-${month}-${day}T${hours}:${minutes}`;
    }

    loadFarms(): void {
        this.isLoadingFarms = true;
        this.farmService.getAllFarms().subscribe({
            next: (farms) => {
                this.farms = farms;
                this.isLoadingFarms = false;
            },
            error: (error) => {
                console.error('Error loading farms:', error);
                this.snackBar.open('Failed to load farms', 'Close', {
                    duration: 3000,
                });
                this.isLoadingFarms = false;
            },
        });
    }

    // Filter farms based on search
    get filteredFarms(): FarmDto[] {
        if (!this.searchFarmText.trim()) {
            return this.farms.filter(
                (farm) =>
                    !this.selectedFarms.some(
                        (selected) => selected.id === farm.id
                    )
            );
        }
        return this.farms.filter(
            (farm) =>
                farm.farmName
                    .toLowerCase()
                    .includes(this.searchFarmText.toLowerCase()) &&
                !this.selectedFarms.some((selected) => selected.id === farm.id)
        );
    }

    // Add farm to selection
    addFarm(farm: FarmDto): void {
        if (!this.selectedFarms.some((selected) => selected.id === farm.id)) {
            this.selectedFarms.push(farm);
            this.farmDetails.push({
                farmId: farm.id,
                farmName: farm.farmName,
                forecastedTrips: 1,
                allocatedHeads: 0, // Start with 0, user must enter a value
            });
            this.searchFarmText = '';
            this.calculateTotalHeads();
        }
    }

    // Remove farm from selection
    removeFarm(farmId: number): void {
        this.selectedFarms = this.selectedFarms.filter(
            (farm) => farm.id !== farmId
        );
        this.farmDetails = this.farmDetails.filter(
            (detail) => detail.farmId !== farmId
        );
        this.calculateTotalHeads();
    }

    // Update farm details
    updateFarmDetail(
        farmId: number,
        field: 'forecastedTrips' | 'allocatedHeads',
        value: number
    ): void {
        const detail = this.farmDetails.find((d) => d.farmId === farmId);
        if (detail) {
            // Ensure minimum values
            if (field === 'forecastedTrips' && value < 1) value = 1;
            if (field === 'allocatedHeads' && value < 0) value = 0;
            
            detail[field] = value;
            this.calculateTotalHeads();
        }
    }

    // Calculate total heads from all farms
    calculateTotalHeads(): void {
        this.totalHeads = this.farmDetails.reduce(
            (sum, detail) => sum + detail.allocatedHeads,
            0
        );
    }

    // Validate form
    isValid(): boolean {
        return (
            !!this.productionName.trim() &&
            this.selectedFarms.length > 0 &&
            this.farmDetails.every((detail) => detail.allocatedHeads > 0) &&
            !!this.startDateTime // Ensure start date is selected
        );
    }

    // Submit form
    onSubmit(): void {
        if (!this.isValid()) {
            this.snackBar.open('Please fill all required fields correctly', 'Close', {
                duration: 3000,
                panelClass: ['error-snackbar']
            });
            return;
        }

        this.isSubmitting = true;

        // Prepare form data
        const formData: ProductionFormData = {
            productionName: this.productionName,
            startDateTime: this.startDateTime,
            description: this.description,
            farmDetails: this.farmDetails
        };

        // Convert to create DTO
        const createDto = this.productionService.convertFormToCreateDto(formData);

        // Call the production service to create production
        this.productionService.createProduction(createDto).subscribe({
            next: (response) => {
                console.log('Production created successfully:', response);
                
                // Show success message
                this.snackBar.open('Production created successfully!', 'Close', {
                    duration: 3000,
                    panelClass: ['success-snackbar']
                });

                // Emit the production data to parent
                this.productionCreated.emit(response);

                // Reset form
                this.resetForm();

                // Close drawer after successful creation
                this.closeDrawer();
            },
            error: (error) => {
                console.error('Error creating production:', error);
                
                let errorMessage = 'Failed to create production. Please try again.';
                
                if (error.status === 400) {
                    errorMessage = error.error?.message || 'Validation error. Please check your inputs.';
                } else if (error.status === 409) {
                    errorMessage = error.error?.message || 'Production with this name already exists.';
                } else if (error.status === 500) {
                    errorMessage = 'Server error. Please try again later.';
                }

                this.snackBar.open(errorMessage, 'Close', {
                    duration: 5000,
                    panelClass: ['error-snackbar']
                });
            },
            complete: () => {
                this.isSubmitting = false;
            }
        });
    }

    // Reset form
    resetForm(): void {
        this.productionName = '';
        this.totalHeads = null;
        this.description = '';
        this.selectedFarms = [];
        this.farmDetails = [];
        this.searchFarmText = '';
        this.setDefaultStartTime();
    }

    // Close drawer
    closeDrawer(): void {
        this.close.emit();
    }

    // Check if any farm has invalid allocations
    hasInvalidAllocations(): boolean {
        return this.farmDetails.some((d) => d.allocatedHeads <= 0);
    }

    // Get button text based on submission state
    get submitButtonText(): string {
        return this.isSubmitting ? 'Creating...' : 'Start Production';
    }

    // Check if submit button should be disabled
    isSubmitDisabled(): boolean {
        return !this.isValid() || this.isSubmitting;
    }
}

// Interface for farm details (if not already in separate model)
interface FarmDetail {
    farmId: number;
    farmName: string;
    forecastedTrips: number;
    allocatedHeads: number;
}