import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { ChevronUp, ChevronDown, X } from "lucide-react";

const collapsedHeight = "34vh"; // Altura fija para el estado colapsado

const BoothInfoSheet = ({ location, onClose }) => {
  const [sheetState, setSheetState] = useState("closed");
  const [expandedHeight, setExpandedHeight] = useState(null);
  const containerRef = useRef(null);

  // Abrir/cerrar según location
  useEffect(() => {
    if (location) setSheetState("collapsed");
    else setSheetState("closed");
  }, [location]);

  // Cuando expandimos, medimos el contenido para animar altura
  useEffect(() => {
    if (sheetState === "expanded" && containerRef.current) {
      const prev = containerRef.current.style.height;
      containerRef.current.style.height = "auto";
      const measured = containerRef.current.scrollHeight;
      setExpandedHeight(measured);
      containerRef.current.style.height = prev;
    }
  }, [sheetState, location]);

  if (!location) return null;

  // Procesar contactos y emails CSV
  const contacts = location.contacts
    ? location.contacts.split(",").map((c) => c.trim())
    : [];
  const emails = location.emails
    ? location.emails.split(",").map((e) => e.trim())
    : [];
  const contactEmailPairs = contacts.map((contact, i) => ({
    contact,
    email: emails[i] || "",
  }));

  return (
    <AnimatePresence>
      <motion.div
        key={location.boothId}
        ref={containerRef}
        className="
          absolute bottom-0 left-0 w-full
          bg-white shadow-lg border-t
          rounded-t-2xl z-50
          max-h-[84dvh]
        "
        initial={{ height: 0 }}
        animate={{
          height:
            sheetState === "closed"
              ? 0
              : sheetState === "collapsed"
              ? collapsedHeight
              : expandedHeight ?? "84dvh",
        }}
        exit={{ height: 0 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        style={{ overflow: "hidden", maxHeight: "84dvh" }}
      >
        {/* Cabecera */}
        <div className="flex items-center justify-between px-4 py-4 pb-2">
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
              setTimeout(onClose, 400);
            }}
            className="flex items-center justify-center rounded-full bg-edgeText w-8 h-8 hover:bg-gray-600"
            aria-label="Cerrar"
          >
            <X size={16} color="white" />
          </button>
        </div>

        {/* Contenido con scroll interno al expandir */}
        <div
          className={`
            ${sheetState === "expanded" ? "overflow-y-auto" : "overflow-hidden"}
            px-6 pb-14
          `}
          style={{ height: "calc(100% - 56px)" }} // 56px = altura aprox. de la cabecera
        >
          {/* Sección principal */}
          <div className="flex flex-col gap-2 mb-4">
            <div className="flex items-center gap-2">
              <img
                src={`/nb-icons/${location.neighbourhood?.toLowerCase()}.svg`}
                alt={`${location.neighbourhood} icon`}
                className="w-8 h-8"
              />
              <span className="text-edgeTextSecondary font-black font-sans">
                {location.boothId?.toUpperCase()}
              </span>
            </div>
            <h2 className="text-2xl font-bold mt-1 text-edgeText">
              {location.name}
            </h2>
            {location.subtitle && (
              <p className="text-base text-gray-500 mb-2 italic">
                {location.subtitle}
              </p>
            )}
            {location.partner === "Y" && (
              <span className="inline-block bg-edgeBackground text-edgeText text-xs font-semibold px-4 py-2 rounded-full">
                Partners &amp; Collaborators
              </span>
            )}
          </div>

          {/* ABOUT */}
          <div className="mb-6">
            <span className="inline-block text-edgeGreen text-sm font-bold uppercase mb-2">
              ABOUT
            </span>
            <p className="text-gray-700 whitespace-pre-line text-sm">
              {location.description}
            </p>
          </div>

          {/* CONTACTS */}
          {contactEmailPairs.length > 0 && (
            <div className="mb-6">
              <span className="inline-block text-edgeGreen text-sm font-bold uppercase mb-2">
                CONTACTS
              </span>
              <div className="flex flex-col gap-1">
                {contactEmailPairs.map(({ contact, email }, i) => (
                  <span key={i} className="text-sm text-gray-700">
                    {contact} ({email})
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default BoothInfoSheet;
