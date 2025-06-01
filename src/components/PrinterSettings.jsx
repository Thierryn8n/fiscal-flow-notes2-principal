import React, { useState, useEffect } from 'react';
import printers from '../config/printers'; // Mantemos a lista de impressoras disponíveis

const PrinterSettings = ({ onSettingsChange, initialSettings }) => {
  const [fiscalNotePrinter, setFiscalNotePrinter] = useState(initialSettings?.fiscalNotePrinter || '');
  const [normalPrinter, setNormalPrinter] = useState(initialSettings?.normalPrinter || '');
  const [availablePrinters, setAvailablePrinters] = useState([]);

  useEffect(() => {
    // A lista de impressoras vem do config/printers.js
    setAvailablePrinters(printers.map(p => ({ id: p.id, name: `${p.brand} ${p.name}` })));
    if (initialSettings) {
      setFiscalNotePrinter(initialSettings.fiscalNotePrinter || '');
      setNormalPrinter(initialSettings.normalPrinter || '');
    }
  }, [initialSettings]);

  const handleFiscalPrinterChange = (e) => {
    const newPrinter = e.target.value;
    setFiscalNotePrinter(newPrinter);
    onSettingsChange({ fiscalNotePrinter: newPrinter, normalPrinter });
  };

  const handleNormalPrinterChange = (e) => {
    const newPrinter = e.target.value;
    setNormalPrinter(newPrinter);
    onSettingsChange({ fiscalNotePrinter, normalPrinter: newPrinter });
  };

  return (
    <div className="p-4 sm:p-6 bg-white rounded-lg shadow-sm border border-gray-200">
      <h2 className="text-lg sm:text-xl font-cascadia mb-4 sm:mb-6 flex items-center">
        <span className="bg-fiscal-green-500 text-white p-1.5 sm:p-2 rounded-lg mr-2 sm:mr-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" />
          </svg>
        </span>
        Configurações de Impressora
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div>
          <label htmlFor="fiscal-printer" className="block text-sm font-medium text-gray-700 mb-1">
            Impressora para Notas Fiscais
        </label>
        <select
            id="fiscal-printer"
            className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-fiscal-green-500 focus:border-fiscal-green-500"
            value={fiscalNotePrinter}
            onChange={handleFiscalPrinterChange}
          >
            <option value="">Nenhuma selecionada</option>
            {availablePrinters.map(printer => (
              <option key={`fiscal-${printer.id}`} value={printer.id}>
                {printer.name}
            </option>
          ))}
        </select>
      </div>

        <div>
          <label htmlFor="normal-printer" className="block text-sm font-medium text-gray-700 mb-1">
            Impressora para Documentos Normais
          </label>
          <select
            id="normal-printer"
            className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-fiscal-green-500 focus:border-fiscal-green-500"
            value={normalPrinter}
            onChange={handleNormalPrinterChange}
          >
            <option value="">Nenhuma selecionada</option>
            {availablePrinters.map(printer => (
              <option key={`normal-${printer.id}`} value={printer.id}>
                {printer.name}
              </option>
            ))}
          </select>
        </div>
      </div>
        <p className="mt-4 text-xs text-gray-500">
        As impressoras selecionadas aqui serão usadas para impressão automática e manual através do dashboard.
        A impressão real ocorre através do sistema Fiscal Flow via internet, certifique-se que o aplicativo Fiscal Flow Printer esteja configurado corretamente no computador onde as impressoras estão instaladas.
      </p>
    </div>
  );
};

export default PrinterSettings; 