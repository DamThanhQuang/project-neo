"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import axios from "@/lib/axios";
import { isAxiosError } from "axios";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";

export default function Title() {
  const params = useParams();
  const [title, setTitle] = useState("");
  const [originalTitle, setOriginalTitle] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  // Fetch current product details
  useEffect(() => {
    const fetchProductDetails = async () => {
      if (!params.id) return;

      try {
        setIsFetching(true);
        const response = await axios.get(
          `/business/detail-product/${params.id}`
        );
        setTitle(response.data.title || "");
        setOriginalTitle(response.data.title || "");
      } catch (error) {
        console.error("Error fetching product:", error);
        toast.error("Không thể tải thông tin sản phẩm");
      } finally {
        setIsFetching(false);
      }
    };

    fetchProductDetails();
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Tiêu đề không được để trống");
      return;
    }

    if (title === originalTitle) {
      toast("Không có thay đổi nào", { icon: "ℹ️" });
      return;
    }

    try {
      setIsLoading(true);

      // Ensure the payload is in the format the server expects
      const response = await axios.put(
        `/business/update-product/${params.id}`,
        { title }
      );
      console.log("Server response:", response.data);

      setOriginalTitle(title);
      toast.success("Cập nhật tiêu đề thành công");
    } catch (error) {
      console.error("Error updating title:", error);
      if (isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.message || "Lỗi không xác định";
        toast.error(`Lỗi: ${errorMessage}`);
      } else {
        toast.error("Không thể cập nhật tiêu đề");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return <div className="p-4 text-center">Đang tải thông tin...</div>;
  }

  return (
    <div className="flex flex-col items-center align-center py-4 px-2">
      <h2 className="text-2xl font-semibold mb-6">Tiêu đề</h2>

      <div className="mb-6 max-w-3xl mx-auto text-center">
        <p className="text-gray-600 mb-4">
          Tiêu đề nên mô tả ngắn gọn điểm đặc biệt của chỗ ở bạn. Tránh nhắc đến
          vị trí vì sẽ được hiển thị riêng.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col items-center">
          <div className="mb-4 w-full">
            <textarea
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-4 text-lg text-center bg-transparent border-none focus:outline-none focus:ring-0 resize-none"
              rows={3}
              placeholder="Ví dụ: Căn hộ hiện đại và đầy đủ tiện nghi với ban công view thành phố"
            ></textarea>
            <p className="text-sm text-gray-500 mt-2">
              {title.length}/64 ký tự
            </p>
          </div>

          <motion.button
            type="submit"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="mt-4 px-6 py-3 bg-gray-900 text-white rounded-lg"
            disabled={isLoading}
          >
            {isLoading ? "Đang lưu..." : "Lưu tiêu đề"}
          </motion.button>
        </form>
      </div>
    </div>
  );
}
