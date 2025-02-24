import { useState, useEffect } from "react";


import jallikattu from "../assets/jallikattu.jpg";
import photo1 from "/240_F_988992147_urXqMNdfqC07vwDqFxAC2v7UZ3FX5IPp.jpg";
import photo2 from "/debashis-rc-biswas-ZrejNf2Ex0M-unsplash.jpg"; 
import photo3 from "/gettyimages-sb10069471a-001-612x612.jpg";
import photo4 from "/karoly-buzas-QS7e8OrubI0-unsplash (1).jpg"
import photo5 from "/raimond-klavins-0xQ1H6xMak4-unsplash.jpg";
import photo6 from "/karoly-buzas-QS7e8OrubI0-unsplash.jpg";

const images = [jallikattu,photo1,photo2,photo3,photo4,photo5,photo6];

export default function Slideshow() {
  const [currentIndex, setCurrentIndex] = useState(0);


  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval); 
  }, []);

  return (
    <div className="relative w-full max-w-2xl mx-auto">
     
    
      <div className="overflow-hidden rounded-lg">
        <img
          src={images[currentIndex]}
          alt={`Slide ${currentIndex + 1}`}
          className="w-[600px] h-[363px] object-cover transition-opacity duration-500 cursor-pointer"
        />
      </div>

      
  
    </div>
  );
}
