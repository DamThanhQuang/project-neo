import { motion } from "framer-motion";
import {
  FaWifi,
  FaParking,
  FaSnowflake,
  FaShower,
  FaCoffee,
  FaTv,
  FaUtensils,
  FaCheck,
} from "react-icons/fa";

interface ProductAmenitiesProps {
  amenities: string[];
}

export const getAmenityIcon = (amenity: string) => {
  const amenityLower = amenity.toLowerCase();
  if (amenityLower.includes("wifi")) return <FaWifi />;
  if (amenityLower.includes("parking")) return <FaParking />;
  if (amenityLower.includes("air") || amenityLower.includes("ac"))
    return <FaSnowflake />;
  if (amenityLower.includes("shower") || amenityLower.includes("bath"))
    return <FaShower />;
  if (amenityLower.includes("coffee") || amenityLower.includes("breakfast"))
    return <FaCoffee />;
  if (amenityLower.includes("tv") || amenityLower.includes("television"))
    return <FaTv />;
  if (amenityLower.includes("kitchen") || amenityLower.includes("dining"))
    return <FaUtensils />;
  return <FaCheck />;
};

export default function ProductAmenities({ amenities }: ProductAmenitiesProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h3 className="text-xl font-semibold mb-6">Tiện nghi tại chỗ ở</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
        {amenities.map((amenity, index) => (
          <div key={index} className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center text-gray-700">
              {getAmenityIcon(amenity)}
            </div>
            <span className="text-gray-800">{amenity}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
