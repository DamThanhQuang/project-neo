"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "@/lib/axios";
import Cookies from "js-cookie";
import {
  CalendarIcon,
  MapPinIcon,
  HomeIcon,
  ExclamationCircleIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

// Định nghĩa interface cho dữ liệu booking
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
}

interface Booking {
  _id: string;
  productId: Product;
  checkIn: string;
  checkOut: string;
  status: string;
  createdAt: string;
}

export const YourTrip = () => {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [checkingExpired, setCheckingExpired] = useState<boolean>(false);
  const [expiredResult, setExpiredResult] = useState<string | null>(null);

  // Hàm kiểm tra bookings hết hạn
  const checkExpiredBookings = async () => {
    try {
      setCheckingExpired(true);
      const token = Cookies.get("token");

      if (!token) {
        router.push("/login");
        return;
      }

      const response = await axios.get("/bookings/expired-check", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setExpiredResult(response.data.message);
      // Tải lại danh sách booking sau khi kiểm tra
      fetchBookings();
    } catch (err: any) {
      console.error("Lỗi khi kiểm tra booking hết hạn:", err);
      setExpiredResult("Không thể kiểm tra booking hết hạn");
    } finally {
      setCheckingExpired(false);
    }
  };

  const fetchBookings = async () => {
    try {
      console.log("Bắt đầu tải dữ liệu đặt phòng");
      setLoading(true);
      // Lấy token từ localStorage
      const token = Cookies.get("token");

      console.log("Token có tồn tại:", !!token);

      if (!token) {
        router.push("/login");
        return;
      }

      console.log("Đang gọi API...");
      const response = await axios.get("/bookings", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Nhận được dữ liệu:", response.data);
      setBookings(response.data);
      setLoading(false);
      console.log("Đã tắt trạng thái loading");
    } catch (err: any) {
      console.error("Lỗi khi lấy dữ liệu đặt phòng:", err);
      // Hiển thị chi tiết lỗi hơn
      if (err.response) {
        console.error("Lỗi phản hồi:", err.response.status, err.response.data);
      }
      setError("Không thể tải dữ liệu đặt phòng");
      setLoading(false);
    }
  };

  // Hàm mới để kiểm tra và tải booking theo thứ tự
  const loadAndCheckBookings = async () => {
    // Đầu tiên kiểm tra booking hết hạn
    await checkExpiredBookings();
    // Sau đó tải danh sách booking đã cập nhật
    await fetchBookings();
  };

  useEffect(() => {
    // Gọi hàm mới thay vì chỉ fetchBookings()
    loadAndCheckBookings();
  }, [router]);

  // Cập nhật hàm kiểm tra thủ công để sử dụng hàm mới
  const handleManualCheck = async () => {
    await checkExpiredBookings();
    await fetchBookings();
  };
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push("/home");
  };

  // Hiển thị trạng thái đang tải
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 font-sans">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Chuyến đi của bạn
        </h1>
        <div className="flex flex-col items-center justify-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mb-4"></div>
          <p className="text-gray-600">Đang tải thông tin chuyến đi...</p>
        </div>
      </div>
    );
  }

  // Hiển thị thông báo lỗi nếu có
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 font-sans">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Chuyến đi của bạn
        </h1>
        <div className="py-10 bg-red-50 rounded-lg border border-red-100 flex items-center justify-center">
          <ExclamationCircleIcon className="h-6 w-6 text-red-500 mr-2" />
          <p className="text-red-600 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  // Hiển thị trạng thái trống nếu không có đặt phòng
  if (!bookings || bookings.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 font-sans">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">
          Chuyến đi của bạn
        </h1>

        <div className="py-12 bg-gray-50 rounded-xl flex flex-col items-center justify-center">
          <img
            src="/images/empty-suitcase.svg"
            alt="No trips"
            className="w-32 h-32 mb-6 opacity-80"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
          <h2 className="text-2xl font-semibold text-gray-800 mb-3">
            Chưa có chuyến đi nào được đặt... vẫn chưa!
          </h2>
          <p className="text-gray-600 mb-8 max-w-md text-center">
            Đã đến lúc phủi bụi vali và bắt đầu chuẩn bị cho chuyến phiêu lưu
            tiếp theo của bạn rồi.
          </p>

          <button
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-full transition-all transform hover:scale-105 shadow-md flex items-center"
            onClick={handleClick}
          >
            <HomeIcon className="h-5 w-5 mr-2" />
            Bắt đầu tìm kiếm
          </button>
        </div>

        <div className="mt-10 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 flex items-center justify-center">
            <span>Bạn không tìm thấy đặt phòng/đặt chỗ của mình ở đây?</span>
            <a
              href="#"
              className="text-blue-600 hover:underline ml-1 font-medium inline-flex items-center"
            >
              Truy cập Trung tâm trợ giúp
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 ml-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </a>
          </p>
        </div>
      </div>
    );
  }

  // Hiển thị danh sách đặt phòng
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 font-sans">
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-3xl font-bold text-gray-800">Chuyến đi của bạn</h1>

        <button
          onClick={handleManualCheck}
          disabled={checkingExpired}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-lg flex items-center transition-colors"
        >
          <ClockIcon className="h-4 w-4 mr-1" />
          {checkingExpired ? "Đang kiểm tra..." : "Kiểm tra hết hạn"}
        </button>
      </div>

      <p className="text-gray-600 mb-4">
        Quản lý và theo dõi tất cả các chuyến đi của bạn tại đây
      </p>

      {expiredResult && (
        <div className="mb-6 p-3 bg-blue-50 border border-blue-100 rounded-lg">
          <p className="text-blue-700 text-sm">{expiredResult}</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-8">
        {bookings.map((booking) => (
          <div
            key={booking._id}
            className="border border-gray-200 hover:border-gray-300 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg bg-white"
            onClick={() =>
              booking.status !== "cancelled" &&
              booking.status !== "expired" &&
              router.push(`/trip/${booking._id}/details`)
            }
            style={{
              cursor:
                booking.status !== "cancelled" && booking.status !== "expired"
                  ? "pointer"
                  : "default",
            }}
          >
            <div className="flex flex-col md:flex-row">
              {/* Hình ảnh phòng */}
              <div className="w-full md:w-1/3 lg:w-1/4 relative">
                <div className="aspect-[4/3] relative">
                  <img
                    src={booking.productId.images[0] || "/placeholder.jpg"}
                    alt={booking.productId.name}
                    className="w-full h-full object-cover"
                  />
                  <div
                    className={`absolute top-3 left-3 px-3 py-1.5 text-xs font-semibold rounded-full shadow-sm ${
                      booking.status === "confirmed"
                        ? "bg-green-500 text-white"
                        : booking.status === "cancelled"
                        ? "bg-red-500 text-white"
                        : booking.status === "expired"
                        ? "bg-gray-500 text-white"
                        : "bg-yellow-500 text-white"
                    }`}
                  >
                    {booking.status === "confirmed"
                      ? "Đã xác nhận"
                      : booking.status === "cancelled"
                      ? "Đã hủy"
                      : booking.status === "expired"
                      ? "Đã hết hạn"
                      : "Đang chờ"}
                  </div>
                </div>
              </div>

              {/* Thông tin đặt phòng */}
              <div className="w-full md:w-2/3 lg:w-3/4 p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-1">
                  {booking.productId.name}
                </h3>

                <div className="flex items-center text-gray-600 mb-3">
                  <MapPinIcon className="h-5 w-5 mr-2 text-gray-400 flex-shrink-0" />
                  <p className="truncate">
                    {booking.productId.location
                      ? `${booking.productId.location.address || ""}, ${
                          booking.productId.location.city || ""
                        }, ${booking.productId.location.country || ""}`
                      : "Không có địa chỉ"}
                  </p>
                </div>

                <div className="flex items-center mb-4">
                  <CalendarIcon className="h-5 w-5 mr-2 text-gray-400" />
                  <span className="text-gray-700 font-medium">
                    {new Date(booking.checkIn).toLocaleDateString("vi-VN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                    <span className="mx-2">→</span>
                    {new Date(booking.checkOut).toLocaleDateString("vi-VN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>

                <div className="flex flex-wrap justify-between items-center">
                  <div className="mb-2 md:mb-0">
                    <span className="text-sm text-gray-500">Giá mỗi đêm</span>
                    <div className="text-xl font-bold text-gray-900">
                      {booking.productId.price.toLocaleString("vi-VN")}đ
                    </div>
                  </div>

                  {booking.status !== "cancelled" && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/trip/${booking._id}/details`);
                      }}
                      className="px-5 py-2.5 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors shadow-sm hover:shadow-md flex items-center"
                    >
                      Xem chi tiết
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 ml-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 p-5 bg-gray-50 rounded-lg border border-gray-100">
        <p className="text-sm text-gray-600 flex items-center justify-center">
          <span>Bạn không tìm thấy đặt phòng/đặt chỗ của mình ở đây?</span>
          <a
            href="#"
            className="text-blue-600 hover:underline ml-1 font-medium inline-flex items-center"
          >
            Truy cập Trung tâm trợ giúp
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 ml-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </a>
        </p>
      </div>
    </div>
  );
};
