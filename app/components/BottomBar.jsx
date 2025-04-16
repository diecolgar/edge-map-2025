const BottomBar = () => {
    return (
      <div className="absolute bottom-0 left-0 w-full z-[1000] bg-white/90 backdrop-blur px-4 py-2 shadow-inner flex justify-around items-center rounded-t-2xl">
        <button className="text-sm font-semibold text-blue-600">Mapa</button>
        <button className="text-sm font-semibold text-gray-500">Lista</button>
      </div>
    );
  };
  
  export default BottomBar;
  