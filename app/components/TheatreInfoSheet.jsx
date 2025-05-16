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

const collapsedVH = 44;
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
    if (!theatre) {
      setSheetState("closed");
    } else {
      setSheetState("collapsed");
    }
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

  const showFade = sheetState === "collapsed";
  const disableScroll = sheetState === "collapsed";

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
        className="absolute bottom-0 left-0 w-full bg-edgeText shadow-lg rounded-t-2xl z-50"
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
          className="px-6 pt-6 pb-1 cursor-grab"
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

        {/* CONTENT */}
        <div
          ref={scrollRef}
          onWheel={handleWheel}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          className={`relative pb-20 pt-1 text-sm text-gray-700 ${
            disableScroll ? "overflow-hidden" : "overflow-y-auto"
          }`}
          style={{
            height: "calc(100% - 56px)",
            WebkitOverflowScrolling: "touch",
            touchAction: "pan-y",
          }}
        >
          <div className="flex flex-col">
            {/* Header */}
            <div className="px-6 pb-6 pt-2 flex flex-col gap-4">
              <h3 className="text-2xl font-bold text-white">
                10 minute talks on our centrally located Micro-theater stage
              </h3>
              <div className="flex flex-col">
                <p className="text-gray-300 italic">
                  Discover the full agenda and join us
                </p>
                <p className="text-sm text-white">
                  <span className="font-semibold">Wednesday, May 28</span> | 12:30pm – 3:00pm
                </p>
              </div>

            </div>

            <div className="bg-white px-6 py-6 pb-2 space-y-1">
              <p className="uppercase text-gray-400 font-bold text-sm">Agenda</p>
            </div>


            {/* Agenda */}
            <div className="bg-white divide-y divide-gray-200">
            {agenda.map((item, index) => {
  const isBreak = item.type === "break";
  const isOpen = openIndex === index;

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
          {/* Header */}
          <button
            onClick={() => setOpenIndex((prev) => (prev === index ? null : index))}
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
                <svg
                  width="14"
                  height="9"
                  viewBox="0 0 14 9"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M1.5 1.75L7 7.25L12.5 1.75"
                    stroke="#21BF61"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </motion.div>
            </div>
          </button>

          {/* Content */}
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
                  <p className="text-sm text-gray-700 italic px-6">
                    {item.subtitle}
                  </p>
                )}
                <div className="flex flex-col gap-2 mt-2 mb-4 px-6 pb-6">
                  {item.speakers.map((speaker, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 bg-white rounded-full shadow px-3 py-1 w-max"
                    >
                      <img
                        src="/speaker-placeholder.jpg"
                        alt={speaker}
                        className="w-6 h-6 rounded-full"
                      />
                      <p className="text-sm text-edgeText font-medium">
                        {speaker}
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

        {/* Smooth Fade */}
        {/* <AnimatePresence>
          {showFade && (
            <motion.div
              key="fade"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="absolute bottom-0 left-0 w-full h-40 pointer-events-none"
              style={{
                background:
                  "linear-gradient(to top, #323232 60%, rgba(23, 23, 23, 0))",
              }}
            />
          )}
        </AnimatePresence> */}
      </motion.div>
    </AnimatePresence>
  );
};

export default TheatreInfoSheet;
