'use client'; // บอกว่าเป็น Client Component

import { useState } from 'react';
import Link from 'next/link'; // ใช้ Link จาก Next.js
import { useRouter } from 'next/navigation'; // ใช้ Router จาก Next.js
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';

const API_ENDPOINT = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337';

export default function LoginPage() {
  const { login } = useAuth();
  const [formData, setFormData] = useState({ identifier: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter(); // Hook สำหรับการ redirect

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(`${API_ENDPOINT}/api/auth/local`, {
        identifier: formData.identifier,
        password: formData.password,
      });

      login(response.data.jwt, response.data.user);

      setLoading(false);
      router.push('/'); // Redirect ไปหน้าแรก
    } catch (err) {
      setLoading(false);
      setError('Invalid email or password.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-4">
      <div className="bg-gray-800 p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-100">Welcome Back</h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <div>
              <label htmlFor="identifier" className="block text-sm font-medium text-gray-400 mb-2">Email or Username</label>
              <input 
                id="identifier" type="text" name="identifier" 
                placeholder="Enter your email or username" 
                onChange={handleChange} required 
                className="w-full p-3 bg-gray-700 text-gray-100 rounded-md border border-gray-600"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-400 mb-2">Password</label>
              <input 
                id="password" type="password" name="password" 
                placeholder="Enter your password" 
                onChange={handleChange} required 
                className="w-full p-3 bg-gray-700 text-gray-100 rounded-md border border-gray-600"
              />
            </div>
          </div>
          <div className="text-right mt-4">
            <Link href="/forgot-password" className="text-sm text-blue-400 hover:underline">
              Forgot Password?
            </Link>
          </div>
          <button type="submit" disabled={loading}
            className="w-full mt-8 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-md">
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        {error && <p className="text-red-400 mt-4 text-center">{error}</p>}
        <p className="text-center text-gray-400 mt-6">
          Don't have an account?{' '}
          <Link href="/register" className="text-blue-400 hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  );
};