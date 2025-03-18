import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";



function Form () {
   const  [formData,setFormData]=useState({
    CultureName: "",
    CultureDescription:"",
    Region:"",
    Significance:""
   })

   const [message,setMessage]=useState("")
   const navigate = useNavigate()

   const handleChange = (e) => {
        setFormData({...formData,[e.target.name]:e.target.value})
   }

   const handleSubmit = async (e) =>{
      e.preventDefault();
      try{
        const response = await axios.post("http://localhost:5000/api/item/create", formData);
        setMessage("data submited succesfully")
    
        console.log("Response:", response.data);
            navigate('/home')
      }
      catch(error){
        setMessage("error submiting data");
        console.error("Error:", error);
      }
   }   


   
   
    return(
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <form
        action={SubmitEvent}
          onSubmit={handleSubmit}
          className="bg-white shadow-lg rounded-xl p-8 w-full max-w-lg"
        >
          <h2 className="text-3xl font-semibold text-orange-600 text-center mb-6">
            Add Cultural Entity
          </h2>
  
          {/* Culture Name */}
          <label className="block mb-2 text-gray-700 font-medium">Culture Name</label>
          <input
            type="text"
            name="CultureName"
            value={formData.CultureName}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            required
          />
  
          {/* Culture Description */}
          <label className="block mt-4 mb-2 text-gray-700 font-medium">Culture Description</label>
          <textarea
            name="CultureDescription"
            value={formData.CultureDescription}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            rows="3"
            required
          ></textarea>
  
          {/* Region */}
          <label className="block mt-4 mb-2 text-gray-700 font-medium">Region</label>
          <input
            type="text"
            name="Region"
            value={formData.Region}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            required
          />
  
          {/* Significance */}
          <label className="block mt-4 mb-2 text-gray-700 font-medium">Significance</label>
          <input
            type="text"
            name="Significance"
            value={formData.Significance}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            required
          />
  
          {/* Submit Button */}
          <button
            type="submit"
            className="mt-6 w-full bg-orange-500 text-white font-semibold py-3 rounded-md hover:bg-orange-600 transition duration-300"
            
          >
            Submit
          </button>
  
          {/* Message */}
          {message && (
            <p className="mt-4 text-center font-medium text-orange-600">{message}</p>
          )}
        </form>
      </div>
        
    )
}


export default Form