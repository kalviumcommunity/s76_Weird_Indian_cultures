import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

function Form() {
  const storedUserId = localStorage.getItem("userId");
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    CultureName: "",
    CultureDescription: "",
    Region: "",
    Significance: "",
    created_by: storedUserId || "", // fallback to empty string
  });

  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    axios.get("http://localhost:5000/api/item/users")
      .then((res) => {
        setUsers(res.data); // Ensure response structure matches expectations
      })
      .catch((err) => console.error("Failed to load users:", err));
  }, []);

  useEffect(() => {
    if (id) {
      axios.get(`http://localhost:5000/api/item/fetch/${id}`)
        .then((response) => {
          const data = response.data || response.data.item;
          setFormData({
            CultureName: data.CultureName || "",
            CultureDescription: data.CultureDescription || "",
            Region: data.Region || "",
            Significance: data.Significance || "",
            created_by: data.created_by || storedUserId,
          });
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
          setMessage("Error fetching data.");
        });
    }
  }, [id, storedUserId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { CultureName, CultureDescription, Region, Significance, created_by } = formData;

    if (!CultureName || !CultureDescription || !Region || !Significance || !created_by) {
      setMessage("Please fill all fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEdit) {
        await axios.put(`http://localhost:5000/api/item/update/${id}`, formData);
        setMessage("Data updated successfully!");
      } else {
        await axios.post("http://localhost:5000/api/item/create", formData);
        setMessage("Data submitted successfully!");
      }
      navigate("/home");
    } catch (error) {
      console.error("Error submitting data:", error);
      setMessage(error.response?.data?.message || "Error submitting data.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-xl p-8 w-full max-w-lg">
        <h2 className="text-3xl font-semibold text-orange-600 text-center mb-6">
          {isEdit ? "Edit Cultural Entity" : "Add Cultural Entity"}
        </h2>

        {/* All Input Fields */}
        <label className="block mb-2 text-gray-700 font-medium">Culture Name</label>
        <input
          type="text"
          name="CultureName"
          value={formData.CultureName}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500"
          required
        />

        <label className="block mt-4 mb-2 text-gray-700 font-medium">Culture Description</label>
        <textarea
          name="CultureDescription"
          value={formData.CultureDescription}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500"
          required
        />

        <label className="block mt-4 mb-2 text-gray-700 font-medium">Region</label>
        <input
          type="text"
          name="Region"
          value={formData.Region}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500"
          required
        />

        <label className="block mt-4 mb-2 text-gray-700 font-medium">Significance</label>
        <textarea
          name="Significance"
          value={formData.Significance}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500"
          required
        />

        <label className="block mt-4 mb-2 text-gray-700 font-medium">select user</label>
        <select
          name="created_by"
          value={formData.created_by}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500"
          required
        >
          <option value="">Select User</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>{user.username}</option>
          ))}
        </select>

        <div className="flex justify-center mt-6">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
          >
            {isSubmitting ? "Submitting..." : isEdit ? "Update Item" : "Create Item"}
          </button>
        </div>

        {message && (
          <div className="mt-4 text-center text-sm text-red-500">
            {message}
          </div>
        )}
      </form>
    </div>
  );
}

export default Form;
