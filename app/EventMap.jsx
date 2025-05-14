// EventMap.jsx
"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  MapContainer,
  ImageOverlay,
  Marker,
  Pane,
  Rectangle,
  useMap,
  useMapEvents,
  ZoomControl
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
  useMapEvents({ zoomend: e => setZoomLevel(e.target.getZoom()) });
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
    map.flyToBounds(area, { animate: true, duration: 0.4, easeLinearity: 0.25 });
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
      min-width: 60px; max-width: 100px;
      border-radius: 4px;
      display: flex; flex-direction: column; align-items: center;
      font-family: 'BCGHenSans'; font-weight: 700;
    ">
      <div style="font-size:12px;color:#fff;pointer-events:none;">
        ${id.toUpperCase()}
      </div>
      <div style="
        min-width:120px;font-size:12px;color: white; text-shadow: 1px 1px 2px black; text-align:center;
        line-height:1.1;transition:opacity 0.3s ease;
        opacity:${showTitle?1:0};height:1em;
      ">
        ${shortName}
      </div>
    </div>
  `;
  return divIcon({ html, iconSize: [60,60], iconAnchor: [30,10], className: "custom-icon" });
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

  // Filters state
  const [filterActiveTypes, setFilterActiveTypes] = useState([]);
  const [filterSelections, setFilterSelections] = useState({});
  const isFilteredView = searchQuery.trim() !== "" || filterActiveTypes.length > 0;

  const handleApplyFilters = (activeTypes, selections) => {
    setFilterActiveTypes(activeTypes);
    setFilterSelections(selections);
    setShowFilters(false);
  };

  // Load data
  useEffect(() => {
    fetch("/locations.json").then(r => r.json()).then(setLocations).catch(console.error);
    fetch("/services.json").then(r => r.json()).then(setServices).catch(console.error);
  }, []);

  // Compute bounds & scale
  useEffect(() => {
    const update = () => {
      if (typeof window === "undefined") return;
      const vw = window.innerWidth, vh = window.innerHeight;
      let w, h;
      if (vw/vh > aspect) { h = vh; w = h*aspect; }
      else { w = vw; h = w/aspect; }
      const sf = Math.min(w/original.width, h/original.height);
      setScaleFactor(sf);

      const b = new LatLngBounds([0,0],[h,w]);
      setBounds(b);
      setExpandedBounds(new LatLngBounds([-h*0.25,-w*0.25],[h*1.25,w*1.25]));
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [aspect]);

  // 1) Define overview zones
// Definición de todas las zonas con posición manual para la etiqueta
const overviewZones = useMemo(() => {
  if (!bounds) return [];

  const rawZones = [
    {
      id: "zone1",               // FS
      bounds: [
        [(original.height - 200) * scaleFactor,  100 * scaleFactor],
        [(original.height - 1800) * scaleFactor, 1200 * scaleFactor]
      ],
      zoomLevel: 1,
      labelPosition: [
        (original.height - 580) * scaleFactor,
        540 * scaleFactor
      ]
    },
    {
      id: "zone2",               // CE
      bounds: [
        [(original.height - 1900) * scaleFactor, 700 * scaleFactor],
        [(original.height - 2500) * scaleFactor, 1800 * scaleFactor]
      ],
      zoomLevel: 1,
      labelPosition: [
        (original.height - 1940) * scaleFactor,
        1170 * scaleFactor
      ]
    },
    {
      id: "zone3",               // OP
      bounds: [
        [(original.height - 2700) * scaleFactor, 250 * scaleFactor],
        [(original.height - 4200) * scaleFactor, 1200 * scaleFactor]
      ],
      zoomLevel: 1,
      labelPosition: [
        (original.height - 3300) * scaleFactor,
        620 * scaleFactor
      ]
    },
    {
      id: "zone4",               // SP
      bounds: [
        [(original.height - 2900) * scaleFactor, 1200 * scaleFactor],
        [(original.height - 4200) * scaleFactor, 2400 * scaleFactor]
      ],
      zoomLevel: 1,
      labelPosition: [
        (original.height - 3050) * scaleFactor,
        1600 * scaleFactor
      ]
    },
    {
      id: "zone5",               // TD
      bounds: [
        [(original.height - 4200) * scaleFactor, 1200 * scaleFactor],
        [(original.height - 5800) * scaleFactor, 2400 * scaleFactor]
      ],
      zoomLevel: 1,
      labelPosition: [
        (original.height - 4750) * scaleFactor,
        1840 * scaleFactor
      ]
    },
    {
      id: "zoneMicroTheatre",     // Micro-Theatre
      bounds: [
        [(original.height - 2900) * scaleFactor, 1200 * scaleFactor],
        [(original.height - 2550) * scaleFactor, 1800 * scaleFactor]
      ],
      zoomLevel: 1,
      openTheatre: true,
    }
  ];

  return rawZones.map((zone) => {
    const [[swLat, swLng], [neLat, neLng]] = zone.bounds;
    return {
      ...zone,
      // calculamos target por si lo quieres usar también
      target: [(swLat + neLat) / 2, (swLng + neLng) / 2]
    };
  });
}, [bounds, scaleFactor, original.height]);


  // 2’) Simplified counts by neighbourhood
  const zoneCounts = useMemo(() => {
    // primero, agrupo todos los booths filtrados por neighbourhood
    const countsByNb = filteredLocations.reduce((acc, loc) => {
      const nb = loc.neighbourhood?.toUpperCase() || "UNKNOWN";
      acc[nb] = (acc[nb] || 0) + 1;
      return acc;
    }, {});

    // luego mapeo cada zona a su código de neighbourhood
    return {
      zone1: countsByNb.FS || 0,  // FS
      zone2: countsByNb.CE || 0,  // CE
      zone3: countsByNb.OP || 0,  // OP
      zone4: countsByNb.SP || 0,  // SP
      zone5: countsByNb.TD || 0,  // TD
      // microTheatre no necesita conteo
    };
  }, [filteredLocations]);


  // “You are here” URL params
  useEffect(() => {
    if (!bounds) return;
    const p = new URLSearchParams(window.location.search);
    const x = parseFloat(p.get("x")), y = parseFloat(p.get("y"));
    if (!isNaN(x)&&!isNaN(y)) {
      setYouAreHere([(original.height-y)*scaleFactor, x*scaleFactor]);
    }
  }, [bounds, scaleFactor]);

  // Scale locations
  useEffect(() => {
    if (!bounds||!locations.length) return;
    setScaledLocations(locations.map(loc => ({
      ...loc,
      position: [(original.height-loc.y)*scaleFactor, loc.x*scaleFactor],
      sectorjourneys: loc.sectorjourneys?.split(",").map(s=>s.trim())||[],
      topicjourneys: loc.topicjourneys?.split(",").map(s=>s.trim())||[],
      neighbourhood: loc.neighbourhood
    })));
  }, [bounds, locations, scaleFactor]);

  // Scale services
  useEffect(() => {
    if (!bounds||!services.length) return;
    setScaledServices(services.map(svc=>({
      ...svc,
      position: [(original.height-svc.y)*scaleFactor, svc.x*scaleFactor]
    })));
  }, [bounds, services, scaleFactor]);

  // Filter locations
  useEffect(() => {
    const stop = new Set(["the","of","for","a","an","to","in","on","and","is","are","at","with","by"]);
    const normalize = s => s.toLowerCase().normalize("NFD")
      .replace(/[\u0300-\u036f]/g,"").replace(/[^\w\s]/g,"").trim();
    let res = scaledLocations;
    if (searchQuery.trim()) {
      const q = normalize(searchQuery), toks=q.split(/\s+/).filter(t=>t&&!stop.has(t));
      res = res.filter(loc => loc.boothId.toLowerCase().includes(q)
        || toks.every(tok=>normalize(loc.name).includes(tok)));
    }
    const { topic=[], sector=[], nb=[] } = filterSelections;
    if (topic.length&& !topic.includes("all_topics"))
      res=res.filter(loc=>loc.topicjourneys?.some(t=>topic.includes(t)));
    if (sector.length&& !sector.includes("all_sectors"))
      res=res.filter(loc=>loc.sectorjourneys?.some(s=>sector.includes(s)));
    if (nb.length&& !nb.includes("all_nb"))
      res=res.filter(loc=>nb.includes(loc.neighbourhood?.toLowerCase()));
    setFilteredLocations(res);
  }, [scaledLocations, searchQuery, filterSelections]);

  // Always show services
  useEffect(() => setFilteredServices(scaledServices), [scaledServices]);

  // Direct-link view
  useEffect(() => {
    const viewId = new URLSearchParams(window.location.search).get("view");
    if (!viewId||!locations.length||!services.length) return;
    const booth = locations.find(l=>l.boothId.toLowerCase()===viewId.toLowerCase());
    if (booth) { setSelectedLocation(booth); setLocationOrigin("map"); setShowLanding(false); return; }
    if (viewId.toLowerCase()==="th") {
      const th=services.find(s=>s.boothId==="th");
      if (th) { setSelectedTheatre(th); setShowLanding(false); }
      return;
    }
    const svc=services.find(s=>s.boothId.toLowerCase()===viewId.toLowerCase());
    if (svc) { setSelectedService(svc); setShowLanding(false); }
  }, [locations, services]);

  // "You are here" icon
  const youAreHereIcon = divIcon({
    html:`<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 30">
      <rect width="30" height="30" rx="15" fill="#21BF61"/>
      <path d="..." fill="white"/>
    </svg>`,
    className:"you-are-here-icon", iconSize:[32,32], iconAnchor:[16,16]
  });

  if (showLanding) {
    return <LandingPage onClose={()=>setShowLanding(false)} />;
  }

  return (
    <div className="w-full flex justify-center">
      <div className="w-full max-w-[800px] h-dvh relative overflow-hidden bg-edgeBackground">
              <TopBar
          searchQuery={searchQuery}
          onSearch={setSearchQuery}
          onOpenFilters={() => setShowFilters(true)}
           onToggleFilter={(code) => {
               // Abrimos siempre el panel...
               setShowFilters(true);
               // ...y solo añadimos el código si no existía
               setFilterActiveTypes((prev) =>
                 prev.includes(code) ? prev : [...prev, code]
               );
             }}
          selectedFilters={filterActiveTypes}
        />

        <div className={`absolute inset-0 transition-opacity duration-300 ${
            activeView==="map"?"opacity-100 z-10":"opacity-0 pointer-events-none z-0"
        }`}>
          <MapContainer
            crs={CRS.Simple}
            style={{ width:"100%", height:"100%", zIndex:10 }}
            maxZoom={2}
            maxBounds={expandedBounds}
            maxBoundsViscosity={1.0}
          >
            <FitToViewport bounds={bounds} />
            <ZoomListener setZoomLevel={setZoomLevel} />
            <ZoomControl position="bottomright" />

            {/* pane for highlights */}
            <Pane name="highlights" style={{ zIndex:1200 }} />

            {/* overview image */}
            <ImageOverlay
              url="/edge-map-general.png"
              bounds={bounds}
              zIndex={1001}
              opacity={zoomLevel<1?1:0}
            />

            {/* interactive zones + counts */}
{zoomLevel < 1 && overviewZones.map((zone) => (
  <React.Fragment key={zone.id}>
    <Rectangle
      bounds={zone.bounds}
      pane="highlights"
      pathOptions={{
        stroke: false,
        fill: true,
        fillColor: "#FFD700",
        fillOpacity: 0.0
      }}
      interactive
      eventHandlers={{
        click: (e) => {
          const map = e.target._map;
          if (zone.openTheatre) {
            const th = services.find((s) => s.boothId === "th");
            if (th) setSelectedTheatre(th);
          }
          map.flyTo(zone.target, zone.zoomLevel, { animate: true, duration: 0.4 });
        }
      }}
    />

    {/*
      Sólo si hay filtro/búsqueda activo,
      no es el micro-theatre,
      y el conteo es mayor que cero
    */}
    {isFilteredView
      && zone.id !== "zoneMicroTheatre"
      && zoneCounts[zone.id] > 0 && (
      <Marker
        position={zone.labelPosition}
        icon={divIcon({
          className: "zone-count-label",
          html:  `<div style="width: 24px; color: #323232; height: 24px; border: 2px solid #323232; display: flex; justify-content: center; align-items: center; font-size:12px;font-weight:700; background-color: white; border-radius: 1000px;">
          ${zoneCounts[zone.id]}
        </div>`
        })}
        interactive={false}
      />
    )}
  </React.Fragment>
))}



            {/* detailed image */}
            <ImageOverlay url={imageUrl} bounds={bounds} opacity={1} zIndex={10} />

            {/* search/filter highlights */}
            {isFilteredView && filteredLocations.map(loc=>(
              <ImageOverlay
                key={`hl-${loc.boothId}`}
                url={loc.highlightUrl}
                bounds={bounds}
                opacity={1}
                zIndex={900}
                className="highlight-overlay"
              />
            ))}

            {/* clicked booth highlight */}
            {selectedLocation && (
              <ImageOverlay
                url={selectedLocation.highlightUrl}
                bounds={bounds}
                opacity={1}
                zIndex={1000}
              />
            )}

            {/* booth markers */}
            {zoomLevel>=1 && filteredLocations.map(loc=>(
              <Marker
                key={loc.boothId}
                position={loc.position}
                icon={renderBoothIcon(loc.boothId, loc.name, zoomLevel)}
                eventHandlers={{
                  click:()=>{
                    setSelectedService(null);
                    setSelectedTheatre(null);
                    setSelectedLocation(loc);
                    setLocationOrigin("map");
                  }
                }}
              />
            ))}

            {/* service & theatre markers */}
            {zoomLevel>=1 && filteredServices.map(svc=>{
              const isTheatre=svc.boothId==="th";
              const icon=isTheatre
                ? divIcon({
                    html:`<div style="position:relative;display:flex;flex-direction:column;align-items:center;transform:translate(-50%,-30%);">
                      <div style="margin-top:2px;font-family:'BCGHenSans';font-size:10px;font-weight:600;color:#FFF;text-align:center;width:100px;">
                        Micro-Theater
                      </div>
                    </div>`,
                    iconSize:[24,36],
                    iconAnchor:[12,18],
                  })
                : divIcon({
                    html:`<img src="${svc.iconUrl}" style="width:24px;height:24px; filter: drop-shadow(1px 1px 2px rgba(0,0,0,0.5));"/>`,
                    iconSize:[24,24],
                    iconAnchor:[12,12],
                  });
              return (
                <Marker
                  key={svc.boothId}
                  position={svc.position}
                  icon={icon}
                  eventHandlers={{
                    click:()=>{
                      setSelectedLocation(null);
                      if(isTheatre){
                        setSelectedTheatre(svc);
                        setSelectedService(null);
                      } else {
                        setSelectedTheatre(null);
                        setSelectedService(svc);
                      }
                    }
                  }}
                />
              );
            })}

            {/* \"You are here\" */}
            {youAreHere && (
              <Marker position={youAreHere} icon={youAreHereIcon} zIndexOffset={2000}/>
            )}

            {/* focus on selected */}
            {(selectedLocation||selectedService||selectedTheatre) && (
              <FocusOnLocation position={
                selectedLocation?.position
                || selectedService?.position
                || selectedTheatre?.position
              }/>
            )}
          </MapContainer>
        </div>

        {/* list view */}
        {activeView==="list" && (
          <BoothList
            booths={filteredLocations}
            isSearching={isFilteredView}
            searchQuery={searchQuery}
            filterSelections={filterSelections}
            onSelect={item=>{
              setSelectedLocation(null);
              setSelectedService(null);
              setSelectedTheatre(null);
              if(item==="th"){
                const th=services.find(s=>s.boothId==="th");
                if(th) setSelectedTheatre(th);
              } else if(item.type==="service"){
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
          onChangeView={view=>{
            if(view==="list"){
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
          onClose={()=>setSelectedLocation(null)}
        />
        <ServiceInfoSheet
          service={selectedService}
          onClose={()=>setSelectedService(null)}
        />
        <TheatreInfoSheet
          theatre={selectedTheatre}
          onClose={()=>setSelectedTheatre(null)}
        />

        {showFilters && (
          <Filters
            activeTypes={filterActiveTypes}
            selections={filterSelections}
            onApply={handleApplyFilters}
            onClose={()=>setShowFilters(false)}
          />
        )}
      </div>
    </div>
  );
};

export default EventMap;
