import { motion } from "framer-motion"
import { FaGithub } from "react-icons/fa";
import { FaLinkedin } from "react-icons/fa";
const Footer = () => {
  return (
    <>
    <div className='h-[350px] w-full relative flex' 
   
    >
      <div className="pl-[80px] pt-[40px]">
        <h1 className='font-bold text-2xl text-black '>about us </h1>
            <motion.div className="h-1 w-[100px] bg-black"
            initial={{ width: 0 }} 
            whileInView={{ width: "100px" }}
            transition={{ duration: 1 }}
            >
            </motion.div>

        <p className="h-[200px] w-[600px] mt-[30px]">Welcome to India culture a platform dedicated to celebrating Indias rich cultural heritage! From vibrant festivals and traditional arts to diverse cuisines and historical wonders, we bring you an immersive experience of Indias traditions.

        Our mission is to showcase the beauty and diversity of Indian culture in an engaging way, making it accessible to everyone. Whether youre a history buff, a traveler, or just curious, explore and celebrate India with us! 🇮🇳✨

        </p>    
      </div>


      <div className="pl-[280px] pt-[40px]">
        <h1 className="font-bold text-2xl text-black">contact</h1>
    
        <motion.div className="h-1 w-[100px] bg-black"
            initial={{ width: 0 }} 
            whileInView={{ width: "80px" }}
            transition={{ duration: 1 }}
            >
            </motion.div>

            <div className="flex gap-[30px] mt-[30px] ">
            <FaGithub size={45} className="hover:scale-110 cursor-pointer" onClick={() => window.open('https://github.com/harishb2006', '_blank')}/> 
            <FaLinkedin size={45} className="hover:scale-110 cursor-pointer" onClick={() => window.open('https://www.linkedin.com/in/harish-b-41450232a/', '_blank')}/>

            </div>
           
      </div>
    
    </div>
    </>
  )
}

export default Footer
