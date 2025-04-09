import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

function Form() {
  const userId = localStorage.getItem("userId");
  const { id } = useParams(); // Retrieve id from the URL
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    CultureName: "",
    CultureDescription: "",
    Region: "",
    Significance: "",
  });

  const [message, setMessage] = useState("");

  // Fetch existing data when editing
  useEffect(() => {
    if (id) {
      axios
        .get(`http://localhost:5000/api/item/fetch/${id}`)
        .then((response) => {
          const data = response.data || response.data.item;
          setFormData({
            CultureName: data.CultureName || "",
            CultureDescription: data.CultureDescription || "",
            Region: data.Region || "",
            Significance: data.Significance || "",
          });
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
          setMessage("Error fetching data.");
        });
    }
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.CultureName || !formData.CultureDescription || !formData.Region || !formData.Significance) {
      setMessage("Please fill all fields.");
      return;
    }

    try {
      if (isEdit) {
        // Update existing entry
        await axios.put(`http://localhost:5000/api/item/update/${id}`, formData);
        setMessage("Data updated successfully!");
      } else {
        // Add userId only when creating
        const dataToSend = {
          ...formData,
          created_by: userId,
        };
        await axios.post("http://localhost:5000/api/item/create", dataToSend);
        setMessage("Data submitted successfully!");
      }
      navigate("/home"); // Redirect after submission
    } catch (error) {
      console.error("Error submitting data:", error.response?.data || error.message);
      setMessage("Error submitting data");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-xl p-8 w-full max-w-lg">
        <h2 className="text-3xl font-semibold text-orange-600 text-center mb-6">
          {id ? "Edit Cultural Entity" : "Add Cultural Entity"}
        </h2>

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
          rows="3"
          required
        ></textarea>

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
        <input
          type="text"
          name="Significance"
          value={formData.Significance}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500"
          required
        />

        <button
          type="submit"
          className="mt-6 w-full bg-orange-500 text-white font-semibold py-3 rounded-md hover:bg-orange-600 transition"
        >
          {id ? "Update" : "Submit"}
        </button>

        {message && <p className="mt-4 text-center font-medium text-orange-600">{message}</p>}
      </form>
    </div>
  );
}

export default Form;
