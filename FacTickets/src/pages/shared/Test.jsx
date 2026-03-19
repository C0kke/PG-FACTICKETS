import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_CONFIG } from '../../config/api';

const Test = () => {
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [editingUser, setEditingUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const API_BASE_URL = API_CONFIG.BASE_URL;

  // Cargar todos los usuarios al iniciar
  useEffect(() => {
    fetchUsers();
  }, []);

  // GET - Obtener todos los usuarios
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/users`);
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
        setMessage('Usuarios cargados exitosamente');
      } else {
        setMessage('Error al cargar usuarios');
      }
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // POST - Crear nuevo usuario
  const createUser = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setMessage('Usuario creado exitosamente');
        setFormData({ name: '', email: '', password: '' });
        fetchUsers(); // Recargar la lista
      } else {
        setMessage('Error al crear usuario');
      }
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // PUT - Actualizar usuario
  const updateUser = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/users/${editingUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setMessage('Usuario actualizado exitosamente');
        setFormData({ name: '', email: '', password: '' });
        setEditingUser(null);
        fetchUsers(); // Recargar la lista
      } else {
        setMessage('Error al actualizar usuario');
      }
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // DELETE - Eliminar usuario
  const deleteUser = async (userId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setMessage('Usuario eliminado exitosamente');
        fetchUsers(); // Recargar la lista
      } else {
        setMessage('Error al eliminar usuario');
      }
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // GET - Obtener usuario por ID
  const getUserById = async (userId) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/users/${userId}`);
      if (response.ok) {
        const user = await response.json();
        setMessage(`Usuario encontrado: ${user.name}`);
        console.log('Usuario:', user);
      } else {
        setMessage('Usuario no encontrado');
      }
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const startEditing = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: ''
    });
  };

  const cancelEditing = () => {
    setEditingUser(null);
    setFormData({ name: '', email: '', password: '' });
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-800">Pruebas de API</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/login')}
                className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
              >
                Login
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto p-8">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Prueba de Endpoints - Sistema de Usuarios
        </h1>

        {/* Mensaje de estado */}
        {message && (
          <div className="mb-4 p-4 bg-blue-100 border border-blue-400 text-blue-700 rounded">
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Formulario para crear/editar usuario */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">
              {editingUser ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
            </h2>
            
            <form onSubmit={editingUser ? updateUser : createUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contraseña
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex space-x-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:opacity-50"
                >
                  {loading ? 'Procesando...' : (editingUser ? 'Actualizar' : 'Crear')}
                </button>
                
                {editingUser && (
                  <button
                    type="button"
                    onClick={cancelEditing}
                    className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Lista de usuarios */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Lista de Usuarios</h2>
              <button
                onClick={fetchUsers}
                disabled={loading}
                className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 disabled:opacity-50"
              >
                Recargar
              </button>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {users.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No hay usuarios registrados</p>
              ) : (
                users.map((user) => (
                  <div key={user.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-800">{user.name}</h3>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        <p className="text-xs text-gray-500">ID: {user.id}</p>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => getUserById(user.id)}
                          className="text-blue-500 hover:text-blue-700 text-sm"
                        >
                          Ver
                        </button>
                        <button
                          onClick={() => startEditing(user)}
                          className="text-yellow-500 hover:text-yellow-700 text-sm"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => deleteUser(user.id)}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Panel de pruebas adicionales */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Pruebas de Endpoints</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <button
              onClick={fetchUsers}
              className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
            >
              GET /users
            </button>
            <button
              onClick={() => setMessage('Usa el formulario para probar POST')}
              className="bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600"
            >
              POST /users
            </button>
            <button
              onClick={() => setMessage('Haz clic en "Ver" en cualquier usuario para probar GET /users/{id}')}
              className="bg-yellow-500 text-white py-2 px-4 rounded-md hover:bg-yellow-600"
            >
              GET /users/&#123;id&#125;
            </button>
            <button
              onClick={() => setMessage('Haz clic en "Editar" para probar PUT')}
              className="bg-orange-500 text-white py-2 px-4 rounded-md hover:bg-orange-600"
            >
              PUT /users/&#123;id&#125;
            </button>
            <button
              onClick={() => setMessage('Haz clic en "Eliminar" para probar DELETE')}
              className="bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600"
            >
              DELETE /users/&#123;id&#125;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Test;
