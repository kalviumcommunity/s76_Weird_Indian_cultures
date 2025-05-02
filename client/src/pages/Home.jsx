import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar.jsx";
import IndBg from "/indianbg.jpg";
import CulturalEntity from "../components/CulturalEntity.jsx";

function Home () {
  const [cultures, setCultures] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [loading, setLoading] = useState(true);

  const API_URL = "http://localhost:5000/api/item/fetch";

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/item/users");
        setUsers(response.data || []);
      } catch (error) {
        console.error("Error fetching users", error);
      }
    };

    const fetchData = async () => {
      try {
        const response = await axios.get(API_URL);
        setCultures(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    fetchUsers();
  }, []);

  const handleUserChange = async (e) => {
    const userId = e.target.value;
    localStorage.setItem("userId", userId);
    setSelectedUser(userId);
    setLoading(true);

    if (userId === "") {
      try {
        const res = await fetch("http://localhost:5000/api/item/fetch");
        const data = await res.json();
        setCultures(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching all items:", error);
      } finally {
        setLoading(false);
      }
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/api/item/usercreatedby/${userId}`);
      const data = await res.json();
      setCultures(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching filtered combos:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/item/delete/${id}`);
      // Immediately update the state by filtering out the deleted item
      setCultures(prevCultures => prevCultures.filter((culture) => culture.id !== id));
      alert("Entry deleted successfully!");
    } catch (error) {
      console.error("Error deleting entry:", error);
    }
  };

  return (
    <>
      <div
        className="relative bg-cover  bg-fixed"
        style={{ backgroundImage: `url(${IndBg})` }}
      >
        <div className="absolute inset-0 " style={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }}></div>

        <div className="-z-10">
          <Navbar />
        </div>

        <select
          className="p-2 bg-violet-600 text-white rounded-md shadow-md focus:ring-2  focus:ring-violet-400  absolute z-100"
          onChange={handleUserChange}
          value={selectedUser}
        >
          <option value="">Select User</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.username}
            </option>
          ))}
        </select>

        <div className="relative flex flex-col items-center justify-center  p-4">
          {loading ? (
            <p className="text-white">Loading...</p>
          ) : (
            <div className="grid grid-cols-1  xl:grid-cols-4 gap-6">
              {Array.isArray(cultures) && cultures.length > 0 ? (
                cultures.map((culture) => (
                  <CulturalEntity key={culture.id} {...culture} onDelete={handleDelete} />
                ))
              ) : (
                <p className="text-white">No cultural data found.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Home;
