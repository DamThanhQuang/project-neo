"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { FaCloudUploadAlt, FaTrash, FaImages } from "react-icons/fa";
import { MdOutlineCabin } from "react-icons/md";
import axios from "axios";
import Cookies from "js-cookie";

interface PhotoFile extends File {
  preview: string;
  id: string;
}

// Hàm chuyển File thành chuỗi Base64
const readFileAsDataURL = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

export default function Photo() {
  const router = useRouter();
  const [photos, setPhotos] = useState<PhotoFile[]>([]);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Lấy ảnh đã lưu từ localStorage khi component mount
  useEffect(() => {
    try {
      const savedImages = localStorage.getItem("images");
      if (savedImages) {
        const imageUrls = JSON.parse(savedImages);
        setUploadedUrls(imageUrls);
      }
    } catch (err) {
      console.error("Lỗi khi đọc ảnh từ localStorage:", err);
    }
  }, []);

  // Xử lý khi người dùng chọn file
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      await addFiles(files);
    }
  };

  // Chuyển đổi file ảnh sang Base64 và lưu vào state
  const addFiles = async (files: FileList) => {
    const newFiles: PhotoFile[] = [];
    for (const file of Array.from(files)) {
      if (file.type.startsWith("image/")) {
        const base64 = await readFileAsDataURL(file);
        const photoFile = file as PhotoFile;
        photoFile.preview = base64; // Lưu chuỗi Base64 làm preview
        photoFile.id = `photo-${Date.now()}-${Math.random()
          .toString(36)
          .substring(2, 9)}`;
        newFiles.push(photoFile);
      }
    }
    setPhotos((prev) => [...prev, ...newFiles]);
  };

  const removePhoto = (id: string) => {
    setPhotos((prev) => prev.filter((photo) => photo.id !== id));
  };

  const removeUploadedPhoto = (url: string) => {
    setUploadedUrls((prev) => {
      const updatedUrls = prev.filter((photoUrl) => photoUrl !== url);
      localStorage.setItem("images", JSON.stringify(updatedUrls));
      return updatedUrls;
    });
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      await addFiles(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const openFileSelector = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Các biến animation của framer-motion
  const containerVariant = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariant = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300 } },
  };

  const handleBack = () => {
    router.push("/create/amenity");
  };

  // Hàm upload ảnh lên S3 thông qua server API
  const uploadImages = async () => {
    if (photos.length === 0) return [];

    const token = Cookies.get("token");
    if (!token) {
      throw new Error("Bạn cần đăng nhập để tải ảnh lên");
    }

    setIsLoading(true);
    const formData = new FormData();
    photos.forEach((photo) => {
      formData.append("files", photo);
    });

    try {
      const response = await axios.post(
        "http://localhost:8000/api/v1/s3/create-product-photo/s3",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              setProgress(percentCompleted);
            }
          },
        }
      );

      // Trả về mảng các URL của ảnh trên S3
      return response.data.urls || [];
    } catch (error) {
      console.error("Lỗi khi tải ảnh lên S3:", error);
      throw error;
    }
  };

  // Xử lý khi người dùng nhấn "Tiếp theo"
  const handleNext = async () => {
    if (photos.length === 0 && uploadedUrls.length < 5) {
      setError("Bạn cần ít nhất 5 ảnh để tiếp tục");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      let imageUrls = [...uploadedUrls];

      // Nếu có ảnh mới, upload lên S3
      if (photos.length > 0) {
        const uploadedImageUrls = await uploadImages();
        imageUrls = [...imageUrls, ...uploadedImageUrls];
      }

      // Lưu mảng URLs vào localStorage
      localStorage.setItem("images", JSON.stringify(imageUrls));

      // Lưu ảnh đầu tiên làm ảnh chính
      if (imageUrls.length > 0) {
        localStorage.setItem("image", imageUrls[0]);
      }

      router.push("/create/title");
    } catch (err: any) {
      console.error("Lỗi khi tải ảnh:", err);
      setError(
        err.response?.data?.message || "Có lỗi xảy ra khi tải ảnh lên S3"
      );
    } finally {
      setIsLoading(false);
      setProgress(0);
    }
  };

  const totalImages = photos.length + uploadedUrls.length;
  const isReadyToNext = totalImages >= 5;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 flex flex-col">
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-2xl md:text-3xl font-semibold mb-4">
          Bổ sung một số bức ảnh chụp chỗ ở của bạn
        </h1>
        <p className="text-gray-600 max-w-xl mx-auto">
          Bạn sẽ cần 5 bức ảnh để bắt đầu. Về sau, bạn vẫn có thể đăng thêm hoặc
          thay đổi ảnh.
        </p>
      </motion.div>

      {/* Hiển thị thông báo lỗi */}
      {error && (
        <motion.div
          className="w-full mb-4 p-4 bg-red-100 text-red-700 rounded-lg flex items-center"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <svg
            className="w-5 h-5 mr-2 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 9a1 1 0 100-2 1 1 0 000 2z"
              clipRule="evenodd"
            />
          </svg>
          <span>{error}</span>
        </motion.div>
      )}

      <motion.div
        variants={containerVariant}
        initial="hidden"
        animate="show"
        className="w-full"
      >
        {/* Khu vực upload ảnh */}
        <motion.div variants={itemVariant} className="mb-8">
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
              isDragging
                ? "border-rose-500 bg-rose-50"
                : "border-gray-300 hover:border-rose-400 hover:bg-gray-50"
            }`}
            onClick={openFileSelector}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <input
              type="file"
              hidden
              multiple
              accept="image/*"
              onChange={handleFileChange}
              ref={fileInputRef}
            />
            <div className="flex flex-col items-center justify-center py-6">
              <motion.div
                className="text-5xl text-rose-500 mb-4"
                animate={{ scale: isDragging ? 1.1 : 1 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                {!isDragging ? <FaCloudUploadAlt /> : <FaImages />}
              </motion.div>
              <p className="text-lg font-medium mb-2">
                {isDragging ? "Thả ảnh ở đây" : "Kéo và thả ảnh vào đây"}
              </p>
              <p className="text-gray-500 mb-4">hoặc</p>
              <button className="px-4 py-2 bg-rose-500 text-white rounded-md hover:bg-rose-600 transition-colors">
                Chọn từ thiết bị của bạn
              </button>
            </div>
          </div>
        </motion.div>

        {/* Hiển thị số lượng ảnh */}
        <motion.div
          variants={itemVariant}
          className="flex items-center justify-between p-4 bg-gray-50 rounded-md mb-6 border border-gray-200"
        >
          <div className="flex items-center">
            <MdOutlineCabin className="text-2xl text-rose-500 mr-3" />
            <span>Chỗ ở của bạn</span>
          </div>
          <div
            className={`font-medium ${
              isReadyToNext ? "text-green-500" : "text-amber-500"
            }`}
          >
            {totalImages}/5 ảnh {isReadyToNext ? "(Đã đủ)" : "(Tối thiểu)"}
          </div>
        </motion.div>

        {/* Progress bar khi upload */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full mb-6"
          >
            <div className="mb-2 flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">
                Đang tải ảnh lên...
              </span>
              <span className="text-sm font-medium text-gray-700">
                {progress}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-rose-500 h-2.5 rounded-full"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </motion.div>
        )}

        {/* Ảnh đã lưu trong localStorage */}
        {uploadedUrls.length > 0 && (
          <motion.div variants={itemVariant} className="mb-6">
            <h3 className="font-medium text-gray-700 mb-2">Ảnh đã tải lên</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              <AnimatePresence>
                {uploadedUrls.map((url, index) => (
                  <motion.div
                    key={`uploaded-${index}`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ type: "spring", stiffness: 500 }}
                    className="relative aspect-square rounded-lg overflow-hidden group border border-gray-200"
                  >
                    <Image
                      src={url}
                      alt="Uploaded"
                      className="object-cover"
                      fill
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                      <button
                        onClick={() => removeUploadedPhoto(url)}
                        className="bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity transform hover:scale-110"
                      >
                        <FaTrash />
                      </button>
                    </div>
                    {index === 0 && (
                      <div className="absolute top-2 left-2 bg-rose-500 text-white text-xs py-1 px-2 rounded">
                        Ảnh chính
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {/* Ảnh mới vừa chọn để upload */}
        <motion.div variants={itemVariant} className="mb-8">
          {photos.length > 0 && (
            <h3 className="font-medium text-gray-700 mb-2">Ảnh mới</h3>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <AnimatePresence>
              {photos.map((photo) => (
                <motion.div
                  key={photo.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ type: "spring", stiffness: 500 }}
                  className="relative aspect-square rounded-lg overflow-hidden group border border-gray-200"
                >
                  <Image
                    src={photo.preview}
                    alt="Preview"
                    className="object-cover"
                    fill
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                    <button
                      onClick={() => removePhoto(photo.id)}
                      className="bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity transform hover:scale-110"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Hiển thị khung trống để đủ 5 ảnh */}
            {totalImages < 5 &&
              Array.from({ length: 5 - totalImages }).map((_, index) => (
                <motion.div
                  key={`empty-${index}`}
                  variants={itemVariant}
                  className="aspect-square bg-gray-100 rounded-lg border border-dashed border-gray-300 flex items-center justify-center"
                >
                  <div className="text-gray-400 text-center p-4">
                    <FaImages className="text-4xl mx-auto mb-2" />
                    <p>Cần thêm ảnh</p>
                  </div>
                </motion.div>
              ))}
          </div>
        </motion.div>

        <motion.div
          variants={itemVariant}
          className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-blue-800 mb-12"
        >
          <h3 className="font-semibold mb-2">Mẹo đăng ảnh đẹp:</h3>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Sử dụng ảnh có độ phân giải cao (ít nhất 1024x683px)</li>
            <li>Chụp vào ban ngày với nhiều ánh sáng tự nhiên</li>
            <li>Chụp các phòng chính và nổi bật các đặc điểm độc đáo</li>
            <li>Tránh sử dụng bộ lọc quá mức hoặc chỉnh sửa nặng</li>
            <li>Dọn dẹp và làm gọn không gian trước khi chụp</li>
          </ul>
        </motion.div>
      </motion.div>

      {/* Các nút điều hướng */}
      <motion.div
        className="mt-8 w-full flex justify-between"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
      >
        <motion.button
          className="px-6 py-3 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition"
          whileHover={{ scale: 1.05, backgroundColor: "#f3f4f6" }}
          whileTap={{ scale: 0.95 }}
          onClick={handleBack}
          disabled={isLoading}
        >
          Quay lại
        </motion.button>
        <motion.button
          className={`px-6 py-3 bg-rose-500 text-white font-medium rounded-lg ${
            (!isReadyToNext || isLoading) && "opacity-70 cursor-not-allowed"
          }`}
          whileHover={{
            scale: isReadyToNext && !isLoading ? 1.05 : 1,
            backgroundColor:
              isReadyToNext && !isLoading ? "#e11d48" : undefined,
          }}
          whileTap={{ scale: isReadyToNext && !isLoading ? 0.95 : 1 }}
          disabled={!isReadyToNext || isLoading}
          onClick={handleNext}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              <span>Đang xử lý...</span>
            </div>
          ) : (
            "Tiếp theo"
          )}
        </motion.button>
      </motion.div>
    </div>
  );
}
