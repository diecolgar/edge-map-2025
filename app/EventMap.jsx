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
import LandingPage from "./components/LandingPage";

// Listener para cambios de zoom
const ZoomListener = ({ setZoomLevel }) => {
  useMapEvents({
    zoomend: (e) => setZoomLevel(e.target.getZoom()),
  });
  return null;
};

// Ajusta el mapa para encajar los bounds iniciales
const FitToViewport = ({ bounds }) => {
  const map = useMap();
  useEffect(() => {
    if (!map || !bounds) return;
    map.setView(bounds.getCenter(), map.getBoundsZoom(bounds, false));
  }, [map, bounds]);
  return null;
};

// Cuando seleccionas un marcador, centra suavemente el área alrededor
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

// Genera el icono para los booths
const renderBoothIcon = (id) => {
  const html = `
    <div style="
      position: relative;
      width: 40px;
      height: 40px;
      display: flex;
      justify-content: center;
      align-items: center;
      transform: translate(-45%, -40%);
      font-family: 'BCGHenSans';
      font-weight: 700;
    ">
      <div style="
        font-size: 12px;
        font-weight: bold;
        color: #fff;
        pointer-events: none;
      ">${id.toUpperCase()}</div>
    </div>
  `;
  return divIcon({
    html,
    iconSize: [40, 40],
    iconAnchor: [1, 1],
    className: "custom-icon",
  });
};

const EventMap = () => {
  const imageUrl = "/edge-map-def.png";
  const original = { width: 2560, height: 6064 };
  const aspect = original.width / original.height;

  // Estado para mostrar LandingPage
  const [showLanding, setShowLanding] = useState(true);

  const [activeView, setActiveView] = useState("map");
  const [bounds, setBounds] = useState(null);
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

  const [searchQuery, setSearchQuery] = useState("");
  const [youAreHere, setYouAreHere] = useState(null);

  // Carga datos de booths y servicios
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

  // Calcula bounds y scale factor según tamaño de ventana
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

  // Maneja parámetro ?x & ?y para mostrar "You Are Here"
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

  // Escala y prepara locations
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

  // Filtra por búsqueda
  useEffect(() => {
    setFilteredLocations(
      scaledLocations.filter((loc) =>
        loc.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [searchQuery, scaledLocations]);

  // Escala servicios
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

  // Icono para "You Are Here"
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

  // Si la landing sigue activa, sólo mostramos ella
  if (showLanding) {
    return <LandingPage onClose={() => setShowLanding(false)} />;
  }

  // Una vez cerrada la landing, montamos el resto de la app
  return (
    <div className="w-full flex justify-center">
      <div className="w-full max-w-[800px] h-dvh relative overflow-hidden">
        {/* TopBar */}
        <TopBar searchQuery={searchQuery} onSearch={setSearchQuery} />

        {/* MAP VIEW */}
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

            {/* Booth markers */}
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
                      setLocationOrigin("map");
                    },
                  }}
                />
              ))}

            {/* Service markers */}
            {zoomLevel >= 1 &&
              scaledServices.map((svc) => {
                const icon =
                  svc.boothId === "th"
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
                        className: "",
                      })
                    : divIcon({
                        html: `<img src="${svc.iconUrl}" style="width:24px;height:24px;" />`,
                        iconSize: [24, 24],
                        iconAnchor: [12, 12],
                        className: "",
                      });

                return (
                  <Marker
                    key={svc.boothId}
                    position={svc.position}
                    icon={icon}
                    eventHandlers={{
                      click: () => {
                        setSelectedLocation(null);
                        setSelectedService(svc);
                      },
                    }}
                  />
                );
              })}

            {/* "You Are Here" */}
            {youAreHere && (
              <Marker
                position={youAreHere}
                icon={youAreHereIcon}
                zIndexOffset={2000}
              />
            )}

            {/* Centrar en selección */}
            {(selectedLocation || selectedService) && (
              <FocusOnLocation
                position={(selectedLocation || selectedService).position}
              />
            )}
          </MapContainer>
        </div>

        {/* LIST VIEW */}
        {activeView === "list" && (
          <BoothList
            booths={filteredLocations}
            onSelect={(item) => {
              setSelectedLocation(null);
              setSelectedService(null);

              if (typeof item === "string") {
                const svc = services.find((s) => s.boothId === item);
                if (svc) setSelectedService(svc);
              } else if (item.type === "service") {
                setSelectedService(item);
              } else {
                setSelectedLocation(item);
              }
              setLocationOrigin("list");
            }}
          />
        )}

        {/* BottomBar */}
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

        {/* Info Sheets */}
        <BoothInfoSheet
          location={selectedLocation}
          origin={locationOrigin}
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
