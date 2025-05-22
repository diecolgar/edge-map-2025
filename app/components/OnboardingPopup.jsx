import React, { useState } from "react";
import { XIcon } from "lucide-react";

const OnboardingPopup = ({ onClose }) => {
  const steps = [
    {
      title: "How to navigate the app?",
      video: "/videos/Onboarding_Video1.mov",
      description: (
        <>
          <span className="text-2xl font-light">Pinch, zoom, and drag</span>
          <span className="font-bold text-2xl">to explore the map</span>
          <span className="mt-2 text-[#7E7D7C]">Move around effortlessly to find booths and key locations</span>
        </>
      ),
    },
    {
      title: "How to navigate the app?",
      video: "/videos/Onboarding_Video2.mov",
      description: (
        <>
          <span className="text-2xl font-light">Search or filter</span>
          <span className="font-bold text-2xl">to find key locations</span>
          <span className="mt-2 text-[#7E7D7C]">Refine results by topic, quickly find booths, and explore sector journeys</span>
        </>
      ),
    },
    {
      title: "How to navigate the app?",
      video: "/videos/Onboarding_Video3.mov",
      description: (
        <>
          <span className="text-2xl font-light">Tap on a booth</span>
          <span className="font-bold text-2xl">to learn more</span>
          <span className="mt-2 text-[#7E7D7C]">Dive into detailed information, industry insights, and connections</span>
        </>
      ),
    },
  ];

  const [current, setCurrent] = useState(0);
  const isFirst = current === 0;
  const isLast = current === steps.length - 1;

  const handleBackdropClick = () => onClose();
  const stopPropagation = e => e.stopPropagation();

  const Arrow = ({ left }) => (
    <svg
      width="7"
      height="12"
      viewBox="0 0 7 12"
      fill="none"
      className={left ? "transform rotate-180" : ""}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M1 10.5L5.5 6L1 1.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-[600] w-screen h-screen"
    >
        <div
          onClick={stopPropagation}
          className="relative bg-edgeBackground rounded-2xl p-6 max-w-md w-full mx-6 max-h-[80vh] overflow-y-auto"
        >
        <button
          aria-label="Close onboarding"
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
        >
          <XIcon size={20} />
        </button>

        <h3 className="text-sm font-semibold text-green-600 uppercase mb-4">
          {steps[current].title}
        </h3>

        <div className="bg-[#DFD7CC] rounded-lg mx-auto mb-4 flex aspect-square items-center justify-center overflow-hidden">
          <video
            src={steps[current].video}
            className="h-full w-full object-cover rounded-lg"
            muted
            loop
            autoPlay
            playsInline
          />
        </div>


        <div className="flex items-center justify-left space-x-2 mb-6">
          <span className="text-xs text-edgeGreen font-bold">
            {current + 1}/{steps.length}
          </span>
          <div className="flex space-x-1">
            {steps.map((_, i) => (
              <span
                key={i}
                className={`h-2 rounded-full ${i === current ? 'bg-green-600 w-6' : 'bg-edgeTextGray w-2'}`}
              />
            ))}
          </div>
        </div>

        <div className="flex flex-col mb-6 text-[#323232]">
          {steps[current].description}
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={() => !isFirst && setCurrent(current - 1)}
            disabled={isFirst}
            className="flex items-center gap-2 px-7 py-2 border border-green-600 text-green-600 rounded-lg disabled:opacity-50"
          >
            <Arrow left />
            <span className="font-bold">Back</span>
          </button>

          {isLast ? (
            <button
              onClick={onClose}
              className="flex items-center gap-2 px-7 py-2 bg-edgeText text-white rounded-lg"
            >
            <span className="ml-1 font-bold">Go to Map</span>
              <Arrow className="text-white font-bold" />
            </button>
          ) : (
            <button
              onClick={() => setCurrent(current + 1)}
              className="flex items-center gap-2 px-7 py-2 bg-green-600 text-white rounded-lg"
            >
            <span className="ml-1 font-bold">Next</span>
              <Arrow className="text-white font-bold" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OnboardingPopup;
