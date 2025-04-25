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
  const [youAreHere, setYouAreHere] = useState(null);

  // Load data
  useEffect(() => {
    fetch("/locations.json").then((res) => res.json()).then(setLocations).catch(console.error);
    fetch("/services.json").then((res) => res.json()).then(setServices).catch(console.error);
  }, []);

  // Calculate bounds & scale
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

  // Parse URL for You Are Here
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
      sectorjourneys: loc.sectorjourneys?.split(",").map((s) => s.trim()) || [],
    }));
    setScaledLocations(arr);
    setFilteredLocations(arr);
  }, [bounds, locations, scaleFactor]);

  // Filter by search
  useEffect(() => {
    setFilteredLocations(
      scaledLocations.filter((loc) => loc.name.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [searchQuery, scaledLocations]);

  // Scale services
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

  // You Are Here icon with inline SVG
  const youAreHereIcon = divIcon({
    html: `
<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 30" fill="none">
<rect width="30" height="30" rx="15" fill="#21BF61"/>
<path d="M7.96017 18.4629V15.9812L5.79782 12.2587H7.34887L8.69008 14.7495H8.70832L9.94004 12.2587H11.3451L9.28313 15.9812V18.4629H7.96017ZM17.6848 15.3334C17.6848 15.9173 17.6026 16.4161 17.4384 16.8297C17.2742 17.2433 17.0522 17.5809 16.7724 17.8425C16.4926 18.0979 16.1641 18.2865 15.787 18.4081C15.416 18.5298 15.0236 18.5906 14.61 18.5906C14.1964 18.5906 13.8041 18.5328 13.433 18.4173C13.062 18.2956 12.7336 18.104 12.4477 17.8425C12.1679 17.5809 11.9428 17.2464 11.7725 16.8388C11.6083 16.4313 11.5262 15.9386 11.5262 15.3608C11.5262 14.8012 11.6083 14.3176 11.7725 13.9101C11.9428 13.5026 12.1679 13.168 12.4477 12.9065C12.7275 12.6388 13.0529 12.4442 13.4239 12.3225C13.795 12.1948 14.1873 12.1309 14.6009 12.1309C15.0206 12.1309 15.416 12.1948 15.787 12.3225C16.158 12.4442 16.4835 12.6358 16.7633 12.8973C17.0491 13.1589 17.2742 13.4934 17.4384 13.901C17.6026 14.3024 17.6848 14.7799 17.6848 15.3334ZM16.2523 15.3699C16.2523 14.6461 16.1063 14.1047 15.8144 13.7459C15.5224 13.3809 15.121 13.1984 14.61 13.1984C14.0808 13.1984 13.6703 13.3809 13.3783 13.7459C13.0924 14.1047 12.9495 14.6461 12.9495 15.3699C12.9495 16.0998 13.0924 16.6412 13.3783 16.994C13.6703 17.3467 14.0808 17.5231 14.61 17.5231C15.121 17.5231 15.5224 17.3467 15.8144 16.994C16.1063 16.6412 16.2523 16.0998 16.2523 15.3699ZM24.1421 16.0086C24.1421 16.4526 24.0934 16.8388 23.9961 17.1673C23.8988 17.4897 23.7437 17.7573 23.5308 17.9702C23.324 18.177 23.0533 18.3321 22.7188 18.4355C22.3842 18.5389 21.9828 18.5906 21.5144 18.5906C21.0947 18.5906 20.7237 18.548 20.4013 18.4629C20.085 18.3838 19.8174 18.253 19.5984 18.0706C19.3794 17.882 19.2122 17.6387 19.0966 17.3407C18.9871 17.0365 18.9324 16.6685 18.9324 16.2367V12.2587H20.2553V16.1546C20.2553 16.6108 20.3527 16.9544 20.5473 17.1856C20.7419 17.4106 21.0765 17.5231 21.5509 17.5231C22.0254 17.5231 22.366 17.4136 22.5728 17.1947C22.7796 16.9696 22.883 16.6077 22.883 16.1089V12.2587H24.1421V16.0086Z" fill="white"/>
</svg>
    `,
    className: "you-are-here-icon",
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });

  return (
    <div className="w-full flex justify-center">
      <div className="w-full max-w-[800px] h-dvh relative overflow-hidden">
        <TopBar searchQuery={searchQuery} onSearch={setSearchQuery} />
        {/* MAP VIEW */}
        <div className={`absolute inset-0 transition-opacity duration-300 ${activeView === "map" ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
          <MapContainer crs={CRS.Simple} style={{ width: "100%", height: "100%", zIndex: 10 }} maxZoom={2}>
            <FitToViewport bounds={bounds} />
            <ZoomListener setZoomLevel={setZoomLevel} />
            <ImageOverlay url="/edge-map-general.png" bounds={bounds} zIndex={1001} opacity={zoomLevel < 1 ? 1 : 0} />
            <ImageOverlay url={imageUrl} bounds={bounds} opacity={1} zIndex={10} />
            {selectedLocation && <ImageOverlay url={selectedLocation.highlightUrl} bounds={bounds} opacity={1} zIndex={1000} />}
            {zoomLevel >= 1 && filteredLocations.map((loc) => (
              <Marker key={loc.boothId} position={loc.position} icon={renderBoothIcon(loc.boothId)} eventHandlers={{ click: () => { setSelectedService(null); setSelectedLocation(loc); } }} />
            ))}
            {zoomLevel >= 1 && scaledServices.map((svc) => (
              <Marker key={svc.boothId} position={svc.position} icon={divIcon({ html: `<img src=\"${svc.iconUrl}\" style=\"width:24px;height:24px;\" />`, iconSize: [24, 24], iconAnchor: [20,20], className: "bg-transparent" })} eventHandlers={{ click: () => { setSelectedLocation(null); setSelectedService(svc); } }} />
            ))}
            {youAreHere && <Marker position={youAreHere} icon={youAreHereIcon} zIndexOffset={2000} />}
            {(selectedLocation || selectedService) && <FocusOnLocation position={(selectedLocation || selectedService).position} />}
          </MapContainer>
        </div>
        {/* LIST VIEW */}
        {activeView === "list" && <BoothList booths={filteredLocations} onSelect={(loc) => { setSelectedService(null); setSelectedLocation(loc); }} />}
        <BottomBar activeView={activeView} onChangeView={(view) => { if (view === "list") { setSelectedLocation(null); setSelectedService(null); } setActiveView(view); }} />
        {/* INFO SHEETS */}
        <BoothInfoSheet location={selectedLocation} onClose={() => setSelectedLocation(null)} />
        <ServiceInfoSheet service={selectedService} onClose={() => setSelectedService(null)} />
      </div>
    </div>
  );
};

export default EventMap;
