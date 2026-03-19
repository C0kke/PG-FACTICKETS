import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { buildApiUrl } from '../../config/api';

const SpotEvents = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [spots, setSpots] = useState([]);
  const [selectedSpotId, setSelectedSpotId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);

  // Cargar locales del propietario al montar el componente
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
    
    fetchOwnerSpots();
  }, []);

  // Cargar eventos cuando se selecciona un local
  useEffect(() => {
    if (selectedSpotId) {
      fetchSpotEvents(selectedSpotId);
    }
  }, [selectedSpotId]);

  const fetchOwnerSpots = async () => {
    const currentUser = user || (localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null);
    
    if (!currentUser || !currentUser.id) {
      setError('No se pudo obtener la información del usuario');
      return;
    }
    try {
      const response = await fetch(buildApiUrl(`/spots/owner/${currentUser.id}`));
      if (response.ok) {
        const spotsData = await response.json();
        setSpots(spotsData);
        // Si hay locales, seleccionar el primero por defecto
        if (spotsData.length > 0) {
          setSelectedSpotId(spotsData[0].id.toString());
        }
      } else {
        setError('Error al cargar los locales');
      }
    } catch (err) {
      setError('Error de conexión al cargar locales');
    }
  };

  const fetchSpotEvents = async (spotId) => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(buildApiUrl(`/events/spot/${spotId}`));
      if (response.ok) {
        const eventsData = await response.json();
        setEvents(eventsData);
      } else {
        setError('Error al cargar los eventos');
        setEvents([]);
      }
    } catch (err) {
      setError('Error de conexión al cargar eventos');
      setEvents([]);
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
              <p className="hidden sm:block text-gray-600">Eventos en mi Local</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/spot-owner')}
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
              Eventos en mis Locales
            </h2>
            <p className="text-lg text-gray-600">
              Revisa todos los eventos programados en tus espacios
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-orange-500 to-pink-500 mx-auto rounded-full mt-4"></div>
          </div>

          {/* Selector de local */}
          {spots.length > 0 && (
            <div className="mb-6">
              <label htmlFor="spotSelect" className="block text-sm font-medium text-gray-700 mb-2">
                Selecciona un local:
              </label>
              <select
                id="spotSelect"
                value={selectedSpotId}
                onChange={(e) => setSelectedSpotId(e.target.value)}
                className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                {spots.map((spot) => (
                  <option key={spot.id} value={spot.id}>
                    {spot.name} - {spot.location}
                  </option>
                ))}
              </select>
            </div>
          )}

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

          {/* Sin locales */}
          {spots.length === 0 && !loading && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No tienes locales registrados</h3>
              <p className="text-gray-600 mb-4">Crea tu primer local para empezar a recibir eventos</p>
              <button
                onClick={() => navigate('/create-spot')}
                className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300"
              >
                Crear Local
              </button>
            </div>
          )}

          {/* Lista de eventos */}
          {!loading && spots.length > 0 && (
            <>
              {events.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">No hay eventos programados</h3>
                  <p className="text-gray-600">Este local aún no tiene eventos programados</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {events.map((event) => (
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
                              Capacidad: {event.capacity} personas
                            </div>
                          )}
                        </div>

                        {event.description && (
                          <p className="text-gray-700 text-sm">{event.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SpotEvents;
