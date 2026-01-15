'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth'; // Import from Firebase
import { auth } from '@/firebase'; // Import auth instance
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const [formData, setFormData] = useState({ identifier: '', password: '' });
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
      // Direct Firebase Login
      await signInWithEmailAndPassword(auth, formData.identifier, formData.password);

      // AuthContext listener will handle the state update automatically
      setLoading(false);
      router.push('/');
    } catch (err: any) {
      console.error("Login error:", err);
      setLoading(false);
      // Map Firebase error codes to user-friendly messages
      switch (err.code) {
        case 'auth/invalid-credential':
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          setError('Invalid email or password.');
          break;
        case 'auth/too-many-requests':
          setError('Too many failed attempts. Please try again later.');
          break;
        default:
          setError('Failed to login. Please try again.');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-4">
      <div className="bg-gray-800 p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-100">Welcome Back</h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <div>
              <label htmlFor="identifier" className="block text-sm font-medium text-gray-400 mb-2">Email</label>
              <input
                id="identifier" type="email" name="identifier"
                placeholder="Enter your email"
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