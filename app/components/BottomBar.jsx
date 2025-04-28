import { motion } from "framer-motion";
import React from "react";

const BottomBar = ({ activeView, onChangeView }) => {
  return (
    <div className="absolute bottom-0 left-0 w-full z-[1000] bg-[#323232] h-14 flex flex-col items-center">
      {/* Contenedor del indicador */}
      <div className="relative w-full h-1">
        {/* Indicador animado */}
        <motion.div
          className="absolute top-0 h-1 bg-green-400"
          style={{ width: "50%" }}
          animate={{ left: activeView === "map" ? 0 : "50%" }}
          transition={{ duration: 0.3 }}
        />
      </div>
      {/* Sección de botones */}
      <div className="flex justify-around items-center w-full flex-1">
        {["map", "list"].map((view) => (
          <button
            key={view}
            onClick={() => onChangeView(view)}
            className="text-lg font-semibold text-white w-1/2 h-full flex items-center justify-center"
          >
            {view === "map" ? "Map" : "List"}
          </button>
        ))}
      </div>
    </div>
  );
};

export default BottomBar;
