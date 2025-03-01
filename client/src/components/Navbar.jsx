const NavBar = () => {
  return (
    <div
      className="flex gap-16 text-white fixed top-0 w-full justify-center bg-black/30 backdrop-blur-md h-[70px]  z-20"
      style={{ backgroundColor: "" }}
    >
      <p className="cursor-pointer pt-[19px] hover:text-orange-400">
        States <span className="text-orange-500">|</span>
      </p>
      <p className="cursor-pointer pt-[19px] hover:text-orange-400">
        Cultures <span className="text-orange-500">|</span>
      </p>
      <p className="cursor-pointer pt-[19px] hover:text-orange-400">
        Login <span className="text-orange-500">|</span>
      </p>
      <p className="cursor-pointer pt-[19px] hover:text-orange-400">Signup</p>
    </div>
  );
};

export default NavBar;
