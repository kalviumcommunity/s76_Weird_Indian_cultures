'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Image from 'next/image';
import { FaUser, FaCamera } from 'react-icons/fa';
import Sidebar from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';

export default function EditProfilePage() {
  const router = useRouter();
  const { user } = useAuth();

  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [profilePicFile, setProfilePicFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const res = await axios.get(`/api/users/${user.id}`, { withCredentials: true });
      setUsername(res.data.username || '');
      setBio(res.data.bio || '');
      setProfilePic(res.data.profilePic || null);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePicFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePic(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('username', username);
      formData.append('bio', bio);
      if (profilePicFile) {
        formData.append('profilePic', profilePicFile);
      }

      await axios.put(`/api/users/${user.id}`, formData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      alert('Profile updated successfully!');
      router.push(`/profile/${user.id}`);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      alert(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Sidebar />
        <div className="flex md:ml-64 items-center justify-center h-screen">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-orange-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Sidebar />

      <div className="md:ml-64">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-8">Edit Profile</h1>

          {/* Profile Picture */}
          <div className="flex items-center gap-6 mb-8 pb-8 border-b border-gray-200">
            <div className="relative">
              {profilePic ? (
                <div className="relative h-20 w-20 rounded-full overflow-hidden border border-gray-300">
                  <Image src={profilePic} alt="Profile" fill className="object-cover" />
                </div>
              ) : (
                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-orange-400 to-pink-400 flex items-center justify-center">
                  <FaUser className="text-white text-3xl" />
                </div>
              )}
              <label
                htmlFor="profile-pic"
                className="absolute bottom-0 right-0 h-6 w-6 bg-blue-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-600"
              >
                <FaCamera className="text-white text-xs" />
              </label>
              <input
                id="profile-pic"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>
            <div>
              <p className="font-semibold text-lg">{username}</p>
              <label
                htmlFor="profile-pic"
                className="text-sm text-blue-500 hover:text-blue-700 cursor-pointer font-semibold"
              >
                Change profile photo
              </label>
            </div>
          </div>

          {/* Username */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400"
              placeholder="Username"
            />
          </div>

          {/* Bio */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              maxLength={150}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400 resize-none"
              placeholder="Tell us about yourself..."
            />
            <p className="text-xs text-gray-500 mt-1">
              {bio.length}/150
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={handleSave}
              disabled={saving || !username.trim()}
              className="flex-1 px-6 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={() => router.back()}
              className="px-6 py-2 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
