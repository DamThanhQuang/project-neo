import { motion } from "framer-motion";
import { FaMapMarkerAlt } from "react-icons/fa";
import "mapbox-gl/dist/mapbox-gl.css";
import { Map, Marker } from "react-map-gl/mapbox";

interface ProductLocationProps {
  location: {
    address: string;
    city: string;
    country: string;
    latitude: number;
    longitude: number;
  };
}

// Get MapBox access token from environment variables
const MAPBOX_TOKEN =
  "pk.eyJ1IjoiZGFtcXVhbmciLCJhIjoiY21hcDR3dXY4MGRsdzJvcHk5bWdoZTFlYSJ9._z2zA5665s6s_1HMsYg_pg";

export default function ProductLocation({ location }: ProductLocationProps) {
  // Sử dụng tọa độ mặc định nếu không có
  const latitude = location.latitude || 21.0285; // Tọa độ Hà Nội mặc định
  const longitude = location.longitude || 105.8542; // Tọa độ Hà Nội mặc định

  // Kiểm tra xem có tọa độ hay không
  const hasCoordinates = latitude !== undefined && longitude !== undefined;
  console.log("Location data:", location);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      <h3 className="text-xl font-semibold mb-3">Vị trí</h3>
      <p className="text-gray-700">
        {location.address}, {location.city}, {location.country}
      </p>

      <div className="aspect-video bg-gray-100 rounded-xl overflow-hidden">
        {hasCoordinates ? (
          <Map
            mapboxAccessToken={MAPBOX_TOKEN}
            initialViewState={{
              longitude: longitude,
              latitude: latitude,
              zoom: 14,
            }}
            style={{ width: "100%", height: "100%" }}
            mapStyle="mapbox://styles/mapbox/streets-v11"
          >
            <Marker longitude={longitude} latitude={latitude} anchor="bottom">
              <FaMapMarkerAlt className="text-red-500 text-3xl" />
            </Marker>
          </Map>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center p-8">
              <FaMapMarkerAlt className="mx-auto text-4xl text-gray-400 mb-2" />
              <p className="text-gray-600">Bản đồ hiện chưa được tải</p>
            </div>
          </div>
        )}
      </div>

      <div className="p-6 bg-gray-50 rounded-xl border border-gray-100 mt-4">
        <h4 className="font-semibold mb-3">Khám phá khu vực</h4>
        <ul className="space-y-3">
          <li className="flex justify-between">
            <span className="text-gray-700">Trung tâm thành phố</span>
            <span className="text-gray-900 font-medium">2 km</span>
          </li>
          <li className="flex justify-between">
            <span className="text-gray-700">Sân bay gần nhất</span>
            <span className="text-gray-900 font-medium">15 km</span>
          </li>
          <li className="flex justify-between">
            <span className="text-gray-700">Bãi biển</span>
            <span className="text-gray-900 font-medium">500 m</span>
          </li>
        </ul>
      </div>
    </motion.div>
  );
}
