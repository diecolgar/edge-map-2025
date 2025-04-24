const BottomBar = ({ activeView, onChangeView }) => {
  return (
    <div className="absolute bottom-0 left-0 w-full z-[1000] bg-[#323232] px-4 py-4 flex justify-around items-center">
      {["map", "list"].map((view) => (
        <button
          key={view}
          onClick={() => onChangeView(view)}
          className={`relative text-lg font-semibold text-white px-4`}
        >
          {activeView === view && (
            <div className="absolute top-[-12px] left-1/2 -translate-x-1/2 w-full h-1 rounded-full bg-green-400" />
          )}
          {view === "map" ? "Map" : "List"}
        </button>
      ))}
    </div>
  );
};

export default BottomBar;
