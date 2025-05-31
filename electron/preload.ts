import { contextBridge, ipcRenderer } from 'electron';

// Expõe uma API segura para o processo de renderização
contextBridge.exposeInMainWorld('electron', {
  invoke: (channel: string, data?: any) => {
    const validChannels = ['getPrinters', 'printDocument', 'getPrinterStatus', 'printToPDF'];
    if (validChannels.includes(channel)) {
      return ipcRenderer.invoke(channel, data);
    }
    throw new Error(`Canal não permitido: ${channel}`);
  }
}); 