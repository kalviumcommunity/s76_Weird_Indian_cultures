'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  FaHome,
  FaSearch,
  FaCompass,
  FaPlay,
  FaComment,
  FaHeart,
  FaPlusSquare,
  FaUser,
  FaBars,
  FaSignOutAlt,
} from 'react-icons/fa';
import { BsBookmark } from 'react-icons/bs';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';
import { API_ROUTES } from '@/lib/constants';

export default function Sidebar() {
  const router = useRouter();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();

  const navigate = (path: string) => {
    router.push(path);
  };

  const handleLogout = async () => {
    try {
      await axios.post(API_ROUTES.LOGOUT);
      logout();
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
      logout();
      router.push('/');
    }
    setShowUserMenu(false);
  };

  const menuItems = [
    { icon: FaHome, label: 'Home', path: '/home' },
    { icon: FaSearch, label: 'Search', path: '/home' },
    { icon: FaCompass, label: 'Explore', path: '/explore' },
    { icon: FaPlay, label: 'Reels', path: '/home' },
    { icon: FaComment, label: 'Messages', path: '/home' },
    { icon: FaHeart, label: 'Notifications', path: '/home' },
    { icon: FaPlusSquare, label: 'Create', path: '/form' },
    { icon: BsBookmark, label: 'Saved', path: '/saved' },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex fixed left-0 top-0 h-screen w-64 border-r border-gray-200 bg-white flex-col z-50">
        {/* Logo */}
        <div className="px-6 py-8 cursor-pointer" onClick={() => navigate('/home')}>
          <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">
            Instagram
          </span>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 px-3">
          {menuItems.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => navigate(item.path)}
              className="flex items-center gap-4 w-full px-3 py-3 rounded-lg text-gray-800 hover:bg-gray-100 transition-colors mb-1"
            >
              <item.icon className="text-2xl" />
              <span className="text-base font-medium">{item.label}</span>
            </button>
          ))}

          {/* Profile */}
          {isAuthenticated ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => navigate(`/profile/${user?.id}`)}
                className="flex items-center gap-4 w-full px-3 py-3 rounded-lg text-gray-800 hover:bg-gray-100 transition-colors"
              >
                <div className="h-7 w-7 rounded-full bg-gradient-to-br from-orange-400 to-pink-400 flex items-center justify-center text-white font-bold text-sm">
                  {user?.username?.charAt(0).toUpperCase() || 'U'}
                </div>
                <span className="text-base font-medium">Profile</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="flex items-center gap-4 w-full px-3 py-3 rounded-lg text-gray-800 hover:bg-gray-100 transition-colors"
            >
              <FaUser className="text-2xl" />
              <span className="text-base font-medium">Login</span>
            </button>
          )}
        </nav>

        {/* More Menu at bottom */}
        {isAuthenticated && (
          <div className="px-3 pb-4">
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-4 w-full px-3 py-3 rounded-lg text-gray-800 hover:bg-gray-100 transition-colors"
              >
                <FaBars className="text-2xl" />
                <span className="text-base font-medium">More</span>
              </button>

              {showUserMenu && (
                <div className="absolute left-3 bottom-16 w-56 rounded-lg border border-gray-200 bg-white shadow-xl">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left text-gray-700 hover:bg-gray-100 rounded-lg"
                  >
                    <FaSignOutAlt />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Mobile Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white md:hidden">
        <div className="flex justify-around py-2">
          <button
            type="button"
            onClick={() => navigate('/home')}
            className="flex flex-col items-center justify-center p-2 text-gray-800 hover:text-gray-900"
          >
            <FaHome className="text-2xl" />
          </button>

          <button
            type="button"
            className="flex flex-col items-center justify-center p-2 text-gray-800 hover:text-gray-900"
          >
            <FaSearch className="text-2xl" />
          </button>

          <button
            type="button"
            onClick={() => navigate('/form')}
            className="flex flex-col items-center justify-center p-2 text-gray-800 hover:text-gray-900"
          >
            <FaPlusSquare className="text-2xl" />
          </button>

          <button
            type="button"
            className="flex flex-col items-center justify-center p-2 text-gray-800 hover:text-gray-900"
          >
            <FaPlay className="text-2xl" />
          </button>

          {isAuthenticated ? (
            <button
              type="button"
              onClick={() => navigate(`/profile/${user?.id}`)}
              className="flex flex-col items-center justify-center p-2"
            >
              <div className="h-7 w-7 rounded-full bg-gradient-to-br from-orange-400 to-pink-400 flex items-center justify-center text-white font-bold text-sm">
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </div>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="flex flex-col items-center justify-center p-2 text-gray-800 hover:text-gray-900"
            >
              <FaUser className="text-2xl" />
            </button>
          )}
        </div>
      </div>
    </>
  );
}
