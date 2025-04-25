import React from "react";

const BoothList = ({ booths, onSelect }) => {
  const neighbourhoodStyles = {
    fs: {
      label: "Future of Sustainability",
      color: "bg-[#197A56]", // verde
    },
    ce: {
      label: "Future of Customer Engagement",
      color: "bg-[#EFAE00]", // amarillo
    },
    op: {
      label: "Future of Operations",
      color: "bg-[#FF6000]", // naranja
    },
    sp: {
      label: "Future of Strategy, People, and Organization",
      color: "bg-[#FF54D4]", // ajusta el color según tu preferencia
    },
    td: {
      label: "Future of Technology, Digital, and Data",
      color: "bg-[#322E81]", // azul / morado
    },
  };

  // Agrupa booths por neighbourhood (en minúsculas, fallback "other").
  const grouped = booths.reduce((acc, booth) => {
    const group = booth.neighbourhood?.toLowerCase() || "other";
    if (!acc[group]) acc[group] = [];
    acc[group].push(booth);
    return acc;
  }, {});

  return (
    <div className="overflow-y-auto bg-edgeBackground max-h-full pb-14 pt-16">
      {Object.entries(grouped).map(([neighbourhood, groupBooths]) => {
        const style = neighbourhoodStyles[neighbourhood] || {
          label: `Group: ${neighbourhood}`,
          color: "bg-gray-50",
        };

        return (
          <div key={neighbourhood} className={`py-6 ${style.color}`}>
            <h2 className="text-base font-semibold text-white px-6 mb-4">
              {style.label.startsWith("Future of ") ? (
                <span>
                  <i className="font-light mr-1">Future of</i>
                  {" "}{style.label.substring("Future of ".length)}
                </span>
              ) : (
                style.label
              )}
            </h2>

            {/* Sección de booths, con scrollbar horizontal oculta */}
            <div className="flex gap-4 overflow-x-auto px-6 pb-2 scrollbar-hide">
              {groupBooths.map((booth) => (
                <div
                  key={booth.boothId}
                  onClick={() => onSelect(booth)}
                  className="flex flex-col justify-between min-w-[250px] min-h-[190px] bg-white rounded-xl shadow p-4 border cursor-pointer hover:shadow-md transition"
                >
                  {/* Top row: Icono, Booth ID y "See details" */}
                  <div className="flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <img
                          src={`/nb-icons/${booth.neighbourhood?.toLowerCase()}.svg`}
                          alt={`${booth.neighbourhood} icon`}
                          className="w-5 h-5"
                        />
                        <span className="text-sm font-bold text-edgeTextSecondary">
                          {booth.boothId?.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-edgeGreen text-sm font-bold">
                        <span>See details</span>
                        <svg
                          width="6"
                          height="12"
                          viewBox="0 0 6 12"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M0.75 10.5L5.25 6L0.75 1.5"
                            stroke="#21BF61"
                            strokeWidth="1.2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    </div>
                    {/* Contenedor para la parte principal y la etiqueta de partner */}
                    <div className="flex flex-col justify-between">
                      {/* Parte principal: Nombre y subtítulo */}
                      <div className="flex flex-col">
                        <h3 className="text-base font-semibold mb-1 text-edgeText">{booth.name}</h3>
                        <p className="text-sm text-edgeTextSecondary line-clamp-2 italic">
                          {booth.subtitle}
                        </p>
                      </div>
                      {/* Etiqueta de partner, si corresponde */}
                    </div>
                  </div>
                  {booth.partner === "Y" && (
                      <div className="flex-shrink-0">
                        <span className="inline-block bg-edgeBackground text-edgeText text-xs font-semibold px-3 py-1 rounded-full border border-[#D9D7D6]">
                          Partners &amp; Collaborators
                        </span>
                      </div>
                    )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default BoothList;
