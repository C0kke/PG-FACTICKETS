import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// Auth pages
import Welcome from './pages/auth/Welcome.jsx';
import Login from './pages/auth/login.jsx';
// Shared pages
import Test from './pages/shared/Test.jsx';
import TestNotifications from './pages/shared/TestNotifications.jsx';
// Client pages
import ClientPage from './pages/client/ClientPage.jsx';
// import AvailableEvents from './pages/client/AvailableEvents.jsx';
import MyTickets from './pages/client/MyTickets.jsx';
import PaymentConfirmation from './pages/client/PaymentConfirmation.jsx';
import PaymentSuccess from './pages/client/PaymentSuccess.jsx';
import PaymentFailed from './pages/client/PaymentFailed.jsx';
// Organizer pages
import EventOwner from './pages/organizer/eventOwner.jsx';
import CreateEvent from './pages/organizer/CreateEvent.jsx';
import ManageEvents from './pages/organizer/ManageEvents.jsx';
import QRValidator from './pages/organizer/QRValidator.jsx';
// Owner pages
import SpotOwnerPage from './pages/owner/spotOwnerPage.jsx';
import CreateSpot from './pages/owner/CreateSpot.jsx';
import SpotEvents from './pages/owner/SpotEvents.jsx';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Ruta por defecto - muestra página de bienvenida */}
          <Route path="/" element={<Welcome />} />
          
          {/* Página de bienvenida */}
          <Route path="/welcome" element={<Welcome />} />
          
          {/* Ruta de login/register */}
          <Route path="/login" element={<Login />} />
          
          {/* Páginas específicas por tipo de usuario */}
          <Route path="/client" element={<ClientPage />} />
          <Route path="/event-owner" element={<EventOwner />} />
          <Route path="/spot-owner" element={<SpotOwnerPage />} />
          
          {/* Funcionalidades del cliente */}
          <Route path="/available-events" element={<AvailableEvents />} />
          <Route path="/my-tickets" element={<MyTickets />} />
          
          {/* Página de confirmación de pago de MercadoPago */}
          <Route path="/payment-confirmation" element={<PaymentConfirmation />} />
          
          {/* Páginas de resultado de pago */}
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/payment-failed" element={<PaymentFailed />} />
          
          {/* Funcionalidades del propietario */}
          <Route path="/create-spot" element={<CreateSpot />} />
          <Route path="/spot-events" element={<SpotEvents />} />
          
          {/* Funcionalidades del organizador */}
          <Route path="/create-event" element={<CreateEvent />} />
          <Route path="/manage-events" element={<ManageEvents />} />
          <Route path="/qr-validator" element={<QRValidator />} />
          
          {/* Página de pruebas de API */}
          <Route path="/test" element={<Test />} />
          
          {/* Página de pruebas de notificaciones */}
          <Route path="/test-notifications" element={<TestNotifications />} />
          
          {/* Ruta para páginas no encontradas */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
