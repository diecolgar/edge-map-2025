"use client";

import {
  motion,
  AnimatePresence,
  useMotionValue,
  animate,
  useDragControls,
} from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { X } from "lucide-react";

const collapsedVH = 24;
const maxVH = 82;
const DRAG_THRESHOLD = 50;

const TheatreInfoSheet = ({ theatre, onClose }) => {
  const containerRef = useRef(null);
  const scrollRef = useRef(null);
  const height = useMotionValue(0);
  const startHeightRef = useRef(0);
  const touchStartYRef = useRef(0);
  const dragControls = useDragControls();

  const [sheetState, setSheetState] = useState("closed");
  const [expandedPx, setExpandedPx] = useState(0);
  const [collapsedPx, setCollapsedPx] = useState(0);
  const [agenda, setAgenda] = useState([]);
  const [openIndex, setOpenIndex] = useState(null);

  const getViewportHeight = () =>
    window.visualViewport?.height ?? window.innerHeight;

  const isDesktop = () => window.innerWidth >= 1024;
  
  const handleCopy = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      // ✅ simple feedback (reemplaza con toast si usas uno)
      alert(`Copied to clipboard: ${text}`);
    });
  };
  

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
      if (!theatre) {
        setSheetState("closed");
        return;
      }

      if (isDesktop()) {
        setSheetState("expanded");
      } else {
        setSheetState("collapsed");
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [theatre]);

  useEffect(() => {
    if (sheetState === "expanded" && containerRef.current) {
      containerRef.current.style.height = "auto";
      const measured = containerRef.current.scrollHeight;
      setExpandedPx(measured);
      containerRef.current.style.height = `${height.get()}px`;
    }
  }, [sheetState, theatre]);

  useEffect(() => {
    if (isDesktop()) {
      height.set("auto");
      return;
    }

    let target;
    if (sheetState === "closed") {
      target = 0;
    } else if (sheetState === "collapsed") {
      target = collapsedPx;
    } else {
      target = expandedPx || (getViewportHeight() * maxVH) / 100;
    }

    animate(height, target, { duration: 0.4, ease: "easeInOut" });
  }, [sheetState, collapsedPx, expandedPx]);

  useEffect(() => {
    fetch("/agenda.json")
      .then((res) => res.json())
      .then(setAgenda)
      .catch(console.error);
  }, []);

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
      if (sheetState === "expanded") {
        setSheetState("collapsed");
      } else if (sheetState === "collapsed") {
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

  if (!theatre) return null;

  const disableScroll = sheetState === "collapsed";

  return (
    <AnimatePresence>
      <motion.div
        ref={containerRef}
        initial={false}
        style={{
          height,
          overflow: isDesktop() ? "auto" : "hidden",
          maxHeight: isDesktop() ? "80vh" : `${maxVH}dvh`,
        }}
        className={`absolute bottom-0 z-50 bg-edgeText shadow-lg ${
          isDesktop()
            ? "right-0 w-[400px] mr-14 mb-24 rounded-3xl"
            : "left-0 w-full rounded-t-2xl"
        }`}
        drag={!isDesktop() ? "y" : false}
        dragControls={dragControls}
        dragListener={false}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.2}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        exit={{ height: 0 }}
      >
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-gray-300 rounded-full lg:hidden" />

        <div
          onPointerDown={(e) => !isDesktop() && dragControls.start(e)}
          className={`px-6 pt-6 pb-2 ${isDesktop() ? "cursor-default" : "cursor-grab"}`}
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-[#989898] font-bold uppercase">
              <img src="/services/theatre.svg" alt="Micro-Theatre Icon" className="w-5 h-5" />
              Micro-theater
            </div>
            <button
              onClick={() => {
                setSheetState("closed");
                setTimeout(onClose, 400);
              }}
              className="flex items-center justify-center rounded-full bg-edgeText w-8 h-8 border border-gray-600 hover:bg-gray-600"
              aria-label="Close"
            >
              <X size={16} color="white" />
            </button>
          </div>
        </div>

        <div
          ref={scrollRef}
          onWheel={handleWheel}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          className={`relative pb-20 lg:pb-0 pt-1 text-sm text-gray-700 ${
            disableScroll ? "overflow-hidden" : "overflow-y-auto"
          }`}
          style={{
            height: "calc(100% - 56px)",
            WebkitOverflowScrolling: "touch",
            touchAction: "pan-y",
          }}
        >
          <div className="flex flex-col">
            <div className="px-6 pb-6 pt-2 flex flex-col gap-4">
              <h3 className="text-2xl font-bold text-white">
                10 minute talks on our centrally located Micro-theater stage
              </h3>
              <div className="flex flex-col">
                <p className="text-gray-300 italic">Discover the full agenda and join us</p>
                <p className="text-sm text-white">
                  <span className="font-semibold">Wednesday, May 28</span> | 12:30pm – 3:00pm
                </p>
              </div>
            </div>

            <div className="bg-white px-6 py-6 pb-2 space-y-1">
              <p className="uppercase text-gray-400 font-bold text-sm">Agenda</p>
            </div>

            <div className="bg-white divide-y divide-gray-200">
              {agenda.map((item, index) => {
                const isBreak = item.type === "break";
                const isOpen = openIndex === index;

                // Parse speakers string into structured objects
                let speakerEntries = [];
                if (item.speakers && typeof item.speakers === "string") {
                  const raw = item.speakers.split(",").map(s => s.trim());
                  for (let i = 0; i < raw.length; i += 3) {
                    speakerEntries.push({
                      name: raw[i],
                      email: raw[i + 1] || "",
                      img: raw[i + 2] || "",
                    });
                  }
                }

                return (
                  <div key={index}>
                    {isBreak ? (
                      <div className="bg-[#F3F0EB]">
                        <p className="text-edgeGreen font-bold text-sm px-6 py-2">
                          {item.title.toUpperCase()}
                        </p>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() =>
                            setOpenIndex((prev) => (prev === index ? null : index))
                          }
                          className="w-full text-left"
                        >
                          <div className="flex items-start justify-between gap-2 py-4 px-6">
                            <div>
                              <p className="text-edgeGreen font-semibold text-sm">{item.time}</p>
                              <h5 className="font-bold text-sm mt-1">{item.title}</h5>
                            </div>
                            <motion.div
                              animate={{ rotate: isOpen ? 180 : 0 }}
                              transition={{ duration: 0.2 }}
                              className="text-edgeGreen mt-1"
                            >
                              <svg width="14" height="9" viewBox="0 0 14 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M1.5 1.75L7 7.25L12.5 1.75" stroke="#21BF61" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </motion.div>
                          </div>
                        </button>

                        <AnimatePresence initial={false}>
                          {isOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3, ease: "easeInOut" }}
                              className="overflow-hidden space-y-2"
                            >
                              {item.subtitle && (
                                <p className="text-sm text-gray-700 italic px-6">{item.subtitle}</p>
                              )}
                              <div className="flex flex-col gap-2 mt-4 mb-4 px-6 pb-6">
                                {speakerEntries.map((sp, i) => (
                                  <div
                                    key={i}
                                    onClick={() => handleCopy(sp.email)}
                                    className="flex items-center bg-white rounded-full pr-4 shadow w-max cursor-pointer hover:bg-gray-100"
                                  >
                                    <p className="flex items-center text-sm text-edgeText gap-4">
                                      {sp.img && (
                                        <img
                                          src={`/contact-pics/${sp.img}`}
                                          alt={sp.name}
                                          className="w-8 h-8 rounded-full object-cover"
                                          onError={(e) => (e.target.style.display = "none")}
                                        />
                                      )}
                                      <span className="font-semibold">{sp.name}</span>
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="20"
                                        height="16"
                                        viewBox="0 0 20 16"
                                        fill="none"
                                      >
                                        <path
                                          d="M17.917 12.9997L12.3813 7.99968M7.61937 7.99968L2.08369 12.9997M1.66699 3.83301L8.47109 8.59588C9.02207 8.98156 9.29756 9.1744 9.59721 9.2491C9.8619 9.31508 10.1387 9.31508 10.4034 9.2491C10.7031 9.1744 10.9786 8.98156 11.5296 8.59588L18.3337 3.83301M5.66699 14.6663H14.3337C15.7338 14.6663 16.4339 14.6663 16.9686 14.3939C17.439 14.1542 17.8215 13.7717 18.0612 13.3013C18.3337 12.7665 18.3337 12.0665 18.3337 10.6663V5.33301C18.3337 3.93288 18.3337 3.23281 18.0612 2.69803C17.8215 2.22763 17.439 1.84517 16.9686 1.60549C16.4339 1.33301 15.7338 1.33301 14.3337 1.33301L5.66699 1.33301C4.26686 1.33301 3.5668 1.33301 3.03202 1.60549C2.56161 1.84517 2.17916 2.22763 1.93948 2.69803C1.66699 3.23281 1.66699 3.93288 1.66699 5.33301L1.66699 10.6663C1.66699 12.0665 1.66699 12.7665 1.93948 13.3013C2.17916 13.7717 2.56161 14.1542 3.03202 14.3939C3.5668 14.6663 4.26686 14.6663 5.66699 14.6663Z"
                                          stroke="#21BF61"
                                          strokeWidth="1.5"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                        />
                                      </svg>

                                    </p>
                                  </div>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default TheatreInfoSheet;
