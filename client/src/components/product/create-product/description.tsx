"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { MdOutlineCabin } from "react-icons/md";
import { FaLightbulb } from "react-icons/fa";

export default function Description() {
  const router = useRouter();
  const [description, setDescription] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const maxLength = 500;

  useEffect(() => {
    try {
      const savedDescription = localStorage.getItem("description");
      if (savedDescription) {
        // Kiểm tra xem dữ liệu có phải là JSON hay không
        if (savedDescription.startsWith("{")) {
          // Nếu là JSON, xử lý theo cách cũ
          const savedData = JSON.parse(savedDescription);
          if (savedData.description) {
            setDescription(savedData.description);
          }
        } else {
          // Nếu là chuỗi đơn giản, gán trực tiếp
          setDescription(savedDescription);
        }
        setIsComplete(true);
      }
    } catch (error) {
      console.error("Get saved data error:", error);
    }
  }, []);

  useEffect(() => {
    setIsComplete(description.length > 0 && description.length <= maxLength);
  }, [description]);

  // Tính số ký tự đã nhập
  const charCount = description.length;
  const isValid = charCount > 0 && charCount <= maxLength;

  // Kiểm tra độ dài mô tả để phân loại
  const getDescriptionFeedback = () => {
    if (charCount === 0)
      return { message: "Mô tả không được để trống", color: "text-gray-400" };
    if (charCount < 50)
      return {
        message: "Mô tả quá ngắn, hãy bổ sung thêm chi tiết",
        color: "text-amber-500",
      };
    if (charCount < 100)
      return {
        message: "Mô tả ngắn gọn, có thể thêm chi tiết",
        color: "text-yellow-500",
      };
    if (charCount <= 300)
      return { message: "Mô tả chi tiết tốt", color: "text-green-500" };
    if (charCount <= maxLength)
      return { message: "Mô tả rất đầy đủ", color: "text-blue-500" };
    return { message: "Mô tả quá dài", color: "text-red-500" };
  };

  const feedback = getDescriptionFeedback();

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

  const handleDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setDescription(e.target.value);
  };

  const handleBack = () => {
    router.push("/create/title");
  };

  const handleNext = () => {
    if (!isValid) return;

    try {
      setIsLoading(true);
      localStorage.setItem("description", description);

      // Chuyển trang
      router.push("/create/finish-setup");
    } catch (error) {
      console.error("Save data error:", error);
      setError("Đã xảy ra lỗi khi lưu mô tả. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 flex flex-col">
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-2xl md:text-3xl font-semibold mb-4">
          Hãy mô tả chỗ ở cabin của bạn
        </h1>
        <p className="text-gray-600 max-w-xl mx-auto">
          Chia sẻ những điều làm cho chỗ ở của bạn đặc biệt và những gì khách sẽ
          yêu thích về nơi này.
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
          className="flex items-center mb-6 p-3 bg-gray-50 rounded-md border border-gray-200"
        >
          <MdOutlineCabin className="text-2xl text-rose-500 mr-3" />
          <span className="font-medium">Cabin của bạn</span>
        </motion.div>

        {/* Description textarea */}
        <motion.div variants={itemVariant} className="mb-6">
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Mô tả
          </label>
          <div className="relative">
            <textarea
              id="description"
              value={description}
              onChange={handleDescriptionChange}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              maxLength={maxLength + 10} // Cho phép nhập thêm để hiển thị cảnh báo
              placeholder="Mô tả không gian, tiện nghi và trải nghiệm đặc biệt tại cabin của bạn..."
              rows={8}
              className={`w-full p-4 text-base border rounded-lg transition-all resize-y ${
                isFocused
                  ? "border-rose-500 ring-2 ring-rose-100"
                  : charCount > maxLength
                  ? "border-red-500"
                  : isValid && charCount > 50
                  ? "border-green-500"
                  : "border-gray-300"
              }`}
            ></textarea>

            <div className="absolute right-4 bottom-4 text-sm font-medium">
              <span
                className={`${
                  charCount > maxLength ? "text-red-500" : "text-gray-500"
                }`}
              >
                {charCount}/{maxLength}
              </span>
            </div>
          </div>

          {/* Feedback message */}
          <div className={`mt-2 text-sm ${feedback.color}`}>
            {feedback.message}
          </div>
        </motion.div>

        {/* Description tips */}
        <motion.div
          variants={itemVariant}
          className="mb-8 p-4 bg-amber-50 border border-amber-100 rounded-lg"
        >
          <div className="flex items-start">
            <FaLightbulb className="text-amber-500 mt-1 mr-3 text-lg flex-shrink-0" />
            <div>
              <h3 className="font-medium text-amber-800 mb-2">
                Mẹo viết mô tả hiệu quả:
              </h3>
              <ul className="space-y-2 text-amber-700 text-sm">
                <li>
                  • Mô tả không gian, cảnh quan và bầu không khí của cabin
                </li>
                <li>• Nêu bật các tiện nghi và tính năng đặc biệt</li>
                <li>• Chia sẻ những trải nghiệm độc đáo mà khách có thể có</li>
                <li>• Đề cập đến khoảng cách đến các địa điểm thú vị gần đó</li>
                <li>• Viết ngắn gọn nhưng chi tiết và chân thực</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Buttons điều hướng */}
      <motion.div
        className="mt-8 w-full flex justify-between"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
      >
        <motion.button
          className="px-6 py-3 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition"
          whileHover={{
            scale: 1.05,
            backgroundColor: "#f3f4f6",
          }}
          whileTap={{ scale: 0.95 }}
          disabled={isLoading}
          onClick={handleBack}
        >
          Quay lại
        </motion.button>
        <motion.button
          className={`px-6 py-3 bg-rose-500 text-white font-medium rounded-lg ${
            !isValid || isLoading ? "opacity-70 cursor-not-allowed" : ""
          }`}
          whileHover={{
            scale: isValid && !isLoading ? 1.05 : 1,
            backgroundColor: isValid && !isLoading ? "#e11d48" : undefined,
          }}
          whileTap={{ scale: isValid && !isLoading ? 0.95 : 1 }}
          disabled={!isValid || isLoading}
          onClick={handleNext}
        >
          {isLoading ? "Đang xử lý..." : "Tiếp theo"}
        </motion.button>
      </motion.div>

      {/* Error message */}
      {error && (
        <motion.div
          className=" mt-4 p-3 bg-red-50 text-red-600 rounded-lg text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {error}
        </motion.div>
      )}
    </div>
  );
}
