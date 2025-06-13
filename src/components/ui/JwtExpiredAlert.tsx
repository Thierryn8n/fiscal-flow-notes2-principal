import React from 'react';
import { AlertCircle } from 'lucide-react';

export const JwtExpiredAlert: React.FC = () => {
  return (
    <div className="bg-white p-6 rounded-t-lg shadow-lg">
      <div className="flex items-center gap-4">
        <div className="bg-red-100 p-3 rounded-full">
          <AlertCircle className="w-6 h-6 text-red-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Sessão Expirada</h3>
          <p className="text-gray-600 mt-1">
            Sua sessão expirou. Por favor, faça login novamente para continuar.
          </p>
        </div>
      </div>
    </div>
  );
}; 