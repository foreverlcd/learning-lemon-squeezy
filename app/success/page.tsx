'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

interface User {
  id: string;
  email: string;
  tokens: number;
}

export default function SuccessPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get('/api/auth/me');
        setUser(response.data);
      } catch (err: unknown) {
        if (axios.isAxiosError(err) && err.response?.status === 401) {
          window.location.href = '/login';
        } else {
          setError('Failed to load user data');
        }
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

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>No autenticado</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-black">
      <div className="max-w-md w-full bg-white dark:bg-black p-8 rounded-lg shadow-lg border">
        <h1 className="text-2xl font-bold mb-6 text-center text-green-600">
          ¡Pago Exitoso!
        </h1>
        <div className="mb-6">
          <p className="text-lg">
            Tokens actuales: <span className="font-bold">{user.tokens}</span>
          </p>
        </div>
        <div className="mb-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Tus tokens han sido acreditados correctamente.
          </p>
        </div>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <button
          onClick={() => (window.location.href = '/payment')}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Volver a Comprar
        </button>
      </div>
    </div>
  );
}
