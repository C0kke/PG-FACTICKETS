import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { buildApiUrl } from '../../config/api';

const MyTickets = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [events, setEvents] = useState({});
  const [user, setUser] = useState(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedTickets, setSelectedTickets] = useState([]);

  useEffect(() => {
    // Obtener usuario del localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
    } else {
      navigate('/login');
      return;
    }
    
    fetchUserTickets();
  }, []);

  const fetchUserTickets = async () => {
    // Obtener usuario del localStorage si no está en el state
    const currentUser = user || (localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null);
    
    if (!currentUser || !currentUser.id) {
      setError('No se pudo obtener la información del usuario');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await fetch(buildApiUrl(`/tickets/user/${currentUser.id}`));
      
      if (response.ok) {
        const ticketsData = await response.json();
        setTickets(ticketsData);
        
        // Obtener información de eventos
        const eventIds = [...new Set(ticketsData.map(ticket => ticket.eventId))];
        const eventDetails = {};
        
        for (const eventId of eventIds) {
          try {
            const eventResponse = await fetch(buildApiUrl(`/events/${eventId}`));
            if (eventResponse.ok) {
              const eventData = await eventResponse.json();
              eventDetails[eventId] = eventData;
            }
          } catch (err) {
            console.error(`Error fetching event ${eventId}:`, err);
          }
        }
        
        setEvents(eventDetails);
      } else {
        setError('Error al cargar los tickets');
      }
    } catch (err) {
      setError('Error de conexión al cargar tickets');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      console.error('Error formatting date:', dateString, e);
      return 'Fecha inválida';
    }
  };

  const formatPrice = (price) => {
    try {
      return new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP'
      }).format(price);
    } catch (e) {
      console.error('Error formatting price:', price, e);
      return `$${price || 0}`;
    }
  };

  const getEventStatus = (eventDate) => {
    try {
      const now = new Date();
      const eventDateTime = new Date(eventDate);
      
      // Verificar si la fecha es válida
      if (isNaN(eventDateTime.getTime())) {
        return { status: 'unknown', label: 'Fecha inválida', color: 'bg-yellow-100 text-yellow-800' };
      }
      
      if (eventDateTime > now) {
        return { status: 'upcoming', label: 'Próximo', color: 'bg-green-100 text-green-800' };
      } else {
        return { status: 'past', label: 'Finalizado', color: 'bg-gray-100 text-gray-800' };
      }
    } catch (e) {
      console.error('Error getting event status:', eventDate, e);
      return { status: 'error', label: 'Error', color: 'bg-red-100 text-red-800' };
    }
  };

  const groupTicketsByEvent = (tickets) => {
    if (!Array.isArray(tickets) || tickets.length === 0) {
      return [];
    }

    const grouped = {};
    
    tickets.forEach((ticket) => {
      const eventId = ticket.eventId;
      const eventData = events[eventId];
      
      if (!grouped[eventId]) {
        grouped[eventId] = {
          event: eventData || {
            id: eventId,
            eventName: 'Evento sin nombre',
            eventDate: new Date().toISOString(),
            category: 'Sin categoría'
          },
          tickets: []
        };
      }
      grouped[eventId].tickets.push(ticket);
    });

    return Object.values(grouped);
  };

  const groupedTickets = groupTicketsByEvent(tickets);

  // Función para mostrar QR codes de un evento
  const showQRCodes = (eventTickets) => {
    setSelectedTickets(eventTickets);
    setShowQRModal(true);
  };

  // Componente Modal para mostrar QR codes
  const QRModal = ({ tickets, onClose }) => {
    if (!tickets.length) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800">Códigos QR de tus Tickets</h3>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {tickets.map((ticket, index) => (
                <div key={ticket.id || index} className="border border-gray-200 rounded-lg p-4 text-center">
                  <h4 className="font-semibold text-gray-800 mb-2">
                    Ticket #{ticket.id || index + 1}
                  </h4>
                  <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    {ticket.qrCode ? (
                      <img
                        src={ticket.qrCode}
                        alt={`QR Code para ticket ${ticket.id}`}
                        className="mx-auto max-w-full h-auto"
                        style={{ maxWidth: '200px' }}
                      />
                    ) : (
                      <div className="w-48 h-48 mx-auto bg-gray-200 rounded-lg flex items-center justify-center">
                        <span className="text-gray-500">QR no disponible</span>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    Precio: {formatPrice(ticket.price)}
                  </p>
                  <button
                    onClick={() => {
                      const printWindow = window.open('', '_blank');
                      printWindow.document.write(`
                        <html>
                          <head><title>Ticket QR - ${ticket.id}</title></head>
                          <body style="text-align: center; font-family: Arial;">
                            <h2>Ticket #${ticket.id}</h2>
                            <img src="${ticket.qrCode}" style="max-width: 300px;" />
                            <p>Precio: ${formatPrice(ticket.price)}</p>
                          </body>
                        </html>
                      `);
                      printWindow.document.close();
                      printWindow.print();
                    }}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                  >
                    Imprimir QR
                  </button>
                </div>
              ))}
            </div>
            
            <div className="mt-6 text-center">
              <button
                onClick={onClose}
                className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-6 rounded-lg"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center space-x-4">
                <h1 className="text-3xl font-bold">
                  <span className="text-orange-500">Fac</span>
                  <span className="text-pink-500">Tickets</span>
                </h1>
                <div className="hidden sm:block w-px h-8 bg-gray-300"></div>
                <p className="hidden sm:block text-gray-600">Mis Tickets</p>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigate('/available-events')}
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300"
                >
                  Comprar Más
                </button>
                <button
                  onClick={() => navigate('/client')}
                  className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300"
                >
                  Volver
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                Mis Tickets
              </h2>
              <p className="text-lg text-gray-600">
                Aquí están todos tus tickets comprados
              </p>
              <div className="w-24 h-1 bg-gradient-to-r from-orange-500 to-pink-500 mx-auto rounded-full mt-4"></div>
            </div>



            {/* Estado de carga */}
            {loading && (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
                <span className="ml-3 text-gray-600">Cargando tickets...</span>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                {error}
                <button 
                  onClick={fetchUserTickets}
                  className="ml-4 px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                >
                  Reintentar
                </button>
              </div>
            )}

            {/* Lista de tickets */}
            {!loading && !error && (
              <>
                {groupedTickets.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">No tienes tickets</h3>
                    <p className="text-gray-600 mb-4">¡Compra tu primer ticket para un evento increíble!</p>
                    <button
                      onClick={() => navigate('/available-events')}
                      className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300"
                    >
                      Ver Eventos
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {groupedTickets.map((group) => {
                      try {
                        const eventStatus = getEventStatus(group.event.eventDate);
                        const totalTickets = group.tickets.length;
                        const totalAmount = group.tickets.reduce((sum, ticket) => {
                          const ticketPrice = ticket.price || ticket.ticketPrice || 0;
                          return sum + ticketPrice;
                        }, 0);

                        return (
                          <div key={group.event.id} className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                              {/* Información del evento */}
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-3">
                                  <h3 className="text-xl font-bold text-gray-800">{group.event.eventName || 'Evento sin nombre'}</h3>
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${eventStatus.color}`}>
                                    {eventStatus.label}
                                  </span>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600 mb-3">
                                  <div className="flex items-center">
                                    <svg className="w-4 h-4 mr-2 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                    </svg>
                                    {formatDate(group.event.eventDate)}
                                  </div>
                                  
                                  <div className="flex items-center">
                                    <svg className="w-4 h-4 mr-2 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
                                    </svg>
                                    {group.event.category || 'Sin categoría'}
                                  </div>
                                  
                                  <div className="flex items-center">
                                    <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                                    </svg>
                                    {totalTickets} ticket(s) comprado(s)
                                  </div>
                                  
                                  <div className="flex items-center">
                                    <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                                    </svg>
                                    Total pagado: {formatPrice(totalAmount)}
                                  </div>
                                </div>

                                {group.event.description && (
                                  <p className="text-gray-700 text-sm">{group.event.description}</p>
                                )}
                              </div>

                              {/* Imagen del evento */}
                              {group.event.imageUrl && (
                                <div className="lg:w-48 lg:h-32">
                                  <img
                                    src={group.event.imageUrl}
                                    alt={group.event.eventName}
                                    className="w-full h-full object-cover rounded-lg"
                                    onError={(e) => {
                                      e.target.style.display = 'none';
                                    }}
                                  />
                                </div>
                              )}
                            </div>

                            {/* Detalles de tickets individuales */}
                            <div className="mt-4 pt-4 border-t border-gray-200">
                              <h4 className="text-sm font-medium text-gray-700 mb-3">Detalles de tickets:</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {group.tickets.map((ticket, ticketIndex) => {
                                  const ticketPrice = ticket.price || ticket.ticketPrice || 0;
                                  const ticketId = ticket.id || `ticket_${ticketIndex}`;
                                  const purchaseDate = ticket.purchaseDate || ticket.createdAt || new Date();
                                  
                                  return (
                                    <div key={ticketId} className="bg-gray-50 rounded-lg p-3">
                                      <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium text-gray-700">
                                          Ticket #{ticketId}
                                        </span>
                                        <span className="text-sm font-semibold text-green-600">
                                          {formatPrice(ticketPrice)}
                                        </span>
                                      </div>
                                      <div className="text-xs text-gray-500 mt-1">
                                        Comprado: {formatDate(purchaseDate)}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Acciones */}
                            <div className="mt-4 pt-4 border-t border-gray-200">
                              <div className="flex gap-2">
                                <button 
                                  onClick={() => showQRCodes(group.tickets)}
                                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 text-sm flex items-center justify-center"
                                >
                                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M12 12h-4.01M16 12h4m-4 0v4m-4-4v4m-4-4v4"></path>
                                  </svg>
                                  Ver QR Codes
                                </button>
                                <button className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 text-sm flex items-center justify-center">
                                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                  </svg>
                                  Descargar PDF
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      } catch (e) {
                        console.error('Error rendering group:', group, e);
                        return (
                          <div key={group.event?.id || Math.random()} className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                            <h4 className="font-medium">Error al renderizar este evento</h4>
                            <p className="text-sm mt-1">Error: {e.message}</p>
                            {process.env.NODE_ENV === 'development' && (
                              <details className="mt-2">
                                <summary className="text-xs cursor-pointer">Ver datos del grupo</summary>
                                <pre className="text-xs mt-1 overflow-auto max-h-32">
                                  {JSON.stringify(group, null, 2)}
                                </pre>
                              </details>
                            )}
                          </div>
                        );
                      }
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Modales */}
        {showQRModal && (
          <QRModal 
            tickets={selectedTickets} 
            onClose={() => {
              setShowQRModal(false);
              setSelectedTickets([]);
            }} 
          />
        )}
      </div>
  );
};

export default MyTickets;
