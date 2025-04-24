import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { ChevronUp, ChevronDown, X } from "lucide-react";

const sheetVariants = {
  closed: { height: "0vh" },
  collapsed: { height: "40vh" },
  expanded: { height: "80vh" },
};

const BoothInfoSheet = ({ location, onClose }) => {
  const [sheetState, setSheetState] = useState("closed");

  // Cambia automáticamente a semiabierto al seleccionar una nueva ubicación
  useEffect(() => {
    if (location) {
      setSheetState("collapsed");
    } else {
      setSheetState("closed");
    }
  }, [location]);

  if (!location) return null;

  return (
    <AnimatePresence>
      <motion.div
        key={location.id}
        className="absolute bottom-0 left-0 w-full bg-white shadow-lg border-t z-50 rounded-t-2xl"
        initial="closed"
        animate={sheetState}
        exit="closed"
        variants={sheetVariants}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        style={{
          overflow: "hidden",
          touchAction: "none",
        }}
      >
        <div className="flex items-center justify-between px-4 py-2 border-b">
          <button
            onClick={() =>
              setSheetState((prev) =>
                prev === "collapsed" ? "expanded" : "collapsed"
              )
            }
            className="text-gray-500 hover:text-gray-800"
            aria-label="Expandir o Replegar"
          >
            {sheetState === "collapsed" ? (
              <ChevronUp size={24} />
            ) : (
              <ChevronDown size={24} />
            )}
          </button>
          <button
            onClick={() => {
              setSheetState("closed");
              setTimeout(onClose, 400); // espera la transición antes de desmontar
            }}
            className="text-gray-500 hover:text-gray-800"
            aria-label="Cerrar"
          >
            <X size={24} />
          </button>
        </div>

        <div
          className={`p-4 h-full ${
            sheetState === "expanded" ? "overflow-y-auto" : "overflow-hidden"
          }`}
        >
          <p className="text-sm text-gray-400 font-mono mb-1">
            {location.boothId?.toUpperCase()}
          </p>

          <h2 className="text-xl font-bold">{location.name}</h2>

          {location.subtitle && (
            <p className="text-sm text-gray-500 mb-2">{location.subtitle}</p>
          )}

          <p className="text-gray-700 whitespace-pre-line mb-4">
            {location.description}
          </p>

          <div className="text-sm text-gray-700 space-y-1">
            <p>
              <strong>Contactos:</strong> {location.contacts}
            </p>
            <p>
              <strong>Emails:</strong>{" "}
              {location.emails
                ?.split(",")
                .map((email) => (
                  <a
                    key={email}
                    href={`mailto:${email.trim()}`}
                    className="text-blue-600 underline mr-2"
                  >
                    {email.trim()}
                  </a>
                ))}
            </p>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default BoothInfoSheet;
