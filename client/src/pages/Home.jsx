import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar.jsx";
import IndBg from "/indianbg.jpg";
import CulturalEntity from "../components/CulturalEntity.jsx";

function Home () {
  const [cultures, setCultures] = useState([]);
  const [loading, setLoading] = useState(true);
  const API_URL = "http://localhost:5000/api/item/fetch";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(API_URL);
        setCultures(response.data);
        console.log(response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/item/delete/${id}`);
      setCultures(cultures.filter((culture) => culture._id !== id));
      alert("Entry deleted successfully!");
    } catch (error) {
      console.error("Error deleting entry:", error);
    }
  };

  return (
    <>
      {/* Background Section */}
      <div
        className="relative bg-cover bg-center bg-fixed"
        style={{ backgroundImage: `url(${IndBg})` }}
      >
        {/* Background Overlay */}
        <div className="absolute inset-0" style={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }}></div>

        {/* Navbar */}
        <Navbar />
         
        {/* Main Content */}
        <div className="relative flex flex-col items-center justify-center  p-4">
          
          {loading ? (
            <p className="text-white">Loading...</p>
          ) : (
            <div className="grid grid-cols-1  xl:grid-cols-4 gap-6">
              {cultures.map((culture) => (
                <CulturalEntity key={culture.id} {...culture} onDelete={handleDelete} />
              ))}
            </div>
          )}
        </div>
              {/* <div className="  ">
              <Footer />
            </div> */}
      </div>

      {/* Footer */}
     
    </>
  );
};

export default Home;
