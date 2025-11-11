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
  const [formKey, setFormKey] = useState(Date.now()); // used to reset file inputs

  // ✅ Fetch users and restore selected user
  useEffect(() => {
    axios
      .get<UserSummary[]>(API_ROUTES.users)
      .then((res) => {
        const data = res.data ?? [];
        setUsers(data);

        const storedUser =
          typeof window !== 'undefined' ? localStorage.getItem('userId') : null;

        if (storedUser && data.find((u) => u.id === storedUser)) {
          setSelectedUser(storedUser);
        }
      })
      .catch(() => setUsers([]));
  }, []);

  // ✅ Handle user selection
  const handleUserSelect = (value: string) => {
    setSelectedUser(value);
    if (typeof window !== 'undefined') {
      localStorage.setItem('userId', value);
    }
  };

  // ✅ Handle text & file inputs safely
  const handleInput = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const target = event.target as HTMLInputElement;
    const { name, value, files } = target;
    setForm((prev) => ({
      ...prev,
      [name]: files && files.length > 0 ? files[0] : value,
    }));
  };

  // ✅ Form submit
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
    formData.append('created_by', selectedUser);
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
        alert('Item updated successfully!');
      } else {
        // ✅ Create mode
        await axios.post(API_ROUTES.createItem, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          withCredentials: true,
        });
        alert('Item created successfully!');
      }

      // ✅ Reset form & file inputs
      setForm(defaultFormState);
      setFormKey(Date.now());
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? 'Error submitting item. Please try again.';
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
        key={formKey} // ensures file inputs reset
        onSubmit={handleSubmit}
        className="flex flex-col gap-4"
        encType="multipart/form-data"
      >
        {/* User Selection */}
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

        {/* Culture Name */}
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

        {/* Description */}
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

        {/* Region */}
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

        {/* Significance */}
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

        {/* Image */}
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

        {/* Video */}
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

        {/* Submit Button */}
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
