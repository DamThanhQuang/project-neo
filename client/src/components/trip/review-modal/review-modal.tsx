import React, { useState, useEffect, useRef } from "react";
import axios from "@/lib/axios";
import Cookies from "js-cookie";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiImage, FiSend } from "react-icons/fi";
import { HiOutlineEmojiHappy } from "react-icons/hi";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
  productName: string;
  productId: string;
}

export default function ReviewModal({
  isOpen,
  onClose,
  bookingId,
  productName,
  productId,
}: ReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const modalRef = useRef<HTMLDivElement>(null);
  const MAX_COMMENT_LENGTH = 500;

  // Reset fields when modal opens
  useEffect(() => {
    if (isOpen) {
      setRating(0);
      setComment("");
      setErrorMessage("");
      setShowSuccessMessage(false);
    }
  }, [isOpen]);

  // Handle clicking outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        handleCloseIntent();
      }
    };
    
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, comment, rating]);

  // Handle ESC key to close
  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleCloseIntent();
      }
    };
    
    if (isOpen) {
      document.addEventListener("keydown", handleEscKey);
    }
    
    return () => {
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [isOpen, comment, rating]);

  const handleCloseIntent = () => {
    // Check if there's unsaved data
    if (comment.trim() || rating > 0) {
      if (confirm("Bạn có chắc muốn hủy đánh giá này?")) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setErrorMessage("Vui lòng chọn số sao đánh giá");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");
    
    try {
      const token = Cookies.get("token");
      const response = await axios.post(
        "/reviews",
        {
          bookingId,
          productId,
          rating,
          comment,
          type: "product",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      if (response.status !== 201) {
        throw new Error("Có lỗi xảy ra");
      }

      setShowSuccessMessage(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error("Lỗi khi gửi đánh giá:", error);
      setErrorMessage("Có lỗi xảy ra khi gửi đánh giá. Vui lòng thử lại sau.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const feedbackTitles = [
    "",
    "Rất không hài lòng",
    "Không hài lòng",
    "Bình thường",
    "Hài lòng",
    "Rất hài lòng"
  ];

  const feedbackEmojis = [
    "",
    "😞",
    "🙁",
    "😐",
    "🙂",
    "😄"
  ];
  
  const ratingColors = [
    "",
    "text-red-500",
    "text-orange-500",
    "text-yellow-500",
    "text-lime-500",
    "text-green-500"
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            ref={modalRef}
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-hidden shadow-2xl relative"
          >
            {/* Decorative top bar */}
            <div className="h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 w-full"></div>
            
            <div className="p-7">
              <div className="flex justify-between items-center mb-6 border-b pb-4">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                  <HiOutlineEmojiHappy className="mr-2 text-blue-500" size={24} />
                  Đánh giá dịch vụ
                </h2>
                <button
                  onClick={handleCloseIntent}
                  className="text-gray-500 hover:text-gray-700 transition-colors p-2 hover:bg-gray-100 rounded-full"
                  aria-label="Đóng"
                >
                  <FiX size={20} />
                </button>
              </div>

              <div className="mb-8 text-center">
                <p className="text-gray-600 mb-1">
                  Đánh giá của bạn về
                </p>
                <h3 className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-blue-400 text-transparent bg-clip-text">
                  {productName}
                </h3>
              </div>

              {showSuccessMessage ? (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-green-50 border border-green-200 rounded-xl p-6 text-center"
                >
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-green-800 mb-2">Đánh giá thành công!</h3>
                  <p className="text-green-600">Cảm ơn bạn đã đánh giá và góp ý. Chúng tôi rất trân trọng phản hồi của bạn.</p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="flex flex-col items-center p-6 bg-gradient-to-b from-blue-50 to-white rounded-xl shadow-sm">
                    <p className="text-center text-lg font-medium text-gray-700 mb-4">
                      Bạn cảm thấy trải nghiệm này thế nào?
                    </p>
                    
                    <div className="flex space-x-5 mb-3">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <motion.button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="focus:outline-none transform transition-transform"
                          whileHover={{ scale: 1.15 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className={`h-14 w-14 transition-all duration-300 ${
                              (hoverRating || rating) >= star 
                                ? "text-yellow-400 drop-shadow-lg" 
                                : "text-gray-200"
                            }`}
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        </motion.button>
                      ))}
                    </div>
                    
                    <AnimatePresence>
                      {(rating > 0 || hoverRating > 0) && (
                        <motion.div 
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className={`flex flex-col items-center mt-3`}
                        >
                          <span className="text-3xl mb-1">{feedbackEmojis[hoverRating || rating]}</span>
                          <p className={`text-lg font-medium ${ratingColors[hoverRating || rating]}`}>
                            {feedbackTitles[hoverRating || rating]}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 shadow-sm">
                    <label className="block text-base font-medium text-gray-700 mb-3 flex justify-between">
                      <span>Chi tiết trải nghiệm của bạn</span>
                      <span className={`text-sm ${comment.length >= MAX_COMMENT_LENGTH ? 'text-red-500' : 'text-gray-500'}`}>
                        {comment.length}/{MAX_COMMENT_LENGTH}
                      </span>
                    </label>
                    <textarea
                      value={comment}
                      onChange={(e) => {
                        if (e.target.value.length <= MAX_COMMENT_LENGTH) {
                          setComment(e.target.value);
                        }
                      }}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                      placeholder="Chia sẻ những điều bạn thích, những điều có thể cải thiện..."
                    ></textarea>
                    
                    <div className="flex justify-between mt-3">
                      <button 
                        type="button"
                        className="inline-flex items-center text-gray-500 hover:text-blue-600 text-sm"
                      >
                        <FiImage className="mr-1" /> Thêm hình ảnh
                      </button>
                      <p className="text-xs text-gray-500 italic">Các trường có dấu * là bắt buộc</p>
                    </div>
                  </div>

                  {errorMessage && (
                    <motion.div 
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-red-50 text-red-600 p-3 rounded-lg border border-red-100"
                    >
                      {errorMessage}
                    </motion.div>
                  )}

                  <div className="flex flex-col sm:flex-row sm:justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handleCloseIntent}
                      className="px-6 py-3 bg-white text-gray-700 rounded-lg border border-gray-300 font-medium hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 inline-flex items-center justify-center"
                    >
                      <FiX className="mr-1" /> Hủy
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting || rating === 0}
                      className={`px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg font-medium shadow-md hover:from-blue-700 hover:to-blue-600 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 inline-flex items-center justify-center ${
                        (isSubmitting || rating === 0) ? "opacity-70 cursor-not-allowed" : ""
                      }`}
                    >
                      <FiSend className="mr-2" /> {isSubmitting ? "Đang gửi..." : "Gửi đánh giá"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}