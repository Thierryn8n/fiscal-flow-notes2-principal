"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path = __importStar(require("path"));
const util = __importStar(require("util"));
const child_process_1 = require("child_process");
const execAsync = util.promisify(child_process_1.exec);
let mainWindow = null;
const createWindow = () => {
    mainWindow = new electron_1.BrowserWindow({
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
    }
    else {
        // Em produção, carrega o arquivo index.html empacotado
        mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    }
};
// Gerenciamento do ciclo de vida do aplicativo
electron_1.app.whenReady().then(() => {
    createWindow();
    electron_1.app.on('activate', () => {
        if (electron_1.BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});
electron_1.app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
// Função para obter impressoras do Windows
async function getWindowsPrinters() {
    try {
        const { stdout } = await execAsync('wmic printer get name,default');
        const lines = stdout.split('\n').slice(1);
        const printers = lines
            .map(line => {
            const [defaultStr, ...nameParts] = line.trim().split(/\s+/);
            if (!nameParts.length)
                return null;
            const name = nameParts.join(' ').trim();
            if (!name)
                return null;
            return {
                name,
                status: 'READY',
                isDefault: defaultStr === 'TRUE'
            };
        })
            .filter(Boolean);
        return printers;
    }
    catch (error) {
        console.error('Erro ao obter impressoras:', error);
        return [];
    }
}
// Handlers IPC para gerenciamento de impressoras
electron_1.ipcMain.handle('getPrinters', async () => {
    try {
        const printers = await getWindowsPrinters();
        return printers;
    }
    catch (error) {
        console.error('Erro ao obter impressoras:', error);
        throw error;
    }
});
electron_1.ipcMain.handle('getPrinterStatus', async (_, printerName) => {
    try {
        const { stdout } = await execAsync(`wmic printer where name="${printerName}" get status`);
        const status = stdout.split('\n')[1].trim();
        return status || 'READY';
    }
    catch (error) {
        console.error('Erro ao verificar status da impressora:', error);
        return 'UNKNOWN';
    }
});
electron_1.ipcMain.handle('printDocument', async (_, { printerName, data, options }) => {
    try {
        // Usar o comando de impressão do Windows
        const printCommand = Buffer.isBuffer(data)
            ? data
            : typeof data === 'string'
                ? data
                : JSON.stringify(JSON.parse(data), null, 2);
        // Criar um arquivo temporário para impressão
        const tempFile = path.join(electron_1.app.getPath('temp'), `print_${Date.now()}.txt`);
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
    }
    catch (error) {
        console.error('Erro ao imprimir:', error);
        throw error;
    }
});
