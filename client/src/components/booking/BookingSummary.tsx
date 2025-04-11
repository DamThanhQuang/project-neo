"use client";

import { useState } from "react";
import { FaStar } from "react-icons/fa";
import { BookingState } from "./BookingForm";

interface BookingSummaryProps {
  product: any;
  setShowBookingModal: (show: boolean) => void;
}

export default function BookingSummary({
  product,
  setShowBookingModal,
}: BookingSummaryProps) {
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

  // Calculate nights and prices
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

  // Check if booking is last minute
  const isBookingLastMinute = () => {
    const checkInDate = booking.dateRange.startDate;
    const today = new Date();
    const diffTime = Math.abs(checkInDate.getTime() - today.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 3;
  };

  return (
    <div className="sticky top-24">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xl p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <span className="text-2xl font-bold">₫{product.price}</span>
            <span className="text-gray-600"> / đêm</span>
          </div>
          <div className="flex items-center">
            <FaStar className="text-yellow-400 mr-1" />
            <span className="font-medium">{product.rating}</span>
            <span className="mx-1 text-gray-400">·</span>
            <span className="text-gray-600 underline cursor-pointer">
              {product.totalRatings} đánh giá
            </span>
          </div>
        </div>

        {/* Date and Guest Selector */}
        <div className="mb-6">
          <div className="grid grid-cols-2 rounded-t-xl overflow-hidden border border-gray-300">
            <div
              className="p-3 border-r border-gray-300 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => setShowBookingModal(true)}
            >
              <div className="text-xs font-medium text-gray-500">
                NHẬN PHÒNG
              </div>
              <div className="font-medium">
                {booking.dateRange.startDate.toLocaleDateString()}
              </div>
            </div>
            <div
              className="p-3 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => setShowBookingModal(true)}
            >
              <div className="text-xs font-medium text-gray-500">TRẢ PHÒNG</div>
              <div className="font-medium">
                {booking.dateRange.endDate.toLocaleDateString()}
              </div>
            </div>
          </div>

          <div
            className="p-3 border border-t-0 border-gray-300 rounded-b-xl cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => setShowBookingModal(true)}
          >
            <div className="text-xs font-medium text-gray-500">KHÁCH</div>
            <div className="flex justify-between items-center">
              <div className="font-medium">{booking.guests} khách</div>
              <svg
                className="w-4 h-4 text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Book Button */}
        <button
          onClick={() => setShowBookingModal(true)}
          className="w-full py-3 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-xl font-bold transition-all duration-300 shadow-lg shadow-rose-200 hover:shadow-rose-300 mb-4"
        >
          Đặt phòng
        </button>

        {/* Price breakdown */}
        <div className="space-y-3 text-gray-600 mt-4">
          <div className="flex justify-between">
            <span className="underline">
              ₫{product.price} x {nightCount} đêm
            </span>
            <span>₫{totalPrice}</span>
          </div>
          <div className="flex justify-between">
            <span className="underline">Phí dịch vụ</span>
            <span>₫{serviceFee}</span>
          </div>
          <div className="border-t pt-3 mt-3 flex justify-between font-bold text-black">
            <span>Tổng trước thuế</span>
            <span>₫{totalWithFees}</span>
          </div>
        </div>
      </div>

      {/* Loyalty Program Teaser */}
      <div className="mt-4 flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-100">
        <div className="flex items-center">
          <svg
            className="w-5 h-5 text-amber-600 mr-2"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <span className="text-sm font-medium">Tích luỹ điểm thưởng</span>
        </div>
        <span className="text-sm text-amber-700 font-medium">
          +{Math.round(totalWithFees * 0.05)} điểm
        </span>
      </div>

      {/* Last Minute Deal Teaser */}
      {isBookingLastMinute() && (
        <div className="mt-4 p-3 bg-rose-50 rounded-lg border border-rose-100">
          <div className="flex items-center text-rose-600">
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
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-sm font-medium">Giảm 15% cho đặt phòng gấp!</p>
          </div>
          <p className="text-xs text-rose-500 mt-1">
            Áp dụng cho lịch nhận phòng trong 3 ngày tới
          </p>
        </div>
      )}

      {/* Flexible Payment Teaser */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
        <div className="flex items-center text-blue-600 mb-1">
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
          <p className="text-sm font-medium">Thanh toán linh hoạt</p>
        </div>
        <p className="text-xs text-blue-500">
          Trả góp 3-12 tháng không lãi suất hoặc chia sẻ thanh toán nhóm
        </p>
      </div>

      <div className="mt-4 p-4 bg-rose-50 rounded-xl border border-rose-100">
        <p className="text-rose-600 text-sm text-center">
          Đây là chỗ ở được đặt nhiều. Đặt ngay kẻo hết!
        </p>
      </div>
    </div>
  );
}
