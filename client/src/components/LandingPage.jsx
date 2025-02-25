import BgImg from '../assets/Group.jpg';
import { motion } from "framer-motion";
import ChackraImg from '../assets/737-Photoroom.png';
// import Kalai from '../assets/jallikattu.jpg';
import Slideshow from './Slideshow';

import { useNavigate } from 'react-router-dom';
import Footer from './Footer';

// import Slideshow from './Slideshow';

const LandingPage = () => {
  const navigate = useNavigate();
  const handleClick = () => { 
 
    navigate('/home');
  }
  return (
    <>
    {/* backgroundImage */}
      <div 
        className=" relative bg-cover bg-center bg-fixed min-h-screen"
        style={{ backgroundImage: `url(${BgImg})` }}
      >
        {/* backgroundImageOpacity */}
        <div 
          className="absolute inset-0"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.7)" }} 
        ></div>

        <div className="relative">
          <h1 className="font-bold text-5xl p-[50px] text-orange-500">Indias Culture</h1>
        
  


   
          
          {/* ChackraImg */}
          <motion.img
            src={ChackraImg}
            alt="Spinning Image"
            className="w-[400px] h-[363px] absolute ml-[150px] mt-[120px]" 
            animate={{ rotate: 360 }} // Rotate to 360 degrees
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }} // Infinite loop
          />
                 
            

                   {/* kalai */}
                    {/* <img
                   
  src={Kalai}
  alt="Spinning Image"
  className="w-[600px] h-[363px] absolute rounded-2xl mt-[740px] ml-[1170px] drop-shadow-lg transition-transform duration-300 ease-in-out transform hover:scale-105"
/> 
                */}

      <div className='absolute mt-[740px] ml-[1170px]'> <Slideshow/></div>
     
      
        </div>

        {/* Text */}

          <div className="mt-4 relative">
            <div className='ml-[1170px] mt-[100px] h-[600px] w-[500px]'>
              <h1 className='text-4xl font-bold text-orange-400 pt-[40px]'>Experience the Heart of Indias Culture!</h1>
              <p className='mt-[20px] text-[20px] text-white'>
                India is a land of diversity, where every region has its own language, cuisine, art, and customs. 
                From the grandeur of ancient temples to the rhythm of folk dances, from the aroma of street food to the melodies of classical music—every element reflects a rich cultural tapestry. 
                Step into a journey where history and modernity blend seamlessly, and immerse yourself in the vibrant tapestry of Indias heritage.
              </p>
           
          </div>
        </div>

     
        <div className="mt-4 relative">
            <div className='ml-[170px]  h-[600px] w-[500px]'>
              <h1 className='text-4xl font-bold text-orange-400 pt-[10px]'>Features</h1>
              <p className='mt-[20px] text-[20px] text-white'>
                        🌍 Explore Indias Diversity – Discover traditions, festivals, and heritage of every state.
                        🏞️ State-Wise Insights – Easily navigate and explore cultural aspects of each region.
                        🎭 Traditional Arts & Festivals – Experience India’s folk dances, music, and grand celebrations.
                        🍛 Cuisine Showcase – Learn about iconic dishes and their cultural significance.
                        🏰 Historical Marvels – Explore ancient temples, monuments, and architectural wonders.
                        📜 Mythology & Folklore – Dive into legendary stories and traditional beliefs.
                        📱 User-Friendly Interface – Smooth and interactive experience across all devices.

              </p>

              
                        <button 
                    className="font-bold text-xl text-white h-14 w-96 cursor-pointer rounded-2xl 
                              border-2 border-orange-500 bg-transparent hover:bg-orange-500 
                                ml-[640px] mt-[50px]   z-10"
                  onClick={handleClick}>
                    Get Started ➝
                  </button> 
           
          </div>
   
       
        </div>


      </div>
      <div className=''>
      <Footer/></div>
    </>
  );
};

export default LandingPage;

