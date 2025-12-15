import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductionService } from '../../../../services/production-service/production.service';
import { ProductionDto } from '../../../../models/production/production.model';

interface TripRow {
  tripNo: number;
  driver?: string;
  plate?: string;
  volume?: number;
  aiw?: string;
  pcsTime?: string;
  timeArrived?: string;
  travelTime?: string;
  unloadingStart?: string;
  unloadingEnd?: string;
  unloadingTime?: string;
  haulerStart?: string;
  movingTime?: string;
  haulingEnd?: string;
  haulingTime?: string;
  equalizeHauling?: string;
  runningOut?: string;
  loadingStart?: string;
  loadingEnd?: string;
  transferTime?: string;
  timeFinishedDP?: string;
}

@Component({
  selector: 'app-trip-sheet-view',
  templateUrl: './trip-sheet-view.component.html',
  styleUrls: ['./trip-sheet-view.component.scss']
})
export class TripSheetViewComponent implements OnInit {

  productionId!: number;
  production?: ProductionDto;
  loading = true;
  error: string | null = null;

  private farmColors = [
    '#E8F5E9',  // Light green
    '#E3F2FD',  // Light blue
    '#FFF9C4',  // Light yellow
    '#FCE4EC',  // Light pink
    '#F3E5F5',  // Light purple
    '#E0F2F1',  // Light teal
  ];

  constructor(
    private route: ActivatedRoute,
    private productionService: ProductionService
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      if (idParam) {
        this.productionId = +idParam;
        this.loadProduction(this.productionId);
      } else {
        this.error = 'No production ID provided';
        this.loading = false;
      }
    });
  }

  loadProduction(id: number): void {
    this.loading = true;
    this.productionService.getProductionById(id).subscribe({
      next: (data) => {
        this.production = data;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.error = 'Failed to load production data';
        this.loading = false;
      }
    });
  }

  generateTripRows(farm: any): TripRow[] {
    const rows: TripRow[] = [];
    const tripCount = farm.forecastedTrips || 0;
    
    for (let i = 1; i <= tripCount; i++) {
      rows.push({
        tripNo: i,
        // Initialize empty trip data
        // This can be populated from actual trip data if available
      });
    }
    
    return rows;
  }

  getFarmColor(farmIndex: number): string {
    return this.farmColors[farmIndex % this.farmColors.length];
  }
}