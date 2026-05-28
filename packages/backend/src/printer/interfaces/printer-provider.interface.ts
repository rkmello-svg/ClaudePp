export interface PrinterConfig {
  port: string;
  baudRate?: number;
  paperWidth?: number;
}

export interface PrintJobData {
  type: 'receipt' | 'report' | 'label';
  content: string;
  copies?: number;
}

export interface IPrinterProvider {
  connect(): Promise<boolean>;
  disconnect(): Promise<boolean>;
  print(data: PrintJobData): Promise<boolean>;
  testPrint(): Promise<boolean>;
  getStatus(): Promise<{ online: boolean; paperLow: boolean; error?: string }>;
}
