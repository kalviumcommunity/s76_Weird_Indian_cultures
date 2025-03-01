import CulturalEntity from "../components/CulturalEntity.jsx";
import Footer from "../components/Footer.jsx";
import Navbar from "../components/Navbar.jsx";
import IndBg from "/indianbg.jpg";

const Home = () => {
  return (
    <>
      {/* Background Section */}
      <div
        className="relative bg-cover bg-center bg-fixed h-screen"
        style={{ backgroundImage: `url(${IndBg})` }}
      >
        {/* Background Overlay for Opacity */}
        <div 
          className="absolute inset-0"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }} 
        ></div>
        {/* Navbar */}
        <div className="">
          <Navbar />
        </div>

        {/* Main Content */}
        <div className="relative z-10 flex flex-col items-center justify-center h-screen">
          <div className="flex flex-wrap justify-center gap-6">
            <CulturalEntity />
            <CulturalEntity />
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </>
  );
};

export default Home;
