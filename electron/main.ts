import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import * as util from 'util';
import { exec } from 'child_process';
import { join } from 'path';
import { format } from 'date-fns';
import { existsSync, mkdirSync } from 'fs';
import { writeFile } from 'fs/promises';

const execAsync = util.promisify(exec);

let mainWindow: BrowserWindow | null = null;

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // Em desenvolvimento, carrega o servidor local
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    // Em produção, carrega o arquivo index.html empacotado
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
};

// Gerenciamento do ciclo de vida do aplicativo
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Função para obter impressoras do Windows
async function getWindowsPrinters() {
  try {
    const { stdout } = await execAsync('wmic printer get name,default,status');
    const lines = stdout.split('\n').slice(1);
    const printers = lines
      .map(line => {
        const [defaultStr, status, ...nameParts] = line.trim().split(/\s+/);
        if (!nameParts.length) return null;
        const name = nameParts.join(' ').trim();
        if (!name) return null;
        // Filtra impressoras virtuais indesejadas
        if (name.toLowerCase().includes('fax') ||
            name.toLowerCase().includes('microsoft xps')) {
          return null;
        }
        return {
          name,
          status: status || 'READY',
          isDefault: defaultStr === 'TRUE'
        };
      })
      .filter((p): p is { name: string; status: string; isDefault: boolean } => p !== null);

    // Verifica se há algum leitor de PDF instalado
    const commonPDFReaders = [
      'C:\\Program Files\\Adobe\\Acrobat DC\\Acrobat\\Acrobat.exe',
      'C:\\Program Files (x86)\\Adobe\\Acrobat Reader DC\\Reader\\AcroRd32.exe',
      'C:\\Program Files\\Foxit Software\\Foxit PDF Reader\\FoxitPDFReader.exe'
    ];

    const hasPDFReader = commonPDFReaders.some(path => existsSync(path)) || 
                        printers.some(p => p.name.toLowerCase().includes('pdf'));

    if (hasPDFReader) {
      // Adiciona a opção de PDF apenas se houver um leitor PDF instalado
      printers.push({
        name: 'PDF',
        status: 'READY',
        isDefault: false
      });
    }

    return printers;
  } catch (error) {
    console.error('Erro ao obter impressoras:', error);
    return [];
  }
}

// Handlers IPC para gerenciamento de impressoras
ipcMain.handle('getPrinters', async () => {
  try {
    const printers = await getWindowsPrinters();
    return printers;
  } catch (error) {
    console.error('Erro ao obter impressoras:', error);
    throw error;
  }
});

ipcMain.handle('getPrinterStatus', async (_: unknown, printerName: string) => {
  try {
    const { stdout } = await execAsync(`wmic printer where name="${printerName}" get status`);
    const status = stdout.split('\n')[1].trim();
    return status || 'READY';
  } catch (error) {
    console.error('Erro ao verificar status da impressora:', error);
    return 'UNKNOWN';
  }
});

interface PrintOptions {
  copies?: number;
}

interface PrintContent {
  title?: string;
  items?: string[];
}

ipcMain.handle('printDocument', async (_: unknown, { printerName, data, options }: { printerName: string; data: string | Buffer; options?: PrintOptions }) => {
  try {
    // Usar o comando de impressão do Windows
    const printCommand = Buffer.isBuffer(data) 
      ? data 
      : typeof data === 'string' 
        ? data
        : JSON.stringify(JSON.parse(data), null, 2);

    // Criar um arquivo temporário para impressão
    const tempFile = path.join(app.getPath('temp'), `print_${Date.now()}.txt`);
    const { writeFile } = require('fs/promises');
    await writeFile(tempFile, printCommand);

    // Imprimir usando o comando do Windows
    const copies = options?.copies || 1;
    for (let i = 0; i < copies; i++) {
      await execAsync(`print /d:"${printerName}" "${tempFile}"`);
    }

    // Limpar o arquivo temporário
    const { unlink } = require('fs/promises');
    await unlink(tempFile);

    return { success: true };
  } catch (error) {
    console.error('Erro ao imprimir:', error);
    throw error;
  }
});

// Adicionar manipulador para impressão em PDF
ipcMain.handle('printToPDF', async (_event, { data, options }) => {
  try {
    const pdfDir = join(app.getPath('userData'), 'pdfs');
    if (!existsSync(pdfDir)) {
      mkdirSync(pdfDir, { recursive: true });
    }

    const timestamp = format(new Date(), 'yyyy-MM-dd-HH-mm-ss');
    const pdfPath = join(pdfDir, `impressao-${timestamp}.pdf`);

    const win = new BrowserWindow({
      show: false,
      webPreferences: {
        nodeIntegration: true
      }
    });

    await win.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(data));
    const pdfData = await win.webContents.printToPDF({
      printBackground: options?.printBackground ?? true,
      pageSize: options?.pageSize ?? 'A4',
      margins: {
        marginType: 'none'
      }
    });

    await writeFile(pdfPath, pdfData);
    win.close();

    return { success: true, filePath: pdfPath };
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    throw error;
  }
}); 