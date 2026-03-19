import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { buildApiUrl } from '../../config/api';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [ticketInfo, setTicketInfo] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const ticketId = searchParams.get('ticketId');
    
    if (ticketId) {
      // Si tenemos el ticketId de la URL, mostrar éxito
      setTicketInfo({ id: ticketId });
      setLoading(false);
    } else {
      // Si no hay ticketId, procesar los parámetros de MercadoPago
      const collection_id = searchParams.get('collection_id');
      const collection_status = searchParams.get('collection_status');
      const external_reference = searchParams.get('external_reference');

      if (collection_id && collection_status && external_reference) {
        processPayment(collection_id, collection_status, external_reference);
      } else {
        setError('Información de pago incompleta');
        setLoading(false);
      }
    }
  }, [searchParams]);

  const processPayment = async (collection_id, collection_status, external_reference) => {
    try {
      const response = await fetch(buildApiUrl('/api/mercadopago/payment-success'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `collection_id=${collection_id}&collection_status=${collection_status}&external_reference=${external_reference}`
      });

      if (response.ok) {
        const result = await response.text();
        console.log('Pago procesado:', result);
        
        // Extraer el ticketId del resultado si está disponible
        const ticketMatch = result.match(/ID: (\\d+)/);
        if (ticketMatch) {
          setTicketInfo({ id: ticketMatch[1] });
        } else {
          setTicketInfo({ processed: true });
        }
      } else {
        setError('Error al procesar el pago');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleGoToTickets = () => {
    navigate('/my-tickets');
  };

  const handleGoToEvents = () => {
    navigate('/available-events');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Procesando tu pago...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
          <div className="text-red-500 text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Error en el Pago</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={handleGoToEvents}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Volver a Eventos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
        <div className="text-green-500 text-6xl mb-4">✅</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-4">¡Pago Exitoso!</h1>
        <p className="text-gray-600 mb-6">
          Tu pago ha sido procesado correctamente y tu ticket ha sido generado.
        </p>
        
        {ticketInfo && ticketInfo.id && (
          <div className="bg-green-50 p-4 rounded-lg mb-6">
            <p className="text-green-700 font-semibold">
              Ticket ID: #{ticketInfo.id}
            </p>
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={handleGoToTickets}
            className="w-full bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Ver Mis Tickets
          </button>
          <button
            onClick={handleGoToEvents}
            className="w-full bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Explorar Más Eventos
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;