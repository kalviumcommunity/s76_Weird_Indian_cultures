'use client';

import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import { API_ROUTES } from '@/lib/constants';
import { useRouter } from 'next/navigation';

interface CultureFormProps {
  itemId?: string;
}

interface CultureFormState {
  CultureName: string;
  CultureDescription: string;
  Region: string;
  Significance: string;
  image: File | null;
  video: File | null;
}

const defaultFormState: CultureFormState = {
  CultureName: '',
  CultureDescription: '',
  Region: '',
  Significance: '',
  image: null,
  video: null,
};

export default function CultureForm({ itemId }: CultureFormProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState<CultureFormState>(defaultFormState);
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);

  // ✅ Handle text inputs
  const handleInput = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ✅ Handle file inputs with preview
  const handleFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = event.target;
    if (files && files.length > 0) {
      const file = files[0];
      setForm((prev) => ({
        ...prev,
        [name]: file,
      }));

      // Create preview
      const previewURL = URL.createObjectURL(file);
      if (name === 'image') {
        setImagePreview(previewURL);
      } else if (name === 'video') {
        setVideoPreview(previewURL);
      }
    }
  };

  // ✅ Remove media
  const removeMedia = (type: 'image' | 'video') => {
    setForm((prev) => ({
      ...prev,
      [type]: null,
    }));
    if (type === 'image') setImagePreview(null);
    if (type === 'video') setVideoPreview(null);
  };

  // ✅ Form submit
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!user) {
      alert('You must be logged in to create a post.');
      return;
    }

    if (
      form.CultureName.length < 3 ||
      form.CultureDescription.length < 10 ||
      form.Region.length < 3 ||
      form.Significance.length < 10
    ) {
      alert('Please fill all fields with valid lengths.');
      return;
    }

    const formData = new FormData();
    formData.append('CultureName', form.CultureName);
    formData.append('CultureDescription', form.CultureDescription);
    formData.append('Region', form.Region);
    formData.append('Significance', form.Significance);
    formData.append('created_by', user.id);
    if (form.image) formData.append('image', form.image);
    if (form.video) formData.append('video', form.video);

    setLoading(true);
    try {
      if (itemId) {
        // ✅ Editing mode
        await axios.put(`${API_ROUTES.updateItem}/${itemId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          withCredentials: true,
        });
        alert('Post updated successfully!');
      } else {
        // ✅ Create mode
        await axios.post(API_ROUTES.createItem, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          withCredentials: true,
        });
        alert('Post created successfully!');
      }

      // ✅ Reset form
      setForm(defaultFormState);
      setImagePreview(null);
      setVideoPreview(null);
      router.push('/home');
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? 'Error submitting post. Please try again.';
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto my-10 max-w-2xl rounded-xl bg-white p-6 shadow-lg">
      <div className="mb-6 flex items-center gap-3 border-b border-gray-200 pb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500 text-white font-bold">
          {user?.username?.charAt(0).toUpperCase() || 'U'}
        </div>
        <div>
          <p className="font-semibold text-gray-800">{user?.username}</p>
          <p className="text-sm text-gray-500">
            {itemId ? 'Edit your post' : 'Share a cultural discovery'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Culture Name */}
        <input
          name="CultureName"
          value={form.CultureName}
          onChange={handleInput}
          placeholder="What's the name of this culture or tradition?"
          minLength={3}
          maxLength={100}
          required
          autoComplete="off"
          className="w-full rounded-lg border border-gray-300 p-3 text-lg font-semibold text-black focus:outline-none focus:ring-2 focus:ring-orange-500"
        />

        {/* Description */}
        <textarea
          name="CultureDescription"
          value={form.CultureDescription}
          onChange={handleInput}
          placeholder="Describe this culture... What makes it unique?"
          minLength={10}
          maxLength={500}
          required
          rows={4}
          className="w-full resize-none rounded-lg border border-gray-300 p-3 text-black focus:outline-none focus:ring-2 focus:ring-orange-500"
        />

        {/* Region */}
        <input
          name="Region"
          value={form.Region}
          onChange={handleInput}
          placeholder="Region or location (e.g., Kerala, Rajasthan)"
          minLength={3}
          maxLength={100}
          required
          autoComplete="off"
          className="w-full rounded-lg border border-gray-300 p-3 text-black focus:outline-none focus:ring-2 focus:ring-orange-500"
        />

        {/* Significance */}
        <textarea
          name="Significance"
          value={form.Significance}
          onChange={handleInput}
          placeholder="Why is this culturally significant?"
          minLength={10}
          maxLength={500}
          required
          rows={3}
          className="w-full resize-none rounded-lg border border-gray-300 p-3 text-black focus:outline-none focus:ring-2 focus:ring-orange-500"
        />

        {/* Media Previews */}
        {imagePreview && (
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-full rounded-lg object-cover max-h-96"
            />
            <button
              type="button"
              onClick={() => removeMedia('image')}
              className="absolute top-2 right-2 rounded-full bg-black/70 p-2 text-white hover:bg-black"
            >
              ✕
            </button>
          </div>
        )}

        {videoPreview && (
          <div className="relative">
            <video
              src={videoPreview}
              controls
              className="w-full rounded-lg max-h-96"
            />
            <button
              type="button"
              onClick={() => removeMedia('video')}
              className="absolute top-2 right-2 rounded-full bg-black/70 p-2 text-white hover:bg-black"
            >
              ✕
            </button>
          </div>
        )}

        {/* Media Upload Buttons */}
        <div className="flex gap-3 border-t border-gray-200 pt-4">
          <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-50">
            <span className="text-2xl">📷</span>
            <span className="text-sm font-medium">Photo</span>
            <input
              type="file"
              accept="image/*"
              name="image"
              onChange={handleFileInput}
              className="hidden"
            />
          </label>

          <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-50">
            <span className="text-2xl">🎥</span>
            <span className="text-sm font-medium">Video</span>
            <input
              type="file"
              accept="video/*"
              name="video"
              onChange={handleFileInput}
              className="hidden"
            />
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="mt-2 rounded-lg bg-orange-500 py-3 text-lg font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? 'Posting...' : itemId ? 'Update Post' : 'Share Post'}
        </button>
      </form>
    </div>
  );
}
