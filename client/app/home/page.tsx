'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import {
  FaArchway,
  FaImage,
  FaUser,
  FaVideo,
} from 'react-icons/fa';
import Navbar from '@/components/Navbar';
import CulturalEntity from '@/components/CulturalEntity';
import {
  API_ROUTES,
  CultureItem,
  UserSummary,
} from '@/lib/constants';

type ContentFilter = 'all' | 'videos' | 'images';

export default function HomePage() {
  const router = useRouter();
  const [cultures, setCultures] = useState<CultureItem[]>([]);
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [loading, setLoading] = useState(true);
  const [contentType, setContentType] = useState<ContentFilter>('all');

  useEffect(() => {
    fetchUsers();
    fetchCultures();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get<UserSummary[]>(API_ROUTES.users);
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch {
      setUsers([]);
    }
  };

  const fetchCultures = async (userId?: string) => {
    setLoading(true);
    try {
      const url =
        userId && userId.length > 0
          ? API_ROUTES.itemsByUser(userId)
          : API_ROUTES.fetchItems;
      const res = await axios.get<CultureItem[]>(url);
      setCultures(Array.isArray(res.data) ? res.data : []);
    } catch {
      setCultures([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUserSelect = (userId: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('userId', userId);
    }
    setSelectedUser(userId);
    fetchCultures(userId);
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(API_ROUTES.deleteItem(id), { withCredentials: true });
      setCultures((prev) => prev.filter((culture) => culture.id !== id));
      alert('Entry deleted successfully!');
    } catch {
      // no-op
    }
  };

  const filteredCultures = useMemo(() => {
    if (contentType === 'videos') {
      return cultures.filter((item) => Boolean(item.VideoURL));
    }
    if (contentType === 'images') {
      return cultures.filter(
        (item) => Boolean(item.ImageURL) && !item.VideoURL
      );
    }
    return cultures;
  }, [contentType, cultures]);

  return (
    <div
      className="relative min-h-screen bg-cover bg-fixed"
      style={{ backgroundImage: "url('/images/indianbg.jpg')" }}
    >
      <div
        className="absolute inset-0"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
      />
      <Navbar />

      <div className="relative z-10 mx-auto max-w-6xl px-4 pt-24">
        <div className="mb-6 rounded-lg border border-gray-700 bg-black/30 backdrop-blur-md shadow-lg">
          <div className="flex border-b border-gray-700">
            <button
              type="button"
              className={`flex items-center gap-2 px-6 py-3 font-medium ${
                contentType === 'all'
                  ? 'border-b-2 border-orange-400 text-orange-400'
                  : 'text-gray-300 hover:text-orange-400'
              }`}
              onClick={() => setContentType('all')}
            >
              <FaArchway /> All
            </button>
            <button
              type="button"
              className={`flex items-center gap-2 px-6 py-3 font-medium ${
                contentType === 'videos'
                  ? 'border-b-2 border-orange-400 text-orange-400'
                  : 'text-gray-300 hover:text-orange-400'
              }`}
              onClick={() => setContentType('videos')}
            >
              <FaVideo /> Videos
            </button>
            <button
              type="button"
              className={`flex items-center gap-2 px-6 py-3 font-medium ${
                contentType === 'images'
                  ? 'border-b-2 border-orange-400 text-orange-400'
                  : 'text-gray-300 hover:text-orange-400'
              }`}
              onClick={() => setContentType('images')}
            >
              <FaImage /> Images
            </button>
          </div>
        </div>

        <div className="mb-6 rounded-lg border border-gray-700 bg-black/30 backdrop-blur-md shadow-lg">
          <div className="flex flex-row space-x-4 overflow-x-auto p-4">
            <div
              role="button"
              tabIndex={0}
              className={`flex cursor-pointer flex-col items-center ${
                selectedUser === ''
                  ? 'opacity-100'
                  : 'opacity-60 hover:opacity-100'
              }`}
              onClick={() => handleUserSelect('')}
              onKeyDown={(e) => e.key === 'Enter' && handleUserSelect('')}
            >
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-orange-500 to-pink-500 p-0.5">
                <div className="flex h-full w-full items-center justify-center rounded-full border-2 border-black bg-gray-800 text-white">
                  <FaUser size={24} />
                </div>
              </div>
              <span className="mt-1 text-xs text-gray-300">All Users</span>
            </div>

            {users.map((user) => (
              <div
                key={user.id}
                role="button"
                tabIndex={0}
                className={`flex cursor-pointer flex-col items-center ${
                  selectedUser === user.id
                    ? 'opacity-100'
                    : 'opacity-60 hover:opacity-100'
                }`}
                onClick={() => handleUserSelect(user.id)}
                onKeyDown={(e) =>
                  e.key === 'Enter' && handleUserSelect(user.id)
                }
              >
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-orange-500 to-pink-500 p-0.5">
                  <div className="flex h-full w-full items-center justify-center rounded-full border-2 border-black bg-gray-800 text-white text-lg">
                    {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
                  </div>
                </div>
                <span className="mt-1 text-xs text-gray-300">
                  {user.username}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-orange-500" />
            </div>
          ) : filteredCultures.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {filteredCultures.map((culture) => (
                <CulturalEntity
                  key={culture.id}
                  {...culture}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          ) : (
            <div className="col-span-full rounded-lg border border-gray-700 bg-black/30 p-6 text-center text-white backdrop-blur-md">
              No cultural posts found.
            </div>
          )}
        </div>
      </div>

      <div className="fixed bottom-8 right-8">
        <button
          type="button"
          onClick={() => router.push('/form')}
          className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-500 text-white shadow-lg transition-transform hover:scale-110 hover:bg-orange-600"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
