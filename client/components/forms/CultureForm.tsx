'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { API_ROUTES, UserSummary } from '@/lib/constants';

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
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [form, setForm] = useState<CultureFormState>(defaultFormState);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedUser =
      typeof window !== 'undefined' ? localStorage.getItem('userId') : null;
    if (storedUser) {
      setSelectedUser(storedUser);
    }
  }, []);

  useEffect(() => {
    axios
      .get<UserSummary[]>(API_ROUTES.users)
      .then((res) => setUsers(res.data ?? []))
      .catch(() => setUsers([]));
  }, []);

  const handleUserSelect = (value: string) => {
    setSelectedUser(value);
    if (typeof window !== 'undefined') {
      localStorage.setItem('userId', value);
    }
  };

  const handleInput = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, files } = event.target as HTMLInputElement;
    setForm((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedUser) {
      alert('Please select a user.');
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
    formData.append('created_by', String(Number(selectedUser)));
    if (form.image) formData.append('image', form.image);
    if (form.video) formData.append('video', form.video);

    setLoading(true);
    try {
      await axios.post(API_ROUTES.createItem, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
      });
      alert('Item created successfully!');
      setForm(defaultFormState);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? 'Error creating item. Check your input and try again.';
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto my-10 max-w-xl rounded-2xl border border-gray-200 bg-[#f6f6fa] p-8 shadow-2xl">
      <h2 className="mb-6 text-center text-3xl font-extrabold text-[#138808]">
        {itemId ? 'Edit Cultural Item' : 'Create Cultural Item'}
      </h2>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4"
        encType="multipart/form-data"
      >
        <label className="text-sm font-medium text-[#FF9933]">
          User
          <select
            value={selectedUser}
            onChange={(e) => handleUserSelect(e.target.value)}
            required
            className="mt-1 w-full rounded-lg border border-gray-300 p-2"
          >
            <option value="">Select User</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.username}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm font-medium text-[#FF9933]">
          Culture Name
          <input
            name="CultureName"
            value={form.CultureName}
            onChange={handleInput}
            placeholder="Culture Name"
            minLength={3}
            maxLength={100}
            required
            autoComplete="off"
            className="mt-1 w-full rounded-lg border border-gray-300 p-2"
          />
        </label>

        <label className="text-sm font-medium text-[#FF9933]">
          Culture Description
          <textarea
            name="CultureDescription"
            value={form.CultureDescription}
            onChange={handleInput}
            placeholder="Culture Description"
            minLength={10}
            maxLength={500}
            required
            rows={3}
            className="mt-1 w-full rounded-lg border border-gray-300 p-2"
          />
        </label>

        <label className="text-sm font-medium text-[#FF9933]">
          Region
          <input
            name="Region"
            value={form.Region}
            onChange={handleInput}
            placeholder="Region"
            minLength={3}
            maxLength={100}
            required
            autoComplete="off"
            className="mt-1 w-full rounded-lg border border-gray-300 p-2"
          />
        </label>

        <label className="text-sm font-medium text-[#FF9933]">
          Significance
          <textarea
            name="Significance"
            value={form.Significance}
            onChange={handleInput}
            placeholder="Significance"
            minLength={10}
            maxLength={500}
            required
            rows={3}
            className="mt-1 w-full rounded-lg border border-gray-300 p-2"
          />
        </label>

        <label className="text-sm font-medium text-[#FF9933]">
          Image
          <input
            type="file"
            accept="image/*"
            name="image"
            onChange={handleInput}
            className="mt-1 w-full rounded-lg border border-dashed border-gray-300 p-2"
          />
        </label>

        <label className="text-sm font-medium text-[#FF9933]">
          Video
          <input
            type="file"
            accept="video/*"
            name="video"
            onChange={handleInput}
            className="mt-1 w-full rounded-lg border border-dashed border-gray-300 p-2"
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="mt-4 rounded-lg bg-[#138808] py-3 text-lg font-semibold text-white transition hover:bg-[#0e6a06] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? 'Submitting...' : itemId ? 'Save Changes' : 'Create'}
        </button>
      </form>
    </div>
  );
}
