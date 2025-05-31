"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
// Expõe uma API segura para o processo de renderização
electron_1.contextBridge.exposeInMainWorld('electron', {
    invoke: (channel, ...args) => {
        // Lista de canais permitidos
        const validChannels = ['getPrinters', 'getPrinterStatus', 'printDocument'];
        if (validChannels.includes(channel)) {
            return electron_1.ipcRenderer.invoke(channel, ...args);
        }
        throw new Error(`Canal IPC não permitido: ${channel}`);
    }
});
