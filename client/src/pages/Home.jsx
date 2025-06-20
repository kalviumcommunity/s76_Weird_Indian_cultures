import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar.jsx";
import IndBg from "/indianbg.jpg";
import CulturalEntity from "../components/CulturalEntity.jsx";
import { FaUser, FaImage, FaVideo, FaArchway } from "react-icons/fa";

function Home() {
  const [cultures, setCultures] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [loading, setLoading] = useState(true);
  const [contentType, setContentType] = useState("all");

  const API_URL = "http://localhost:5000/api/item/fetch";

  useEffect(() => {
    fetchData();
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/item/users");
      setUsers(response.data || []);
    } catch (error) {
      setUsers([]);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_URL);
      setCultures(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      setCultures([]);
    }
    setLoading(false);
  };

  const handleUserSelect = async (userId) => {
    localStorage.setItem("userId", userId);
    setSelectedUser(userId);
    setLoading(true);

    try {
      let url = userId === "" ? API_URL : `http://localhost:5000/api/item/usercreatedby/${userId}`;
      const res = await axios.get(url);
      setCultures(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      setCultures([]);
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/item/delete/${id}`);
      setCultures(prevCultures => prevCultures.filter((culture) => culture.id !== id));
      alert("Entry deleted successfully!");
    } catch (error) {}
  };

  const handleContentTypeChange = (type) => {
    setContentType(type);
  };

  // Filter content based on tab
  const getFilteredContent = () => {
    let filtered = cultures;
    if (contentType === "videos") {
      filtered = cultures.filter(c => c.VideoURL);
    } else if (contentType === "images") {
      filtered = cultures.filter(c => c.ImageURL && !c.VideoURL);
    }
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filtered.length > 0 ? (
          filtered.map((culture) => (
            <CulturalEntity key={culture.id} {...culture} onDelete={handleDelete} />
          ))
        ) : (
          <div className="col-span-full text-center py-10 bg-black/30 backdrop-blur-md rounded-lg p-6 border border-gray-700">
            <p className="text-white text-lg">No cultural posts found.</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className="min-h-screen bg-cover bg-fixed relative"
      style={{ backgroundImage: `url(${IndBg})` }}
    >
      <div className="absolute inset-0" style={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }}></div>
      <Navbar />

      <div className="relative max-w-6xl mx-auto pt-24 px-4 z-10">
        {/* Content type selector */}
        <div className="bg-black/30 backdrop-blur-md rounded-lg shadow-lg mb-6 border border-gray-700">
          <div className="flex border-b border-gray-700">
            <button
              className={`flex items-center gap-2 px-6 py-3 font-medium ${
                contentType === "all"
                  ? "text-orange-400 border-b-2 border-orange-400"
                  : "text-gray-300 hover:text-orange-400"
              }`}
              onClick={() => handleContentTypeChange("all")}
            >
              <FaArchway /> All
            </button>
            <button
              className={`flex items-center gap-2 px-6 py-3 font-medium ${
                contentType === "videos"
                  ? "text-orange-400 border-b-2 border-orange-400"
                  : "text-gray-300 hover:text-orange-400"
              }`}
              onClick={() => handleContentTypeChange("videos")}
            >
              <FaVideo /> Videos
            </button>
            <button
              className={`flex items-center gap-2 px-6 py-3 font-medium ${
                contentType === "images"
                  ? "text-orange-400 border-b-2 border-orange-400"
                  : "text-gray-300 hover:text-orange-400"
              }`}
              onClick={() => handleContentTypeChange("images")}
            >
              <FaImage /> Images
            </button>
          </div>
        </div>

        {/* User Selection */}
        <div className="bg-black/30 backdrop-blur-md rounded-lg shadow-lg mb-6 border border-gray-700">
          <div className="p-4 flex flex-row space-x-4 overflow-x-auto">
            <div
              className={`flex flex-col items-center cursor-pointer ${selectedUser === "" ? "opacity-100" : "opacity-60 hover:opacity-100"}`}
              onClick={() => handleUserSelect("")}
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-pink-500 p-0.5">
                <div className="w-full h-full rounded-full border-2 border-black overflow-hidden flex items-center justify-center bg-gray-800 text-white">
                  <FaUser size={24} />
                </div>
              </div>
              <span className="text-xs text-gray-300 mt-1">All Users</span>
            </div>
            {users.map((user) => (
              <div
                key={user.id}
                className={`flex flex-col items-center cursor-pointer ${selectedUser === user.id ? "opacity-100" : "opacity-60 hover:opacity-100"}`}
                onClick={() => handleUserSelect(user.id)}
              >
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-pink-500 p-0.5">
                  <div className="w-full h-full rounded-full border-2 border-black overflow-hidden flex items-center justify-center bg-gray-800 text-white text-lg">
                    {user.username ? user.username.charAt(0).toUpperCase() : "U"}
                  </div>
                </div>
                <span className="text-xs text-gray-300 mt-1">{user.username}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Content feed */}
        <div className="relative">
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
            </div>
          ) : getFilteredContent()}
        </div>
      </div>

      {/* Floating action button */}
      <div className="fixed right-8 bottom-8">
        <button
          onClick={() => window.location.href = '/form'}
          className="bg-orange-500 hover:bg-orange-600 text-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg transition-transform transform hover:scale-110"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
    </div>
  );
}
export default Home;