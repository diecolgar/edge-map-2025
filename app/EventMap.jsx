"use client";

import { useEffect, useState } from "react";
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

// Listener para cambios de zoom
const ZoomListener = ({ setZoomLevel }) => {
  useMapEvents({
    zoomend: (e) => setZoomLevel(e.target.getZoom()),
  });
  return null;
};

const FitToViewport = ({ bounds }) => {
  const map = useMap();
  useEffect(() => {
    if (!map || !bounds) return;
    map.setView(bounds.getCenter(), map.getBoundsZoom(bounds, false));
  }, [map, bounds]);
  return null;
};

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

  const [showLanding, setShowLanding] = useState(true);
  const [activeView, setActiveView] = useState("map");
  const [bounds, setBounds] = useState(null);
  const [expandedBounds, setExpandedBounds] = useState(null);
  const [scaleFactor, setScaleFactor] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(0);

  const [locations, setLocations] = useState([]);
  const [scaledLocations, setScaledLocations] = useState([]);
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [locationOrigin, setLocationOrigin] = useState("map");

  const [services, setServices] = useState([]);
  const [scaledServices, setScaledServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);

  const [selectedTheatre, setSelectedTheatre] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [youAreHere, setYouAreHere] = useState(null);

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
      const expandedBounds = new LatLngBounds(
        [-h * margin, -w * margin],
        [h * (1 + margin), w * (1 + margin)]
      );
      setExpandedBounds(expandedBounds);
    };

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [aspect]);

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
    }));
    setScaledLocations(arr);
    setFilteredLocations(arr);
  }, [bounds, locations, scaleFactor]);

  useEffect(() => {
    const stopWords = new Set([
      "the", "of", "for", "a", "an", "to", "in", "on", "and", "is", "are", "at", "with", "by"
    ]);
  
    const normalizeText = (str) =>
      str
        .toLowerCase()
        .normalize("NFD") // separa tildes (é → e +  ́)
        .replace(/[\u0300-\u036f]/g, "") // elimina tildes
        .replace(/[^\w\s]/g, "") // elimina signos/puntuación
        .trim();
  
    const query = normalizeText(searchQuery);
    if (!query) {
      setFilteredLocations(scaledLocations);
      return;
    }
  
    const tokens = query
      .split(/\s+/)
      .filter((token) => token && !stopWords.has(token));
  
    const matches = scaledLocations.filter((loc) => {
      const name = normalizeText(loc.name);
      const boothId = loc.boothId.toLowerCase();
  
      if (boothId.includes(query)) return true;
      return tokens.every((token) => name.includes(token));
    });
  
    setFilteredLocations(matches);
  }, [searchQuery, scaledLocations]);
  
  

  useEffect(() => {
    if (!bounds || !services.length) return;
    setScaledServices(
      services.map((svc) => ({
        ...svc,
        position: [
          (original.height - svc.y) * scaleFactor,
          svc.x * scaleFactor,
        ],
      }))
    );
  }, [bounds, services, scaleFactor]);

  // Handle view param (e.g. ?view=theatre or ?view=AI12)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const viewId = params.get("view");

    if (!viewId || !locations.length || !services.length) return;

    const booth = locations.find((l) => l.boothId.toLowerCase() === viewId.toLowerCase());
    if (booth) {
      setSelectedLocation(booth);
      setLocationOrigin("map");
      setShowLanding(false);
      return;
    }

    if (viewId.toLowerCase() === "theatre" || viewId.toLowerCase() === "th") {
      const theatre = services.find((s) => s.boothId === "th");
      if (theatre) {
        setSelectedTheatre(theatre);
        setShowLanding(false);
      }
      return;
    }

    const service = services.find((s) => s.boothId.toLowerCase() === viewId.toLowerCase());
    if (service) {
      setSelectedService(service);
      setShowLanding(false);
    }
  }, [locations, services]);

  const youAreHereIcon = divIcon({
    html: `
<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 30" fill="none">
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
        <TopBar searchQuery={searchQuery} onSearch={setSearchQuery} />

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

            <ImageOverlay
              url="/edge-map-general.png"
              bounds={bounds}
              zIndex={1001}
              opacity={zoomLevel < 1 ? 1 : 0}
            />
            <ImageOverlay
              url={imageUrl}
              bounds={bounds}
              opacity={1}
              zIndex={10}
            />
            {selectedLocation && (
              <ImageOverlay
                url={selectedLocation.highlightUrl}
                bounds={bounds}
                opacity={1}
                zIndex={1000}
              />
            )}

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

            {zoomLevel >= 1 &&
              scaledServices.map((svc) => {
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
                          <img
                            src="${svc.iconUrl}"
                            style="width:24px; height:24px; pointer-events: none;"
                          />
                          <div style="
                            margin-top: 2px;
                            font-family: 'BCGHenSans', sans-serif;
                            font-size: 10px;
                            font-weight: 600;
                            color: #FFF;
                            pointer-events: none;
                            width: 100px;
                            text-align: center;
                          ">
                            Micro-Theater
                          </div>
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
                        setSelectedService(null);
                        setSelectedTheatre(
                          svc.boothId === "th" ? svc : null
                        );
                      },
                    }}
                  />
                );
              })}

            {youAreHere && (
              <Marker
                position={youAreHere}
                icon={youAreHereIcon}
                zIndexOffset={2000}
              />
            )}

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
            isSearching={searchQuery.trim().length > 0}
            onSelect={(item) => {
              setSelectedLocation(null);
              setSelectedService(null);
              setSelectedTheatre(null);

              if (typeof item === "string" && item === "th") {
                const theatre = services.find((s) => s.boothId === "th");
                if (theatre) setSelectedTheatre(theatre);
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
      </div>
    </div>
  );
};

export default EventMap;
