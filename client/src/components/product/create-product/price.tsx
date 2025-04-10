"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { FaInfoCircle, FaChartLine, FaCoins } from "react-icons/fa";
import { MdOutlineCabin, MdAttachMoney } from "react-icons/md";
import { IoMdTrendingUp } from "react-icons/io";

export default function Price() {
  const router = useRouter();
  const [price, setPrice] = useState<string>("654053");
  const [isFocused, setIsFocused] = useState(false);
  const [isPriceValid, setIsPriceValid] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load saved price on component mount
  useEffect(() => {
    try {
      const savedPrice = localStorage.getItem("listing_price");
      if (savedPrice) {
        const savedData = JSON.parse(savedPrice);
        if (savedData.price) {
          setPrice(savedData.price);
          setIsPriceValid(parseInt(savedData.price) >= 100000);
        }
      }
    } catch (error) {
      console.error("Failed to load saved price:", error);
      setError("Không thể tải dữ liệu đã lưu");
    }
  }, []);

  // Format price as VND currency
  const formatCurrency = (value: string): string => {
    const numberValue = value.replace(/\D/g, "");
    if (!numberValue) return "";
    return new Intl.NumberFormat("vi-VN").format(parseInt(numberValue));
  };

  // For displaying formatted price
  const formattedPrice = formatCurrency(price);

  // Calculate guest price (add ~14% for fees)
  const guestPrice = price
    ? Math.round(parseInt(price.replace(/\D/g, "")) * 1.14)
    : 0;
  const formattedGuestPrice = formatCurrency(guestPrice.toString());

  // Handle price change
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove all non-digits and format
    const rawValue = e.target.value.replace(/\D/g, "");
    setPrice(rawValue);
    setIsPriceValid(parseInt(rawValue) >= 100000 || rawValue === ""); // Empty is valid while typing
  };

  // Handle blur event to validate empty input
  const handleBlur = () => {
    setIsFocused(false);
    // If empty on blur, set a default value
    if (price === "") {
      setPrice("100000");
      setIsPriceValid(true);
    }
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

  // Suggested price ranges
  const suggestedPrices = [
    { label: "Thấp", value: "479806", description: "Ít đặt phòng hơn" },
    { label: "Đề xuất", value: "654053", description: "Cân bằng tốt" },
    { label: "Cao", value: "1023584", description: "Ít đặt phòng hơn" },
  ];

  const handleBack = () => {
    // Save before navigating back
    try {
      localStorage.setItem("listing_price", JSON.stringify({ price }));
    } catch (error) {
      console.error("Failed to save price data:", error);
    }
    router.push("/create/finish-setup");
  };

  const handleNext = () => {
    if (!isPriceValid) return;

    setIsLoading(true);
    setError(null);

    try {
      localStorage.setItem("listing_price", JSON.stringify({ price }));
      router.push("/create/receipt");
    } catch (error) {
      console.error("Failed to save price data:", error);
      setError("Đã xảy ra lỗi khi lưu dữ liệu");
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-5 py-10 flex flex-col bg-white rounded-xl shadow-sm">
      <motion.div
        className="text-center mb-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">
          Bây giờ, hãy đặt mức giá mà bạn muốn
        </h1>
        <p className="text-gray-600 max-w-xl mx-auto text-lg">
          Bạn có thể thay đổi giá này bất cứ lúc nào.
        </p>
      </motion.div>

      <motion.div
        variants={containerVariant}
        initial="hidden"
        animate="show"
        className="w-full"
      >
        {/* Property type indicator */}
        <motion.div
          variants={itemVariant}
          className="flex items-center mb-8 p-4 bg-gradient-to-r from-rose-50 to-transparent rounded-lg border border-rose-100"
        >
          <div className="bg-rose-100 rounded-full p-2 mr-4">
            <MdOutlineCabin className="text-2xl text-rose-500" />
          </div>
          <span className="font-medium text-gray-800 text-lg">
            Cabin của bạn
          </span>
        </motion.div>

        {/* Price input */}
        <motion.div variants={itemVariant} className="mb-10">
          <label
            htmlFor="price"
            className="block text-lg font-semibold text-gray-700 mb-3"
          >
            Giá mỗi đêm
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <span className="text-gray-500 text-xl font-medium">₫</span>
            </div>
            <input
              type="text"
              id="price"
              value={formattedPrice}
              onChange={handlePriceChange}
              onFocus={() => setIsFocused(true)}
              onBlur={handleBlur}
              className={`w-full pl-10 pr-4 py-6 text-2xl font-medium border rounded-xl shadow-sm transition-all ${
                isFocused
                  ? "border-rose-500 ring-4 ring-rose-100"
                  : !isPriceValid
                  ? "border-red-500 ring-4 ring-red-50"
                  : "border-gray-300 hover:border-gray-400"
              }`}
              aria-invalid={!isPriceValid}
              aria-describedby="price-error"
            />
          </div>

          {!isPriceValid && (
            <motion.p
              id="price-error"
              className="mt-2 text-red-500 text-sm font-medium"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              Giá phải ít nhất 100.000₫ mỗi đêm
            </motion.p>
          )}

          <div className="mt-5 p-5 bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-xl shadow-sm">
            <div className="flex justify-between items-center">
              <span className="text-gray-700 font-medium">
                Giá cho khách (trước thuế)
              </span>
              <span className="font-bold text-xl text-gray-800">
                ₫{formattedGuestPrice}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Market comparison */}
        <motion.div variants={itemVariant} className="mb-10">
          <div className="flex items-center mb-4">
            <div className="bg-rose-100 rounded-full p-1.5 mr-3">
              <FaChartLine className="text-lg text-rose-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800">
              So sánh thị trường
            </h3>
          </div>

          <div className="p-6 border border-gray-200 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center mb-5">
              <div className="bg-green-100 rounded-full p-1.5 mr-3">
                <IoMdTrendingUp className="text-green-600" />
              </div>
              <span className="text-lg">
                Nhà/phòng cho thuê tương tự:{" "}
                <strong className="text-gray-800">₫479.806 – ₫654.053</strong>
              </span>
            </div>

            {/* Price range slider visualization */}
            <div className="relative h-3 bg-gray-200 rounded-full my-8">
              <div className="absolute h-full w-3/5 bg-gradient-to-r from-rose-400 to-rose-500 rounded-full left-1/5"></div>
              <div className="absolute -top-2 left-1/5 h-6 w-6 bg-white border-2 border-rose-500 rounded-full shadow-md transform hover:scale-110 transition-transform"></div>
              <div className="absolute -top-2 left-[45%] h-6 w-6 bg-white border-2 border-rose-500 rounded-full shadow-md transform hover:scale-110 transition-transform"></div>
              <div className="absolute -top-2 left-4/5 h-6 w-6 bg-white border-2 border-rose-500 rounded-full shadow-md transform hover:scale-110 transition-transform"></div>
            </div>

            {/* Price suggestions */}
            <div className="grid grid-cols-3 gap-4 mt-10">
              {suggestedPrices.map((item, index) => (
                <motion.div
                  key={index}
                  onClick={() => {
                    setPrice(item.value);
                    setIsPriceValid(true);
                  }}
                  className={`cursor-pointer p-4 rounded-xl border-2 transition-all ${
                    price === item.value
                      ? "border-rose-500 bg-rose-50 shadow-md"
                      : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                  }`}
                  whileHover={{ y: -5 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div
                    className={`font-semibold ${
                      price === item.value ? "text-rose-600" : "text-gray-700"
                    }`}
                  >
                    {item.label}
                  </div>
                  <div
                    className={`text-xl ${
                      price === item.value
                        ? "font-bold text-gray-800"
                        : "font-medium text-gray-700"
                    }`}
                  >
                    ₫{formatCurrency(item.value)}
                  </div>
                  <div className="text-xs mt-1 text-gray-500">
                    {item.description}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <button
            className="mt-4 flex items-center text-rose-600 text-sm font-medium hover:text-rose-700 transition-colors"
            onClick={() =>
              window.open("https://www.example.com/pricing-help", "_blank")
            }
          >
            <FaInfoCircle className="mr-1" />
            Tìm hiểu thêm về định giá
          </button>
        </motion.div>

        {/* Pricing tips */}
        <motion.div
          variants={itemVariant}
          className="mb-12"
          whileHover={{ scale: 1.01 }}
          transition={{ type: "spring", stiffness: 400 }}
        >
          <div className="p-6 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-xl shadow-sm">
            <div className="flex items-start">
              <div className="bg-blue-200 rounded-full p-2 mr-4 mt-1 flex-shrink-0">
                <FaCoins className="text-xl text-blue-600" />
              </div>
              <div>
                <h4 className="font-bold text-blue-800 mb-3 text-lg">
                  Lời khuyên định giá:
                </h4>
                <ul className="text-blue-700 space-y-2 pl-1">
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>
                      Giá khởi đầu thấp hơn có thể giúp bạn nhận được đánh giá
                      đầu tiên nhanh hơn
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>
                      Bạn luôn có thể thay đổi giá hoặc thiết lập giá cuối
                      tuần/theo mùa khác nhau
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>
                      Giảm giá cho đặt phòng dài ngày có thể tăng tỷ lệ đặt
                      phòng và giảm công việc vệ sinh
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Error message display */}
      {error && (
        <motion.div
          className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-center border border-red-200 shadow-sm"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-center">
            <FaInfoCircle className="mr-2" />
            <span className="font-medium">{error}</span>
          </div>
        </motion.div>
      )}

      {/* Navigation buttons */}
      <motion.div
        className="mt-8 w-full flex justify-between"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
      >
        <motion.button
          className="px-8 py-3.5 text-gray-700 font-medium bg-gray-100 hover:bg-gray-200 rounded-xl transition flex items-center"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleBack}
          disabled={isLoading}
        >
          <span className="mr-1">←</span> Quay lại
        </motion.button>
        <motion.button
          className={`px-8 py-3.5 bg-gradient-to-r from-rose-500 to-rose-600 text-white font-medium rounded-xl shadow-md transition ${
            (!isPriceValid || isLoading) &&
            "opacity-70 cursor-not-allowed from-gray-400 to-gray-500"
          }`}
          whileHover={{
            scale: isPriceValid && !isLoading ? 1.05 : 1,
            boxShadow:
              isPriceValid && !isLoading
                ? "0 10px 15px -3px rgba(244, 63, 94, 0.2)"
                : "",
          }}
          whileTap={{ scale: isPriceValid && !isLoading ? 0.95 : 1 }}
          disabled={!isPriceValid || isLoading}
          onClick={handleNext}
        >
          {isLoading ? "Đang xử lý..." : "Tiếp theo"}{" "}
          <span className="ml-1">→</span>
        </motion.button>
      </motion.div>
    </div>
  );
}
