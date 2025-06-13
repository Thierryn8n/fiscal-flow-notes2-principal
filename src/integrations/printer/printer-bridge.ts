export interface PrinterInfo {
  name: string;
  status: string;
  isDefault: boolean;
}

export interface PrintOptions {
  copies?: number;
  silent?: boolean;
  printBackground?: boolean;
  pageSize?: string;
}

interface PrintToPDFParams {
  data: string;
  options?: PrintOptions;
}

interface PrintDocumentParams {
  printerName: string;
  data: string;
  options?: PrintOptions;
}

export async function getPrinters(): Promise<PrinterInfo[]> {
  try {
    const response = await window.electron.invoke('getPrinters') as PrinterInfo[];
    return response.filter((printer: PrinterInfo) => 
      !printer.name.toLowerCase().includes('fax') && 
      !printer.name.toLowerCase().includes('microsoft') &&
      !printer.name.toLowerCase().includes('onenote') &&
      !printer.name.toLowerCase().includes('pdf')
    );
  } catch (error) {
    console.error('Erro ao obter impressoras:', error);
    return [];
  }
}

export async function printDocument(
  printerName: string,
  data: string,
  options?: PrintOptions
): Promise<void> {
  try {
    if (printerName === 'PDF' || !(await getPrinters()).length) {
      await window.electron.invoke('printToPDF', { data, options } as PrintToPDFParams);
    } else {
      await window.electron.invoke('printDocument', { printerName, data, options } as PrintDocumentParams);
    }
  } catch (error) {
    console.error('Erro ao imprimir documento:', error);
    throw error;
  }
}

export async function getPrinterStatus(printerName: string): Promise<string> {
  try {
    const status = await window.electron.invoke('getPrinterStatus', printerName) as string;
    return status;
  } catch (error) {
    console.error('Erro ao obter status da impressora:', error);
    return 'ERROR';
  }
} 