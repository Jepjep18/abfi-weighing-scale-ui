import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
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

interface RangedProduct {
    size: string;
    variants: { [key: string]: string };
}

interface CatchWeightProduct {
    product: string;
    codes?: string[];
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
    sessionTotalWeight: number = 0;

    productClassifications: ProductClassification[] = [];
    rangedProducts: RangedProduct[] = [];
    catchWeightProducts: CatchWeightProduct[] = [];
    
    activeProduct: any = null;
    activeRowSize: string | null = null;
    activeVariant: string | null = null;
    selectedRowVariant: { [rowSize: string]: string | null } = {};
    activeWeighingRow: string | null = null;
    
    private activeProductTimeout: any = null;
    private sessionTimerInterval: any;
    private productWeighingInterval: any;

    constructor(
        private route: ActivatedRoute,
        private productClassificationService: ProductClassificationService
    ) {}

    ngOnInit(): void {
        this.loadProductClassifications();
        this.loadProductionFromRoute();
    }

    ngOnDestroy(): void {
        this.stopWeighing();
    }

    private loadProductClassifications(): void {
        this.productClassificationService.getAll().subscribe({
            next: (data) => {
                this.productClassifications = data;
                this.buildProductTables();
            },
            error: () => {
                console.error('Failed to load product classifications');
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
                    code = code.replace(regex, '').trim();
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
                codes,
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
            } else {
                this.selectedProductionId = 'PROD-001';
            }
        });
    }

    onProductionIdChange(): void {
        // Recalculate totals when production changes
        this.calculateTotals();
    }

    startWeighing(): void {
        if (!this.selectedProductionId) {
            alert('Please select a Production ID first!');
            return;
        }

        this.isWeighingActive = true;
        this.sessionStartTime = new Date();
        this.sessionTotalWeight = 0;
        this.startSessionTimer();
    }

    stopWeighing(): void {
        if (this.activeWeighingRow) {
            this.stopActiveProductWeighing();
        }

        this.isWeighingActive = false;
        this.clearSessionTimer();
        this.clearProductWeighing();
        this.sessionDuration = '00:00:00';
        this.activeRowSize = null;
        this.activeVariant = null;
        this.activeWeighingRow = null;
        this.selectedRowVariant = {};
        this.activeProduct = null;
    }

    selectVariantForRow(row: RangedProduct, variant: string): void {
        if (!this.isWeighingActive) {
            alert('Please start the weighing system first!');
            return;
        }

        if (this.selectedRowVariant[row.size] === variant) {
            this.selectedRowVariant[row.size] = null;
            this.activeRowSize = null;
            this.activeVariant = null;
        } else {
            this.selectedRowVariant[row.size] = variant;
            this.activeRowSize = row.size;
            this.activeVariant = variant;
        }
    }

    getVariantCellClass(row: RangedProduct, variant: string): string {
        const isSelected = this.selectedRowVariant[row.size] === variant;
        const isWeighing =
            this.activeWeighingRow === row.size &&
            this.activeVariant === variant;

        if (isWeighing) {
            return 'bg-green-100 text-green-800 border border-green-300';
        } else if (isSelected) {
            return 'bg-blue-100 text-blue-800 border border-blue-300';
        }

        return 'bg-gray-100 text-gray-700 hover:bg-gray-200';
    }

    isRowWeighing(row: RangedProduct): boolean {
        return this.activeWeighingRow === row.size;
    }

    isCatchWeightWeighing(row: CatchWeightProduct): boolean {
        return this.activeWeighingRow === row.product;
    }

    isRangedRowActive(row: RangedProduct): boolean {
        if (this.activeWeighingRow === row.size) {
            return true;
        }

        if (!this.activeProduct || !this.activeProduct.prodCode) return false;
        const activeCode = this.activeProduct.prodCode;

        if (row.size === activeCode) return true;
        return Object.values(row.variants || {}).includes(activeCode);
    }

    startWeighingProduct(row: RangedProduct): void {
        if (!this.isWeighingActive) {
            alert('Please start the weighing system first!');
            return;
        }

        if (!this.selectedRowVariant[row.size]) {
            alert('Please select a variant (Choice, Farmers, LB, or Plain Poly) first!');
            return;
        }

        const variant = this.selectedRowVariant[row.size]!;
        const productCode = row.variants[variant];

        if (!productCode) {
            alert('Product code not found!');
            return;
        }

        // Stop any currently active weighing
        if (this.activeWeighingRow) {
            this.stopActiveProductWeighing();
        }

        this.activeWeighingRow = row.size;
        this.activeVariant = variant;

        this.startProductWeighing(productCode, row.size, variant);

        this.activeProduct = {
            prodCode: productCode,
            size: row.size,
            variant: variant,
            qty: 0,
            uom: 'KG',
            heads: null,
            portLabel: 'Auto',
        };
    }

    stopWeighingProduct(row: RangedProduct): void {
        if (this.activeWeighingRow === row.size) {
            this.stopActiveProductWeighing();
            this.selectedRowVariant[row.size] = null;

            if (this.activeRowSize === row.size) {
                this.activeRowSize = null;
                this.activeVariant = null;
            }
        }
    }

    startWeighingCatchWeight(row: CatchWeightProduct): void {
        if (!this.isWeighingActive) {
            alert('Please start the weighing system first!');
            return;
        }

        const code = row.codes && row.codes.length > 0 ? row.codes[0] : null;
        if (!code) {
            alert('No product code found for this catch weight product!');
            return;
        }

        // Stop any currently active weighing
        if (this.activeWeighingRow) {
            this.stopActiveProductWeighing();
        }

        this.activeWeighingRow = row.product;

        this.startProductWeighing(code, row.product, 'CATCH WEIGHT');

        this.activeProduct = {
            prodCode: code,
            product: row.product,
            qty: 0,
            uom: 'KG',
            heads: null,
            portLabel: 'Auto',
        };
    }

    stopWeighingCatchWeight(row: CatchWeightProduct): void {
        if (this.activeWeighingRow === row.product) {
            this.stopActiveProductWeighing();
        }
    }

    private startProductWeighing(
        productCode: string,
        rowIdentifier: string,
        productType: string
    ): void {
        this.clearProductWeighing();

        this.productWeighingInterval = setInterval(() => {
            if (!this.isWeighingActive || this.activeWeighingRow !== rowIdentifier) {
                this.clearProductWeighing();
                return;
            }

            // Generate random weight between 10-25 KG
            const randomWeight = (Math.random() * 15 + 10).toFixed(1);
            const weight = parseFloat(randomWeight);

            // Generate random heads count (between 10-30)
            const heads = Math.floor(Math.random() * 21) + 10;

            // Randomly decide which port gets data
            const activePort = Math.random() > 0.5 ? 'port1' : 'port2';
            const portName = activePort === 'port1' ? 'COM11' : 'COM12';

            const newData: WeighingData = {
                serialData: `   ${randomWeight} KG G ${heads.toString().padStart(6, '0')} PCS`,
                qty: weight,
                uom: 'KG',
                prodCode: productCode,
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

            // Add to logs
            const newLog: WeighingLog = {
                id: this.logs.length + 1,
                serialData: newData.serialData,
                qty: weight,
                uom: 'KG',
                heads: heads,
                prodCode: productCode,
                productionId: this.selectedProductionId,
                createdDateTime: new Date().toISOString().slice(0, 19).replace('T', ' '),
                portNumber: portName,
                class: 'ClassB',
                remarks: newData.remarks,
            };

            this.logs = [newLog, ...this.logs];
            this.sessionTotalWeight += weight;

            this.handleWeightData(newLog);
            this.calculateTotals();

            // Reset status after showing capture
            setTimeout(() => {
                const resetData = { ...newData, status: 'Ready' };
                if (activePort === 'port1') {
                    this.port1Data = resetData;
                } else {
                    this.port2Data = resetData;
                }
            }, 1000);
        }, 3000);
    }

    private stopActiveProductWeighing(): void {
        this.clearProductWeighing();
        this.activeWeighingRow = null;
        this.activeVariant = null;
        this.activeProduct = null;

        // Reset port status
        this.port1Data.status = 'Ready';
        this.port2Data.status = 'Ready';
    }

    private clearProductWeighing(): void {
        if (this.productWeighingInterval) {
            clearInterval(this.productWeighingInterval);
            this.productWeighingInterval = null;
        }
    }

    private calculateTotals(): void {
        // Recalculate session total for current production
        this.sessionTotalWeight = this.logs
            .filter((log) => log.productionId === this.selectedProductionId)
            .reduce((sum, log) => sum + log.qty, 0);
    }

    private startSessionTimer(): void {
        this.sessionTimerInterval = setInterval(() => {
            if (this.sessionStartTime) {
                const now = new Date();
                const diff = now.getTime() - this.sessionStartTime.getTime();
                const hours = Math.floor(diff / (1000 * 60 * 60));
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
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

    private clearSessionTimer(): void {
        if (this.sessionTimerInterval) {
            clearInterval(this.sessionTimerInterval);
            this.sessionTimerInterval = null;
        }
    }

    getProdCodeClass(prodCode: string | null): string {
        if (!prodCode) return 'bg-gray-100 text-gray-800';

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

        const hash = prodCode
            .split('')
            .reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return colors[hash % colors.length];
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

    private handleWeightData(log: any): void {
        // Clear any existing timeout
        if (this.activeProductTimeout) {
            clearTimeout(this.activeProductTimeout);
        }

        // Update the active product with current data
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
            if (this.activeProduct && this.activeProduct.prodCode === log.prodCode) {
                this.activeProduct = null;
            }
        }, 5000);
    }
}