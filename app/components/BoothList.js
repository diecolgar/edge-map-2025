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
    <div className="overflow-y-auto max-h-full pb-20 pt-20">
      {Object.entries(grouped).map(([neighbourhood, groupBooths]) => {
        const style = neighbourhoodStyles[neighbourhood] || {
          label: `Group: ${neighbourhood}`,
          color: "bg-gray-50",
        };

        return (
          <div key={neighbourhood} className={`py-4 ${style.color}`}>
            <h2 className="text-base font-semibold text-white px-4 mb-2">
              {style.label}
            </h2>

            {/* Sección de booths, con scrollbar horizontal oculta */}
            <div className="flex gap-4 overflow-x-auto px-4 pb-2 scrollbar-hide">
              {groupBooths.map((booth) => (
                <div
                  key={booth.boothId}
                  onClick={() => onSelect(booth)}
                  className="min-w-[250px] bg-white rounded-xl shadow p-4 border cursor-pointer hover:shadow-md transition"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <img
                      src={`/nb-icons/${booth.neighbourhood?.toLowerCase()}.svg`}
                      alt={`${booth.neighbourhood} icon`}
                      className="w-5 h-5"
                    />
                    <span className="text-xs font-bold text-gray-400">
                      {booth.boothId?.toUpperCase()}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold mb-1">{booth.name}</h3>
                  <p className="text-xs text-gray-500 line-clamp-2">
                    {booth.subtitle}
                  </p>
                  <div className="text-green-600 text-xs font-semibold mt-2 flex items-center gap-1">
                    See details <span>→</span>
                  </div>
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
