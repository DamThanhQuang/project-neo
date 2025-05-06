"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import axios from "@/lib/axios";
import Link from "next/link";
import Cookies from "js-cookie";

export default function SuccessPage() {
  const searchParams = useSearchParams();
  interface PaymentInfo {
    id: string;
    amount: number;
    status: string;
  }

  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPaymentInfo = async () => {
      const sessionId = searchParams.get("session_id");

      if (sessionId) {
        try {
          // Lấy token từ localStorage hoặc context
          const token = Cookies.get("token");
          const response = await axios.get(
            `/payment/verify?session_id=${sessionId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          setPaymentInfo(response.data);
          setLoading(false);
        } catch (error) {
          console.error("Lỗi khi xác thực thanh toán:", error);
          setLoading(false);
        }
      }
    };

    fetchPaymentInfo();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-xl">Đang xác thực thanh toán...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-white p-4">
      <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full border border-gray-100 transform transition-all">
        <div className="flex justify-center mb-6">
          <div className="rounded-full bg-green-100 p-3 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-center text-green-600 mb-4">
          Thanh toán thành công!
        </h1>

        {paymentInfo && (
          <div className="mb-6">
            <p className="mb-4 text-center text-gray-700">
              Cảm ơn bạn đã thanh toán.
            </p>
            <div className="bg-gray-50 p-5 rounded-lg border border-gray-100 shadow-sm">
              <p className="mb-3 flex justify-between">
                <span className="font-medium text-gray-600">Mã giao dịch:</span>
                <span className="text-gray-800 font-mono">
                  {paymentInfo.id}
                </span>
              </p>
              <p className="mb-3 flex justify-between">
                <span className="font-medium text-gray-600">Số tiền:</span>
                <span className="text-gray-800 font-semibold">
                  {paymentInfo.amount} USD
                </span>
              </p>
              <p className="flex justify-between">
                <span className="font-medium text-gray-600">Trạng thái:</span>
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  {paymentInfo.status}
                </span>
              </p>
            </div>
          </div>
        )}

        <Link
          href="/"
          className="block w-full bg-blue-600 text-white text-center py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-300 font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
        >
          Quay về trang chủ
        </Link>
      </div>
    </div>
  );
}
