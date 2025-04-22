"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import PhotoTour from "../photo-tour";
import Title from "../title";
import { motion, AnimatePresence } from "framer-motion";
import AdditionalPhoto from "../additional-photo";
import PropertyType from "../property-type";
import { FetchNumberOfGuest } from "../number-of-guest";
import { UpdateDescription } from "../update-description";
import { Comfort } from "../comfort";

export default function ListingSetup() {
  const router = useRouter();
  const pathname = usePathname();
  const [activeContent, setActiveContent] = useState("photo-tour");

  // Trích xuất ID từ URL một cách an toàn hơn
  const pathSegments = pathname ? pathname.split("/") : [];
  const listingId = pathSegments.length > 4 ? pathSegments[4] : null;

  useEffect(() => {
    if (pathname && pathname.includes("/details/title")) {
      setActiveContent("title");
    } else if (pathname && pathname.includes("/details/property-type")) {
      setActiveContent("property-type");
    } else if (pathname && pathname.includes("/details/additional-photos")) {
      setActiveContent("additional-photos");
    } else if (pathname && pathname.includes("details/number-of-guest")) {
      setActiveContent("number-of-guest");
    } else if (pathname && pathname.includes("details/update-description")) {
      setActiveContent("update-description");
    } else if (pathname && pathname.includes("details/comfort")) {
      setActiveContent("comfort");
    } else {
      setActiveContent("photo-tour");
    }
  }, [pathname]);

  const handleContentChange = (contentType: string) => {
    if (contentType === "photo-tour") {
      router.push(`/host/dashboard/listing/${listingId}/details/photo-tour`);
    } else if (contentType === "title") {
      router.push(`/host/dashboard/listing/${listingId}/details/title`);
    } else if (contentType === "property-type") {
      router.push(`/host/dashboard/listing/${listingId}/details/property-type`);
    } else if (contentType === "number-of-guest") {
      router.push(
        `/host/dashboard/listing/${listingId}/details/number-of-guest`
      );
    } else if (contentType === "update-description") {
      router.push(
        `/host/dashboard/listing/${listingId}/details/update-description`
      );
    } else if (contentType === "comfort") {
      router.push(`/host/dashboard/listing/${listingId}/details/comfort`);
    } else {
      setActiveContent(contentType);
    }
  };

  const renderRightContent = () => {
    switch (activeContent) {
      case "photo-tour":
        return (
          <PhotoTour
            onNavigate={(url: string) => {
              if (url === "/additional-photos") {
                handleContentChange("additional-photos");
              } else {
                router.push(url);
              }
            }}
          />
        );
      case "title":
        return <Title />;
      case "additional-photos":
        return (
          <AdditionalPhoto
            onBack={() => handleContentChange("photo-tour")}
            listingId={listingId}
            productTitle="Product Title" // Add a default title or fetch it from your state/props
          />
        );
      case "property-type":
        return <PropertyType />;

      case "number-of-guest":
        return <FetchNumberOfGuest />;

      case "update-description":
        return <UpdateDescription productId={listingId || ""} />;

      case "comfort":
        return <Comfort />;

      default:
        return <PhotoTour onNavigate={(url: string) => router.push(url)} />;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Main Content */}
      <div className="flex flex-col md:flex-row gap-4 md:gap-0">
        {/* Left Sidebar with scroll */}
        <div className="w-full md:w-1/3 max-w-md border-b md:border-b-0 md:border-r border-gray-200 p-6 md:h-screen md:overflow-y-auto md:sticky md:top-0">
          <div>
            <Link
              href="/listing"
              className="inline-flex items-center text-gray-500 mb-6"
            >
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
              Trình chỉnh sửa mục cho thuê
            </Link>

            <div className="mb-8">
              <div className="flex flex-col sm:flex-row gap-2 mb-4">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="py-2 px-4 bg-gray-100 rounded-full text-sm"
                >
                  Chỗ ở cho thuê của bạn
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="py-2 px-4 bg-gray-100 rounded-full text-sm"
                >
                  Hướng dẫn khi khách đến
                </motion.button>
              </div>

              <motion.div
                className="border border-gray-200 rounded-lg p-4 mb-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                whileHover={{ boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
              >
                <div className="flex items-start">
                  <motion.div
                    className="flex-shrink-0 h-2 w-2 mt-2 bg-red-500 rounded-full"
                    animate={{
                      scale: [1, 1.2, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatType: "loop",
                    }}
                  ></motion.div>
                  <div className="ml-4">
                    <motion.h3
                      className="font-medium"
                      initial={{ color: "#000000" }}
                      animate={{ color: "#000000" }}
                      whileHover={{ color: "#ff385c" }}
                    >
                      Hoàn thành các bước bắt buộc
                    </motion.h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Vui lòng hoàn tất các nhiệm vụ cuối cùng này để đăng mục
                      cho thuê và bắt đầu nhận yêu cầu đặt phòng.
                    </p>
                  </div>
                  <motion.div
                    className="ml-auto"
                    whileHover={{ x: 3 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <svg
                      className="h-5 w-5 text-gray-400"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </motion.div>
                </div>
              </motion.div>

              {/* Photo Tour Section */}
              <motion.div
                className="border border-gray-200 rounded-lg p-4 mb-4 cursor-pointer"
                onClick={() => handleContentChange("photo-tour")}
                whileHover={{
                  backgroundColor: "rgba(0,0,0,0.02)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                }}
              >
                <h3 className="font-medium mb-2">Tour tham quan qua ảnh</h3>
                <p className="text-sm text-gray-700">
                  1 phòng ngủ · 1 giường · 1 phòng tắm
                </p>

                <div className="mt-4 relative">
                  <div className="relative overflow-hidden rounded-lg">
                    <div className="flex">
                      <div className="relative h-32 w-32 flex-shrink-0">
                        <Image
                          src="https://a0.muscache.com/im/pictures/miso/Hosting-1371412356785196440/original/138d58a6-d4b6-4dd3-9555-123af2583d87.jpeg?im_w=240"
                          alt="Property view"
                          fill
                          sizes="128px"
                          style={{ objectFit: "cover" }}
                          className="rounded-l-lg"
                        />
                        <div className="absolute top-2 left-2 bg-white bg-opacity-80 text-xs px-2 py-1 rounded">
                          5 ảnh
                        </div>
                      </div>
                      <div className="relative h-32 w-32 flex-shrink-0 ml-1">
                        <Image
                          src="https://a0.muscache.com/im/pictures/miso/Hosting-1371412356785196440/original/138d58a6-d4b6-4dd3-9555-123af2583d87.jpeg?im_w=240"
                          alt="Another view"
                          fill
                          sizes="128px"
                          style={{ objectFit: "cover" }}
                          className="rounded-r-lg"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Title Section */}
              <motion.div
                className="border border-gray-200 rounded-lg p-4 mb-4 cursor-pointer"
                onClick={() => handleContentChange("title")}
                whileHover={{
                  backgroundColor: "rgba(0,0,0,0.02)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                }}
              >
                <h3 className="font-medium mb-2">Tiêu đề</h3>
                <h3 className="text-sm font-medium text-gray-500">
                  Chỉnh sửa tiêu đề của bạn
                </h3>
              </motion.div>

              {/* Property Type Section */}
              <motion.div
                className="border border-gray-200 rounded-lg p-4 mb-4 cursor-pointer"
                onClick={() => handleContentChange("property-type")}
                whileHover={{
                  backgroundColor: "rgba(0,0,0,0.02)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                }}
              >
                <h3 className="font-medium mb-2">Loại chỗ ở</h3>
                <h3 className="text-sm font-medium text-gray-500">
                  Toàn bộ nhà - Nhà
                </h3>
              </motion.div>
              <motion.div
                className="border border-gray-200 rounded-lg p-4 mb-4 cursor-pointer"
                onClick={() => handleContentChange("number-of-guest")}
                whileHover={{
                  backgroundColor: "rgba(0,0,0,0.02)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                }}
              >
                <h3 className="font-medium mb-2">Số lượng khách</h3>
                <h3 className="text-sm font-medium text-gray-500">
                  Số lượng khách hàng
                </h3>
              </motion.div>
              <motion.div
                className="border border-gray-200 rounded-lg p-4 mb-4 cursor-pointer"
                onClick={() => handleContentChange("update-description")}
                whileHover={{
                  backgroundColor: "rgba(0,0,0,0.02)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                }}
              >
                <h3 className="font-medium mb-2">Mô tả</h3>
                <h3 className="text-sm font-medium text-gray-500">
                  Cung cấp thêm mô tả của bạn
                </h3>
              </motion.div>
              <motion.div
                className="border border-gray-200 rounded-lg p-4 mb-4 cursor-pointer"
                onClick={() => handleContentChange("comfort")}
                whileHover={{
                  backgroundColor: "rgba(0,0,0,0.02)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                }}
              >
                <h3 className="font-medium mb-2">Tiện nghi</h3>
                <h3 className="text-sm font-meidum text-gray-500">
                  Cung cấp - Chỉnh sửa tiện nghi của bạn
                </h3>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Right Content with Smooth Transitions */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeContent}
            className="w-full md:w-2/3 p-6 md:h-screen md:overflow-y-auto md:sticky md:top-0 md:right-0"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderRightContent()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
