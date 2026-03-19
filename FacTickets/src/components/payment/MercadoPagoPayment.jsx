import React, { useEffect, useState } from 'react';
import { initMercadoPago, Wallet } from '@mercadopago/sdk-react';
import { buildApiUrl } from '../../config/api';

const MercadoPagoPayment = ({ event, user, quantity, onSuccess, onError, onCancel }) => {
  const [preferenceId, setPreferenceId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPreferenceId = async () => {
      try {
        setLoading(true);
        setError('');

        const totalAmount = event.ticketPrice * quantity;
        
        const requestBody = {
          eventId: event.id,
          userId: user.id,
          quantity: quantity,
          eventName: event.eventName,
          unitPrice: event.ticketPrice,
          totalAmount: totalAmount,
        };

        console.log('Enviando datos al backend:', requestBody);
        
        const response = await fetch(buildApiUrl('/api/mercadopago/create-preference'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
          throw new Error('Error al crear la preferencia de pago');
        }

        const contentType = response.headers.get('content-type');
        let data;
        
        if (contentType && contentType.includes('application/json')) {
          data = await response.json();
          setPreferenceId(data.id || data);
        } else {
          // Si la respuesta es texto plano (como en el backend actual)
          data = await response.text();
          
          // Verificar si la respuesta es un ID válido o un mensaje de error
          if (data.startsWith('Error:') || data.includes('Error')) {
            throw new Error(data);
          }
          
          setPreferenceId(data.trim());
        }
      } catch (error) {
        console.error('Error al obtener preferenceId:', error);
        setError('Error al inicializar el pago: ' + error.message);
        if (onError) onError(error);
      } finally {
        setLoading(false);
      }
    };

    if (event && user && quantity) {
      fetchPreferenceId();
    }
  }, [event, user, quantity]);

  useEffect(() => {
    // Inicializar MercadoPago con tu Public Key
    try {
      const publicKey = import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY;
      
      if (!publicKey || publicKey === 'TEST-your-public-key-here') {
        setError('❌ CREDENCIALES FALTANTES: Necesitas configurar VITE_MERCADOPAGO_PUBLIC_KEY en el archivo .env del frontend.');
        return;
      }
      
      if (!publicKey.startsWith('TEST-') && !publicKey.startsWith('APP_USR-')) {
        setError('❌ FORMATO INCORRECTO: La Public Key debe empezar con TEST- o APP_USR-');
        return;
      }
      
      initMercadoPago(publicKey);
    } catch (error) {
      console.error('Error al inicializar MercadoPago:', error);
      setError('Error al inicializar MercadoPago: ' + error.message);
    }
  }, []);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(price);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        <span className="ml-3 text-gray-600">Preparando el pago...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300"
          >
            Cancelar
          </button>
          <button
            onClick={() => window.location.reload()}
            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!preferenceId) {
    return (
      <div className="space-y-4">
        <div className="p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded-lg">
          No se pudo obtener la información de pago
        </div>
        <button
          onClick={onCancel}
          className="w-full bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300"
        >
          Cancelar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Resumen de la compra */}
      <div className="bg-blue-50 rounded-lg p-4">
        <h4 className="font-semibold text-gray-800 mb-2">Resumen de compra:</h4>
        <div className="space-y-1 text-sm text-gray-600">
          <div className="flex justify-between">
            <span>Evento:</span>
            <span className="font-medium">{event.eventName}</span>
          </div>
          <div className="flex justify-between">
            <span>Cantidad:</span>
            <span className="font-medium">{quantity} ticket(s)</span>
          </div>
          <div className="flex justify-between">
            <span>Precio unitario:</span>
            <span className="font-medium">{formatPrice(event.ticketPrice)}</span>
          </div>
          <div className="border-t border-blue-200 pt-2 mt-2">
            <div className="flex justify-between text-lg font-bold text-green-600">
              <span>Total:</span>
              <span>{formatPrice(event.ticketPrice * quantity)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Wallet de MercadoPago */}
      <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
        <h4 className="font-semibold text-gray-800 mb-4 text-center">
          Completa tu pago con MercadoPago
        </h4>
        <div className="text-sm text-gray-600 mb-4 text-center">
          Serás redirigido a MercadoPago para completar tu pago de forma segura.
        </div>
        <div className="flex justify-center">
          <div style={{ width: '100%', maxWidth: '400px' }}>
            <Wallet 
              initialization={{ 
                preferenceId: preferenceId,
                redirectMode: 'self' // Redirige en la misma pestaña
              }}
              customization={{
                texts: {
                  valueProp: 'smart_option'
                }
                // Removido buttonBackground deprecated
              }}
              onSubmit={onSuccess}
              onError={onError}
            />
          </div>
        </div>
      </div>

      {/* Botón para cancelar */}
      <button
        onClick={onCancel}
        className="w-full bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300"
      >
        Cancelar compra
      </button>
    </div>
  );
};

export default MercadoPagoPayment;