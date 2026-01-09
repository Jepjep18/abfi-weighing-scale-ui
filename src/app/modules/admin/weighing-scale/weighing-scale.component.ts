import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProductionService } from '../../../services/production-service/production.service';
import { ProductionRequest } from '../../../models/production/production-request.model';
import { ProductionListDto } from '../../../models/production/production-list.model';
import { PagedResponse } from '../../../models/page-response/page-response.model';
import { ActivatedRoute } from '@angular/router';
import { ProductClassificationService } from 'app/services/product-classification/product-classification.service';
import { ProductClassification } from 'app/models/product-classification/product-classification.model';

interface WeighingData {
    serialData: string;
    qty: number;
    uom: string;
    heads: number | null;
    prodCode: string | null;
    status: string;
    class: string;
    remarks: string | null;
}

interface WeighingLog {
    id: number;
    serialData: string;
    qty: number;
    uom: string;
    heads: number | null;
    prodCode: string | null;
    productionId: string | null;
    createdDateTime: string;
    portNumber: string;
    class: string;
    remarks: string | null;
}

interface ProductionOption {
    id: string;
    name: string;
    displayText: string;
    originalId: number;
}

interface RangedProduct {
    size: string;
    variants: { [key: string]: string };
}

interface CatchWeightProduct {
    product: string;
    total: number;
}

@Component({
    selector: 'app-weighing-scale',
    templateUrl: './weighing-scale.component.html',
    styleUrls: ['./weighing-scale.component.scss'],
})
export class WeighingScaleComponent implements OnInit, OnDestroy {
    port1Data: WeighingData = {
        serialData: '   0.0 KG G 000000 PCS',
        qty: 0.0,
        uom: 'KG',
        heads: null,
        prodCode: null,
        status: 'Ready',
        class: 'ClassB',
        remarks: null,
    };

    port2Data: WeighingData = {
        serialData: '   0.0 KG G 000000 PCS',
        qty: 0.0,
        uom: 'KG',
        heads: null,
        prodCode: null,
        status: 'Ready',
        class: 'ClassB',
        remarks: null,
    };

    logs: WeighingLog[] = [];

    isWeighingActive = false;
    selectedProductionId: string = '';
    sessionStartTime: Date | null = null;
    sessionDuration: string = '00:00:00';
    sessionLogsCount: number = 0;
    sessionTotalWeight: number = 0;
    port1Total: number = 0;
    port2Total: number = 0;
    isLoadingProductClassifications = false;
    productClassifications: ProductClassification[] = [];

    // New properties for production list
    productionOptions: ProductionOption[] = [];
    isLoadingProductions = false;
    productionError: string | null = null;

    private autoLogInterval: any;
    private sessionTimerInterval: any;

    rangedProducts: RangedProduct[] = [];
    catchWeightProducts: CatchWeightProduct[] = [];
    activeProduct: any = null;
    private activeProductTimeout: any = null;

    constructor(
        private productionService: ProductionService,
        private route: ActivatedRoute,
        private productClassificationService: ProductClassificationService
    ) {}

    ngOnInit(): void {
        this.loadProductClassifications();
        this.loadProductionFromRoute();
        this.calculateTotals();
    }

    ngOnDestroy(): void {
        this.stopWeighing();
    }

    private loadProductClassifications(): void {
        this.isLoadingProductClassifications = true;

        this.productClassificationService.getAll().subscribe({
            next: (data) => {
                this.productClassifications = data;
                this.buildProductTables();
                this.isLoadingProductClassifications = false;
            },
            error: () => {
                this.isLoadingProductClassifications = false;
            },
        });
    }

    private buildProductTables(): void {
        const RANGE_VARIANTS = ['CHOICE', 'FARMERS', 'PLAIN POLY', 'LB'];
        const rangeMap = new Map<string, RangedProduct>();
        const catchMap = new Map<string, string[]>();

        this.productClassifications.forEach((p) => {
            let code = p.productCode.trim();
            let variant: string | null = null;

            // Detect variant
            for (const v of RANGE_VARIANTS) {
                const regex = new RegExp(`\\s*${v}$`, 'i');
                if (regex.test(code)) {
                    variant = v;
                    code = code.replace(regex, '').trim(); // size only
                    break;
                }
            }

            // Catch cases like "1-1.1LB" without space
            if (!variant && /LB$/i.test(code)) {
                variant = 'LB';
                code = code.replace(/LB$/i, '').trim();
            }

            // Determine if it's a ranged product (has digits)
            if (/\d/.test(code)) {
                if (!rangeMap.has(code)) {
                    rangeMap.set(code, { size: code, variants: {} });
                }
                if (variant) {
                    rangeMap.get(code)!.variants[variant] = p.productCode;
                }
            }
            // Catch weight products
            else {
                if (!catchMap.has(code)) {
                    catchMap.set(code, []);
                }
                catchMap.get(code)!.push(p.productCode);
            }
        });

        // Sort weight-range products numerically
        this.rangedProducts = Array.from(rangeMap.values()).sort((a, b) =>
            a.size.localeCompare(b.size, undefined, { numeric: true })
        );

        // Build catch weight products
        this.catchWeightProducts = Array.from(catchMap.entries()).map(
            ([product, codes]) => ({
                product,
                codes, // add this!
                total: codes.reduce(
                    (sum, code) => sum + this.getTotalKG(code),
                    0
                ),
            })
        );
    }

    displayKG(productCode?: string): string {
        if (!productCode) return '-';
        const total = this.getTotalKG(productCode);
        return total > 0 ? total.toFixed(1) : '-';
    }

    getVariantTotal(variants: Record<string, string>): number {
        return Object.values(variants || {}).reduce(
            (sum, code) => sum + this.getTotalKG(code),
            0
        );
    }

    getCatchWeightTotal(codes: string[]): number {
        return codes.reduce((sum, code) => sum + this.getTotalKG(code), 0);
    }

    displayTotal(value: number): string {
        return value > 0 ? value.toFixed(1) : '-';
    }

    private loadProductionFromRoute(): void {
        this.route.paramMap.subscribe((params) => {
            const id = params.get('id');

            if (id) {
                this.selectedProductionId = `PROD-${id.padStart(3, '0')}`;
                this.calculateTotals();
            } else {
                // If no ID in route, set a default one
                this.selectedProductionId = 'PROD-001';
            }
        });
    }

    onProductionIdChange(): void {
        this.calculateTotals();
    }

    startWeighing(): void {
        if (!this.selectedProductionId) {
            alert('Please select a Production ID first!');
            return;
        }

        this.isWeighingActive = true;
        this.sessionStartTime = new Date();
        this.sessionLogsCount = 0;
        this.sessionTotalWeight = 0;
        this.startSessionTimer();
        this.startAutoLogging();
    }

    stopWeighing(): void {
        this.isWeighingActive = false;
        this.clearAutoLogging();
        this.clearSessionTimer();
        this.sessionDuration = '00:00:00';
    }

    startAutoLogging(): void {
        this.autoLogInterval = setInterval(() => {
            if (!this.isWeighingActive) return;

            // Generate random weight between 10-25 KG
            const randomWeight = (Math.random() * 15 + 10).toFixed(1);
            const weight = parseFloat(randomWeight);

            // Get a random product code from loaded classifications
            if (this.productClassifications.length === 0) {
                console.warn('No product classifications loaded');
                return;
            }

            const randomProduct =
                this.productClassifications[
                    Math.floor(
                        Math.random() * this.productClassifications.length
                    )
                ];
            const prodCode = randomProduct.productCode;

            // Generate random heads count (between 10-30)
            const heads = Math.floor(Math.random() * 21) + 10;

            // Randomly decide which port gets data
            const activePort = Math.random() > 0.5 ? 'port1' : 'port2';
            const portName = activePort === 'port1' ? 'COM11' : 'COM12';

            const newData: WeighingData = {
                serialData: `   ${randomWeight} KG G ${heads
                    .toString()
                    .padStart(6, '0')} PCS`,
                qty: weight,
                uom: 'KG',
                prodCode: prodCode,
                heads: heads,
                status: 'Captured',
                class: 'ClassB',
                remarks: weight === 0 ? 'Invalid Qty' : null,
            };

            // Update port display
            if (activePort === 'port1') {
                this.port1Data = { ...newData };
            } else {
                this.port2Data = { ...newData };
            }

            // Automatically log to table
            const newLog: WeighingLog = {
                id: this.logs.length + 1,
                serialData: newData.serialData,
                qty: weight,
                uom: 'KG',
                heads: heads,
                prodCode: prodCode,
                productionId: this.selectedProductionId,
                createdDateTime: new Date()
                    .toISOString()
                    .slice(0, 19)
                    .replace('T', ' '),
                portNumber: portName,
                class: 'ClassB',
                remarks: newData.remarks,
            };

            this.logs = [newLog, ...this.logs];
            this.sessionLogsCount++;
            this.sessionTotalWeight += weight;

            this.handleWeightData(newLog);

            // Recalculate totals
            this.calculateTotals();

            console.log('New log added:', newLog);
            console.log(
                'Total KG for',
                prodCode,
                ':',
                this.getTotalKG(prodCode)
            );

            // Reset status after showing capture
            setTimeout(() => {
                const resetData = { ...newData, status: 'Ready' };
                if (activePort === 'port1') {
                    this.port1Data = resetData;
                } else {
                    this.port2Data = resetData;
                }
            }, 1000);
        }, 3000); // Generate new data every 3 seconds
    }

    calculateTotals(): void {
        // Calculate port totals
        this.port1Total = this.getPort1Logs().reduce(
            (sum, log) => sum + log.qty,
            0
        );
        this.port2Total = this.getPort2Logs().reduce(
            (sum, log) => sum + log.qty,
            0
        );

        // Recalculate session total for current production
        this.sessionTotalWeight = this.logs
            .filter((log) => log.productionId === this.selectedProductionId)
            .reduce((sum, log) => sum + log.qty, 0);
    }

    calculateTotalWeight(): number {
        return this.port1Total + this.port2Total;
    }

    getPort1Logs(): WeighingLog[] {
        return this.logs.filter(
            (log) =>
                log.portNumber === 'COM11' &&
                log.productionId === this.selectedProductionId
        );
    }

    getPort2Logs(): WeighingLog[] {
        return this.logs.filter(
            (log) =>
                log.portNumber === 'COM12' &&
                log.productionId === this.selectedProductionId
        );
    }

    clearAutoLogging(): void {
        if (this.autoLogInterval) {
            clearInterval(this.autoLogInterval);
            this.autoLogInterval = null;
        }
    }

    startSessionTimer(): void {
        this.sessionTimerInterval = setInterval(() => {
            if (this.sessionStartTime) {
                const now = new Date();
                const diff = now.getTime() - this.sessionStartTime.getTime();
                const hours = Math.floor(diff / (1000 * 60 * 60));
                const minutes = Math.floor(
                    (diff % (1000 * 60 * 60)) / (1000 * 60)
                );
                const seconds = Math.floor((diff % (1000 * 60)) / 1000);

                this.sessionDuration =
                    hours.toString().padStart(2, '0') +
                    ':' +
                    minutes.toString().padStart(2, '0') +
                    ':' +
                    seconds.toString().padStart(2, '0');
            }
        }, 1000);
    }

    clearSessionTimer(): void {
        if (this.sessionTimerInterval) {
            clearInterval(this.sessionTimerInterval);
            this.sessionTimerInterval = null;
        }
    }

    getStatusClass(status: string): string {
        if (status === 'Captured') return 'text-green-600';
        if (status === 'Error') return 'text-red-600';
        return 'text-blue-600';
    }

    getProdCodeClass(prodCode: string | null): string {
        if (!prodCode) return 'bg-gray-100 text-gray-800';

        // Generate consistent colors based on product code
        const colors = [
            'bg-blue-100 text-blue-800',
            'bg-green-100 text-green-800',
            'bg-yellow-100 text-yellow-800',
            'bg-red-100 text-red-800',
            'bg-purple-100 text-purple-800',
            'bg-pink-100 text-pink-800',
            'bg-indigo-100 text-indigo-800',
            'bg-orange-100 text-orange-800',
        ];

        // Simple hash function to get consistent color for each product code
        const hash = prodCode
            .split('')
            .reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return colors[hash % colors.length];
    }

    isPortActive(data: WeighingData): boolean {
        return data.status === 'Captured';
    }

    getPortBorderClass(data: WeighingData): string {
        return this.isPortActive(data)
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 bg-gray-50';
    }

    getPortTextClass(data: WeighingData): string {
        return this.isPortActive(data) ? 'text-blue-600' : 'text-gray-600';
    }

    getConnectionStatusClass(data: WeighingData): string {
        return this.isPortActive(data) ? 'text-green-500' : 'text-gray-400';
    }

    getConnectionStatusText(data: WeighingData): string {
        return this.isPortActive(data) ? 'Connected' : 'Standby';
    }

    getConnectionTextClass(data: WeighingData): string {
        return this.isPortActive(data) ? 'text-green-600' : 'text-gray-500';
    }

    // Returns total KG for a given productCode for the current selected production
    getTotalKG(productCode: string): number {
        if (!this.selectedProductionId) return 0;

        const total = this.logs
            .filter(
                (log) =>
                    log.productionId === this.selectedProductionId &&
                    log.prodCode === productCode
            )
            .reduce((sum, log) => sum + (log.qty || 0), 0);

        return total;
    }

    recordWeight(logData: any) {
        this.activeProduct = {
            size: logData.prodCode, // or whatever field has the product size
            product: logData.prodCode,
            variant: logData.variant || null,
            weight: logData.qty,
            heads: logData.heads || null,
        };

        // Clear after 3 seconds (optional)
        setTimeout(() => {
            this.activeProduct = null;
        }, 3000);
    }

    private handleWeightData(log: any) {
        // Clear any existing timeout
        if (this.activeProductTimeout) {
            clearTimeout(this.activeProductTimeout);
        }

        // Set the active product
        this.activeProduct = {
            prodCode: log.prodCode,
            qty: log.qty,
            uom: log.uom,
            heads: log.heads,
            portLabel: log.portNumber === 'COM11' ? 'Port 1' : 'Port 2',
            portNumber: log.portNumber,
        };

        // Auto-clear after 5 seconds
        this.activeProductTimeout = setTimeout(() => {
            this.activeProduct = null;
        }, 5000);
    }
}
