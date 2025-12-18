import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';

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
  selectedProductionId: string = 'PROD-001';
  sessionStartTime: Date | null = null;
  sessionDuration: string = '00:00:00';
  sessionLogsCount: number = 0;
  sessionTotalWeight: number = 0;
  port1Total: number = 0;
  port2Total: number = 0;
  
  private autoLogInterval: any;
  private sessionTimerInterval: any;

  constructor() { }

  ngOnInit(): void {
    this.calculateTotals();
  }

  ngOnDestroy(): void {
    this.stopWeighing();
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