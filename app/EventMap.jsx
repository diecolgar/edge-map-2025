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
import BoothList from "./components/BoothList";

const ZoomListener = ({ setZoomLevel }) => {
  useMapEvents({
    zoomend: (e) => {
      const zoom = e.target.getZoom();
      console.log("Zoom level:", zoom);
      setZoomLevel(zoom);
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
    if (!position || !map) return;
    const halfSize = 50;
    const areaBounds = new LatLngBounds(
      [position[0] - halfSize, position[1] - halfSize],
      [position[0] + halfSize, position[1] + halfSize]
    );
    map.flyToBounds(areaBounds, {
      animate: true,
      duration: 0.4,
      easeLinearity: 0.25,
    });
  }, [position, map]);
  return null;
};

const renderIcon = (boothId, name, zoom) => {
  const content = `
    <div style="position: relative; width: 40px; height: 40px; display: flex; justify-content: center; align-items: center; transform: translate(-40%, -40%);">
      <div style="
        font-size: 12px;
        font-weight: bold;
        color: #fff;
        pointer-events: none;
      ">
        ${boothId.toUpperCase()}
      </div>
    </div>
  `;
  return divIcon({
    html: content,
    iconSize: [40, 40],
    iconAnchor: [1, 1],
    className: "custom-icon",
  });
};

const EventMap = () => {
  const imageUrl = "/edge-map-def.png";
  const imageOriginalSize = { width: 2560, height: 6064 };
  const aspectRatio = imageOriginalSize.width / imageOriginalSize.height;

  const [activeView, setActiveView] = useState("map");
  const [bounds, setBounds] = useState(null);
  const [scaleFactor, setScaleFactor] = useState(1);
  const [locations, setLocations] = useState([]);
  const [scaledLocations, setScaledLocations] = useState([]);
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [zoomLevel, setZoomLevel] = useState(0);

  useEffect(() => {
    fetch("/locations.json")
      .then((res) => res.json())
      .then((data) => setLocations(data))
      .catch((error) => console.error("Error cargando locations.json:", error));
  }, []);

  useEffect(() => {
    const updateBounds = () => {
      if (typeof window === "undefined") return;
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      let width, height;
      if (vw / vh > aspectRatio) {
        height = vh;
        width = height * aspectRatio;
      } else {
        width = vw;
        height = width / aspectRatio;
      }

      const scaleX = width / imageOriginalSize.width;
      const scaleY = height / imageOriginalSize.height;
      const newScaleFactor = Math.min(scaleX, scaleY);

      setScaleFactor(newScaleFactor);
      setBounds(new LatLngBounds([0, 0], [height, width]));
    };

    updateBounds();
    if (typeof window !== "undefined") {
      window.addEventListener("resize", updateBounds);
      return () => window.removeEventListener("resize", updateBounds);
    }
  }, [aspectRatio]);

  useEffect(() => {
    if (!bounds || locations.length === 0) return;
    const newLocations = locations.map((loc) => ({
      ...loc,
      // Ahora usamos loc.x y loc.y, y convertimos la posición:
      position: [
        (imageOriginalSize.height - loc.y) * scaleFactor,
        loc.x * scaleFactor,
      ],
      // Si deseas, puedes convertir sectorjourneys (string) a un array, por ejemplo:
      sectorjourneys: loc.sectorjourneys
        ? loc.sectorjourneys.split(",").map((s) => s.trim())
        : [],
    }));
    setScaledLocations(newLocations);
    setFilteredLocations(newLocations);
  }, [bounds, locations, scaleFactor]);

  useEffect(() => {
    const filtered = scaledLocations.filter((loc) =>
      loc.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredLocations(filtered);
  }, [searchQuery, scaledLocations]);

  return (
    <div className="w-full flex justify-center">
      <div className="w-full max-w-[800px] h-dvh relative overflow-hidden">
        <TopBar searchQuery={searchQuery} onSearch={setSearchQuery} />

        {/* Ejemplo: mostramos un contador de booths */}
        <div className="absolute top-0 left-0 m-4 z-50 bg-white p-2 rounded shadow">
          {filteredLocations.length} booths
        </div>

        {activeView === "map" && bounds && (
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
              className="fade-transition"
              opacity={zoomLevel < 1 ? 1 : 0}
            />
            <ImageOverlay url={imageUrl} bounds={bounds} opacity={1} zIndex={10} />

            {selectedLocation?.highlightUrl && (
              <ImageOverlay
                url={selectedLocation.highlightUrl}
                bounds={bounds}
                opacity={1}
                zIndex={1000}
              />
            )}

            {zoomLevel >= 1 &&
              filteredLocations.map((location) => (
                <Marker
                  // Usamos location.boothId como clave, ya que el JSON actualizado no tiene "id"
                  key={location.boothId}
                  position={location.position}
                  icon={renderIcon(
                    location.boothId || location.id,
                    location.name,
                    zoomLevel
                  )}
                  eventHandlers={{
                    click: () => setSelectedLocation(location),
                  }}
                />
              ))}

            {selectedLocation && (
              <FocusOnLocation position={selectedLocation.position} />
            )}
          </MapContainer>
        )}

        {activeView === "list" && (
          <BoothList booths={filteredLocations} onSelect={setSelectedLocation} />
        )}

        <BottomBar activeView={activeView} onChangeView={setActiveView} />

        <BoothInfoSheet
          location={selectedLocation}
          onClose={() => setSelectedLocation(null)}
        />
      </div>
    </div>
  );
};

export default EventMap;
