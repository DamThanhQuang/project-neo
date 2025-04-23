"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaUser, FaRegCalendarAlt } from "react-icons/fa";
import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import axios from "@/lib/axios";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

// Types
interface GroupMember {
  name: string;
  email: string;
  amount: number;
}

interface BookingDate {
  startDate: Date;
  endDate: Date;
  key: string;
}

interface Product {
  id: number;
  title: string;
  price: number;
  image: string[];
  location: {
    city: string;
    country: string;
  };
}

interface BookingState {
  dateRange: BookingDate;
  guests: number;
  isSubmitting: boolean;
  message: string;
  error: string | null;
  success: boolean;
  paymentMethod: "full" | "installment" | "group";
  installmentMonths: number;
  groupMembers: GroupMember[];
  isLastMinute: boolean;
  loyaltyPoints: number;
  usingPoints: boolean;
  isGroupBooking: boolean;
}

interface BookingFormProps {
  product: Product;
  showBookingModal: boolean;
  setShowBookingModal: (show: boolean) => void;
}

export default function BookingForm({
  product,
  showBookingModal,
  setShowBookingModal,
}: BookingFormProps) {
  const router = useRouter();

  const [booking, setBooking] = useState<BookingState>({
    dateRange: {
      startDate: new Date(),
      endDate: new Date(new Date().setDate(new Date().getDate() + 1)),
      key: "selection",
    },
    guests: 1,
    isSubmitting: false,
    message: "",
    error: null,
    success: false,
    paymentMethod: "full",
    installmentMonths: 3,
    groupMembers: [],
    isLastMinute: false,
    loyaltyPoints: 0,
    usingPoints: false,
    isGroupBooking: false,
  });

  // Calculate number of nights and total price
  const nightCount =
    booking.dateRange.endDate && booking.dateRange.startDate
      ? Math.ceil(
          (booking.dateRange.endDate.getTime() -
            booking.dateRange.startDate.getTime()) /
            (1000 * 60 * 60 * 24)
        )
      : 1;

  const totalPrice = (product?.price || 0) * nightCount;
  const serviceFee = Math.round(totalPrice * 0.12); // Example service fee
  const totalWithFees = totalPrice + serviceFee;

  // Group booking helpers
  const addGroupMember = () => {
    setBooking((prev) => ({
      ...prev,
      groupMembers: [
        ...prev.groupMembers,
        {
          name: "",
          email: "",
          amount: Math.round(totalWithFees / (prev.groupMembers.length + 2)),
        },
      ],
    }));
  };

  const removeGroupMember = (index: number): void => {
    setBooking((prev) => ({
      ...prev,
      groupMembers: prev.groupMembers.filter((_, i) => i !== index),
    }));
  };

  type GroupMemberField = keyof GroupMember;

  const updateGroupMember = (
    index: number,
    field: GroupMemberField,
    value: string | number
  ) => {
    setBooking((prev) => ({
      ...prev,
      groupMembers: prev.groupMembers.map((member, i) =>
        i === index ? { ...member, [field]: value } : member
      ),
    }));
  };

  // Last minute booking check
  const isBookingLastMinute = () => {
    const checkInDate = booking.dateRange.startDate;
    const today = new Date();
    const diffTime = Math.abs(checkInDate.getTime() - today.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 3;
  };

  // Final price calculation
  const calculateFinalPrice = () => {
    let finalPrice = totalWithFees;

    // Áp dụng giảm giá phút chót
    if (isBookingLastMinute()) {
      finalPrice = finalPrice * 0.85; // Giảm 15%
    }

    // Áp dụng điểm thưởng
    if (booking.usingPoints) {
      const pointsDiscount = Math.min(1250, Math.round(totalWithFees * 0.1));
      finalPrice = finalPrice - pointsDiscount;
    }

    return Math.round(finalPrice);
  };

  // Booking handler
  const handleBookNow = async () => {
    if (!product) return;

    const token = Cookies.get("token");
    const formattedToken = token?.startsWith("Bearer ")
      ? token
      : `Bearer ${token}`;
    if (!token) {
      setBooking((prev) => ({
        ...prev,
        error: "Bạn cần đăng nhập để đặt phòng",
      }));
      setTimeout(() => {
        router.push("/login");
      }, 2000);
      return;
    }
    console.log("token", token);

    try {
      setBooking((prev) => ({ ...prev, isSubmitting: true, error: null }));

      // Tính toán giá cuối cùng
      const finalPrice = calculateFinalPrice();

      // Chuẩn bị dữ liệu đặt phòng
      const bookingData = {
        productId: product.id.toString(),
        checkIn: booking.dateRange.startDate.toISOString(),
        checkOut: booking.dateRange.endDate.toISOString(),
        guests: Number(booking.guests),
        totalPrice: Number(finalPrice),
        // // Thông tin thanh toán
        // paymentMethod: booking.paymentMethod,
        // installmentMonths: booking.installmentMonths,
        // // Thông tin đặt phòng nhóm
        // isGroupBooking: booking.isGroupBooking,
        // groupMembers: booking.groupMembers,
        // // Thông tin khuyến mãi
        // isLastMinute: isBookingLastMinute(),
        // // Thông tin điểm thưởng
        // usingLoyaltyPoints: booking.usingPoints,
        // loyaltyPointsUsed: booking.usingPoints
        //   ? Math.min(1250, Math.round(totalWithFees * 0.1))
        //   : 0,
        // loyaltyPointsEarned: Math.round(finalPrice * 0.05),
      };

      console.log("Booking data:", bookingData);

      const response = await axios.post("/bookings", bookingData, {
        headers: {
          Authorization: formattedToken,
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });
      console.log("Booking response:", response);

      setBooking((prev) => ({
        ...prev,
        isSubmitting: false,
        success: true,
        message:
          booking.paymentMethod === "group"
            ? "Đặt phòng thành công! Chúng tôi đã gửi thông tin thanh toán đến các thành viên trong nhóm."
            : booking.paymentMethod === "installment"
            ? `Đặt phòng thành công! Lịch thanh toán trả góp ${booking.installmentMonths} tháng đã được thiết lập.`
            : "Đặt phòng thành công! Chúng tôi sẽ gửi thông tin xác nhận đến email của bạn.",
      }));

      // Close modal after 3 seconds of success
      setTimeout(() => {
        setShowBookingModal(false);
        setBooking((prev) => ({
          ...prev,
          success: false,
          message: "",
        }));
      }, 3000);
    } catch (error) {
      console.error("Booking error:", error);
      setBooking((prev) => ({
        ...prev,
        isSubmitting: false,
        error:
          error instanceof Error
            ? error.message
            : "Không thể hoàn tất đặt phòng. Vui lòng thử lại.",
      }));
    }
  };

  // Booking modal component
  return (
    <AnimatePresence>
      {showBookingModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto"
          onClick={() => setShowBookingModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-white rounded-2xl w-full max-w-4xl overflow-hidden shadow-xl flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative">
              <div className="p-4 border-b border-gray-100">
                <button
                  onClick={() => setShowBookingModal(false)}
                  className="absolute top-4 left-4 text-gray-500 hover:text-gray-700 rounded-full p-1 hover:bg-gray-100 transition"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 19l-7-7m0 0l7-7m-7 7h18"
                    />
                  </svg>
                </button>
                <h3 className="text-2xl font-bold text-center text-gray-800">
                  Hoàn tất đặt phòng
                </h3>
              </div>

              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto max-h-[80vh]">
                {/* Left column - calendar and booking details */}
                <div>
                  <div className="bg-gray-50 p-4 rounded-xl mb-5">
                    <div className="flex items-center gap-4 mb-3">
                      {product.image[0] && (
                        <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                          <img
                            src={product.image[0]}
                            alt={product.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div>
                        <h4 className="font-semibold text-gray-700">
                          {product.title}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {product.location.city}, {product.location.country}
                        </p>
                      </div>
                    </div>

                    {/* Last Minute Offer Alert */}
                    {isBookingLastMinute() && (
                      <div className="mt-2 p-2 bg-amber-50 border-l-4 border-amber-500 text-amber-700 rounded-lg">
                        <p className="text-sm font-medium flex items-center">
                          <svg
                            className="w-5 h-5 mr-1"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 110-12 6 6 0 010 12z" />
                            <path d="M10 6a1 1 0 011 1v3a1 1 0 01-1 1 1 1 0 01-1-1V7a1 1 0 011-1zm0 7a1 1 0 110 2 1 1 0 010-2z" />
                          </svg>
                          Ưu đãi phút chót! Giảm 15% khi đặt phòng trong 3 ngày
                          tới
                        </p>
                      </div>
                    )}
                  </div>

                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                    <FaRegCalendarAlt className="mr-2" />
                    Chọn ngày
                  </h4>
                  <div className="mb-6">
                    <DateRange
                      editableDateInputs={true}
                      onChange={(item) =>
                        setBooking((prev) => ({
                          ...prev,
                          dateRange: {
                            startDate: item.selection.startDate || new Date(),
                            endDate:
                              item.selection.endDate ||
                              new Date(
                                new Date().setDate(new Date().getDate() + 1)
                              ),
                            key: item.selection.key || "selection",
                          },
                        }))
                      }
                      moveRangeOnFirstSelection={false}
                      ranges={[booking.dateRange]}
                      minDate={new Date()}
                      className="w-full border rounded-xl overflow-hidden"
                      rangeColors={["#EC4899"]}
                    />
                  </div>

                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                    <FaUser className="mr-2" />
                    Số lượng khách
                  </h4>
                  <div className="flex items-center border rounded-xl p-4 mb-6">
                    <select
                      value={booking.guests}
                      onChange={(e) =>
                        setBooking((prev) => ({
                          ...prev,
                          guests: parseInt(e.target.value),
                          isGroupBooking: parseInt(e.target.value) > 2,
                        }))
                      }
                      className="w-full outline-none bg-transparent text-gray-700"
                    >
                      {[...Array(10)].map((_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {i + 1} khách{i !== 0 ? "" : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Right column - payment options and booking summary */}
                <div>
                  {/* Loyalty Program Section */}
                  <div className="mb-5 p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-800 flex items-center">
                        <svg
                          className="w-5 h-5 mr-2"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        Chương trình khách hàng thân thiết
                      </h4>
                      <span className="text-amber-600 font-bold">
                        1,250 điểm
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-600">
                        Đặt phòng này và nhận{" "}
                        <span className="font-medium">
                          {Math.round(totalWithFees * 0.05)} điểm
                        </span>
                      </div>

                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={booking.usingPoints}
                          onChange={(e) =>
                            setBooking((prev) => ({
                              ...prev,
                              usingPoints: e.target.checked,
                            }))
                          }
                          className="w-4 h-4 text-pink-600 rounded focus:ring-pink-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          Dùng điểm
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Payment Options */}
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                      />
                    </svg>
                    Tùy chọn thanh toán
                  </h4>

                  <div className="space-y-3 mb-5">
                    {/* Payment options here - keeping the same code */}
                    {/* ... */}
                  </div>

                  <div className="border-t border-gray-100 pt-4 pb-1">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">
                        ₫{product.price} × {nightCount} đêm
                      </span>
                      <span className="font-medium">₫{totalPrice}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Phí dịch vụ</span>
                      <span className="font-medium">₫{serviceFee}</span>
                    </div>

                    {isBookingLastMinute() && (
                      <div className="flex justify-between mb-2 text-amber-600">
                        <span>Giảm giá phút chót (15%)</span>
                        <span>-₫{Math.round(totalWithFees * 0.15)}</span>
                      </div>
                    )}

                    {booking.usingPoints && (
                      <div className="flex justify-between mb-2 text-amber-600">
                        <span>Sử dụng điểm thưởng</span>
                        <span>
                          -₫{Math.min(1250, Math.round(totalWithFees * 0.1))}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between pt-3 border-t border-gray-100 mt-3 font-bold text-gray-800">
                      <span>Tổng</span>
                      <span>₫{calculateFinalPrice()}</span>
                    </div>

                    {booking.paymentMethod === "installment" && (
                      <div className="text-xs text-gray-500 text-right mt-1">
                        hoặc ₫
                        {Math.round(
                          calculateFinalPrice() / booking.installmentMonths
                        )}
                        /tháng × {booking.installmentMonths} tháng
                      </div>
                    )}
                  </div>

                  {booking.error && (
                    <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg">
                      <p className="font-medium">Lỗi!</p>
                      <p>{booking.error}</p>
                    </div>
                  )}

                  {booking.success && (
                    <div className="mb-4 p-3 bg-green-50 border-l-4 border-green-500 text-green-700 rounded-lg">
                      <p className="font-medium">Thành công!</p>
                      <p>{booking.message}</p>
                    </div>
                  )}

                  <button
                    onClick={handleBookNow}
                    disabled={booking.isSubmitting}
                    className="w-full py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl font-bold text-lg hover:from-pink-600 hover:to-rose-600 transition duration-300 shadow-lg shadow-rose-200 disabled:opacity-70 flex justify-center items-center"
                  >
                    {booking.isSubmitting ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Đang xử lý...
                      </>
                    ) : (
                      "Đặt phòng ngay"
                    )}
                  </button>

                  <p className="text-xs text-gray-500 text-center mt-3">
                    Bạn sẽ không bị trừ tiền cho đến khi xác nhận.
                  </p>
                </div>

                {/* Group Booking Section - show only when activated */}
                {booking.isGroupBooking && (
                  <div className="md:col-span-2 mb-5">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-800 flex items-center">
                        <svg
                          className="w-5 h-5 mr-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                          />
                        </svg>
                        Đặt phòng nhóm
                      </h4>
                      <button
                        onClick={addGroupMember}
                        className="text-sm text-pink-600 hover:text-pink-800 font-medium"
                      >
                        + Thêm thành viên
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                      {booking.groupMembers.map((member, index) => (
                        <div key={index} className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <h5 className="font-medium">
                              Thành viên {index + 1}
                            </h5>
                            <button
                              onClick={() => removeGroupMember(index)}
                              className="text-gray-400 hover:text-red-500"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                            </button>
                          </div>
                          <div className="space-y-2">
                            <input
                              type="text"
                              placeholder="Tên"
                              value={member.name}
                              onChange={(e) =>
                                updateGroupMember(index, "name", e.target.value)
                              }
                              className="w-full p-2 border rounded-lg text-sm"
                            />
                            <input
                              type="email"
                              placeholder="Email"
                              value={member.email}
                              onChange={(e) =>
                                updateGroupMember(
                                  index,
                                  "email",
                                  e.target.value
                                )
                              }
                              className="w-full p-2 border rounded-lg text-sm"
                            />
                            <div className="flex items-center">
                              <span className="text-sm text-gray-500 mr-2">
                                Đóng góp:
                              </span>
                              <input
                                type="number"
                                placeholder="Số tiền"
                                value={member.amount}
                                onChange={(e) =>
                                  updateGroupMember(
                                    index,
                                    "amount",
                                    parseFloat(e.target.value)
                                  )
                                }
                                className="flex-1 p-2 border rounded-lg text-sm"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {booking.groupMembers.length > 0 && (
                      <div className="text-sm text-gray-500 italic">
                        Chúng tôi sẽ gửi thông báo thanh toán tới email của mỗi
                        thành viên sau khi bạn hoàn tất đặt phòng.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Sử dụng hooks cho các tính năng như giá cuối cùng
export const useBookingCalculations = (
  product: Product,
  booking: BookingState
) => {
  const nightCount =
    booking.dateRange.endDate && booking.dateRange.startDate
      ? Math.ceil(
          (booking.dateRange.endDate.getTime() -
            booking.dateRange.startDate.getTime()) /
            (1000 * 60 * 60 * 24)
        )
      : 1;

  const totalPrice = (product?.price || 0) * nightCount;
  const serviceFee = Math.round(totalPrice * 0.12);
  const totalWithFees = totalPrice + serviceFee;

  // Last minute booking check
  const isBookingLastMinute = () => {
    const checkInDate = booking.dateRange.startDate;
    const today = new Date();
    const diffTime = Math.abs(checkInDate.getTime() - today.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 3;
  };

  // Final price calculation
  const calculateFinalPrice = () => {
    let finalPrice = totalWithFees;

    if (isBookingLastMinute()) {
      finalPrice = finalPrice * 0.85;
    }

    if (booking.usingPoints) {
      const pointsDiscount = Math.min(1250, Math.round(totalWithFees * 0.1));
      finalPrice = finalPrice - pointsDiscount;
    }

    return Math.round(finalPrice);
  };

  return {
    nightCount,
    totalPrice,
    serviceFee,
    totalWithFees,
    isBookingLastMinute,
    calculateFinalPrice,
  };
};

export type { BookingState, GroupMember };
