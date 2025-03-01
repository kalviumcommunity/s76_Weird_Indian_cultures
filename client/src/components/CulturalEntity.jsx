import Taj from '/karoly-buzas-QS7e8OrubI0-unsplash (1).jpg'

const CulturalEntity = () => {
  
  const culturalEntityData = {
    name: 'Taj Mahal',
    description:
      'The Taj Mahal, located in Agra, is a stunning white marble mausoleum and one of the Seven Wonders of the World. It was built by Emperor Shah Jahan in memory of his wife Mumtaz Mahal.',
   
  };




  return (
    <div className="bg-white shadow-neutral-950 shadow-lg m-[40px] mt-[100px] rounded-lg h-[620px] w-[450px] flex flex-col items-center hover:scale-x-100">
      <h2 className="text-2xl font-semibold text-center text-gray-800">{culturalEntityData.name}</h2>
      <img
        src={Taj}
        alt={culturalEntityData.name}
        className="h-[400px] w-auto rounded-lg my-4"
      />
      <p className="text-gray-600 text-sm h-[90px] w-[350px]">{culturalEntityData.description}</p>
      <button
        className="  border-1   border-orange-500 text-orange-500 h-[40px] w-[170px] mb-[20px] mt-[10px] rounded-md hover:bg-orange-500 hover:text-white transition"
        
      >
        Learn More
      </button>
    </div>
  );
};

export default CulturalEntity;
