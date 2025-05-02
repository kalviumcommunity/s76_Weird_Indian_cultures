import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';

function CulturalEntity({ id, CultureName, CultureDescription, Region, Significance, onDelete }) {
  const navigate = useNavigate();

  return (
    <div className="">
      <div className="bg-white shadow-neutral-950 shadow-lg m-[40px] mt-[100px] rounded-lg h-[320px] w-[370px] flex flex-col pl-[30px] pt-[10px] hover:scale-x-100">
        <h2 className="text-2xl font-semibold text-center text-gray-800">{CultureName}</h2>

        <p className="text-gray-600 text-sm mt-[10px]">{CultureDescription}</p>
        <p className="mt-[10px]"><strong>Region:</strong> {Region}</p>
        <p className="mt-[10px]"><strong>Significance:</strong> {Significance}</p>
        
        <div className='flex mt-[240px] absolute'>
          <button
            className="bg-gray-700 ml-[20px] text-white h-[30px] w-[90px] rounded hover:bg-gray-800 transition mt-[10px]"
            onClick={() => navigate(`/form/${id}`)} 
          >
            Edit
          </button>

          <button
            onClick={() => onDelete(id)}
            className='ml-[10px] bg-black text-white h-[30px] w-[90px] rounded hover:bg-gray-800 transition mt-[10px]'   
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

CulturalEntity.propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  CultureName: PropTypes.string.isRequired,
  CultureDescription: PropTypes.string.isRequired,
  Region: PropTypes.string.isRequired,
  Significance: PropTypes.string.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default CulturalEntity;
