"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaMapMarkerAlt, FaCity, FaRoad, FaHome } from "react-icons/fa";
import { MdApartment, MdLocationOn } from "react-icons/md";
import { GoLocation } from "react-icons/go";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function Location() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    address: "",
    district: "",
    city: "",
    country: "Việt Nam",
    postalCode: "",
    apartment: "",
  });

  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Lấy dữ liệu từ localStorage nếu có khi component mount
  useEffect(() => {
    try {
      const savedLocation = localStorage.getItem("location");
      if (savedLocation) {
        const locationData = JSON.parse(savedLocation);
        setFormData((prevData) => ({
          ...prevData,
          ...locationData,
        }));

        // Kiểm tra ngay nếu form đã hoàn thành
        const requiredFields = ["address", "district", "city"];
        const isFormComplete = requiredFields.every(
          (field) => locationData[field]?.trim() !== ""
        );
        setIsComplete(isFormComplete);
      }
    } catch (err) {
      console.error("Lỗi khi đọc dữ liệu từ localStorage:", err);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Check if form is complete (all required fields filled)
    setTimeout(() => {
      const requiredFields = ["address", "district", "city"];
      const isFormComplete = requiredFields.every(
        (field) => formData[field as keyof typeof formData].trim() !== ""
      );
      setIsComplete(isFormComplete);
    }, 100);
  };

  // Animation variants
  const containerVariant = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariant = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300 } },
  };

  // Form fields definition
  const fields = [
    {
      id: "address",
      name: "address",
      label: "Địa chỉ",
      placeholder: "Nhập địa chỉ của bạn",
      icon: FaRoad,
      required: true,
    },
    {
      id: "apartment",
      name: "apartment",
      label: "Căn hộ, Suite, v.v (tùy chọn)",
      placeholder: "Số căn hộ, tầng, v.v",
      icon: MdApartment,
      required: false,
    },
    {
      id: "district",
      name: "district",
      label: "Quận/Huyện",
      placeholder: "Nhập quận/huyện",
      icon: FaHome,
      required: true,
    },
    {
      id: "city",
      name: "city",
      label: "Thành phố",
      placeholder: "Nhập thành phố",
      icon: FaCity,
      required: true,
    },
    {
      id: "postalCode",
      name: "postalCode",
      label: "Mã bưu chính (tùy chọn)",
      placeholder: "Nhập mã bưu chính",
      icon: GoLocation,
      required: false,
    },
  ];

  const handleBack = () => {
    router.push("/create/privacy-type");
  };

  const handleNext = async () => {
    if (!isComplete) return;

    setIsLoading(true);
    setError(null);

    try {
      // Lưu thông tin vào localStorage
      localStorage.setItem("location", JSON.stringify(formData));

      router.push("/create/floor-plan");
    } catch (err: any) {
      console.error("Lỗi khi lưu thông tin địa điểm:", err);
      setError(
        err.response?.data?.message ||
          "Đã xảy ra lỗi khi xử lý thông tin địa điểm"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Kiểm tra API geocoding - ví dụ nếu muốn xác nhận địa chỉ
  const verifyAddress = async () => {
    if (!formData.address || !formData.city) return;

    try {
      setIsLoading(true);
      setError(null);

      // Ví dụ sử dụng API Nominatim (OpenStreetMap) - miễn phí và không cần API key
      const searchQuery = `${formData.address}, ${formData.district}, ${formData.city}, ${formData.country}`;
      const encodedQuery = encodeURIComponent(searchQuery);
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/search?q=${encodedQuery}&format=json&limit=1`
      );

      if (response.data && response.data.length > 0) {
        // Địa chỉ hợp lệ, có thể lấy tọa độ và hiển thị trên bản đồ nếu muốn
        console.log("Địa chỉ hợp lệ:", response.data[0]);
      } else {
        setError(
          "Không thể xác minh địa chỉ. Vui lòng kiểm tra lại thông tin."
        );
      }
    } catch (err) {
      console.error("Lỗi khi xác minh địa chỉ:", err);
      setError("Lỗi khi xác minh địa chỉ");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 flex flex-col items-center">
      {/* Tiêu đề */}
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-2xl md:text-3xl font-semibold mb-4">
          Nhà/phòng cho thuê của bạn nằm ở đâu?
        </h1>
        <p className="text-gray-600 max-w-xl mx-auto">
          Địa chỉ của bạn chỉ được chia sẻ với khách sau khi họ đặt phòng thành
          công.
        </p>
      </motion.div>

      {/* Hiển thị lỗi nếu có */}
      {error && (
        <motion.div
          className="w-full max-w-2xl mb-4 p-3 bg-red-100 text-red-700 rounded-md"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {error}
        </motion.div>
      )}

      {/* Form fields */}
      <motion.div
        className="w-full max-w-2xl"
        variants={containerVariant}
        initial="hidden"
        animate="show"
      >
        {fields.map((field) => (
          <motion.div key={field.id} className="mb-5" variants={itemVariant}>
            <label
              htmlFor={field.id}
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {field.label}{" "}
              {field.required && <span className="text-rose-500">*</span>}
            </label>
            <motion.div
              className={`relative rounded-md shadow-sm ${
                focusedField === field.id
                  ? "ring-2 ring-rose-500 border-transparent"
                  : ""
              }`}
            >
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <field.icon
                  className={`h-5 w-5 ${
                    focusedField === field.id
                      ? "text-rose-500"
                      : "text-gray-400"
                  }`}
                />
              </div>
              <input
                type="text"
                name={field.name}
                id={field.id}
                className="focus:ring-rose-500 focus:border-rose-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-3"
                placeholder={field.placeholder}
                value={formData[field.name as keyof typeof formData]}
                onChange={handleChange}
                onFocus={() => setFocusedField(field.id)}
                onBlur={() => setFocusedField(null)}
              />
            </motion.div>
          </motion.div>
        ))}

        {/* Giả lập vị trí trên bản đồ */}
        <motion.div
          className="mt-8 p-4 border border-gray-300 rounded-lg relative overflow-hidden"
          variants={itemVariant}
        >
          <div className="text-center p-8 bg-gray-50 rounded-md flex items-center justify-center min-h-[200px]">
            <div className="flex flex-col items-center text-gray-500">
              <FaMapMarkerAlt className="text-5xl text-rose-500 mb-4" />
              <p className="text-sm">
                {isComplete
                  ? `Vị trí: ${formData.address}, ${formData.district}, ${formData.city}, ${formData.country}`
                  : "Vui lòng điền đầy đủ thông tin địa chỉ để xem vị trí"}
              </p>
            </div>
          </div>
          {isComplete && (
            <motion.button
              className="absolute top-2 right-2 text-rose-500 bg-white rounded-full p-1 shadow-md"
              whileHover={{ scale: 1.1, rotate: 10 }}
              onClick={verifyAddress}
              disabled={isLoading}
            >
              <MdLocationOn size={24} />
            </motion.button>
          )}
        </motion.div>
      </motion.div>

      {/* Buttons điều hướng */}
      <motion.div
        className="mt-12 w-full max-w-2xl flex justify-between"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.5 }}
      >
        <motion.button
          className="px-6 py-3 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition"
          whileHover={{ scale: 1.05, backgroundColor: "#f3f4f6" }}
          whileTap={{ scale: 0.95 }}
          onClick={handleBack}
          disabled={isLoading}
        >
          Quay lại
        </motion.button>
        <motion.button
          className={`px-6 py-3 bg-rose-500 text-white font-medium rounded-lg ${
            (!isComplete || isLoading) && "opacity-70 cursor-not-allowed"
          }`}
          whileHover={{
            scale: isComplete && !isLoading ? 1.05 : 1,
            backgroundColor: isComplete && !isLoading ? "#e11d48" : undefined,
          }}
          whileTap={{ scale: isComplete && !isLoading ? 0.95 : 1 }}
          disabled={!isComplete || isLoading}
          onClick={handleNext}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              <span>Đang xử lý...</span>
            </div>
          ) : (
            "Tiếp theo"
          )}
        </motion.button>
      </motion.div>
    </div>
  );
}
