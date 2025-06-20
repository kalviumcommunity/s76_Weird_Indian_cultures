import { useState, useEffect } from "react";
import axios from "axios";

export default function Form({ onCreated }) {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(localStorage.getItem("userId") || "");
  const [form, setForm] = useState({
    CultureName: "",
    CultureDescription: "",
    Region: "",
    Significance: "",
    image: null,
    video: null,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios.get("http://localhost:5000/api/item/users")
      .then(res => setUsers(res.data || []))
      .catch(() => setUsers([]));
  }, []);

  const handleUserSelect = (e) => {
    setSelectedUser(e.target.value);
    localStorage.setItem("userId", e.target.value);
  };

  const handleInput = (e) => {
    const { name, value, files } = e.target;
    setForm((f) => ({
      ...f,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUser) return alert("Please select a user.");
    if (
      form.CultureName.length < 3 ||
      form.CultureDescription.length < 10 ||
      form.Region.length < 3 ||
      form.Significance.length < 10
    ) {
      alert("Please fill all fields with valid lengths.");
      return;
    }
    const formData = new FormData();
    formData.append("CultureName", form.CultureName);
    formData.append("CultureDescription", form.CultureDescription);
    formData.append("Region", form.Region);
    formData.append("Significance", form.Significance);
    formData.append("created_by", Number(selectedUser)); // Ensure number type!
    if (form.image) formData.append("image", form.image);
    if (form.video) formData.append("video", form.video);

    setLoading(true);
    try {
      await axios.post("http://localhost:5000/api/item/create", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });
      alert("Item created successfully!");
      setForm({
        CultureName: "",
        CultureDescription: "",
        Region: "",
        Significance: "",
        image: null,
        video: null,
      });
      if (onCreated) onCreated();
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Error creating item. Check your input and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="form-container"
      style={{
        maxWidth: 540,
        margin: "40px auto",
        padding: 32,
        background: "#f6f6fa",
        borderRadius: 16,
        boxShadow: "0 4px 24px 0 rgba(0,0,0,0.11)",
      }}
    >
      <h2 style={{ marginBottom: 16, textAlign: "center" }}>
        Create Cultural Item
      </h2>
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: 16 }}
        encType="multipart/form-data"
      >
        <label>
          <span style={{ display: "block", marginBottom: 4 }}>User:</span>
          <select
            value={selectedUser}
            onChange={handleUserSelect}
            required
            style={{
              padding: "8px",
              borderRadius: 8,
              border: "1px solid #bbb",
              width: "100%",
            }}
          >
            <option value="">Select User</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.username}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span style={{ display: "block", marginBottom: 4 }}>Culture Name:</span>
          <input
            name="CultureName"
            value={form.CultureName}
            onChange={handleInput}
            placeholder="Culture Name"
            minLength={3}
            maxLength={100}
            required
            autoComplete="off"
            style={{
              padding: "8px",
              borderRadius: 8,
              border: "1px solid #bbb",
              width: "100%",
            }}
          />
        </label>
        <label>
          <span style={{ display: "block", marginBottom: 4 }}>
            Culture Description:
          </span>
          <textarea
            name="CultureDescription"
            value={form.CultureDescription}
            onChange={handleInput}
            placeholder="Culture Description"
            minLength={10}
            maxLength={500}
            required
            rows={3}
            style={{
              padding: "8px",
              borderRadius: 8,
              border: "1px solid #bbb",
              width: "100%",
              resize: "vertical",
            }}
          />
        </label>
        <label>
          <span style={{ display: "block", marginBottom: 4 }}>Region:</span>
          <input
            name="Region"
            value={form.Region}
            onChange={handleInput}
            placeholder="Region"
            minLength={3}
            maxLength={100}
            required
            autoComplete="off"
            style={{
              padding: "8px",
              borderRadius: 8,
              border: "1px solid #bbb",
              width: "100%",
            }}
          />
        </label>
        <label>
          <span style={{ display: "block", marginBottom: 4 }}>Significance:</span>
          <textarea
            name="Significance"
            value={form.Significance}
            onChange={handleInput}
            placeholder="Significance"
            minLength={10}
            maxLength={500}
            required
            rows={3}
            style={{
              padding: "8px",
              borderRadius: 8,
              border: "1px solid #bbb",
              width: "100%",
              resize: "vertical",
            }}
          />
        </label>
        <label>
          <span style={{ display: "block", marginBottom: 4 }}>Image:</span>
          <input
            type="file"
            accept="image/*"
            name="image"
            onChange={handleInput}
            style={{ padding: "6px" }}
          />
        </label>
        <label>
          <span style={{ display: "block", marginBottom: 4 }}>Video:</span>
          <input
            type="file"
            accept="video/*"
            name="video"
            onChange={handleInput}
            style={{ padding: "6px" }}
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "12px",
            borderRadius: 8,
            background: "#ff8800",
            color: "#fff",
            fontWeight: "bold",
            border: "none",
            cursor: loading ? "not-allowed" : "pointer",
            marginTop: 8,
            fontSize: 18,
          }}
        >
          {loading ? "Submitting..." : "Create"}
        </button>
      </form>
    </div>
  );
}