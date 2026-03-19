// Configuración de la API del backend
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BACKEND || 'http://localhost:8080',
  ENDPOINTS: {
    // Autenticación
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    
    // Usuarios
    USERS: '/users',
    
    // Eventos
    EVENTS: '/events',
    EVENTS_BY_ORGANIZER: (organizerId) => `/events/organizer/${organizerId}`,
    EVENTS_BY_SPOT: (spotId) => `/events/spot/${spotId}`,
    
    // Locales
    SPOTS: '/spots',
    SPOTS_BY_OWNER: (ownerId) => `/spots/owner/${ownerId}`,
    
    // Tickets
    PURCHASE_TICKETS: '/tickets/purchase',
    TICKETS_BY_USER: (userId) => `/tickets/user/${userId}`,
    TICKETS_BY_EVENT: (eventId) => `/tickets/event/${eventId}`,
    VALIDATE_QR: '/tickets/validate-qr',
  }
};

// Helper function para construir URLs completas
export const buildApiUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// ERROR DE COMPILACIÓN: Syntax error here
syntax_error_api ::: 123;
