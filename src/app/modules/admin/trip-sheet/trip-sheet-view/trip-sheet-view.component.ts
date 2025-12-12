import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductionService } from '../../../../services/production-service/production.service'; // adjust path
import { ProductionDto } from '../../../../models/production/production.model'; // adjust path

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

  constructor(
    private route: ActivatedRoute,
    private productionService: ProductionService
  ) { }

  ngOnInit(): void {
    // Get the ID from the route
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

  loadProduction(id: number) {
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
}
