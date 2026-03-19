import React from 'react';
import { useNotifications } from '../../hooks/useNotifications';

const TestNotifications = () => {
  const { notifications, unreadCount, connected } = useNotifications();

  const sendTestNotification = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BACKEND}/test-notifications/send-test`, {
        method: 'POST'
      });
      const result = await response.text();
      console.log('Respuesta del test:', result);
    } catch (error) {
      console.error('Error enviando test:', error);
    }
  };

  const sendEventDeletedTest = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BACKEND}/test-notifications/send-event-deleted`, {
        method: 'POST'
      });
      const result = await response.text();
      console.log('Respuesta del test:', result);
    } catch (error) {
      console.error('Error enviando test:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Test de Notificaciones WebSocket</h1>
        
        {/* Estado de conexión */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Estado de Conexión</h2>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className={connected ? 'text-green-600' : 'text-red-600'}>
              {connected ? 'Conectado' : 'Desconectado'}
            </span>
          </div>
          <p className="text-gray-600 mt-2">
            Notificaciones no leídas: <span className="font-semibold">{unreadCount}</span>
          </p>
        </div>

        {/* Botones de prueba */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Enviar Notificaciones de Prueba</h2>
          <div className="space-y-4">
            <button
              onClick={sendTestNotification}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
            >
              Enviar Notificación General
            </button>
            <button
              onClick={sendEventDeletedTest}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg ml-4"
            >
              Enviar Notificación de Evento Eliminado
            </button>
          </div>
        </div>

        {/* Lista de notificaciones */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Notificaciones Recibidas</h2>
          {notifications.length === 0 ? (
            <p className="text-gray-500">No hay notificaciones</p>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 rounded-lg border ${
                    !notification.read ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{notification.title}</h3>
                      <p className="text-gray-600">{notification.message}</p>
                      <p className="text-xs text-gray-400 mt-1">{notification.timestamp}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs ${
                      notification.type === 'event_deleted' ? 'bg-red-100 text-red-800' :
                      notification.type === 'test' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {notification.type}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestNotifications;