import { SVGOverlay } from "react-leaflet";
import { motion } from "framer-motion";

const SelectedOverlay = ({ bounds, svgPath }) => {
  if (!svgPath) return null;

  return (
    <SVGOverlay bounds={bounds}>
      <motion.path
        d={svgPath}
        fill="rgba(255, 255, 0, 0.3)"
        stroke="yellow"
        strokeWidth={2}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      />
    </SVGOverlay>
  );
};

export default SelectedOverlay;
