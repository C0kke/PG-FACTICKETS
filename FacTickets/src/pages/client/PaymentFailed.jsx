import React from 'react';
import { useNavigate } from 'react-router-dom';

const PaymentFailed = () => {
  const navigate = useNavigate();

  const handleRetry = () => {
    navigate('/available-events');
  };

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
        <div className="text-red-500 text-6xl mb-4">❌</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Pago Fallido</h1>
        <p className="text-gray-600 mb-6">
          Lo sentimos, tu pago no pudo ser procesado. Esto puede deberse a:
        </p>
        
        <div className="text-left bg-gray-50 p-4 rounded-lg mb-6">
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Fondos insuficientes</li>
            <li>• Problema con la tarjeta</li>
            <li>• Cancelación del pago</li>
            <li>• Error técnico temporal</li>
          </ul>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleRetry}
            className="w-full bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Intentar Nuevamente
          </button>
          <button
            onClick={handleGoHome}
            className="w-full bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Ir a Inicio
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailed;