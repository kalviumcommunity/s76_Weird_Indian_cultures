'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { API_ROUTES } from '@/lib/constants';

export default function SignUpPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(API_ROUTES.signup, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });

      const result = await response.json();
      alert(result.message ?? 'Signup attempt completed.');
      if (response.ok) {
        router.push('/login');
      }
    } catch (error) {
      console.error(error);
      alert('An error occurred during signup.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-r from-[#FF9933] via-white to-[#138808]">
      <div className="w-96 rounded-lg border-4 border-[#FF9933] bg-white p-8 shadow-xl">
        <h2 className="mb-6 text-center text-3xl font-extrabold text-[#138808]">
          Sign Up
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-[#FF9933]"
            >
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 w-full rounded-md border text-black border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-[#FF9933]"
              required
            />
          </div>

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
            {loading ? 'Signing up...' : 'Sign Up'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm">
          Already have an account?{' '}
          <button
            type="button"
            className="font-bold text-[#FF9933] hover:underline"
            onClick={() => router.push('/login')}
          >
            Login here
          </button>
        </p>
      </div>
    </div>
  );
}
