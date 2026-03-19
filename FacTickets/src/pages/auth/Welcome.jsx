import React from 'react';
import { useNavigate } from 'react-router-dom';

const Welcome = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center px-4">
      <div className="max-w-4xl mx-auto text-center">
        {/* Logo/Título Principal */}
        <div className="mb-12">
          <h1 className="text-6xl md:text-7xl font-bold text-gray-900 mb-6">
            <span className="text-orange-500">Fac</span>
            <span className="text-pink-500">Tickets</span>
          </h1>
          <div className="w-32 h-1 bg-gradient-to-r from-orange-500 via-pink-500 to-red-500 mx-auto rounded-full"></div>
        </div>

        {/* Descripción Principal */}
        <div className="mb-12">
          <h2 className="text-3xl md:text-4xl font-semibold text-gray-800 mb-6">
            La plataforma que conecta eventos con lugares únicos
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Descubre espacios perfectos para tus eventos o convierte tu local en el escenario 
            de experiencias inolvidables. FacTickets hace que organizar y encontrar eventos 
            sea más fácil que nunca.
          </p>
        </div>

        {/* Características Principales */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div className="w-16 h-16 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Encuentra Eventos</h3>
            <p className="text-gray-600">
              Explora una amplia variedad de eventos de todo tipo y encuentra el lugar perfecto para ti.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div className="w-16 h-16 bg-gradient-to-r from-pink-400 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Organiza Eventos</h3>
            <p className="text-gray-600">
              Crea y gestiona eventos increíbles con herramientas intuitivas y fáciles de usar.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div className="w-16 h-16 bg-gradient-to-r from-red-400 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Conecta & Crece & Disfruta</h3>
            <p className="text-gray-600">
              Une a organizadores de eventos con propietarios de espacios en una red colaborativa para el éxito de todos.
            </p>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mb-8">
          <button
            onClick={handleGetStarted}
            className="bg-gradient-to-r from-orange-500 via-pink-500 to-red-500 hover:from-orange-600 hover:via-pink-600 hover:to-red-600 text-white font-bold py-4 px-12 rounded-full text-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            Comenzar Ahora
          </button>
        </div>

        {/* Footer Info */}
        
      </div>
    </div>
  );
};

export default Welcome;
