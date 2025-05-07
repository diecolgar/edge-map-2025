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
const maxVH = 90;
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
        {/* HANDLE */}
        <div
          onPointerDown={(e) => dragControls.start(e)}
          className="px-6 pt-6 pb-0 cursor-grab"
        >
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-edgeText">Micro Theatre</h2>
            <button
              onClick={() => {
                setSheetState("closed");
                setTimeout(onClose, 400);
              }}
              className="flex items-center justify-center rounded-full bg-edgeText w-8 h-8 hover:bg-gray-600"
              aria-label="Close"
            >
              <X size={16} color="white" />
            </button>
          </div>
        </div>

        {/* CONTENIDO */}
        <div
          ref={scrollRef}
          onWheel={handleWheel}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          className={`relative px-6 pb-20 pt-4 text-sm text-gray-700 ${
            disableScroll ? "overflow-hidden" : "overflow-y-auto"
          }`}
          style={{
            height: "calc(100% - 56px)",
            WebkitOverflowScrolling: "touch",
            touchAction: "pan-y",
          }}
        >
          <div className="flex flex-col gap-6">
            <div>
              <h3 className="text-xl font-bold text-edgeText">
                Booth Title, 60 characters max, lorem ipsum dolor sit am
              </h3>
              <p className="text-gray-500 italic mt-1">
                Booth Tagline, 80 characters max, lorem ipsum dolor sit amet,
                consectetu
              </p>
            </div>

            <div>
              <h4 className="text-sm font-bold text-edgeText uppercase mb-2">
                Agenda
              </h4>

              <div className="space-y-6">
                <div>
                  <p className="text-edgeGreen font-semibold text-sm">
                    00:00 PM
                  </p>
                  <h5 className="font-bold mt-1">Talk Title</h5>
                  <p className="text-sm text-gray-700 mb-2">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    Expo lorem ipsum dolor sit amet.
                  </p>
                  <div className="flex flex-col gap-2">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 bg-white rounded-full shadow px-3 py-1 w-max"
                      >
                        <img
                          src="/speaker-placeholder.jpg"
                          alt="Speaker"
                          className="w-6 h-6 rounded-full"
                        />
                        <p className="text-sm text-edgeText">
                          <span className="font-semibold">Name Surname</span>,
                          Role, Company
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <p className="text-edgeGreen font-bold uppercase text-sm">
                    30-Minute Break
                  </p>
                </div>

                <div>
                  <p className="text-edgeGreen font-semibold text-sm">
                    00:00 PM
                  </p>
                  <h5 className="font-bold mt-1">Talk Title</h5>
                  <p className="text-sm text-gray-700 mb-2">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    Expo lorem ipsum dolor sit amet.
                  </p>
                  <div className="flex flex-col gap-2">
                    {[1, 2].map((i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 bg-white rounded-full shadow px-3 py-1 w-max"
                      >
                        <img
                          src="/speaker-placeholder.jpg"
                          alt="Speaker"
                          className="w-6 h-6 rounded-full"
                        />
                        <p className="text-sm text-edgeText">
                          <span className="font-semibold">Name Surname</span>,
                          Role, Company
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {[1, 2, 3].map((i) => (
                  <div key={i} className="border-t pt-4">
                    <p className="text-edgeGreen font-semibold text-sm">
                      00:00 PM
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Smooth Fade */}
        <AnimatePresence>
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
                  "linear-gradient(to top, #fff 60%, rgba(255, 255, 255, 0))",
              }}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
};

export default TheatreInfoSheet;
