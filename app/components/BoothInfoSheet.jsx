import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { ChevronUp, ChevronDown, X } from "lucide-react";

const collapsedHeight = "40vh"; // Altura fija para el estado colapsado

const BoothInfoSheet = ({ location, onClose }) => {
  const [sheetState, setSheetState] = useState("closed");
  const [expandedHeight, setExpandedHeight] = useState(null);
  const containerRef = useRef(null);

  // Al seleccionar un booth, se abre en estado "collapsed" (40vh)
  useEffect(() => {
    if (location) {
      setSheetState("collapsed");
    } else {
      setSheetState("closed");
    }
  }, [location]);

  // Cuando pasamos a expanded, medimos la altura natural del contenido.
  useEffect(() => {
    if (sheetState === "expanded" && containerRef.current) {
      // Para medir, temporalmente eliminamos la altura (lo ponemos a "auto")
      const prevHeight = containerRef.current.style.height;
      containerRef.current.style.height = "auto";
      const measuredHeight = containerRef.current.scrollHeight;
      // Guardamos la altura medida (en píxeles)
      setExpandedHeight(measuredHeight);
      // Restauramos el estilo previo (esto no afecta la animación, ya que animate lo controla)
      containerRef.current.style.height = prevHeight;
    }
  }, [sheetState, location]);

  if (!location) return null;

  // Procesamiento de contactos y emails (se asume que vienen en formato CSV)
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
        className="absolute bottom-0 left-0 w-full bg-white shadow-lg border-t z-50 rounded-t-2xl"
        initial={{ height: 0 }}
        animate={{
          height:
            sheetState === "closed"
              ? 0
              : sheetState === "collapsed"
              ? collapsedHeight
              : expandedHeight || "80vh", // si no se ha medido aún, fallback a 80vh
        }}
        exit={{ height: 0 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        style={{ overflow: "hidden", touchAction: "none" }}
      >
        {/* Cabecera: Botones de expandir/colapsar y cerrar */}
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

        {/* Contenido interno (se mide la altura total de este bloque) */}
        <div
          className={`h-full ${
            sheetState === "expanded" ? "overflow-y-auto" : "overflow-hidden"
          }`}
        >
          {/* Primera sección: Icono, ID, Título, Subtítulo y etiqueta de partner */}
          <div className="flex flex-col gap-2 mb-4 px-6 py-2">
            <div className="flex items-center gap-2">
              <img
                src={`/nb-icons/${location.neighbourhood?.toLowerCase()}.svg`}
                alt={`${location.neighbourhood} icon`}
                className="w-8 h-8"
              />
              <span className="text text-edgeTextSecondary font-black">
                {location.boothId?.toUpperCase()}
              </span>
            </div>
            <h2 className="text-xl font-bold mt-1">{location.name}</h2>
            {location.subtitle && (
              <p className="text-sm text-gray-500 mb-2 italic">
                {location.subtitle}
              </p>
            )}
            {location.partner === "Y" && (
              <div>
                <span className="inline-block bg-edgeBackground text-edgeText text-xs font-semibold px-4 py-2 rounded-full">
                  Partners &amp; Collaborators
                </span>
              </div>
            )}
          </div>

          {/* Segunda sección: Tag ABOUT, Descripción y mapeo de contactos */}
          <div className="bg-edgeBackground p-6 mb-16">
            {/* Tag ABOUT */}
            <div className="mb-4">
              <span className="inline-block text-edgeGreen text-sm font-bold uppercase">
                ABOUT
              </span>
            </div>
            <p className="text-gray-700 whitespace-pre-line mb-4 text-sm bg-edgeBackground">
              {location.description}
            </p>

            {/* Tag CONTACTS */}
            <div className="mb-2">
              <span className="inline-block text-edgeGreen text-sm font-bold uppercase">
                CONTACTS
              </span>
            </div>
            {/* Lista de contactos en flex-col */}
            <div className="flex flex-col gap-1">
              {contactEmailPairs.map(({ contact, email }, index) => (
                <span key={index} className="text-sm text-gray-700">
                  {contact} ({email})
                </span>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default BoothInfoSheet;
