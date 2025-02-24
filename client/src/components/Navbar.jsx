
const NavBar = () => {
    return (
      <>
            <div className="flex gap-[70px] bg-black h-[50px] w-[830px] text-white mt-[880px] ml-[490px] rounded-2xl" style={{ backgroundColor: "rgba(0, 0, 0, 0.6)  " }}>
                
                <p className="cursor-pointer pl-[190px] pt-[13px] hover:text-orange-400">States <span className="text-orange-500">|</span></p>
                <p className="cursor-pointer pt-[13px] hover:text-orange-400">Cultures <span className="text-orange-500">|</span></p>
                <p className="cursor-pointer pt-[13px] hover:text-orange-400">Login <span className="text-orange-500">|</span></p>
                <p className="cursor-pointer pt-[13px] hover:text-orange-400">Signup</p>
            </div>
      
      </>
    )
  }
  
  export default NavBar
  