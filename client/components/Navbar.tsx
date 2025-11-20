'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  FaArchway,
  FaBell,
  FaBook,
  FaGlobe,
  FaHome,
  FaPlus,
  FaSearch,
  FaUser,
  FaSignInAlt,
  FaUserPlus,
  FaSignOutAlt,
} from 'react-icons/fa';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';
import { API_ROUTES } from '@/lib/constants';

export default function Navbar() {
  const router = useRouter();
  const [searchFocused, setSearchFocused] = useState(false);
  const [showArchaeMenu, setShowArchaeMenu] = useState(false);
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

  return (
    <>
      <div className="fixed top-0 z-50 w-full border-b border-gray-700 bg-black/30 backdrop-blur-md">
        <div className="mx-auto flex h-[70px] max-w-6xl items-center justify-between px-4">
          <div className="flex items-center">
            <FaGlobe className="text-2xl text-orange-500" />
            <span className="ml-2 text-lg font-bold text-white">
              WeirdCultures
            </span>
          </div>

          <div
            className={`relative mx-4 w-full max-w-xs ${
              searchFocused ? 'flex-grow' : ''
            }`}
          >
            <input
              type="text"
              placeholder="Search cultures..."
              className="w-full rounded-full border border-gray-700 bg-black/50 py-2 pl-10 pr-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
            />
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
          </div>

          <div className="hidden items-center space-x-8 md:flex">
            <button
              type="button"
              onClick={() => navigate('/home')}
              className="text-gray-300 hover:text-orange-400"
            >
              <FaHome className="text-xl" />
            </button>

            <div className="group relative">
              <button
                type="button"
                className="flex items-center gap-2 text-gray-300 hover:text-orange-400"
                onClick={() => setShowArchaeMenu((prev) => !prev)}
              >
                <FaArchway className="text-xl" />
                <span className="hidden text-sm lg:block">Archaeological</span>
              </button>

              {showArchaeMenu && (
                <div className="absolute right-0 mt-2 w-64 rounded-md border border-gray-700 bg-black/80 backdrop-blur-md shadow-lg">
                  <div className="border-t border-gray-700 pt-1">
                    <a
                      href="/archaeology/all"
                      className="flex items-center gap-2 px-4 py-2 text-orange-400 hover:bg-gray-800"
                    >
                      <FaBook /> View All Archaeological Findings
                    </a>
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              className="relative text-gray-300 hover:text-orange-400"
            >
              <FaBell className="text-xl" />
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-orange-500 text-xs text-white">
                2
              </span>
            </button>

            {isAuthenticated ? (
              <>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 text-gray-300 hover:text-orange-400"
                  >
                    <FaUser className="text-xl" />
                    <span className="hidden text-sm lg:block">{user?.username}</span>
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 rounded-md border border-gray-700 bg-black/90 backdrop-blur-md shadow-lg">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 px-4 py-2 text-left text-gray-300 hover:bg-gray-800 hover:text-orange-400"
                      >
                        <FaSignOutAlt /> Logout
                      </button>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => navigate('/form')}
                  className="flex h-10 w-24 items-center justify-center space-x-1 rounded-2xl bg-orange-400 text-white transition-colors hover:bg-orange-500"
                >
                  <FaPlus size={12} />
                  <span>Add New</span>
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="flex items-center gap-2 text-gray-300 hover:text-orange-400"
                >
                  <FaSignInAlt className="text-xl" />
                  <span className="hidden text-sm lg:block">Login</span>
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/signup')}
                  className="flex h-10 px-4 items-center justify-center space-x-1 rounded-2xl bg-orange-400 text-white transition-colors hover:bg-orange-500"
                >
                  <FaUserPlus size={14} />
                  <span>Sign Up</span>
                </button>
              </>
            )}
          </div>

          <div className="flex items-center md:hidden">
            {isAuthenticated ? (
              <button
                type="button"
                onClick={() => navigate('/form')}
                className="flex h-10 w-24 items-center justify-center space-x-1 rounded-2xl bg-orange-400 text-white transition-colors hover:bg-orange-500"
              >
                <FaPlus size={12} />
                <span>Add New</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="flex h-10 px-4 items-center justify-center space-x-1 rounded-2xl bg-orange-400 text-white transition-colors hover:bg-orange-500"
              >
                <FaSignInAlt size={14} />
                <span>Login</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 z-50 w-full border-t border-gray-700 bg-black/30 backdrop-blur-md md:hidden">
        <div className="flex justify-around py-3">
          <button
            type="button"
            onClick={() => navigate('/home')}
            className="flex flex-col items-center text-gray-300 hover:text-orange-400"
          >
            <FaHome className="text-xl" />
            <span className="mt-1 text-xs">Home</span>
          </button>

          <button
            type="button"
            className="flex flex-col items-center text-gray-300 hover:text-orange-400"
          >
            <FaSearch className="text-xl" />
            <span className="mt-1 text-xs">Search</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/form')}
            className="flex flex-col items-center text-gray-300 hover:text-orange-400"
          >
            <FaPlus className="text-xl" />
            <span className="mt-1 text-xs">Post</span>
          </button>

          <button
            type="button"
            onClick={() => setShowArchaeMenu((prev) => !prev)}
            className="flex flex-col items-center text-gray-300 hover:text-orange-400"
          >
            <FaArchway className="text-xl" />
            <span className="mt-1 text-xs">Archaeology</span>
          </button>

          <button
            type="button"
            className="flex flex-col items-center text-gray-300 hover:text-orange-400"
          >
            <FaUser className="text-xl" />
            <span className="mt-1 text-xs">Profile</span>
          </button>
        </div>
      </div>
    </>
  );
}
