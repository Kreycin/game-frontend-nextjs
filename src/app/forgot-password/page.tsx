'use client';

import { useState } from 'react';
import axios from 'axios';

const API_ENDPOINT = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      await axios.post(`${API_ENDPOINT}/api/auth/forgot-password`, { email });
      setMessage('If an account with that email exists, a reset link has been sent.');
    } catch (error) {
      // We always show a success message for security reasons
      setMessage('If an account with that email exists, a reset link has been sent.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-4">
      <div className="bg-gray-800 p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-100">Forgot Password</h2>
        {message ? (
          <p className="text-center text-green-400">{message}</p>
        ) : (
          <form onSubmit={handleSubmit}>
            <p className="text-center text-gray-400 mb-6">Enter your email address and we will send you a link to reset your password.</p>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-2">Email</label>
              <input
                id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                className="w-full p-3 bg-gray-700 text-gray-100 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button type="submit" disabled={loading}
              className="w-full mt-8 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-md transition duration-300 disabled:bg-gray-500"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};