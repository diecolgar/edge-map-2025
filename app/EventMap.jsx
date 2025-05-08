// EventMap.jsx
"use client";

import React, { useEffect, useState } from "react";
import {
  MapContainer,
  ImageOverlay,
  Marker,
  useMap,
  useMapEvents,
} from "react-leaflet";
import { CRS, LatLngBounds, divIcon } from "leaflet";
import "leaflet/dist/leaflet.css";

import TopBar from "./components/TopBar";
import BottomBar from "./components/BottomBar";
import BoothInfoSheet from "./components/BoothInfoSheet";
import ServiceInfoSheet from "./components/ServiceInfoSheet";
import TheatreInfoSheet from "./components/TheatreInfoSheet";
import BoothList from "./components/BoothList";
import LandingPage from "./components/LandingPage";
import Filters from "./components/Filters";

// Listener for zoom level changes
const ZoomListener = ({ setZoomLevel }) => {
  useMapEvents({
    zoomend: (e) => setZoomLevel(e.target.getZoom()),
  });
  return null;
};

// Fit the map view to given bounds
const FitToViewport = ({ bounds }) => {
  const map = useMap();
  useEffect(() => {
    if (!map || !bounds) return;
    map.setView(bounds.getCenter(), map.getBoundsZoom(bounds, false));
  }, [map, bounds]);
  return null;
};

// Fly to a specific position
const FocusOnLocation = ({ position }) => {
  const map = useMap();
  useEffect(() => {
    if (!map || !position) return;
    const half = 50;
    const area = new LatLngBounds(
      [position[0] - half, position[1] - half],
      [position[0] + half, position[1] + half]
    );
    map.flyToBounds(area, {
      animate: true,
      duration: 0.4,
      easeLinearity: 0.25,
    });
  }, [map, position]);
  return null;
};

// Render a custom booth icon with optional label
const renderBoothIcon = (id, name, zoomLevel) => {
  const showTitle = zoomLevel >= 2;
  const shortName = name.length > 25 ? name.slice(0, 25) + "…" : name;

  const html = `
    <div style="
      position: relative;
      width: auto;
      min-width: 60px;
      max-width: 100px;
      height: auto;
      border-radius: 4px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      font-family: 'BCGHenSans';
      font-weight: 700;
    ">
      <div style="
        font-size: 12px;
        font-weight: bold;
        color: #fff;
        pointer-events: none;
      ">${id.toUpperCase()}</div>

      <div style="
        min-width: 120px;
        font-size: 12px;
        font-weight: bold;
        color: #FFF;
        pointer-events: none;
        text-align: center;
        line-height: 1.1;
        transition: opacity 0.3s ease;
        opacity: ${showTitle ? 1 : 0};
        height: 1em;
      ">${shortName}</div>
    </div>
  `;

  return divIcon({
    html,
    iconSize: [60, 60],
    iconAnchor: [30, 10],
    className: "custom-icon",
  });
};

const EventMap = () => {
  const imageUrl = "/edge-map-def.png";
  const original = { width: 2560, height: 6064 };
  const aspect = original.width / original.height;

  // UI state
  const [showLanding, setShowLanding] = useState(true);
  const [activeView, setActiveView] = useState("map");
  const [showFilters, setShowFilters] = useState(false);

  // Map state
  const [bounds, setBounds] = useState(null);
  const [expandedBounds, setExpandedBounds] = useState(null);
  const [scaleFactor, setScaleFactor] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(0);

  // Data state
  const [locations, setLocations] = useState([]);
  const [scaledLocations, setScaledLocations] = useState([]);
  const [filteredLocations, setFilteredLocations] = useState([]);

  const [services, setServices] = useState([]);
  const [scaledServices, setScaledServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);

  // Selection state
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [locationOrigin, setLocationOrigin] = useState("map");
  const [selectedService, setSelectedService] = useState(null);
  const [selectedTheatre, setSelectedTheatre] = useState(null);

  // Search & “You are here”
  const [searchQuery, setSearchQuery] = useState("");
  const [youAreHere, setYouAreHere] = useState(null);

  // Filter state lifted from <Filters>
  const [filterActiveTypes, setFilterActiveTypes] = useState([]);
  const [filterSelections, setFilterSelections] = useState({});

  // Determine if we have any active search or filters
  const isFilteredView =
    searchQuery.trim() !== "" || filterActiveTypes.length > 0;

  // Apply filters callback
  const handleApplyFilters = (activeTypes, selections) => {
    setFilterActiveTypes(activeTypes);
    setFilterSelections(selections);
    setShowFilters(false);
  };

  // Load JSON
  useEffect(() => {
    fetch("/locations.json")
      .then((res) => res.json())
      .then(setLocations)
      .catch(console.error);
    fetch("/services.json")
      .then((res) => res.json())
      .then(setServices)
      .catch(console.error);
  }, []);

  // Compute bounds & scale
  useEffect(() => {
    const update = () => {
      if (typeof window === "undefined") return;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      let w, h;
      if (vw / vh > aspect) {
        h = vh;
        w = h * aspect;
      } else {
        w = vw;
        h = w / aspect;
      }
      const sf = Math.min(w / original.width, h / original.height);
      setScaleFactor(sf);

      const imageBounds = new LatLngBounds([0, 0], [h, w]);
      setBounds(imageBounds);

      const margin = 0.25;
      const expanded = new LatLngBounds(
        [-h * margin, -w * margin],
        [h * (1 + margin), w * (1 + margin)]
      );
      setExpandedBounds(expanded);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [aspect]);

  // “You are here” URL params
  useEffect(() => {
    if (!bounds) return;
    const params = new URLSearchParams(window.location.search);
    const xParam = parseFloat(params.get("x"));
    const yParam = parseFloat(params.get("y"));
    if (!isNaN(xParam) && !isNaN(yParam)) {
      setYouAreHere([
        (original.height - yParam) * scaleFactor,
        xParam * scaleFactor,
      ]);
    }
  }, [bounds, scaleFactor]);

  // Scale locations
  useEffect(() => {
    if (!bounds || !locations.length) return;
    const arr = locations.map((loc) => ({
      ...loc,
      position: [
        (original.height - loc.y) * scaleFactor,
        loc.x * scaleFactor,
      ],
      sectorjourneys: loc.sectorjourneys
        ?.split(",")
        .map((s) => s.trim()) || [],
      topicjourneys: loc.topicjourneys
        ?.split(",")
        .map((s) => s.trim()) || [],
      neighbourhood: loc.neighbourhood,
    }));
    setScaledLocations(arr);
  }, [bounds, locations, scaleFactor]);

  // Scale services
  useEffect(() => {
    if (!bounds || !services.length) return;
    const arr = services.map((svc) => ({
      ...svc,
      position: [
        (original.height - svc.y) * scaleFactor,
        svc.x * scaleFactor,
      ],
    }));
    setScaledServices(arr);
  }, [bounds, services, scaleFactor]);

  // Filter locations
  useEffect(() => {
    const stopWords = new Set([
      "the","of","for","a","an","to","in","on","and","is","are","at","with","by"
    ]);
    const normalize = (s) =>
      s.toLowerCase()
       .normalize("NFD")
       .replace(/[\u0300-\u036f]/g, "")
       .replace(/[^\w\s]/g, "")
       .trim();

    let results = scaledLocations;

    // Search filter
    if (searchQuery.trim()) {
      const q = normalize(searchQuery);
      const tokens = q.split(/\s+/).filter(t => t && !stopWords.has(t));
      results = results.filter(loc => {
        if (loc.boothId.toLowerCase().includes(q)) return true;
        const name = normalize(loc.name);
        return tokens.every(tok => name.includes(tok));
      });
    }

    // Topic filter
    const topics = filterSelections.topic || [];
    if (topics.length > 0 && !topics.includes("all_topics")) {
      results = results.filter(loc =>
        (loc.topicjourneys || []).some(t => topics.includes(t))
      );
    }

    // Sector filter
    const sectors = filterSelections.sector || [];
    if (sectors.length > 0 && !sectors.includes("all_sectors")) {
      results = results.filter(loc =>
        (loc.sectorjourneys || []).some(s => sectors.includes(s))
      );
    }

    // Neighbourhood filter
    const nbs = filterSelections.nb || [];
    if (nbs.length > 0 && !nbs.includes("all_nb")) {
      results = results.filter(loc =>
        nbs.includes((loc.neighbourhood || "").toLowerCase())
      );
    }

    setFilteredLocations(results);
  }, [scaledLocations, searchQuery, filterSelections]);

  // Always show services
  useEffect(() => {
    setFilteredServices(scaledServices);
  }, [scaledServices]);

  // Direct-link view
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const viewId = params.get("view");
    if (!viewId || !locations.length || !services.length) return;

    const booth = locations.find(
      (l) => l.boothId.toLowerCase() === viewId.toLowerCase()
    );
    if (booth) {
      setSelectedLocation(booth);
      setLocationOrigin("map");
      setShowLanding(false);
      return;
    }

    if (viewId.toLowerCase() === "th") {
      const theatre = services.find((s) => s.boothId === "th");
      if (theatre) {
        setSelectedTheatre(theatre);
        setShowLanding(false);
      }
      return;
    }

    const svc = services.find(
      (s) => s.boothId.toLowerCase() === viewId.toLowerCase()
    );
    if (svc) {
      setSelectedService(svc);
      setShowLanding(false);
    }
  }, [locations, services]);

  // "You are here" icon
  const youAreHereIcon = divIcon({
    html: `
      <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 30">
        <rect width="30" height="30" rx="15" fill="#21BF61"/>
        <path d="..." fill="white"/>
      </svg>
    `,
    className: "you-are-here-icon",
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });

  if (showLanding) {
    return <LandingPage onClose={() => setShowLanding(false)} />;
  }

  return (
    <div className="w-full flex justify-center">
      <div className="w-full max-w-[800px] h-dvh relative overflow-hidden bg-edgeBackground">
        <TopBar
          searchQuery={searchQuery}
          onSearch={setSearchQuery}
          onFilterClick={() => setShowFilters(true)}
          selectedFilters={filterActiveTypes}
          filterConfig={[
            { code: "topic", label: "Topic Journeys" },
            { code: "sector", label: "Sector Journeys" },
            { code: "nb", label: "Neighbourhoods" },
          ]}
        />

        <div
          className={`absolute inset-0 transition-opacity duration-300 ${
            activeView === "map"
              ? "opacity-100 z-10"
              : "opacity-0 pointer-events-none z-0"
          }`}
        >
          <MapContainer
            crs={CRS.Simple}
            style={{ width: "100%", height: "100%", zIndex: 10 }}
            maxZoom={2}
            maxBounds={expandedBounds}
            maxBoundsViscosity={1.0}
          >
            <FitToViewport bounds={bounds} />
            <ZoomListener setZoomLevel={setZoomLevel} />

            {/* Base map overlays */}
            <ImageOverlay
              url="/edge-map-general.png"
              bounds={bounds}
              zIndex={1001}
              opacity={zoomLevel < 1 ? 1 : 0}
            />
            <ImageOverlay url={imageUrl} bounds={bounds} opacity={1} zIndex={10} />

            {/* Highlights for filtered/search results */}
            {isFilteredView && filteredLocations.map((loc) => (
              <ImageOverlay
                key={`hl-${loc.boothId}`}
                url={loc.highlightUrl}
                bounds={bounds}
                opacity={1}
                zIndex={900}
                className="highlight-overlay"
              />
            ))}

            {/* Highlight for clicked booth */}
            {selectedLocation && (
              <ImageOverlay
                url={selectedLocation.highlightUrl}
                bounds={bounds}
                opacity={1}
                zIndex={1000}
              />
            )}

            {/* Location markers */}
            {zoomLevel >= 1 &&
              filteredLocations.map((loc) => (
                <Marker
                  key={loc.boothId}
                  position={loc.position}
                  icon={renderBoothIcon(loc.boothId, loc.name, zoomLevel)}
                  eventHandlers={{
                    click: () => {
                      setSelectedService(null);
                      setSelectedTheatre(null);
                      setSelectedLocation(loc);
                      setLocationOrigin("map");
                    },
                  }}
                />
              ))}

            {/* Service & theatre markers */}
            {zoomLevel >= 1 &&
              filteredServices.map((svc) => {
                const isTheatre = svc.boothId === "th";
                const icon = isTheatre
                  ? divIcon({
                      html: `
                        <div style="
                          position: relative;
                          display: flex;
                          flex-direction: column;
                          align-items: center;
                          transform: translate(-50%, -30%);
                        ">
                          <img src="${svc.iconUrl}" style="width:24px;height:24px;" />
                          <div style="
                            margin-top:2px;
                            font-family:'BCGHenSans';
                            font-size:10px;
                            font-weight:600;
                            color:#FFF;
                            text-align:center;
                            width:100px;
                          ">Micro-Theater</div>
                        </div>
                      `,
                      iconSize: [24, 36],
                      iconAnchor: [12, 18],
                    })
                  : divIcon({
                      html: `<img src="${svc.iconUrl}" style="width:24px;height:24px;" />`,
                      iconSize: [24, 24],
                      iconAnchor: [12, 12],
                    });
                return (
                  <Marker
                    key={svc.boothId}
                    position={svc.position}
                    icon={icon}
                    eventHandlers={{
                      click: () => {
                        setSelectedLocation(null);
                        if (isTheatre) {
                          setSelectedTheatre(svc);
                          setSelectedService(null);
                        } else {
                          setSelectedTheatre(null);
                          setSelectedService(svc);
                        }
                      },
                    }}
                  />
                );
              })}

            {/* "You are here" marker */}
            {youAreHere && (
              <Marker position={youAreHere} icon={youAreHereIcon} zIndexOffset={2000} />
            )}

            {/* Focus on selected */}
            {(selectedLocation || selectedService || selectedTheatre) && (
              <FocusOnLocation
                position={
                  selectedLocation?.position ||
                  selectedService?.position ||
                  selectedTheatre?.position
                }
              />
            )}
          </MapContainer>
        </div>

        {activeView === "list" && (
          <BoothList
            booths={filteredLocations}
            isSearching={isFilteredView}
            searchQuery={searchQuery}
            filterSelections={filterSelections}
            onSelect={(item) => {
              setSelectedLocation(null);
              setSelectedService(null);
              setSelectedTheatre(null);
              if (item === "th") {
                const th = services.find((s) => s.boothId === "th");
                if (th) setSelectedTheatre(th);
              } else if (item.type === "service") {
                setSelectedService(item);
              } else {
                setSelectedLocation(item);
              }
              setLocationOrigin("list");
            }}
          />
        )}

        <BottomBar
          activeView={activeView}
          onChangeView={(view) => {
            if (view === "list") {
              setSelectedLocation(null);
              setSelectedService(null);
              setSelectedTheatre(null);
            }
            setActiveView(view);
          }}
        />

        <BoothInfoSheet
          location={selectedLocation}
          origin={locationOrigin}
          onClose={() => setSelectedLocation(null)}
        />
        <ServiceInfoSheet
          service={selectedService}
          onClose={() => setSelectedService(null)}
        />
        <TheatreInfoSheet
          theatre={selectedTheatre}
          onClose={() => setSelectedTheatre(null)}
        />

        {showFilters && (
          <Filters
            activeTypes={filterActiveTypes}
            selections={filterSelections}
            onApply={handleApplyFilters}
            onClose={() => setShowFilters(false)}
          />
        )}
      </div>
    </div>
  );
};

export default EventMap;
