import { motion, AnimatePresence, useMotionValue, animate } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { X } from "lucide-react";

const collapsedVH = 44; // 44vh
const maxVH = 84;       // 84vh

const BoothInfoSheet = ({ location, origin, onClose }) => {
  const containerRef = useRef(null);
  const height = useMotionValue(0);
  const startHeightRef = useRef(0);

  const [sheetState, setSheetState] = useState("closed");
  const [expandedPx, setExpandedPx] = useState(0);
  const [collapsedPx, setCollapsedPx] = useState(0);

  // 1) Inicializamos collapsedPx al montar
  useEffect(() => {
    const px = (window.innerHeight * collapsedVH) / 100;
    console.log("[Init] collapsedPx:", px);
    setCollapsedPx(px);
  }, []);

  // 2) Abrir/colapsar/expandir según location + origin
  useEffect(() => {
    let nextState;
    if (!location) {
      nextState = "closed";
    } else if (origin === "list") {
      nextState = "expanded";
    } else {
      nextState = "collapsed";
    }
    console.log("[State Change] location/origin →", { location: !!location, origin, nextState });
    setSheetState(nextState);
  }, [location, origin]);

  // 3) Cuando entramos en expanded, medimos contenido
  useEffect(() => {
    console.log("[Effect] sheetState changed to", sheetState);
    if (sheetState === "expanded" && containerRef.current) {
      containerRef.current.style.height = "auto";
      const measured = containerRef.current.scrollHeight;
      console.log("[Measure] expanded content height:", measured);
      setExpandedPx(measured);
      containerRef.current.style.height = `${height.get()}px`;
    }
  }, [sheetState, location]);

  // 4) Animamos el motion.value `height` al cambiar sheetState
  useEffect(() => {
    let target;
    if (sheetState === "closed") target = 0;
    else if (sheetState === "collapsed") target = collapsedPx;
    else target = expandedPx || (window.innerHeight * maxVH) / 100;

    console.log("[Animate] from", height.get(), "to target", target, "for state", sheetState);
    animate(height, target, { duration: 0.4, ease: "easeInOut" });
  }, [sheetState, collapsedPx, expandedPx]);

  // 5) Handlers de drag
  const onDragStart = (_event, info) => {
    startHeightRef.current = height.get();
    console.log("[Drag Start] startHeight:", startHeightRef.current);
  };
  const onDragEnd = (_event, info) => {
    const deltaY = info.offset.y;
    const projected = startHeightRef.current - deltaY;
    console.log("[Drag End] deltaY:", deltaY, "projectedHeight:", projected);

    const options = [
      { state: "closed",    value: 0 },
      { state: "collapsed", value: collapsedPx },
      { state: "expanded",  value: expandedPx || (window.innerHeight * maxVH) / 100 },
    ];
    const nearest = options.reduce((prev, curr) =>
      Math.abs(curr.value - projected) < Math.abs(prev.value - projected) ? curr : prev
    );
    console.log("[Snap] nearest state:", nearest.state, "at value:", nearest.value);
    setSheetState(nearest.state);
  };

  if (!location) return null;

  // parse contactos/emails…
  const contacts = location.contacts?.split(",").map(c => c.trim()) || [];
  const emails   = location.emails?.split(",").map(e => e.trim())  || [];
  const contactEmailPairs = contacts.map((c, i) => ({ contact: c, email: emails[i] || "" }));

  return (
    <AnimatePresence>
      <motion.div
        key={location.boothId}
        ref={containerRef}
        style={{ height, overflow: "hidden", maxHeight: `${maxVH}vh` }}
        className="
          absolute bottom-0 left-0 w-full
          bg-white shadow-lg border-t
          rounded-t-2xl z-50
        "
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.2}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        initial={{ height: 0 }}
        exit={{ height: 0 }}
      >
        {/* Botón de Cerrar */}
        <div className="flex justify-end px-4 py-4 pb-2">
          <button
            onClick={() => {
              console.log("[Close] user clicked close");
              setSheetState("closed");
              setTimeout(onClose, 400);
            }}
            className="flex items-center justify-center rounded-full bg-edgeText w-8 h-8 hover:bg-gray-600"
            aria-label="Cerrar"
          >
            <X size={16} color="white" />
          </button>
        </div>

        {/* Contenido */}
        <div
          className={`
            ${sheetState === "expanded" ? "overflow-y-auto" : "overflow-hidden"}
            pb-14
          `}
          style={{ height: "calc(100% - 56px)" }}
        >
          {/* Sección principal */}
          <div className="flex flex-col gap-2 mb-4 px-6">
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
                Technology Leaders &amp; Partners
              </span>
            )}
          </div>

          {/* ABOUT */}
          <div className="bg-edgeBackground py-6 px-6">
            <span className="inline-block text-edgeGreen text-sm font-bold uppercase mb-2">
              ABOUT
            </span>
            <p className="text-gray-700 whitespace-pre-line text-sm">
              {location.description}
            </p>
          </div>

          {/* CONTACTS */}
          {contactEmailPairs.length > 0 && (
            <div className="bg-edgeText py-6 px-6 space-y-2">
              <span className="inline-block text-edgeGreen text-sm font-bold uppercase mb-2">
                CONTACTS
              </span>
              <div className="flex flex-col gap-3">
                {contactEmailPairs.map(({ contact, email }, i) => (
                  <div
                    key={i}
                    className="flex items-center bg-white rounded-full px-4 py-2 shadow w-max"
                  >
                    <p className="text-sm text-edgeText flex gap-2 w-auto">
                      <span className="font-semibold">{contact}</span>
                      {email && (
                        <span className="text-gray-500">{email}</span>
                      )}
                    </p>
                  </div>
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
