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

  const isDesktop = () => window.innerWidth >= 1024;

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
    const handleResize = () => {
      if (!location) {
        setSheetState("closed");
        return;
      }

      if (isDesktop()) {
        setSheetState("expanded");
      } else {
        if (origin === "list") setSheetState("expanded");
        else setSheetState("collapsed");
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
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
    if (isDesktop()) {
      height.set("auto");
      return;
    }

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
    if (isDesktop()) return;

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

  const contactItems = location.contacts?.split(",").map((item) => item.trim()) || [];
  const contactEmailPairs = [];
  for (let i = 0; i < contactItems.length; i += 2) {
    const name = contactItems[i];
    const email = contactItems[i + 1] || "";
    contactEmailPairs.push({ contact: name, email });
  }

  const neighbourhoodKey = location.neighbourhood?.toLowerCase();
  const extension = neighbourhoodKey === "ai" ? "png" : "svg";

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
          overflow: isDesktop() ? "auto" : "hidden",
          maxHeight: isDesktop() ? "none" : `${maxVH}dvh`,
        }}
        className={`absolute bottom-0 w-full max-w-[800px] bg-white shadow-lg border-t rounded-t-2xl z-50
           lg:border-t-0 lg:right-0 lg:w-[400px]  lg:mr-14 lg:mb-24 lg:max-w-none lg:rounded-3xl`}
        drag={!isDesktop() ? "y" : false}
        dragControls={dragControls}
        dragListener={false}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.2}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        exit={{ height: 0 }}
      >
        {/* Barrita visual - ocultar en desktop */}
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-gray-300 rounded-full lg:hidden" />

        {/* Handle para drag */}
        <div
          onPointerDown={(e) => !isDesktop() && dragControls.start(e)}
          className="px-6 pt-6 pb-0 cursor-grab lg:cursor-default"
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
          className={`relative ${disableScroll ? "overflow-hidden" : "overflow-y-auto"} overscroll-y-contain pb-14 lg:pb-0 select-none`}
          style={{
            height: "calc(100% - 56px)",
            WebkitOverflowScrolling: "touch",
            touchAction: "pan-y",
          }}
        >
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

          <div className="bg-edgeBackground py-6 px-6 select-none">
            <span className="inline-block text-edgeGreen text-sm font-bold uppercase mb-2">
              ABOUT
            </span>
            <p className="text-gray-700 whitespace-pre-line text-sm select-none">
              {location.description}
            </p>
          </div>

          {contactEmailPairs.length > 0 && (
            <div className="bg-edgeText px-6 pt-6 pb-24 lg:pb-12 space-y-2">
              <span className="inline-block text-edgeGreen text-sm font-bold uppercase mb-2">
                CONTACTS
              </span>
              <div className="flex flex-col gap-3">
                {contactEmailPairs.map(({ contact, email }, i) => {
                  const textToCopy = email || contact;
                  let imageSrc = null;
                  if (email.includes("@")) {
                    const localPart = email.split("@")[0];
                    if (localPart.includes(".")) {
                      const [apellido, nombre] = localPart.split(".");
                      if (nombre && apellido) {
                        const formatted =
                          nombre.charAt(0).toUpperCase() +
                          nombre.slice(1) +
                          "-" +
                          apellido.charAt(0).toUpperCase() +
                          apellido.slice(1);
                        imageSrc = `/contact-pics/${formatted}.png`;
                      }
                    } else {
                      imageSrc = `/contact-pics/${localPart}.png`;
                    }
                  }

                  return (
                    <div
                      key={i}
                      onClick={() => handleCopy(textToCopy)}
                      className={`flex items-center bg-white rounded-full pr-4 shadow w-max cursor-pointer hover:bg-gray-100 ${!imageSrc ? "p-2" : ""}`}
                    >
                      <p className="flex items-center text-sm text-edgeText gap-4">
                        {imageSrc && (
                          <img
                            src={imageSrc}
                            alt={contact}
                            className="w-8 h-8 rounded-full object-cover"
                            onError={(e) => (e.target.style.display = "none")}
                          />
                        )}
                        <span className="font-semibold">{contact}</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="12" viewBox="0 0 20 16" fill="none">
                          <path d="M17.917 12.9997L12.3813 7.99968M7.61937 7.99968L2.08369 12.9997M1.66699 3.83301L8.47109 8.59588C9.02207 8.98156 9.29756 9.1744 9.59721 9.2491C9.8619 9.31508 10.1387 9.31508 10.4034 9.2491C10.7031 9.1744 10.9786 8.98156 11.5296 8.59588L18.3337 3.83301M5.66699 14.6663H14.3337C15.7338 14.6663 16.4339 14.6663 16.9686 14.3939C17.439 14.1542 17.8215 13.7717 18.0612 13.3013C18.3337 12.7665 18.3337 12.0665 18.3337 10.6663V5.33301C18.3337 3.93288 18.3337 3.23281 18.0612 2.69803C17.8215 2.22763 17.439 1.84517 16.9686 1.60549C16.4339 1.33301 15.7338 1.33301 14.3337 1.33301L5.66699 1.33301C4.26686 1.33301 3.5668 1.33301 3.03202 1.60549C2.56161 1.84517 2.17916 2.22763 1.93948 2.69803C1.66699 3.23281 1.66699 3.93288 1.66699 5.33301L1.66699 10.6663C1.66699 12.0665 1.66699 12.7665 1.93948 13.3013C2.17916 13.7717 2.56161 14.1542 3.03202 14.3939C3.5668 14.6663 4.26686 14.6663 5.66699 14.6663Z" stroke="#21BF61" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
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
