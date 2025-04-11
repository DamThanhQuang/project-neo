"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import axios from "@/lib/axios";
import { isAxiosError } from "axios";
import { toast } from "react-hot-toast";
import { useParams } from "next/navigation";

interface AdditionalPhotoProps {
  onBack: () => void;
  listingId: string | null;
  productTitle: string; // Truyền title hiện tại của sản phẩm
}

const AdditionalPhoto = ({
  onBack,
  listingId,
  productTitle,
}: AdditionalPhotoProps) => {
  const params = useParams();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{
    [key: string]: number;
  }>({});
  const [overallProgress, setOverallProgress] = useState(0);

  // Tạo URL xem trước cho file đã chọn
  useEffect(() => {
    if (selectedFiles.length === 0) {
      setPreviews([]);
      return;
    }
    const newPreviews = selectedFiles.map((file) => URL.createObjectURL(file));
    setPreviews(newPreviews);
    return () => {
      newPreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [selectedFiles]);

  // Khi người dùng chọn file
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const filesArray = Array.from(e.target.files);
    setSelectedFiles(filesArray);
  };

  // Hàm upload từng file lên S3 qua pre-signed URL
  const upLoadFileToS3 = async (file: File): Promise<string> => {
    try {
      // Khởi tạo tiến trình cho file này
      setUploadProgress((prev) => ({ ...prev, [file.name]: 0 }));

      // Lấy pre-signed URL từ backend (NestJS)
      const res = await axios.post("/s3/presigned-url", {
        filename: file.name,
        contentType: file.type,
      });

      const data = res.data;
      const { url: presignedUrl, key } = data;

      // Upload file với theo dõi tiến trình
      const xhr = new XMLHttpRequest();

      // Cập nhật tiến trình
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round(
            (event.loaded / event.total) * 100
          );
          // Cập nhật tiến trình cho file cụ thể
          setUploadProgress((prev) => ({
            ...prev,
            [file.name]: percentComplete,
          }));

          // Tính toán tiến trình tổng thể
          const values = Object.values({
            ...uploadProgress,
            [file.name]: percentComplete,
          });
          const average = values.reduce((a, b) => a + b, 0) / values.length;
          setOverallProgress(Math.round(average));
        }
      };

      // Tạo promise để theo dõi hoàn thành
      return new Promise((resolve, reject) => {
        xhr.open("PUT", presignedUrl);
        xhr.setRequestHeader("Content-Type", file.type);

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            const bucket =
              process.env.NEXT_PUBLIC_S3_BUCKET || "site-review-image-2025";
            const region =
              process.env.NEXT_PUBLIC_AWS_REGION || "ap-southeast-1";
            const s3Url = `https://${bucket}.s3.${region}.amazonaws.com/${key}`;

            // Đánh dấu tiến trình là 100%
            setUploadProgress((prev) => ({ ...prev, [file.name]: 100 }));
            resolve(s3Url);
          } else {
            reject(new Error(`Upload failed: ${xhr.status} ${xhr.statusText}`));
          }
        };

        xhr.onerror = () => {
          reject(new Error("Network error during upload"));
        };

        xhr.send(file);
      });
    } catch (error) {
      console.error("Upload error:", error);
      throw error;
    }
  };

  // Hàm upload tất cả ảnh được chọn
  const handleUpload = async () => {
    if (!listingId) {
      toast.error("Không tìm thấy ID sản phẩm");
      return;
    }

    if (selectedFiles.length === 0) {
      toast.error("Vui lòng chọn ít nhất một ảnh");
      return;
    }

    try {
      setUploading(true);
      // Tạo mảng promises để upload tất cả file cùng lúc
      const uploadPromises = selectedFiles.map((file) => upLoadFileToS3(file));

      // Thực hiện tất cả uploads cùng lúc
      toast.loading(`Đang tải ảnh lên... ${selectedFiles.length} `);
      const uploadedUrls = await Promise.all(uploadPromises);

      console.log("Tất cả URLs đã upload:", uploadedUrls);

      await axios.put(`/business/update-product/${params.id}`, {
        title: productTitle,
        images: uploadedUrls,
      });
      toast.dismiss();
      toast.success("Tải ảnh lên thành công");
      // Cập nhật lại danh sách ảnh đã upload
      setSelectedFiles([]);
      setPreviews([]);
      // Gọi lại hàm onBack để trở về trang trước
      onBack();
    } catch (error) {
      toast.dismiss();
      console.error("Lỗi khi tải ảnh lên:", error);
      if (isAxiosError(error) && error.response) {
        toast.error(`Lỗi từ server: ${error.response.data.message}`);
      } else {
        toast.error("Có lỗi xảy ra trong quá trình tải ảnh lên");
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <button onClick={onBack} className="mb-4 flex items-center text-gray-600">
        <svg
          className="h-5 w-5 mr-2"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Quay lại
      </button>

      <h2 className="text-2xl font-semibold mb-6">
        Thêm ảnh cho phòng của bạn
      </h2>

      <div className="mb-6">
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="mt-4 text-gray-600">
            Kéo và thả ảnh vào đây hoặc bấm để tải lên
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Hỗ trợ JPG, PNG. Tối đa 10MB mỗi ảnh.
          </p>
          <button
            type="button"
            className="mt-4 px-4 py-2 bg-gray-900 text-white rounded-lg"
            onClick={() => fileInputRef.current?.click()}
          >
            Chọn ảnh
          </button>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            multiple
            accept="image/jpeg,image/png"
            onChange={handleFileChange}
          />
        </div>
      </div>

      {previews.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4">Xem trước ảnh đã chọn:</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {previews.map((src, index) => (
              <div
                key={index}
                className="relative aspect-square rounded-lg overflow-hidden border border-gray-200"
              >
                <Image
                  src={src}
                  alt={`Ảnh xem trước ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        className="mt-4 px-6 py-3 bg-gray-900 text-white rounded-lg"
        onClick={handleUpload}
        disabled={uploading}
      >
        {uploading ? "Đang cập nhật..." : "Cập nhật ảnh"}
      </motion.button>

      {/* Hiển thị tiến trình tổng thể */}
      {uploading && (
        <div className="mt-4">
          <p className="text-sm font-medium mb-1">
            Tiến trình tải lên: {overallProgress}%
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full"
              style={{ width: `${overallProgress}%` }}
            ></div>
          </div>

          {/* Hiển thị tiến trình từng file */}
          <div className="mt-2 space-y-2">
            {Object.entries(uploadProgress).map(([filename, progress]) => (
              <div key={filename} className="flex items-center">
                <span className="text-xs truncate w-48">{filename}</span>
                <div className="flex-1 ml-2 bg-gray-200 rounded-full h-1.5">
                  <div
                    className="bg-green-500 h-1.5 rounded-full"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <span className="ml-2 text-xs">{progress}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdditionalPhoto;
