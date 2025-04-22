"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiHome,
  FiBook,
  FiCoffee,
  FiUsers,
  FiInfo,
  FiCheck,
  FiLoader,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";
import axios from "@/lib/axios";

export const UpdateDescription = ({ productId }: { productId: string }) => {
  const [form, setForm] = useState({
    propertyDescription:
      "Đắp xây kỷ niệm tại địa điểm độc đáo và phù hợp cho gia đình này.",
    accommodation: "",
    amenities: "",
    interaction: "",
    otherInfo: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [charCounts, setCharCounts] = useState({
    propertyDescription: form.propertyDescription.length,
    accommodation: 0,
    amenities: 0,
    interaction: 0,
    otherInfo: 0,
  });
  // Add state for tracking open dropdowns
  const [openSections, setOpenSections] = useState({
    propertyDescription: true, // First section open by default
    accommodation: false,
    amenities: false,
    interaction: false,
    otherInfo: false,
  });

  const maxChars = 1000;

  const placeholders = {
    propertyDescription: "Mô tả tổng quan về nhà/phòng cho thuê của bạn...",
    accommodation: "Mô tả chi tiết về không gian ở...",
    amenities: "Liệt kê các tiện ích khách có thể sử dụng...",
    interaction: "Mô tả cách bạn tương tác với khách...",
    otherInfo: "Các thông tin quan trọng khác...",
  };

  const sectionIcons = {
    propertyDescription: <FiHome className="text-blue-500" />,
    accommodation: <FiBook className="text-green-500" />,
    amenities: <FiCoffee className="text-amber-500" />,
    interaction: <FiUsers className="text-purple-500" />,
    otherInfo: <FiInfo className="text-red-500" />,
  };

  // Add toggle function
  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section as keyof typeof prev],
    }));
  };

  const handleChange = (field: string, value: string) => {
    if (value.length <= maxChars) {
      setForm((prev) => ({ ...prev, [field]: value }));
      setCharCounts((prev) => ({ ...prev, [field]: value.length }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const descriptionData = {
        description: {
          description: form.propertyDescription,
          descriptionDetail: form.accommodation,
          guestsAmenities: form.amenities,
          interactionWithGuests: form.interaction,
          otherThingsToNote: form.otherInfo,
        },
      };

      await axios.put(
        `/product/update-description/${productId}`,
        descriptionData
      );

      setNotification({
        message: "Đã lưu thành công",
        type: "success",
      });
      setTimeout(() => setNotification(null), 3000);
    } catch (err) {
      console.error("Error updating description:", err);
      setNotification({
        message: "Có lỗi xảy ra khi lưu. Vui lòng thử lại.",
        type: "error",
      });
      setTimeout(() => setNotification(null), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to render each section as dropdown
  const renderSection = (key: string, label: string) => {
    const isOpen = openSections[key as keyof typeof openSections];
    return (
      <div className="border border-gray-200 rounded-lg overflow-hidden mb-3">
        <button
          type="button"
          onClick={() => toggleSection(key)}
          className={`w-full flex items-center justify-between p-3 text-left ${
            isOpen ? "bg-white" : "bg-white"
          }`}
        >
          <div className="flex items-center space-x-2">
            {sectionIcons[key as keyof typeof sectionIcons]}
            <span className="font-medium text-sm">{label}</span>
          </div>
          {isOpen ? <FiChevronUp /> : <FiChevronDown />}
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="p-3 pt-0">
                <textarea
                  value={form[key as keyof typeof form]}
                  onChange={(e) => handleChange(key, e.target.value)}
                  className="w-full border border-gray-300 rounded-lg py-2 px-3 text-sm min-h-[100px]"
                  placeholder={placeholders[key as keyof typeof placeholders]}
                />
                <div className="text-xs text-gray-500 mt-1 text-right">
                  {charCounts[key as keyof typeof charCounts]}/{maxChars} ký tự
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className="max-w-2xl mx-auto py-6 px-4 bg-white shadow-md rounded-lg">
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`fixed top-4 right-4 px-4 py-2 rounded-md shadow-md flex items-center space-x-2 z-50
              ${
                notification.type === "success"
                  ? "bg-green-100 border border-green-200 text-green-800"
                  : "bg-red-100 border border-red-200 text-red-800"
              }`}
          >
            {notification.type === "success" ? <FiCheck /> : <FiInfo />}
            <span>{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="p-6">
        <h2 className="text-lg font-semibold mb-4">Mô tả chi tiết</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Sections as dropdowns */}
          {renderSection("propertyDescription", "Mô tả nhà/phòng cho thuê")}
          {renderSection("accommodation", "Chỗ ở của bạn")}
          {renderSection("amenities", "Tiện nghi khách có quyền sử dụng")}
          {renderSection("interaction", "Tương tác với khách")}
          {renderSection("otherInfo", "Các thông tin khác cần lưu ý")}

          {/* Submit Button */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="bg-black text-white rounded-lg py-1.5 px-4 text-xs font-medium hover:bg-gray-800 flex items-center space-x-1"
            >
              {isLoading ? (
                <>
                  <FiLoader className="animate-spin" size={14} />
                  <span>Đang lưu...</span>
                </>
              ) : (
                <span>Lưu</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
