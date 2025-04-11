"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { useParams, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Cookies from "js-cookie";
import axios from "@/lib/axios";

interface PhotoTourResponse {
  images: string[]; // API trả về mảng URL ảnh
}

// Hàm kiểm tra URL hợp lệ - cải tiến để hỗ trợ URL từ S3
const isValidImageUrl = (url: string): boolean => {
  if (!url) return false;
  if (url.includes("undefined")) return false;

  // Xác nhận đây là URL hợp lệ từ S3
  const isS3Url = url.includes("s3.") && url.includes("amazonaws.com");

  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
};

// Cải tiến hàm fetchImages để xử lý cụ thể cho ảnh từ S3
const fetchImages = async (id: string): Promise<PhotoTourResponse> => {
  try {
    const token = Cookies.get("token");

    const response = await axios.get(`/business/detail-product/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // Kiểm tra cấu trúc dữ liệu
    if (!response.data || !response.data.images) {
      console.warn("API không trả về dữ liệu images hợp lệ");
      return { images: [] };
    }

    // Nếu images không phải mảng, thử chuyển đổi
    let images = response.data.images;
    if (!Array.isArray(images)) {
      try {
        if (typeof images === "string") {
          images = JSON.parse(images);
        } else {
          images = [];
        }
      } catch (error) {
        console.error("Không thể parse dữ liệu images:", error);
        images = [];
      }
    }

    return { images };
  } catch (error) {
    console.error("Error fetching images:", error);
    throw error;
  }
};

export default function PhotoTour({
  onNavigate,
}: {
  onNavigate: (url: string) => void;
}) {
  const params = useParams();
  const pathname = usePathname();
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Lấy listingId từ URL
  const listingId = pathname.split("/")[4];

  useEffect(() => {
    const id = params.id as string;
    if (!id) {
      setLoading(false);
      setError("Không tìm thấy ID");
      return;
    }

    fetchImages(id)
      .then((data) => {
        // Lọc bỏ các URL không hợp lệ
        const validImages = (data.images || []).filter(isValidImageUrl);

        setImages(validImages);
      })
      .catch((err) => {
        console.error("Lỗi khi tải ảnh:", err);
        setError("Lỗi khi tải ảnh");
      })
      .finally(() => setLoading(false));
  }, [params.id]);

  // Các biến cho hiệu ứng animation với Framer Motion
  const containerVariants = {
    initial: { x: 0, opacity: 1 },
    animate: { x: 0, opacity: 1 },
    exit: {
      x: -1000,
      opacity: 0,
      transition: { duration: 0.5, staggerChildren: 0.1 },
    },
  };

  const cardVariants = {
    initial: { x: 0, opacity: 1 },
    animate: { x: 0, opacity: 1 },
    exit: { x: -50, opacity: 0 },
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-6">Tour tham quan qua ảnh</h2>
      <div className="mb-6">
        <p className="text-gray-600 mb-4">
          Ảnh đẹp sẽ giúp khách hàng hình dung về trải nghiệm tại nơi ở của bạn.
          Hãy bắt đầu bằng việc tải lên ít nhất 5 ảnh.
        </p>

        {loading ? (
          <div className="text-gray-600">Đang tải ảnh...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : images.length > 0 ? (
          <motion.div
            variants={containerVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4"
          >
            <AnimatePresence>
              {images.map((src, index) => {
                // Thêm kiểm tra lần cuối
                if (!isValidImageUrl(src)) {
                  console.log(`Bỏ qua ảnh không hợp lệ: ${src}`);
                  return null;
                }

                return (
                  <motion.div
                    key={`${src}-${index}`}
                    variants={cardVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="relative aspect-square rounded-lg overflow-hidden border border-gray-200"
                  >
                    <Image
                      src={src}
                      alt={`Ảnh ${index + 1}`}
                      fill
                      className="object-cover"
                      // Thêm xử lý lỗi khi ảnh không tải được
                      onError={() => {
                        console.error(`Lỗi tải ảnh: ${src}`);
                      }}
                    />
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        ) : (
          // Hiển thị placeholder nếu chưa có ảnh
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
            {[...Array(3)].map((_, index) => (
              <div
                key={index}
                className="relative aspect-square rounded-lg overflow-hidden border border-gray-200"
              >
                <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                  <svg
                    className="h-10 w-10 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        )}

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="mt-4 px-6 py-3 bg-gray-900 text-white rounded-lg"
          onClick={() => onNavigate("/additional-photos")}
        >
          Tải ảnh lên
        </motion.button>
      </div>
    </div>
  );
}
