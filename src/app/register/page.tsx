'use client'; // บอกว่าเป็น Client Component

import { useState } from 'react';
import Link from 'next/link'; // ใช้ Link จาก Next.js
import { useRouter } from 'next/navigation'; // ใช้ Router จาก Next.js
import axios from 'axios';

const API_ENDPOINT = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Step 1: Register the new user
      await axios.post(`${API_ENDPOINT}/api/auth/local/register`, {
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });

      // Step 2: Log the new user in to get a JWT
      const loginResponse = await axios.post(`${API_ENDPOINT}/api/auth/local`, {
        identifier: formData.email,
        password: formData.password,
      });

      const jwt = loginResponse.data.jwt;
      localStorage.setItem('jwt', jwt);

      // Note: Migration logic for guest data can be added here if needed

      setLoading(false);
      // Reload the page to update auth state globally and redirect
      window.location.href = '/'; 
    } catch (err: any) {
      setLoading(false);
      setError(err.response?.data?.error?.message || 'An unexpected error occurred.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-4">
      <div className="bg-gray-800 p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-100">Create an Account</h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-400 mb-2">Username</label>
              <input 
                id="username"
                type="text" 
                name="username" 
                placeholder="Enter your username" 
                onChange={handleChange} 
                required 
                className="w-full p-3 bg-gray-700 text-gray-100 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-2">Email</label>
              <input 
                id="email"
                type="email" 
                name="email" 
                placeholder="Enter your email" 
                onChange={handleChange} 
                required 
                className="w-full p-3 bg-gray-700 text-gray-100 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-400 mb-2">Password</label>
              <input 
                id="password"
                type="password" 
                name="password" 
                placeholder="Enter your password" 
                onChange={handleChange} 
                required 
                className="w-full p-3 bg-gray-700 text-gray-100 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full mt-8 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-md transition duration-300 disabled:bg-gray-500"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
        {error && <p className="text-red-400 mt-4 text-center">{error}</p>}
        <p className="text-center text-gray-400 mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-blue-400 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};