import {
  motion,
  AnimatePresence,
  useMotionValue,
  animate,
  useDragControls,
} from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { X } from "lucide-react";

const collapsedVH = 44;
const maxVH = 82;
const DRAG_THRESHOLD = 50;

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

  const getViewportHeight = () =>
    window.visualViewport?.height ?? window.innerHeight;

  useEffect(() => {
    const updateCollapsed = () => {
      const vh = getViewportHeight();
      setCollapsedPx((vh * collapsedVH) / 100);
    };
    updateCollapsed();
    window.visualViewport?.addEventListener("resize", updateCollapsed);
    window.addEventListener("resize", updateCollapsed);
    return () => {
      window.visualViewport?.removeEventListener("resize", updateCollapsed);
      window.removeEventListener("resize", updateCollapsed);
    };
  }, []);

  useEffect(() => {
    let nextState;
    if (!location) nextState = "closed";
    else if (origin === "list") nextState = "expanded";
    else nextState = "collapsed";
    setSheetState(nextState);
  }, [location, origin]);

  useEffect(() => {
    if (sheetState === "expanded" && containerRef.current) {
      containerRef.current.style.height = "auto";
      const measured = containerRef.current.scrollHeight;
      setExpandedPx(measured);
      containerRef.current.style.height = `${height.get()}px`;
    }
  }, [sheetState, location]);

  useEffect(() => {
    let target;
    if (sheetState === "closed") target = 0;
    else if (sheetState === "collapsed") target = collapsedPx;
    else target = expandedPx || (getViewportHeight() * maxVH) / 100;
    animate(height, target, { duration: 0.4, ease: "easeInOut" });
  }, [sheetState, collapsedPx, expandedPx]);

  const onDragStart = () => {
    startHeightRef.current = height.get();
  };

  const onDragEnd = (_e, info) => {
    const deltaY = info.offset.y;
    if (deltaY < -DRAG_THRESHOLD) {
      setSheetState("expanded");
      return;
    }
    if (deltaY > DRAG_THRESHOLD) {
      if (sheetState === "expanded") setSheetState("collapsed");
      else if (sheetState === "collapsed") {
        setSheetState("closed");
        setTimeout(onClose, 400);
      }
    }
  };

  const handleWheel = (e) => {
    if (
      sheetState === "expanded" &&
      scrollRef.current?.scrollTop === 0 &&
      e.deltaY < 0
    ) {
      setSheetState("collapsed");
    }
  };

  const handleTouchStart = (e) => {
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e) => {
    const diff = e.touches[0].clientY - touchStartYRef.current;
    if (
      sheetState === "expanded" &&
      scrollRef.current?.scrollTop === 0 &&
      diff > DRAG_THRESHOLD
    ) {
      setSheetState("collapsed");
    }
  };

  if (!location) return null;

  const disableScroll = sheetState === "collapsed";

  // Parse contacts string into name-email pairs
  const contactItems = location.contacts
    ?.split(",")
    .map((item) => item.trim()) || [];
  const contactEmailPairs = [];
  for (let i = 0; i < contactItems.length; i += 2) {
    const name = contactItems[i];
    const email = contactItems[i + 1] || "";
    contactEmailPairs.push({ contact: name, email });
  }

  const neighbourhoodKey = location.neighbourhood?.toLowerCase();
  const extension = neighbourhoodKey === "ai" ? "png" : "svg";

  // Click handler to copy to clipboard
  const handleCopy = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert(`Copied to clipboard: ${text}`);
    });
  };

  return (
    <AnimatePresence>
      <motion.div
        ref={containerRef}
        initial={false}
        style={{
          height,
          overflow: "hidden",
          maxHeight: `${maxVH}dvh`,
        }}
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

        {/* HANDLE */}
        <div
          onPointerDown={(e) => dragControls.start(e)}
          className="px-6 pt-6 pb-0 cursor-grab"
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <img
                src={`/nb-icons/${neighbourhoodKey}.${extension}`}
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
        </div>

        {/* CONTENIDO */}
        <div
          ref={scrollRef}
          onWheel={handleWheel}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          className={`relative ${disableScroll ? "overflow-hidden" : "overflow-y-auto"} overscroll-y-contain pb-14 select-none`}
          style={{
            height: "calc(100% - 56px)",
            WebkitOverflowScrolling: "touch",
            touchAction: "pan-y",
          }}
        >
          {/* Subtitle/tagline */}
          {location.subtitle && (
            <p className="text-base text-gray-500 mb-2 italic px-6">
              {location.subtitle}
            </p>
          )}

          {location.partner === "Y" && (
            <span className="inline-block bg-edgeBackground mb-4 ml-6 text-edgeText text-xs font-semibold px-4 py-2 rounded-full">
              Technology Leaders &amp; Partners
            </span>
          )}

          {/* ABOUT */}
          <div className="bg-edgeBackground py-6 px-6 select-none">
            <span className="inline-block text-edgeGreen text-sm font-bold uppercase mb-2">
              ABOUT
            </span>
            <p className="text-gray-700 whitespace-pre-line text-sm select-none">
              {location.description}
            </p>
          </div>

          {/* CONTACTS */}
          {contactEmailPairs.length > 0 && (
            <div className="bg-edgeText px-6 pt-6 pb-28 space-y-2">
              <span className="inline-block text-edgeGreen text-sm font-bold uppercase mb-2">
                CONTACTS
              </span>
              <div className="flex flex-col gap-3">
                {contactEmailPairs.map(({ contact, email }, i) => {
                  const textToCopy = email || contact;
                  return (
                    <div
                      key={i}
                      onClick={() => handleCopy(textToCopy)}
                      className="flex items-center bg-white rounded-full px-4 py-2 shadow w-max cursor-pointer hover:bg-gray-100"
                    >
                      <p className="flex items-center text-sm text-edgeText gap-2">
                        {/* <span className="font-semibold">{contact}</span> */}
                        {email && <span className="text-gray-500">{email}</span>}
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path
                            d="M7.5 3H14.6C16.8402 3 17.9603 3 18.816 3.43597C19.5686 3.81947 20.1805 4.43139 20.564 5.18404C21 6.03969 21 7.15979 21 9.4V16.5M6.2 21H14.3C15.4201 21 15.9802 21 16.408 20.782C16.7843 20.5903 17.0903 20.2843 17.282 19.908C17.5 19.4802 17.5 18.9201 17.5 17.8V9.7C17.5 8.57989 17.5 8.01984 17.282 7.59202C17.0903 7.21569 16.7843 6.90973 16.408 6.71799C15.9802 6.5 15.4201 6.5 14.3 6.5H6.2C5.0799 6.5 4.51984 6.5 4.09202 6.71799C3.71569 6.90973 3.40973 7.21569 3.21799 7.59202C3 8.01984 3 8.57989 3 9.7V17.8C3 18.9201 3 19.4802 3.21799 19.908C3.40973 20.2843 3.71569 20.5903 4.09202 20.782C4.51984 21 5.0799 21 6.2 21Z"
                            stroke="black"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default BoothInfoSheet;