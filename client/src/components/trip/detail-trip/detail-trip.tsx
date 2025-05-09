"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "@/lib/axios";
import { isAxiosError } from "axios";
import Cookies from "js-cookie";
import {
  CalendarIcon,
  MapPinIcon,
  HomeIcon,
  CreditCardIcon,
  UserIcon,
  PhoneIcon,
  ExclamationCircleIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import PaymentModal from "@/components/trip/payment-modal/payment-modal";
import ReviewModal from "../review-modal/review-modal";

// Định nghĩa interfaces
interface ProductDescription {
  description?: string;
  descriptionDetail?: string;
  guestsAmenities?: string;
  interactionWithGuests?: string;
  otherThingsToNote?: string;
}

interface Product {
  _id: string;
  name: string;
  images: string[];
  location: {
    address: string;
    city: string;
    country: string;
  };
  price: number;
  description: string | ProductDescription;
  amenities: string[];
}

interface Booking {
  _id: string;
  productId: Product;
  checkIn: string;
  checkOut: string;
  name: string;
  status: string;
  createdAt: string;
  totalPrice: number;
  guests: number;
}

// Modal component
function DescriptionModal({
  isOpen,
  onClose,
  description,
}: {
  isOpen: boolean;
  onClose: () => void;
  description: ProductDescription;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              Thông tin chi tiết
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="space-y-6">
            {description.description && (
              <div>
                <h3 className="text-lg font-medium mb-2">Mô tả</h3>
                <p className="text-gray-600">{description.description}</p>
              </div>
            )}

            {description.descriptionDetail && (
              <div>
                <h3 className="text-lg font-medium mb-2">Chi tiết</h3>
                <p className="text-gray-600">{description.descriptionDetail}</p>
              </div>
            )}

            {description.guestsAmenities && (
              <div>
                <h3 className="text-lg font-medium mb-2">Tiện ích cho khách</h3>
                <p className="text-gray-600">{description.guestsAmenities}</p>
              </div>
            )}

            {description.interactionWithGuests && (
              <div>
                <h3 className="text-lg font-medium mb-2">
                  Tương tác với khách
                </h3>
                <p className="text-gray-600">
                  {description.interactionWithGuests}
                </p>
              </div>
            )}

            {description.otherThingsToNote && (
              <div>
                <h3 className="text-lg font-medium mb-2">Lưu ý khác</h3>
                <p className="text-gray-600">{description.otherThingsToNote}</p>
              </div>
            )}
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BookingDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const bookingId = params.id as string;

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isDescriptionModalOpen, setDescriptionModalOpen] =
    useState<boolean>(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);
  const [isReviewModalOpen, setReviewModalOpen] = useState(false);

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        setLoading(true);
        const token = Cookies.get("token");

        if (!token) {
          router.push("/login");
          return;
        }

        console.log("Đang lấy thông tin đặt phòng với ID:", bookingId);
        const response = await axios.get(`/bookings/${bookingId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Kiểm tra xem dữ liệu có đúng cấu trúc không
        if (!response.data || !response.data.productId) {
          console.error("Cấu trúc phản hồi không hợp lệ:", response.data);
          setError("Dữ liệu từ server không đúng định dạng");
          setLoading(false);
          return;
        }

        const bookingData = response.data;
        if (typeof bookingData.productId === "string") {
          console.warn(
            "ProductId là một chuỗi tham chiếu thay vì một đối tượng đầy đủ"
          );
        }

        setBooking(bookingData);
        setLoading(false);
      } catch (err: any) {
        console.error("Lỗi khi lấy chi tiết đặt phòng:", err);
        setError(
          `Không thể tải thông tin chi tiết đặt phòng: ${
            err.message || "Lỗi không xác định"
          }`
        );
        setLoading(false);
      }
    };

    if (bookingId) {
      fetchBookingDetails();
    } else {
      console.error("Không có bookingId được cung cấp");
      setError("Thiếu thông tin ID đặt phòng");
      setLoading(false);
    }
  }, [bookingId, router]);

  // Calculate number of nights
  const calculateNights = () => {
    if (!booking) return 0;
    const checkIn = new Date(booking.checkIn);
    const checkOut = new Date(booking.checkOut);
    return Math.round(
      (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
    );
  };

  const processPayment = async () => {
    setIsProcessingPayment(true);
    try {
      // Lấy token xác thực
      const token = Cookies.get("token");
      if (!token) {
        router.push("/login");
        return;
      }

      // Lấy email từ thông tin người dùng
      const userEmail = booking?.name || "";

      // Gọi API thanh toán
      const response = await axios.post(
        "/payment/create-checkout-session",
        {
          amount: booking?.totalPrice || 0,
          email: userEmail,
          bookingId: booking?._id || "",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Chuyển hướng đến trang thanh toán Stripe
      if (response.data && response.data.url) {
        console.log("Đang chuyển hướng đến trang thanh toán...");
        window.location.href = response.data.url;
      } else {
        throw new Error("Không nhận được URL thanh toán");
      }
    } catch (error) {
      console.error("Lỗi khi tạo phiên thanh toán:", error);

      // Xử lý lỗi chi tiết hơn
      if (isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.message || "Lỗi kết nối đến máy chủ";
        alert(`Không thể tạo phiên thanh toán: ${errorMessage}`);
      } else {
        alert("Không thể tạo phiên thanh toán. Vui lòng thử lại sau.");
      }
    } finally {
      setIsProcessingPayment(false);
      setPaymentModalOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 font-sans">
        <div className="flex flex-col items-center justify-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mb-4"></div>
          <p className="text-gray-600">Đang tải thông tin chi tiết...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 font-sans">
        <div className="py-10 bg-red-50 rounded-lg border border-red-100 flex items-center justify-center">
          <ExclamationCircleIcon className="h-6 w-6 text-red-500 mr-2" />
          <p className="text-red-600 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 font-sans">
        <p className="text-center text-gray-600">
          Không tìm thấy thông tin đặt phòng
        </p>
      </div>
    );
  }

  const nights = calculateNights();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 font-sans">
      <div className="mb-8">
        <Link
          href="/trip"
          className="inline-flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Quay lại danh sách chuyến đi
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
        {/* Booking status header */}
        <div
          className={`py-4 px-6 ${
            booking.status === "confirmed"
              ? "bg-green-50 border-b border-green-100"
              : booking.status === "cancelled"
              ? "bg-red-50 border-b border-red-100"
              : booking.status === "completed"
              ? "bg-blue-50 border-b border-blue-100"
              : booking.status === "expired"
              ? "bg-gray-50 border-b border-gray-100"
              : "bg-yellow-50 border-b border-yellow-100"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div
                className={`w-3 h-3 rounded-full mr-2 ${
                  booking.status === "confirmed"
                    ? "bg-green-500"
                    : booking.status === "cancelled"
                    ? "bg-red-500"
                    : booking.status === "completed"
                    ? "bg-blue-500"
                    : booking.status === "expired"
                    ? "bg-gray-500"
                    : "bg-yellow-500"
                }`}
              ></div>
              <span className="font-medium">
                {booking.status === "confirmed"
                  ? "Đã xác nhận thanh toán"
                  : booking.status === "cancelled"
                  ? "Đã hủy"
                  : booking.status === "completed"
                  ? "Đã hoàn thành"
                  : booking.status === "active"
                  ? "Đã xác nhận"
                  : booking.status === "expired"
                  ? "Đã hết hạn"
                  : "Đang chờ xác nhận"}
              </span>
            </div>
            <span className="text-sm text-gray-500">
              Đặt lúc: {new Date(booking.createdAt).toLocaleString("vi-VN")}
            </span>
          </div>
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
          {/* Left column - Product details */}
          <div className="md:col-span-2">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              {booking.productId.name}
            </h1>

            <div className="flex items-center text-gray-600 mb-6">
              <MapPinIcon className="h-5 w-5 mr-2 text-gray-400 flex-shrink-0" />
              <p>
                {booking.productId.location
                  ? `${booking.productId.location.address || ""}, ${
                      booking.productId.location.city || ""
                    }, ${booking.productId.location.country || ""}`
                  : "Không có địa chỉ"}
              </p>
            </div>

            {/* Image gallery */}
            <div className="mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {booking.productId.images.slice(0, 4).map((image, index) => (
                  <div
                    key={index}
                    className="aspect-video rounded-lg overflow-hidden"
                  >
                    <img
                      src={image}
                      alt={`${booking.productId.name} - Hình ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Product description */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Thông tin phòng
              </h2>

              {typeof booking.productId.description === "object" &&
              booking.productId.description !== null ? (
                <div className="space-y-4">
                  {/* Hiển thị phiên bản thu gọn */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    {booking.productId.description.description && (
                      <div>
                        <h3 className="text-lg font-medium mb-2">Mô tả</h3>
                        <p className="text-gray-600 line-clamp-3">
                          {booking.productId.description.description}
                        </p>
                      </div>
                    )}

                    {/* Hiển thị số lượng các mục khác nếu có */}
                    <div className="mt-4 text-sm text-gray-500">
                      {[
                        booking.productId.description.descriptionDetail &&
                          "Chi tiết",
                        booking.productId.description.guestsAmenities &&
                          "Tiện ích cho khách",
                        booking.productId.description.interactionWithGuests &&
                          "Tương tác với khách",
                        booking.productId.description.otherThingsToNote &&
                          "Lưu ý khác",
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </div>

                    {/* Nút xem thêm */}
                    <button
                      className="mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg flex items-center transition"
                      onClick={() => setDescriptionModalOpen(true)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-1"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Xem thêm thông tin chi tiết
                    </button>
                  </div>

                  {/* Modal component */}
                  <DescriptionModal
                    isOpen={isDescriptionModalOpen}
                    onClose={() => setDescriptionModalOpen(false)}
                    description={
                      booking.productId.description as ProductDescription
                    }
                  />
                </div>
              ) : (
                <p className="text-gray-600 mb-6">
                  {typeof booking.productId.description === "string"
                    ? booking.productId.description
                    : "Không có mô tả cho phòng này."}
                </p>
              )}

              {/* Amenities */}
              {booking.productId.amenities &&
                booking.productId.amenities.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium mb-3">Tiện nghi</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {booking.productId.amenities.map((amenity, index) => (
                        <div
                          key={index}
                          className="flex items-center text-gray-700"
                        >
                          <svg
                            className="h-4 w-4 mr-2 text-green-500"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span>{amenity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          </div>

          {/* Right column - Booking details */}
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 h-fit">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              Chi tiết đặt phòng
            </h2>
            {/* Check-in/out */}
            <div className="mb-6">
              <div className="flex justify-between mb-4 pb-4 border-b border-gray-200">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Nhận phòng
                  </h3>
                  <p className="font-medium">
                    {new Date(booking.checkIn).toLocaleDateString("vi-VN", {
                      weekday: "long",
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <h3 className="text-sm font-medium text-gray-500">
                    Trả phòng
                  </h3>
                  <p className="font-medium">
                    {new Date(booking.checkOut).toLocaleDateString("vi-VN", {
                      weekday: "long",
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
              <div className="text-center text-gray-600">
                <CalendarIcon className="h-5 w-5 inline mr-2" />
                Tổng thời gian:{" "}
                <span className="font-medium">{nights} đêm</span>
              </div>
            </div>
            {/* Guests */}
            <div className="mb-6 pb-4 border-b border-gray-200">
              <div className="flex items-center">
                <UserIcon className="h-5 w-5 text-gray-400 mr-2" />
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Khách</h3>
                  <p className="font-medium">{booking.guests || 1} người</p>
                </div>
              </div>
            </div>
            {/* Price details */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-500 mb-4">
                Chi tiết giá
              </h3>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>
                    {booking.productId.price.toLocaleString("vi-VN")}đ x{" "}
                    {nights} đêm
                  </span>
                  <span>
                    {(booking.productId.price * nights).toLocaleString("vi-VN")}
                    đ
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Phí dịch vụ</span>
                  <span>
                    {(
                      booking.totalPrice -
                      booking.productId.price * nights
                    ).toLocaleString("vi-VN")}
                    đ
                  </span>
                </div>

                <div className="pt-3 mt-3 border-t border-gray-200 flex justify-between font-bold">
                  <span>Tổng</span>
                  <span>{booking.totalPrice.toLocaleString("vi-VN")}đ</span>
                </div>
              </div>
            </div>
            {/* Actions */}
            {/* Chỉ hiển thị nút thanh toán khi status là pending hoặc active */}
            {(booking.status === "pending" || booking.status === "active") && (
              <div className="mt-6">
                <button
                  className={`w-full py-3 ${
                    isProcessingPayment
                      ? "bg-blue-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  } text-white rounded-lg font-medium transition-colors mb-4`}
                  disabled={isProcessingPayment}
                  onClick={() => setPaymentModalOpen(true)}
                >
                  {isProcessingPayment ? (
                    <div className="flex items-center justify-center">
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
                    </div>
                  ) : (
                    "Thanh Toán"
                  )}
                </button>
                <button
                  className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                  onClick={() => {
                    alert("Tính năng hủy đặt phòng sẽ được triển khai sau");
                  }}
                >
                  Hủy đặt phòng
                </button>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  *Vui lòng kiểm tra chính sách hủy trước khi hủy đặt phòng
                </p>
              </div>
            )}
            {/* Hiển thị trạng thái "confirmed" với nội dung khác */}
            {booking.status === "confirmed" && (
              <div className="mt-6 bg-green-50 p-4 rounded-lg border border-green-100">
                <div className="flex items-center text-green-700 mb-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="font-medium">Đã thanh toán thành công</span>
                </div>
                <p className="text-sm text-green-600">
                  Đặt phòng của bạn đã được xác nhận và thanh toán thành công.
                  Chúc bạn có kỳ nghỉ vui vẻ!
                </p>
              </div>
            )}
            {/* Hiển thị trạng thái "expired" với nội dung khác */}
            {booking.status === "expired" && (
              <div className="mt-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="flex items-center text-gray-700 mb-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="font-medium">Đặt phòng đã hết hạn</span>
                </div>
                <p className="text-sm text-gray-600">
                  Đặt phòng của bạn đã hết hạn và không còn hiệu lực.
                </p>
                <div className="mt-4">
                  <button
                    onClick={() => setReviewModalOpen(true)}
                    className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition flex items-center"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    Đánh giá về dịch vụ của chúng tôi
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        onConfirm={processPayment}
        booking={booking}
        isProcessing={isProcessingPayment}
        calculateNights={calculateNights}
      />
      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        bookingId={booking._id}
        productName={booking.productId.name}
        productId={booking.productId._id}
      />
    </div>
  );
}
