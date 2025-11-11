'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { API_ROUTES } from '@/lib/constants';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(API_ROUTES.login, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();
      alert(result.message ?? 'Login attempt completed.');

      if (response.ok) {
        router.push('/home');
      }
    } catch (error) {
      console.error(error);
      alert('An error occurred during login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-r from-[#FF9933] via-white to-[#138808]">
      <div className="w-96 rounded-lg border-4 border-[#FF9933] bg-white p-8 shadow-xl">
        <h2 className="mb-6 text-center text-3xl font-extrabold text-[#138808]">
          Login
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-[#FF9933]"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-[#FF9933]"
              required
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-[#FF9933]"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-[#FF9933]"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-4 w-full rounded-md bg-[#138808] py-2 px-4 font-semibold text-white transition-all duration-300 hover:bg-[#0e6a06] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm">
          Don&apos;t have an account?{' '}
          <button
            type="button"
            className="font-bold text-[#FF9933] hover:underline"
            onClick={() => router.push('/signup')}
          >
            Create new account
          </button>
        </p>
      </div>
    </div>
  );
}
