"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiHome,
  FiBook,
  FiCoffee,
  FiUsers,
  FiInfo,
  FiEdit2,
  FiCheck,
} from "react-icons/fi";

export const UpdateDescription = () => {
  const [descriptionSections, setDescriptionSections] = useState({
    propertyDescription:
      "Đắp xây kỷ niệm tại địa điểm độc đáo và phù hợp cho gia đình này.",
    accommodation: "",
    amenities: "",
    interaction: "",
    otherInfo: "",
  });

  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const handleSave = (section: string, value: string) => {
    setDescriptionSections({
      ...descriptionSections,
      [section]: value,
    });
    setEditingSection(null);

    // Show save status then fade out
    setSaveStatus(`Đã lưu thành công`);
    setTimeout(() => setSaveStatus(null), 3000);
  };

  const placeholders = {
    propertyDescription:
      "Mô tả tổng quan về nhà/phòng cho thuê của bạn. Ví dụ: Căn hộ hiện đại, thoáng mát với view đẹp nhìn ra thành phố...",
    accommodation:
      "Mô tả chi tiết về không gian ở. Ví dụ: Căn hộ có 2 phòng ngủ, 1 phòng khách rộng rãi...",
    amenities:
      "Liệt kê các tiện ích khách có thể sử dụng. Ví dụ: WiFi tốc độ cao, bể bơi, bãi đậu xe miễn phí...",
    interaction:
      "Mô tả cách bạn tương tác với khách. Ví dụ: Tôi luôn sẵn sàng hỗ trợ khách qua điện thoại hoặc tin nhắn...",
    otherInfo:
      "Các thông tin quan trọng khác. Ví dụ: Giờ nhận phòng, trả phòng, quy định về thú cưng...",
  };

  const sectionIcons = {
    propertyDescription: <FiHome className="text-blue-500" />,
    accommodation: <FiBook className="text-green-500" />,
    amenities: <FiCoffee className="text-amber-500" />,
    interaction: <FiUsers className="text-purple-500" />,
    otherInfo: <FiInfo className="text-red-500" />,
  };

  return (
    <>
      {/* Save Status Notification */}
      <AnimatePresence>
        {saveStatus && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed top-4 right-4 bg-green-100 border border-green-200 text-green-800 px-4 py-2 rounded-md shadow-md flex items-center space-x-2 z-50"
          >
            <FiCheck />
            <span>{saveStatus}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Property Description Sections */}
      <motion.div
        className="border border-gray-200 rounded-lg p-6 mb-4 bg-white shadow-sm hover:shadow-md transition-shadow duration-300"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h2 className="text-xl font-semibold mb-8 text-gray-800 border-b pb-4">
          Mô tả chi tiết
        </h2>

        {/* Property Description */}
        <DescriptionSection
          title="Mô tả nhà/phòng cho thuê"
          content={descriptionSections.propertyDescription}
          isEditing={editingSection === "propertyDescription"}
          onEdit={() => setEditingSection("propertyDescription")}
          onSave={(value) => handleSave("propertyDescription", value)}
          placeholder={placeholders.propertyDescription}
          icon={sectionIcons.propertyDescription}
        />

        {/* Accommodation */}
        <DescriptionSection
          title="Chỗ ở của bạn"
          content={descriptionSections.accommodation}
          isEditing={editingSection === "accommodation"}
          onEdit={() => setEditingSection("accommodation")}
          onSave={(value) => handleSave("accommodation", value)}
          placeholder={placeholders.accommodation}
          icon={sectionIcons.accommodation}
        />

        {/* Amenities */}
        <DescriptionSection
          title="Tiện nghi khách có quyền sử dụng"
          content={descriptionSections.amenities}
          isEditing={editingSection === "amenities"}
          onEdit={() => setEditingSection("amenities")}
          onSave={(value) => handleSave("amenities", value)}
          placeholder={placeholders.amenities}
          icon={sectionIcons.amenities}
        />

        {/* Guest Interaction */}
        <DescriptionSection
          title="Tương tác với khách"
          content={descriptionSections.interaction}
          isEditing={editingSection === "interaction"}
          onEdit={() => setEditingSection("interaction")}
          onSave={(value) => handleSave("interaction", value)}
          placeholder={placeholders.interaction}
          icon={sectionIcons.interaction}
        />

        {/* Other Information */}
        <DescriptionSection
          title="Các thông tin khác cần lưu ý"
          content={descriptionSections.otherInfo}
          isEditing={editingSection === "otherInfo"}
          onEdit={() => setEditingSection("otherInfo")}
          onSave={(value) => handleSave("otherInfo", value)}
          placeholder={placeholders.otherInfo}
          icon={sectionIcons.otherInfo}
        />
      </motion.div>
    </>
  );
};

interface DescriptionSectionProps {
  title: string;
  content: string;
  isEditing: boolean;
  onEdit: () => void;
  onSave: (value: string) => void;
  placeholder: string;
  icon: React.ReactNode;
}

const DescriptionSection = ({
  title,
  content,
  isEditing,
  onEdit,
  onSave,
  placeholder,
  icon,
}: DescriptionSectionProps) => {
  const [value, setValue] = useState(content);
  const [charCount, setCharCount] = useState(content.length);
  const maxChars = 500;

  useEffect(() => {
    setCharCount(value.length);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    if (newValue.length <= maxChars) {
      setValue(newValue);
      setCharCount(newValue.length);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.4 } },
  };

  return (
    <motion.div
      className="mb-8 last:mb-0 border-b pb-6 last:border-b-0"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center space-x-2">
          {icon}
          <h3 className="font-medium text-lg text-gray-800">{title}</h3>
        </div>
        {!isEditing && (
          <motion.button
            className={`text-sm font-medium px-3 py-1 rounded-full flex items-center space-x-1 
              ${
                content
                  ? "text-blue-600 hover:bg-blue-50"
                  : "text-green-600 hover:bg-green-50"
              }`}
            whileHover={{ scale: 1.03 }}
            onClick={onEdit}
          >
            <FiEdit2 size={14} />
            <span>{content ? "Chỉnh sửa" : "Thêm thông tin"}</span>
          </motion.button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {isEditing ? (
          <motion.div
            key="editing"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-gray-50 p-4 rounded-lg"
          >
            <textarea
              value={value}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg min-h-[120px] focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              placeholder={placeholder}
            />
            <div className="flex justify-between mt-2">
              <div className="text-xs text-gray-500">
                {charCount}/{maxChars} ký tự
              </div>
              <div className="flex space-x-2">
                <motion.button
                  className="px-4 py-2 text-sm border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  onClick={() => {
                    setValue(content);
                    setCharCount(content.length);
                    onEdit();
                  }}
                >
                  Hủy
                </motion.button>
                <motion.button
                  className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-1"
                  whileHover={{ scale: 1.02 }}
                  onClick={() => onSave(value)}
                  disabled={value.trim() === ""}
                >
                  <FiCheck size={14} />
                  <span>Lưu</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="viewing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-gray-700"
          >
            {content ? (
              <p className="leading-relaxed">{content}</p>
            ) : (
              <p className="text-gray-400 italic">
                Chưa có thông tin, nhấn "Thêm thông tin" để cập nhật.
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
