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
import BoothList from "./components/BoothList";

const ZoomListener = ({ setZoomLevel }) => {
  useMapEvents({
    zoomend: (e) => {
      setZoomLevel(e.target.getZoom());
    },
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
    map.flyToBounds(area, { animate: true, duration: 0.4, easeLinearity: 0.25 });
  }, [map, position]);
  return null;
};

const renderBoothIcon = (id) => {
  const html = `
    <div style="
      position: relative;
      width: 40px;
      height: 40px;
      display: flex;
      justify-content: center;
      align-items: center;
      transform: translate(-40%, -40%);
      font-family: 'BCGHenSans';
    ">
      <div style="
        font-size: 12px;
        font-weight: bold;
        color: #fff;
        pointer-events: none;
      ">${id.toUpperCase()}</div>
    </div>
  `;
  return divIcon({ html, iconSize: [40, 40], iconAnchor: [1, 1], className: "custom-icon" });
};

const EventMap = () => {
  const imageUrl = "/edge-map-def.png";
  const original = { width: 2560, height: 6064 };
  const aspect = original.width / original.height;

  const [activeView, setActiveView] = useState("map");
  const [bounds, setBounds] = useState(null);
  const [scaleFactor, setScaleFactor] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(0);

  const [locations, setLocations] = useState([]);
  const [scaledLocations, setScaledLocations] = useState([]);
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);

  const [services, setServices] = useState([]);
  const [scaledServices, setScaledServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");

  // Carga de datos
  useEffect(() => {
    fetch("/locations.json")
      .then((res) => res.json())
      .then(setLocations)
      .catch((e) => console.error("Error cargando locations.json:", e));

    fetch("/services.json")
      .then((res) => res.json())
      .then(setServices)
      .catch((e) => console.error("Error cargando services.json:", e));
  }, []);

  // Ajuste de bounds y scale
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
      setBounds(new LatLngBounds([0, 0], [h, w]));
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [aspect]);

  // Escalado de locations
  useEffect(() => {
    if (!bounds || !locations.length) return;
    const arr = locations.map((loc) => ({
      ...loc,
      position: [
        (original.height - loc.y) * scaleFactor,
        loc.x * scaleFactor,
      ],
      sectorjourneys: loc.sectorjourneys
        ? loc.sectorjourneys.split(",").map((s) => s.trim())
        : [],
    }));
    setScaledLocations(arr);
    setFilteredLocations(arr);
  }, [bounds, locations, scaleFactor]);

  // Filtrado por búsqueda
  useEffect(() => {
    setFilteredLocations(
      scaledLocations.filter((loc) =>
        loc.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [searchQuery, scaledLocations]);

  // Escalado de services
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

  return (
    <div className="w-full flex justify-center">
      <div className="w-full max-w-[800px] h-dvh relative overflow-hidden">
        <TopBar searchQuery={searchQuery} onSearch={setSearchQuery} />

        {/* MAP VIEW */}
        <div
          className={`absolute inset-0 transition-opacity duration-300 ${
            activeView === "map"
              ? "opacity-100"
              : "opacity-0 pointer-events-none"
          }`}
        >
          <MapContainer
            crs={CRS.Simple}
            style={{ width: "100%", height: "100%", zIndex: 10 }}
            maxZoom={2}
          >
            <FitToViewport bounds={bounds} />
            <ZoomListener setZoomLevel={setZoomLevel} />

            <ImageOverlay
              url="/edge-map-general.png"
              bounds={bounds}
              zIndex={1001}
              opacity={zoomLevel < 1 ? 1 : 0}
            />
            <ImageOverlay url={imageUrl} bounds={bounds} opacity={1} zIndex={10} />

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
                  icon={renderBoothIcon(loc.boothId)}
                  eventHandlers={{
                    click: () => {
                      setSelectedService(null);
                      setSelectedLocation(loc);
                    },
                  }}
                />
              ))}

            {zoomLevel >= 1 &&
              scaledServices.map((svc) => (
                <Marker
                  key={svc.boothId}
                  position={svc.position}
                  icon={divIcon({
                    html: `<img src="${svc.iconUrl}" style="width:24px;height:24px;" />`,
                    iconSize: [24, 24],
                    iconAnchor: [20, 20],
                    className: "p-0 bg-transparent border-none shadow-none",
                  })}
                  eventHandlers={{
                    click: () => {
                      setSelectedLocation(null);
                      setSelectedService(svc);
                    },
                  }}
                />
              ))}

            {(selectedLocation || selectedService) && (
              <FocusOnLocation
                position={
                  (selectedLocation || selectedService).position
                }
              />
            )}
          </MapContainer>
        </div>

        {/* LIST VIEW */}
        {activeView === "list" && (
          <BoothList
            booths={filteredLocations}
            onSelect={(loc) => {
              setSelectedService(null);
              setSelectedLocation(loc);
            }}
          />
        )}

        <BottomBar
          activeView={activeView}
          onChangeView={(view) => {
            if (view === "list") {
              setSelectedLocation(null);
              setSelectedService(null);
            }
            setActiveView(view);
          }}
        />

        {/* INFO SHEETS */}
        <BoothInfoSheet
          location={selectedLocation}
          onClose={() => setSelectedLocation(null)}
        />
        <ServiceInfoSheet
          service={selectedService}
          onClose={() => setSelectedService(null)}
        />
      </div>
    </div>
  );
};

export default EventMap;
