import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProductionService } from '../../../services/production-service/production.service'; // Adjust path as needed
import { ProductionRequest } from '../../../models/production/production-request.model'; // Adjust path as needed
import { ProductionListDto } from '../../../models/production/production-list.model'; // Adjust path as needed
import { PagedResponse } from '../../../models/page-response/page-response.model'; // Adjust path as needed

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

@Component({
  selector: 'app-weighing-scale',
  templateUrl: './weighing-scale.component.html',
  styleUrls: ['./weighing-scale.component.scss']
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
    remarks: null
  };

  port2Data: WeighingData = {
    serialData: '   0.0 KG G 000000 PCS',
    qty: 0.0,
    uom: 'KG',
    heads: null,
    prodCode: null,
    status: 'Ready',
    class: 'ClassB',
    remarks: null
  };

  logs: WeighingLog[] = [
    { 
      id: 1, 
      serialData: '16.3 KG G 000000 PCS', 
      qty: 16.3, 
      uom: 'KG', 
      heads: 15, 
      prodCode: 'CBL', 
      productionId: 'PROD-001',
      createdDateTime: '2021-08-13 16:04:04', 
      portNumber: 'COM11', 
      class: 'ClassB', 
      remarks: null 
    },
    { 
      id: 2, 
      serialData: '14.4 KG G 000000 PCS', 
      qty: 14.4, 
      uom: 'KG', 
      heads: 15, 
      prodCode: 'CBM', 
      productionId: 'PROD-001',
      createdDateTime: '2021-08-13 16:06:06', 
      portNumber: 'COM11', 
      class: 'ClassB', 
      remarks: null 
    },
    { 
      id: 3, 
      serialData: '16.0 KG G 000000 PCS', 
      qty: 16.0, 
      uom: 'KG', 
      heads: 15, 
      prodCode: 'CBL', 
      productionId: 'PROD-001',
      createdDateTime: '2021-08-13 16:19:20', 
      portNumber: 'COM11', 
      class: 'ClassB', 
      remarks: null 
    }
  ];

  isWeighingActive = false;
  selectedProductionId: string = '';
  sessionStartTime: Date | null = null;
  sessionDuration: string = '00:00:00';
  sessionLogsCount: number = 0;
  sessionTotalWeight: number = 0;
  port1Total: number = 0;
  port2Total: number = 0;
  
  // New properties for production list
  productionOptions: ProductionOption[] = [];
  isLoadingProductions = false;
  productionError: string | null = null;
  
  private autoLogInterval: any;
  private sessionTimerInterval: any;

  constructor(
    private productionService: ProductionService
  ) { }

  ngOnInit(): void {
    this.loadProductions();
    this.calculateTotals();
  }

  ngOnDestroy(): void {
    this.stopWeighing();
  }

  loadProductions(): void {
    this.isLoadingProductions = true;
    this.productionError = null;
    
    // Create request object - adjust parameters as needed
    const request: ProductionRequest = {
      pageNumber: 1,
      pageSize: 50, // Increase if you need more items
      searchTerm: '', // You can add search if needed
      // Add any other required properties from your ProductionRequest interface
    };
    
    this.productionService.getProductions(request).subscribe({
      next: (response: PagedResponse<ProductionListDto>) => {
        // Map the API response to production options
        this.productionOptions = response.items.map(production => {
          // Convert numeric ID to string for dropdown value
          // You might want to use a prefix like 'PROD-' or just convert to string
          const productionIdStr = `PROD-${production.id.toString().padStart(3, '0')}`;
          
          return {
            id: productionIdStr, // Use string ID for dropdown
            name: production.productionName || 'Unnamed Production',
            displayText: `${productionIdStr} - ${production.productionName || 'Production'}`,
            originalId: production.id // Store original numeric ID
          };
        });
        
        // Set default selection if available
        if (this.productionOptions.length > 0) {
          this.selectedProductionId = this.productionOptions[0].id;
          this.calculateTotals();
        }
        
        this.isLoadingProductions = false;
      },
      error: (error) => {
        console.error('Error loading productions:', error);
        this.productionError = 'Failed to load productions. Using default options.';
        this.loadDefaultProductions();
        this.isLoadingProductions = false;
      }
    });
  }

  loadDefaultProductions(): void {
    // Fallback to hardcoded options if API fails
    this.productionOptions = [
      { id: 'PROD-001', name: 'Daily Shift 1', displayText: 'PROD-001 - Daily Shift 1', originalId: 1 },
      { id: 'PROD-002', name: 'Daily Shift 2', displayText: 'PROD-002 - Daily Shift 2', originalId: 2 },
      { id: 'PROD-003', name: 'Night Shift', displayText: 'PROD-003 - Night Shift', originalId: 3 },
      { id: 'PROD-004', name: 'Weekend Batch', displayText: 'PROD-004 - Weekend Batch', originalId: 4 }
    ];
    
    if (this.productionOptions.length > 0) {
      this.selectedProductionId = this.productionOptions[0].id;
      this.calculateTotals();
    }
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

  // ... rest of your existing methods remain the same ...
  stopWeighing(): void {
    this.isWeighingActive = false;
    this.clearAutoLogging();
    this.clearSessionTimer();
    this.sessionDuration = '00:00:00';
  }

  startAutoLogging(): void {
    this.autoLogInterval = setInterval(() => {
      if (!this.isWeighingActive) return;

      const randomWeight = (Math.random() * 5 + 15).toFixed(1);
      const prodCodes = ['CBL', 'CBM', 'CBS'];
      const randomProd = prodCodes[Math.floor(Math.random() * prodCodes.length)];
      const heads = randomProd === 'CBS' ? 30 : 15;
      const weight = parseFloat(randomWeight);
      
      // Randomly decide which port gets data
      const activePort = Math.random() > 0.5 ? 'port1' : 'port2';
      const portName = activePort === 'port1' ? 'COM11' : 'COM12';
      
      const newData: WeighingData = {
        serialData: `   ${randomWeight} KG G 000000 PCS`,
        qty: weight,
        uom: 'KG',
        prodCode: randomProd,
        heads: heads,
        status: 'Captured',
        class: 'ClassB',
        remarks: weight === 0 ? 'Invalid Qty' : null
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
        prodCode: randomProd,
        productionId: this.selectedProductionId,
        createdDateTime: new Date().toISOString().slice(0, 19).replace('T', ' '),
        portNumber: portName,
        class: 'ClassB',
        remarks: newData.remarks
      };

      this.logs = [newLog, ...this.logs].slice(0, 20);
      this.sessionLogsCount++;
      this.sessionTotalWeight += weight;
      
      // Recalculate totals
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

  calculateTotals(): void {
    // Calculate port totals
    this.port1Total = this.getPort1Logs().reduce((sum, log) => sum + log.qty, 0);
    this.port2Total = this.getPort2Logs().reduce((sum, log) => sum + log.qty, 0);
    
    // Recalculate session total for current production
    this.sessionTotalWeight = this.logs
      .filter(log => log.productionId === this.selectedProductionId)
      .reduce((sum, log) => sum + log.qty, 0);
  }

  calculateTotalWeight(): number {
    return this.port1Total + this.port2Total;
  }

  getPort1Logs(): WeighingLog[] {
    return this.logs.filter(log => log.portNumber === 'COM11');
  }

  getPort2Logs(): WeighingLog[] {
    return this.logs.filter(log => log.portNumber === 'COM12');
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
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        this.sessionDuration = 
          hours.toString().padStart(2, '0') + ':' +
          minutes.toString().padStart(2, '0') + ':' +
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
    if (prodCode === 'CBL') return 'bg-blue-100 text-blue-800';
    if (prodCode === 'CBM') return 'bg-green-100 text-green-800';
    if (prodCode === 'CBS') return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  }

  isPortActive(data: WeighingData): boolean {
    return data.status === 'Captured';
  }

  getPortBorderClass(data: WeighingData): string {
    return this.isPortActive(data) ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50';
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
}