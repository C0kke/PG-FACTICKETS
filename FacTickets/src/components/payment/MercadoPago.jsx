import React, { useEffect, useState } from 'react';
import { initMercadoPago, Wallet } from '@mercadopago/sdk-react';
import { buildApiUrl } from '../../config/api';

const MercadoPago = () => {
  const [preferenceId, setPreferenceId] = useState(null);

  useEffect(() => {
    const fetchPreferenceId = async () => {
      try {
        const response = await fetch(buildApiUrl('/api/mercadopago/create-preference'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            eventId: 1,
            userId: 123,
            quantity: 2,
            eventName: 'Concierto Prueba',
            unitPrice: 5000,
            totalAmount: 10000,
          }),
        });
        const data = await response.json();
        setPreferenceId(data);  // Aquí debes recibir el preferenceId
      } catch (error) {
        console.error('Error al obtener preferenceId:', error);
      }
    };

    fetchPreferenceId();
  }, []);

  if (!preferenceId) {
    return <div>Cargando...</div>;
  }

  // Inicializar MercadoPago con tu Public Key
  initMercadoPago('VITE_MERCADOPAGO_PUBLIC_KEY');  // Usar tu Public Key de Mercado Pago

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '50px' }}>
      <h1>Botón de Pago</h1>
      <p>Haz clic en el botón para realizar el pago.</p>
      {/* Renderiza el Wallet de Mercado Pago */}
      <div style={{ width: '300px' }}>
        <Wallet initialization={{ preferenceId }} />
      </div>
    </div>
  );
};

export default MercadoPago;
