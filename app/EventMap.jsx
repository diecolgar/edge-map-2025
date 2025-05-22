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
import OnboardingPopup from "./components/OnboardingPopup";
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

// Render a custom booth icon with optional label and circle highlight
const renderBoothIcon = (id, name, zoomLevel, highlight) => {
  const showTitle = zoomLevel >= 2;
  const shortName = name.length > 25
    ? name.slice(0, 25) + "…"
    : name;

  // Estilos para el recuadro del ID: fondo, padding y, si está highlight, círculo amarillo
  const baseIdStyle = `
    color: #fff;
    font-size: 12px;
    padding: 2px 4px;
    border-radius: 4px;
    pointer-events: none;
    text-align: center;
  `;
  const highlightWrapper = highlight
    ? `
      background: #21BF61;
      border-radius: 12px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    `
    : "";

  const html = `
    <div style="
      position: relative;
      min-width: 60px; max-width: 100px;
      display: flex; flex-direction: column; align-items: center;
      font-family: 'BCGHenSans'; font-weight: 700;
    ">
      <div style="${highlightWrapper}">
        <div style="${baseIdStyle}">
          ${id.toUpperCase()}
        </div>
      </div>
      <div style="
        min-width: 120px;
        font-size: 12px;
        color: white;
        text-shadow: 1px 1px 2px black;
        text-align: center;
        line-height: 1.1;
        transition: opacity 0.3s ease;
        opacity: ${showTitle ? 1 : 0};
        height: 1em;
        margin-top: 1px;
      ">
        ${shortName}
      </div>
    </div>
  `;

  return divIcon({
    html,
    iconSize: [40, 40],
    iconAnchor: [30, 10],
    className: "custom-icon"
  });
};





const EventMap = () => {
  const imageUrl = "/edge-map-def.png";
  const original = { width: 2560, height: 6064 };
  const aspect = original.width / original.height;

  // UI state
  const [showLanding, setShowLanding] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
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

    // justo al inicio de EventMap, tras los useState:
      useEffect(() => {
        const params = new URLSearchParams(window.location.search);
  
        // parseamos cada parámetro en array (o vacío si no existe)
        const topicParam  = params.get("topic")  || "";
        const sectorParam = params.get("sector") || "";
        const nbParam     = params.get("nb")     || "";
  
        const topicFilters  = topicParam  ? topicParam.split(",")  : [];
        const sectorFilters = sectorParam ? sectorParam.split(",") : [];
        const nbFilters     = nbParam     ? [nbParam]              : [];
  
        // construimos el objeto selections igual que lo usa Filters.jsx
        const initialSelections = {};
        if (topicFilters.length)  initialSelections.topic  = topicFilters;
        if (sectorFilters.length) initialSelections.sector = sectorFilters;
        if (nbFilters.length)     initialSelections.nb     = nbFilters;
  
        // marcamos qué tipos mostrar abiertos
        const initialActiveTypes = Object.keys(initialSelections);
  
        // actualizamos los estados
        if (initialActiveTypes.length) {
          setFilterSelections(initialSelections);
          setFilterActiveTypes(initialActiveTypes);
        
          // 🔽 Oculta landing y onboarding si hay filtros desde la URL
          setShowLanding(false);
          setShowOnboarding(false);
        }
      }, []);  // solo al montar
  

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
      keywordsArray: loc.keywords
      ? loc.keywords.split(";").map(k => k.trim()).filter(Boolean)
      : [],
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

// Filtrar ubicaciones por búsqueda y selecciones
useEffect(() => {
  // 1) Stop-words para omitir en el análisis de tokens
  const stop = new Set([
    "the","of","for","a","an","to","in","on","and","is","are","at","with","by"
  ]);

  // 2) Función para normalizar texto (minúsculas, sin acentos ni símbolos)
  const normalize = s =>
    s
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\w\s]/g, "")
      .trim();

  // 3) Partimos de todas las ubicaciones escaladas
  let res = scaledLocations;

  // 4) Si hay texto de búsqueda, lo tokenizamos y filtramos por boothId, name o keywords
  if (searchQuery.trim()) {
    const q = normalize(searchQuery);
    const toks = q.split(/\s+/).filter(t => t && !stop.has(t));

    res = res.filter(loc => {
      // Construimos “haystack” con nombre + keywordsArray
      const haystack = [
        normalize(loc.name),
        ...loc.keywordsArray.map(normalize)
      ].join(" ");

      // Coincide si el ID contiene la query completa
      // o si todos los tokens aparecen en el haystack
      return (
        loc.boothId.toLowerCase().includes(q) ||
        toks.every(tok => haystack.includes(tok))
      );
    });
  }

  // 5) Filtrado adicional por topic, sector y neighbourhood
  const { topic = [], sector = [], nb = [] } = filterSelections;

  if (topic.length && !topic.includes("all_topics")) {
    res = res.filter(loc =>
      loc.topicjourneys?.some(t => topic.includes(t))
    );
  }

  if (sector.length && !sector.includes("all_sectors")) {
    res = res.filter(loc =>
      loc.sectorjourneys?.some(s => sector.includes(s))
    );
  }

  if (nb.length && !nb.includes("all_nb")) {
    res = res.filter(loc =>
      nb.includes(loc.neighbourhood?.toLowerCase())
    );
  }

  // 6) Aplicamos el resultado al estado
  setFilteredLocations(res);
}, [scaledLocations, searchQuery, filterSelections]);


  // Always show services
  useEffect(() => setFilteredServices(scaledServices), [scaledServices]);

  // Direct-link view
  useEffect(() => {
    const viewId = new URLSearchParams(window.location.search).get("view");
    if (!viewId || !locations.length || !services.length) return;
  
    const normalizedView = viewId.toLowerCase();
  
    // Intentamos encontrar la ubicación, servicio o theatre
    const booth = locations.find(l => l.boothId.toLowerCase() === normalizedView);
    const svc = services.find(s => s.boothId.toLowerCase() === normalizedView);
    const isTheatreView = ["th", "theatre"].includes(normalizedView);
    const theatre = isTheatreView ? services.find(s => s.boothId === "th") : null;
  
    if (booth) {
      setSelectedLocation(booth);
      setLocationOrigin("map");
    } else if (svc) {
      setSelectedService(svc);
    } else if (theatre) {
      setSelectedTheatre(theatre);
    }
  
    // Si hay vista directa a algo, no mostrar landing ni onboarding
    if (booth || svc || theatre) {
      setShowLanding(false);
      setShowOnboarding(false);
    }
  }, [locations, services]);
  

  // "You are here" icon
  const youAreHereIcon = divIcon({
    html:`<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 30">
      <rect width="30" height="30" rx="15" fill="#21BF61"/>
      <path d="..." fill="white"/>
    </svg>`,
    className:"you-are-here-icon", iconSize:[32,32], iconAnchor:[16,16]
  });

  // Handler para abrir y centrar el micro-theatre
  const handleTheatreClick = () => {
    const th = services.find(s => s.boothId === "th");
    if (!th) return;
    // cerramos cualquier selección anterior
    setSelectedLocation(null);
    setSelectedService(null);
    // abrimos la card de micro-theatre
    setSelectedTheatre(th);
    // (FocusOnLocation se encargará de hacer flyTo al position de `th`)
  };

  if (showLanding) {
     return (
       <LandingPage
         onClose={() => {
           setShowLanding(false);
           setShowOnboarding(true);
         }}
       />
     );
   }

  return (
    <div className="w-full flex justify-center">
      <div className="w-full flex justify-center h-dvh relative overflow-hidden bg-edgeBackground ">
        
      {showOnboarding && (
        <OnboardingPopup
          onClose={() => setShowOnboarding(false)}
          className="absolute inset-0 z-20"
        />
      )}

      <TopBar
        searchQuery={searchQuery}
        onSearch={setSearchQuery}
        onOpenFilters={() => setShowFilters(true)}
        onTheatreClick={handleTheatreClick}
        onToggleFilter={(code) => {
          if (code === "microTheatre") {
            // Ir directamente al detalle del Micro-theatre
            const th = services.find((s) => s.boothId === "th");
            if (th) {
              setSelectedLocation(null);
              setSelectedService(null);
              setSelectedTheatre(th);
            }
            return; // no abrimos el panel de filtros ni tocamos filterActiveTypes
          }

          // Para cualquier otro código, abrimos filtros y alternamos la pill
          setShowFilters(true);
          setFilterActiveTypes((prev) =>
            prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
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
            if (th) {
              // Cerramos cualquier selección previa
              setSelectedLocation(null);
              setSelectedService(null);
              // Abrimos el micro-theatre
              setSelectedTheatre(th);
            }
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

            {/* clicked booth highlight */}
            {selectedLocation && (
              <ImageOverlay
                url={selectedLocation.highlightUrl}
                bounds={bounds}
                opacity={1}
                zIndex={1000}
              />
            )}

            {/* booth markers: glow+outline en seleccionados, opacidad reducida en no seleccionados */}
            {zoomLevel >= 1 && (() => {
              const matchedIds = new Set(filteredLocations.map(l => l.boothId));
              return scaledLocations.map(loc => {
                const isMatch = isFilteredView && matchedIds.has(loc.boothId);
                // Si hay filtro: match=1, no-match=0.4; si no hay filtro: todos=1
                const markerOpacity = isFilteredView
                  ? (isMatch ? 1 : 0.2)
                  : 1;

                return (
                  <Marker
                    key={loc.boothId}
                    position={loc.position}
                    icon={renderBoothIcon(
                      loc.boothId,
                      loc.name,
                      zoomLevel,
                      isMatch
                    )}
                    opacity={markerOpacity}
                    eventHandlers={{
                      click: () => {
                        setSelectedService(null);
                        setSelectedTheatre(null);
                        setSelectedLocation(loc);
                        setLocationOrigin("map");
                      }
                    }}
                  />
                );
              });
            })()}



            {/* service & theatre markers */}
            {zoomLevel>=1 && filteredServices.map(svc=>{
              const isTheatre=svc.boothId==="th";
              const icon=isTheatre
                ? divIcon({
                  html: `
                    <div style="
                      position: relative;
                      display: flex;
                      flex-direction: column;
                      align-items: center;
                      transform: translate(-50%, 10%);
                    ">
                      <!-- Nuevo badge AGENDA -->
                      <div style="
                        background: #F1EEEA;
                        border: 1px solid #323232;
                        padding: 2px 4px;
                        font-family: 'BCGHenSans';
                        font-size: 10px;
                        font-weight: 600;
                        color: #323232;
                        text-align: center;
                        margin-bottom: 2px;
                        border-radius: 4px;
                      ">
                        AGENDA
                      </div>
                      <!-- Texto Micro-theater -->
                      <div style="
                        font-family: 'BCGHenSans';
                        font-size: 10px;
                        font-weight: 600;
                        color: #FFF;
                        text-align: center;
                        width: 100px;
                      ">
                        Micro-theater
                      </div>
                    </div>
                  `,
                  iconSize: [24, 36],
                  iconAnchor: [12, 18],
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
