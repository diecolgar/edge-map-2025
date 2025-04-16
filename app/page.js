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

// Zoom listener
const ZoomListener = ({ setZoomLevel }) => {
  useMapEvents({
    zoomend: (e) => {
      const zoom = e.target.getZoom();
      console.log("Zoom level:", zoom); // 👈 aquí va el console log
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
    <div style="position: relative; width: 40px; height: 40px; display: flex; justify-content: center; align-items: center;">
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
    iconAnchor: [30, 20],
    className: "custom-icon",
  });
};

const EventMap = () => {
  const imageUrl = "/edge-map-def.png";
  const imageOriginalSize = { width: 2560, height: 6064 };
  const aspectRatio = imageOriginalSize.width / imageOriginalSize.height;

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
    window.addEventListener("resize", updateBounds);
    return () => window.removeEventListener("resize", updateBounds);
  }, [aspectRatio]);

  useEffect(() => {
    if (!bounds || locations.length === 0) return;

    const newLocations = locations.map((loc) => ({
      ...loc,
      position: [loc.position[0] * scaleFactor, loc.position[1] * scaleFactor],
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
      <div className="w-full max-w-[800px] h-screen relative overflow-hidden">
        {/* 🔝 TopBar */}
        <TopBar searchQuery={searchQuery} onSearch={setSearchQuery} />

        {/* 🗺️ Mapa */}
        {bounds && (
          <MapContainer
            crs={CRS.Simple}
            style={{ width: "100%", height: "100%", zIndex: 10 }}
            maxBounds={bounds}
            maxBoundsViscosity={1.0}
            zoom={1}
            zoomSnap={0.5} // 👈 Permite valores decimales
          >
            <FitToViewport bounds={bounds} />
            <ZoomListener setZoomLevel={setZoomLevel} />

            {/* Imagen general por encima de todo */}
            <ImageOverlay
              url="/edge-map-general.png"
              bounds={bounds}
              zIndex={1001}
              className="fade-transition"
              opacity={zoomLevel < 1 ? 1 : 0}
            />



            {/* Imagen detallada, debajo de la general si está activa */}
            <ImageOverlay
              url={imageUrl}
              bounds={bounds}
              opacity={1}
              zIndex={10}
            />

            {/* Imagen de highlight si aplica */}
            {selectedLocation?.highlightUrl && (
              <ImageOverlay
                url={selectedLocation.highlightUrl}
                bounds={bounds}
                opacity={1}
                zIndex={1000}
              />
            )}

            {/* Booths solo si zoom >= 2 */}
            {zoomLevel >= 1 &&
              filteredLocations.map((location) => (
                <Marker
                  key={location.id}
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

            {/* Centrado en selección */}
            {selectedLocation && (
              <FocusOnLocation position={selectedLocation.position} />
            )}
          </MapContainer>
        )}

        {/* 🔻 BottomBar */}
        <BottomBar />

        {/* 🧾 Info Sheet */}
        <BoothInfoSheet
          location={selectedLocation}
          onClose={() => setSelectedLocation(null)}
        />
      </div>
    </div>
  );
};

export default EventMap;
