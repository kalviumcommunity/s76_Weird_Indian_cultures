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
import Sidebar from '@/components/Navbar';
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
          ? API_ROUTES.postsByUser(userId)
          : API_ROUTES.fetchPosts;
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
      await axios.delete(API_ROUTES.deletePost(id), { withCredentials: true });
      setCultures((prev) => prev.filter((culture) => culture.id !== id));
      alert('Entry deleted successfully!');
    } catch {
      // no-op
    }
  };

  const filteredCultures = useMemo(() => {
    if (contentType === 'videos') {
      return cultures.filter((item) => Boolean(item.videoUrl || item.VideoURL));
    }
    if (contentType === 'images') {
      return cultures.filter(
        (item) => Boolean(item.imageUrl || item.ImageURL) && !(item.videoUrl || item.VideoURL)
      );
    }
    return cultures;
  }, [contentType, cultures]);

  return (
    <div className="min-h-screen bg-white">
      <Sidebar />

      <div className="flex md:ml-64">
        {/* Main Feed - Center */}
        <div className="flex-1 max-w-2xl mx-auto px-4 py-6 pb-20 md:pb-6">
          {/* Stories Section */}
          <div className="mb-6 overflow-x-auto">
            <div className="flex gap-4 pb-4">
              {users.slice(0, 10).map((user) => (
                <div
                  key={user.id}
                  className="flex flex-col items-center cursor-pointer"
                  onClick={() => handleUserSelect(user.id)}
                >
                  <div className="h-16 w-16 rounded-full bg-gradient-to-br from-orange-500 to-pink-500 p-0.5">
                    <div className="flex h-full w-full items-center justify-center rounded-full border-2 border-white bg-gray-300 text-gray-700 text-lg font-bold">
                      {user.username?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  </div>
                  <span className="mt-1 text-xs text-gray-800 truncate max-w-[64px]">
                    {user.username}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Posts Feed */}
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-orange-500" />
            </div>
          ) : filteredCultures.length > 0 ? (
            <div className="space-y-6">
              {filteredCultures.map((culture) => (
                <CulturalEntity
                  key={culture.id}
                  {...culture}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-gray-300 bg-white p-6 text-center text-gray-500">
              No posts found.
            </div>
          )}
        </div>

        {/* Right Sidebar - Suggestions */}
        <div className="hidden xl:block w-80 px-4 py-6">
          <div className="fixed w-72">
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-500 mb-3">
                Suggestions For You
              </h3>
              <div className="space-y-3">
                {users.slice(0, 5).map((user) => (
                  <div key={user.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-orange-400 to-pink-400 flex items-center justify-center text-white font-bold">
                        {user.username?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">
                          {user.username}
                        </p>
                        <p className="text-xs text-gray-500">Bio here ...</p>
                      </div>
                    </div>
                    <button className="text-xs font-semibold text-blue-500 hover:text-blue-700">
                      Follow
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
