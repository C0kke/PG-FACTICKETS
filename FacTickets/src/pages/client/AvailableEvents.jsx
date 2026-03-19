import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MercadoPagoPayment from '../../components/payment/MercadoPagoPayment';
import { buildApiUrl } from '../../config/api';

const AvailableEvents = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [user, setUser] = useState(null);

  const categories = [
    'Música',
    'Festival',
    'Teatro',
    'Conferencia',
    'Deportes',
    'Arte',
    'Comedia',
    'Danza',
    'Educativo',
    'Familiar',
    'Gastronómico',
    'Tecnología',
    'Otro'
  ];

  useEffect(() => {
    // Verificar usuario logueado
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
    } else {
      navigate('/login');
      return;
    }

    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(buildApiUrl('/events'));
      if (response.ok) {
        const eventsData = await response.json();
        setEvents(eventsData);
      } else {
        setError('Error al cargar los eventos');
      }
    } catch (err) {
      setError('Error de conexión al cargar eventos');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(price);
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.eventName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === '' || event.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleBuyTickets = (event) => {
    setSelectedEvent(event);
    setShowPurchaseModal(true);
  };

  const PurchaseModal = ({ event, onClose, onPurchase }) => {
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(false);
    const [purchaseError, setPurchaseError] = useState('');
    const [showPayment, setShowPayment] = useState(false);

    const handleProceedToPayment = (e) => {
      e.preventDefault();

      // Verificar que hay usuario logueado
      const currentUser = user || (localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null);

      if (!currentUser || !currentUser.id) {
        setPurchaseError('Error: No se pudo obtener la información del usuario. Por favor, inicia sesión nuevamente.');
        return;
      }

      setShowPayment(true);
    };

    const handlePaymentSuccess = () => {
      onPurchase();
      onClose();
    };

    const handlePaymentError = (error) => {
      console.error('Error en el pago:', error);
      setPurchaseError('Error en el proceso de pago. Por favor, intenta nuevamente.');
      setShowPayment(false);
    };

    const handleBackToForm = () => {
      setShowPayment(false);
      setPurchaseError('');
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">
            {showPayment ? 'Pagar con MercadoPago' : 'Comprar Tickets'}
          </h3>

          <div className="mb-4">
            <h4 className="text-lg font-semibold text-gray-700">{event.eventName}</h4>
            <p className="text-gray-600">{formatDate(event.eventDate)}</p>
            <p className="text-green-600 font-semibold">{formatPrice(event.ticketPrice)} por ticket</p>
          </div>

          {purchaseError && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
              {purchaseError}
            </div>
          )}

          {!showPayment ? (
            <form onSubmit={handleProceedToPayment} className="space-y-4">
              <div>
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
                  Cantidad de tickets
                </label>
                <input
                  type="number"
                  id="quantity"
                  min="1"
                  max={event.capacity || 100}
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>

              <div className="bg-blue-50 rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total:</span>
                  <span className="text-lg font-bold text-green-600">
                    {formatPrice(event.ticketPrice * quantity)}
                  </span>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 disabled:opacity-50"
                >
                  Proceder al Pago
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <MercadoPagoPayment
                event={event}
                user={user || JSON.parse(localStorage.getItem('user'))}
                quantity={parseInt(quantity)}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
                onCancel={handleBackToForm}
              />

              <button
                onClick={handleBackToForm}
                className="w-full bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300"
              >
                ← Volver a modificar cantidad
              </button>
            </div>
          )}
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
              <p className="hidden sm:block text-gray-600">Eventos Disponibles</p>
            </div>
            <div className="flex items-center space-x-4">
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
              Eventos Disponibles
            </h2>
            <p className="text-lg text-gray-600">
              Descubre eventos increíbles y compra tus tickets
            </p>
            <div> <
            <div className="w-24 h-1 bg-gradient-to-r from-orange-500 to-pink-500 mx-auto rounded-full mt-4"></div>
            </div>

            {/* Filtros */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div>
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                  Buscar eventos
                </label>
                <input
                  type="text"
                  id="search"
                  placeholder="Buscar por nombre o descripción..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  Categoría
                </label>
                <select
                  id="category"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Todas las categorías</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Estado de carga */}
            {loading && (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
                <span className="ml-3 text-gray-600">Cargando eventos...</span>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            {/* Lista de eventos */}
            {!loading && (
              <>
                {filteredEvents.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">No se encontraron eventos</h3>
                    <p className="text-gray-600">Intenta cambiar los filtros de búsqueda</p>
                  </div>
                ) : (
                  <>
                    <div className="mb-4 text-gray-600">
                      Mostrando {filteredEvents.length} evento(s)
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredEvents.map((event) => (
                        <div key={event.id} className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                          {event.imageUrl && (
                            <div className="mb-4 rounded-lg overflow-hidden">
                              <img
                                src={event.imageUrl}
                                alt={event.eventName}
                                className="w-full h-48 object-cover"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                }}
                              />
                            </div>
                          )}

                          <div className="space-y-3">
                            <h3 className="text-xl font-bold text-gray-800">{event.eventName}</h3>

                            <div className="space-y-2 text-sm text-gray-600">
                              <div className="flex items-center">
                                <svg className="w-4 h-4 mr-2 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                </svg>
                                {formatDate(event.eventDate)}
                              </div>

                              <div className="flex items-center">
                                <svg className="w-4 h-4 mr-2 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
                                </svg>
                                {event.category}
                              </div>

                              <div className="flex items-center">
                                <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                                </svg>
                                {formatPrice(event.ticketPrice)}
                              </div>

                              {event.capacity && (
                                <div className="flex items-center">
                                  <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                                  </svg>
                                  Capacidad: {event.capacity}
                                </div>
                              )}
                            </div>

                            <p className="text-gray-700 text-sm">{event.description}</p>

                            <div className="pt-4">
                              <button
                                onClick={() => handleBuyTickets(event)}
                                className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300"
                              >
                                Comprar Tickets
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>

        {/* Modal de compra */}
        {showPurchaseModal && selectedEvent && (
          <PurchaseModal
            event={selectedEvent}
            onClose={() => {
              setShowPurchaseModal(false);
              setSelectedEvent(null);
            }}
            onPurchase={() => {
              // Refrescar eventos o actualizar estado si es necesario
            }}
          />
        )}
      </div>
      );
};

      export default AvailableEvents;
