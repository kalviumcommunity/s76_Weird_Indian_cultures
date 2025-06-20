import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { 
  FaHome, FaSearch, FaPlus, FaBell, FaUser, FaGlobe, 
  FaArchway, FaBook
} from "react-icons/fa";

const NavBar = () => {
  const navigate = useNavigate();
  const [searchFocused, setSearchFocused] = useState(false);
  const [showArchaeMenu, setShowArchaeMenu] = useState(false);

  const handle = () => {
    navigate('/form');
  };

  return (
    <div className="fixed top-0 w-full bg-black/30 backdrop-blur-md h-[70px] z-50 border-b border-gray-700">
      <div className="max-w-6xl mx-auto px-4 h-full">
        <div className="flex items-center justify-between h-full">
          {/* Logo */}
          <div className="flex items-center">
            <FaGlobe className="text-orange-500 text-2xl" />
            <span className="ml-2 font-bold text-lg text-white">WeirdCultures</span>
          </div>
          
          {/* Search */}
          <div className={`relative max-w-xs w-full mx-4 ${searchFocused ? 'flex-grow' : ''}`}>
            <input 
              type="text" 
              placeholder="Search cultures..." 
              className="w-full py-2 pl-10 pr-4 rounded-full border border-gray-700 bg-black/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
            />
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
          </div>
          
          {/* Navigation links */}
          <div className="hidden md:flex items-center space-x-8">
            <button 
              onClick={() => navigate('/home')}
              className="text-gray-300 hover:text-orange-400 focus:outline-none"
            >
              <FaHome className="text-xl" />
            </button>
            
            {/* Archaeological Sites Dropdown */}
            <div className="relative group">
              <button 
                className="text-gray-300 hover:text-orange-400 focus:outline-none flex items-center gap-2"
                onClick={() => setShowArchaeMenu(!showArchaeMenu)}
              >
                <FaArchway className="text-xl" />
                <span className="text-sm hidden lg:block">Archaeological</span>
              </button>

              {showArchaeMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-black/80 backdrop-blur-md border border-gray-700 rounded-md shadow-lg z-50">
                  <div className="border-t border-gray-700 mt-1 pt-1">
                    <a 
                      href="/archaeology/all" 
                      className="block px-4 py-2 text-orange-400 hover:bg-gray-800 flex items-center gap-2"
                    >
                      <FaBook /> View All Archaeological Findings
                    </a>
                  </div>
                </div>
              )}
            </div>
            
            <button 
              className="text-gray-300 hover:text-orange-400 focus:outline-none relative"
            >
              <FaBell className="text-xl" />
              <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                2
              </span>
            </button>
            
            <button 
              className="text-gray-300 hover:text-orange-400 focus:outline-none"
            >
              <FaUser className="text-xl" />
            </button>
            
            <button 
              onClick={handle}
              className="h-[40px] w-[100px] bg-orange-400 hover:bg-orange-500 rounded-2xl flex items-center justify-center space-x-1 text-white transition-colors"
            >
              <FaPlus size={12} />
              <span>Add New</span>
            </button>
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button 
              onClick={handle}
              className="h-[40px] w-[100px] bg-orange-400 hover:bg-orange-500 rounded-2xl flex items-center justify-center space-x-1 text-white transition-colors"
            >
              <FaPlus size={12} />
              <span>Add New</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Bottom navigation for mobile */}
      <div className="md:hidden fixed bottom-0 w-full bg-black/30 backdrop-blur-md border-t border-gray-700 z-50">
        <div className="flex justify-around py-3">
          <button 
            onClick={() => navigate('/home')}
            className="text-gray-300 hover:text-orange-400 focus:outline-none flex flex-col items-center"
          >
            <FaHome className="text-xl" />
            <span className="text-xs mt-1">Home</span>
          </button>
          
          <button 
            className="text-gray-300 hover:text-orange-400 focus:outline-none flex flex-col items-center"
          >
            <FaSearch className="text-xl" />
            <span className="text-xs mt-1">Search</span>
          </button>
          
          <button 
            onClick={() => navigate('/form')}
            className="text-gray-300 hover:text-orange-400 focus:outline-none flex flex-col items-center"
          >
            <FaPlus className="text-xl" />
            <span className="text-xs mt-1">Post</span>
          </button>
          
          <button 
            onClick={() => setShowArchaeMenu(!showArchaeMenu)}
            className="text-gray-300 hover:text-orange-400 focus:outline-none flex flex-col items-center"
          >
            <FaArchway className="text-xl" />
            <span className="text-xs mt-1">Archaeology</span>
          </button>
          
          <button 
            className="text-gray-300 hover:text-orange-400 focus:outline-none flex flex-col items-center"
          >
            <FaUser className="text-xl" />
            <span className="text-xs mt-1">Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default NavBar;
