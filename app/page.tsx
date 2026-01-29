'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

interface User {
  id: string;
  email: string;
  tokens: number;
}

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get('/api/auth/me');
        setUser(response.data);
      } catch (err: unknown) {
        // Not logged in, that's fine for home page
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Cargando...</p>
      </div>
    );
  }

  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-black">
        <div className="max-w-md w-full bg-white dark:bg-black p-8 rounded-lg shadow-lg border">
          <h1 className="text-2xl font-bold mb-6 text-center">Bienvenido</h1>
          <div className="mb-6">
            <p className="text-lg">
              Tokens actuales: <span className="font-bold">{user.tokens}</span>
            </p>
          </div>
          <div className="space-y-3">
            <button
              onClick={() => (window.location.href = '/payment')}
              className="w-full py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Comprar Tokens
            </button>
            <button
              onClick={async () => {
                await axios.post('/api/auth/logout');
                window.location.href = '/login';
              }}
              className="w-full py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-black">
      <div className="max-w-md w-full bg-white dark:bg-black p-8 rounded-lg shadow-lg border">
        <h1 className="text-2xl font-bold mb-6 text-center">Demo de Pagos Únicos</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6 text-center">
          Compra tokens con Lemon Squeezy
        </p>
        <button
          onClick={() => (window.location.href = '/login')}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Iniciar Sesión
        </button>
      </div>
    </div>
  );
}
