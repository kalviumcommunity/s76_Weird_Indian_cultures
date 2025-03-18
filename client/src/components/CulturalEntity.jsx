import PropTypes from 'prop-types';

function CulturalEntity  ({CultureName,CultureDescription,Region,Significance}) {
  return (
    <div className="">
      
      <div className="bg-white shadow-neutral-950 shadow-lg m-[40px] mt-[100px] rounded-lg h-[320px] w-[370px] flex flex-col pl-[30px] pt-[10px]  hover:scale-x-100">
      <h2 className="text-2xl font-semibold text-center text-gray-800">{CultureName}</h2>

    

      <p className="text-gray-600 text-sm mt-[10px]">{CultureDescription}</p>
      <p className="mt-[10px]"><strong>Region:</strong> {Region}</p>
      <p className="mt-[10px]"><strong>Significance:</strong> {Significance}</p>
      

      {/* <button className="border-1 border-orange-500 text-orange-500 h-[40px] w-[170px] mt-[250px] ml-[10px] absolute rounded-md hover:bg-orange-500 hover:text-white transition ">
        Learn More
      </button> */}
    </div>
    </div>
  );
};

CulturalEntity.propTypes = {
  CultureName: PropTypes.string.isRequired,
  CultureDescription: PropTypes.string.isRequired,
  Region: PropTypes.string.isRequired,
  Significance: PropTypes.string.isRequired,
};


export default CulturalEntity;
