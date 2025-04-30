import { motion, AnimatePresence, useMotionValue, animate, useDragControls } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { X } from "lucide-react";

const collapsedVH = 44; // 44vh
const maxVH = 84;       // 84vh
const DRAG_THRESHOLD = 50; // px necesario para cambiar de estado

const BoothInfoSheet = ({ location, origin, onClose }) => {
  const containerRef = useRef(null);
  const scrollRef = useRef(null);
  const height = useMotionValue(0);
  const startHeightRef = useRef(0);
  const touchStartYRef = useRef(0);
  const dragControls = useDragControls();

  const [sheetState, setSheetState] = useState("closed");
  const [expandedPx, setExpandedPx] = useState(0);
  const [collapsedPx, setCollapsedPx] = useState(0);

  // 1) Inicializamos collapsedPx al montar
  useEffect(() => {
    const px = (window.innerHeight * collapsedVH) / 100;
    setCollapsedPx(px);
  }, []);

  // 2) Abrir/colapsar/expandir según location + origin
  useEffect(() => {
    let nextState;
    if (!location) nextState = "closed";
    else if (origin === "list") nextState = "expanded";
    else nextState = "collapsed";
    setSheetState(nextState);
  }, [location, origin]);

  // 3) Cuando entramos en expanded, medimos contenido
  useEffect(() => {
    if (sheetState === "expanded" && containerRef.current) {
      containerRef.current.style.height = "auto";
      const measured = containerRef.current.scrollHeight;
      setExpandedPx(measured);
      containerRef.current.style.height = `${height.get()}px`;
    }
  }, [sheetState, location]);

  // 4) Animamos la altura según sheetState
  useEffect(() => {
    let target;
    if (sheetState === "closed")         target = 0;
    else if (sheetState === "collapsed") target = collapsedPx;
    else                                 target = expandedPx || (window.innerHeight * maxVH) / 100;
    animate(height, target, { duration: 0.4, ease: "easeInOut" });
  }, [sheetState, collapsedPx, expandedPx]);

  // 5) Handlers de drag con umbral
  const onDragStart = (_e, _info) => {
    startHeightRef.current = height.get();
  };
  const onDragEnd = (_e, info) => {
    const deltaY = info.offset.y;
    if (deltaY < -DRAG_THRESHOLD) {
      setSheetState("expanded");
      return;
    }
    if (deltaY > DRAG_THRESHOLD) {
      if (sheetState === "expanded") {
        setSheetState("collapsed");
      } else if (sheetState === "collapsed") {
        setSheetState("closed");
        setTimeout(onClose, 400);
      }
    }
  };

  // 6) Detectar “pull down” en contenido al tope
  const handleWheel = (e) => {
    if (sheetState === "expanded" && scrollRef.current?.scrollTop === 0 && e.deltaY < 0) {
      setSheetState("collapsed");
    }
  };
  const handleTouchStart = (e) => {
    touchStartYRef.current = e.touches[0].clientY;
  };
  const handleTouchMove = (e) => {
    const diff = e.touches[0].clientY - touchStartYRef.current;
    if (sheetState === "expanded" && scrollRef.current?.scrollTop === 0 && diff > DRAG_THRESHOLD) {
      setSheetState("collapsed");
    }
  };

  if (!location) return null;

  // parse contactos/emails
  const contacts = location.contacts?.split(",").map(c => c.trim()) || [];
  const emails   = location.emails?.split(",").map(e => e.trim()) || [];
  const contactEmailPairs = contacts.map((c, i) => ({ contact: c, email: emails[i] || "" }));

  return (
    <AnimatePresence>
      <motion.div
        ref={containerRef}
        initial={false}
        style={{ height, overflow: "hidden", maxHeight: `${maxVH}vh` }}
        className="absolute bottom-0 left-0 w-full bg-white shadow-lg border-t rounded-t-2xl z-50"
        drag="y"
        dragControls={dragControls}
        dragListener={false}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.2}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        exit={{ height: 0 }}
      >
        {/* Barrita visual */}
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-gray-300 rounded-full" />

        {/* HANDLE: zona superior donde activamos el drag */}
        <div
          onPointerDown={(e) => dragControls.start(e)}
          className="px-6 pt-6 pb-2 cursor-grab"
        >
          <div className="flex justify-between items-center">
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
          <h2 className="text-xl font-bold mt-2 mb-2 text-edgeText">
            {location.name}
          </h2>
          {location.partner === "Y" && (
            <span className="inline-block bg-edgeBackground text-edgeText text-xs font-semibold px-4 py-2 rounded-full">
              Technology Leaders &amp; Partners
            </span>
          )}
        </div>

        {/* CONTENIDO (scrollable) */}
        <div
          ref={scrollRef}
          onWheel={handleWheel}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          className={`
            ${sheetState === "expanded"
              ? "overflow-y-auto overscroll-y-contain select-text"
              : "overflow-hidden select-none"
            } pb-14
          `}
          style={{
            height: "calc(100% - 56px)",
            overscrollBehavior: "contain",       // permite scroll interno y bloquea rebote externo
            WebkitOverflowScrolling: "touch",    // momentum en iOS
            touchAction: "pan-y",                // deja pasar gestures de scroll
          }}
        >
          {/* Subtitle/tagline en zona scrolleable */}
          {location.subtitle && (
            <p className="text-base text-gray-500 mb-4 italic px-6">
              {location.subtitle}
            </p>
          )}

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
            <div className="bg-edgeText px-6 pt-6 pb-20 space-y-2">
              <span className="inline-block text-edgeGreen text-sm font-bold uppercase mb-2">
                CONTACTS
              </span>
              <div className="flex flex-col gap-3">
                {contactEmailPairs.map(({ contact, email }, i) => (
                  <div
                    key={i}
                    className="flex items-center bg-white rounded-full px-4 py-2 shadow w-max"
                  >
                    <p className="text-sm text-edgeText flex gap-2">
                      <span className="font-semibold">{contact}</span>
                      {email && <span className="text-gray-500">{email}</span>}
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
