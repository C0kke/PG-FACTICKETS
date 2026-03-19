import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { buildApiUrl } from '../../config/api';

const CreateEvent = () => {
  const navigate = useNavigate();
  const [spots, setSpots] = useState([]);
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    eventName: '',
    organizerId: '',
    spotId: '',
    eventDate: '',
    description: '',
    category: '',
    imageUrl: '',
    ticketPrice: '',
    capacity: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

  // Cargar locales disponibles al montar el componente
  useEffect(() => {
    // Verificar usuario logueado
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      setFormData(prev => ({
        ...prev,
        organizerId: userData.id
      }));
    } else {
      navigate('/login');
      return;
    }
    
    fetchSpots();
  }, []);

  const fetchSpots = async () => {
    try {
      const response = await fetch(buildApiUrl('/spots'));
      if (response.ok) {
        const spotsData = await response.json();
        setSpots(spotsData);
      } else {
        setError('Error al cargar los locales disponibles');
      }
    } catch (err) {
      setError('Error de conexión al cargar locales');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Preparar datos para enviar
    const eventData = {
      ...formData,
      spotId: parseInt(formData.spotId),
      ticketPrice: parseFloat(formData.ticketPrice),
      capacity: formData.capacity ? parseInt(formData.capacity) : null
    };

    try {
      const response = await fetch(buildApiUrl('/events'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData)
      });

      if (response.ok) {
        // Redirigir de vuelta a la página del organizador con mensaje de éxito
        navigate('/event-owner', { state: { message: 'Evento creado exitosamente' } });
      } else {
        const errorData = await response.text();
        setError('Error al crear el evento: ' + errorData);
      }
    } catch (err) {
      setError('Error de conexión: ' + err.message);
    } finally {
      setLoading(false);
    }
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
              <p className="hidden sm:block text-gray-600">Crear Evento</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/event-owner')}
                className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300"
              >
                Volver
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Crear Nuevo Evento
            </h2>
            <p className="text-lg text-gray-600">
              Organiza un evento increíble y vende tickets fácilmente
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-orange-500 to-pink-500 mx-auto rounded-full mt-4"></div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="eventName" className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Evento *
                </label>
                <input
                  type="text"
                  id="eventName"
                  name="eventName"
                  value={formData.eventName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  placeholder="Ej: Concierto de Rock, Festival de Verano..."
                />
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  Categoría *
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                >
                  <option value="">Selecciona una categoría</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="spotId" className="block text-sm font-medium text-gray-700 mb-2">
                  Local *
                </label>
                <select
                  id="spotId"
                  name="spotId"
                  value={formData.spotId}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                >
                  <option value="">Selecciona un local</option>
                  {spots.map((spot) => (
                    <option key={spot.id} value={spot.id}>
                      {spot.name} - {spot.location}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="eventDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha y Hora *
                </label>
                <input
                  type="datetime-local"
                  id="eventDate"
                  name="eventDate"
                  value={formData.eventDate}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Descripción *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows="4"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                placeholder="Describe tu evento, qué pueden esperar los asistentes..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="ticketPrice" className="block text-sm font-medium text-gray-700 mb-2">
                  Precio del Ticket (CLP) *
                </label>
                <input
                  type="number"
                  id="ticketPrice"
                  name="ticketPrice"
                  value={formData.ticketPrice}
                  onChange={handleChange}
                  required
                  min="0"
                  step="100"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  placeholder="25000"
                />
              </div>

              <div>
                <label htmlFor="capacity" className="block text-sm font-medium text-gray-700 mb-2">
                  Capacidad (opcional)
                </label>
                <input
                  type="number"
                  id="capacity"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleChange}
                  min="1"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  placeholder="500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-2">
                URL de la Imagen (opcional)
              </label>
              <input
                type="url"
                id="imageUrl"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                placeholder="https://ejemplo.com/imagen.jpg"
              />
            </div>

            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">Información Importante</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Una vez creado el evento, los clientes podrán comprar tickets</li>
                <li>• El precio se muestra en pesos chilenos (CLP)</li>
                <li>• La capacidad es opcional, pero ayuda a controlar las ventas</li>
                <li>• Asegúrate de que la fecha y hora sean correctas</li>
              </ul>
            </div>

            <div className="flex gap-4 pt-6">
              <button
                type="button"
                onClick={() => navigate('/event-owner')}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Creando...
                  </div>
                ) : (
                  'Crear Evento'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateEvent;
