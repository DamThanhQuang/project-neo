"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import {
  FaStar,
  FaHeart,
  FaShare,
  FaMapMarkerAlt,
  FaUser,
  FaChevronLeft,
  FaChevronRight,
  FaWifi,
  FaParking,
  FaSnowflake,
  FaShower,
  FaCoffee,
  FaTv,
  FaUtensils,
  FaCheck,
  FaRegCalendarAlt,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import axios from "@/lib/axios";
import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import Cookies from "js-cookie";
import BookingForm, {
  useBookingCalculations,
} from "@/components/booking/BookingForm";
import BookingSummary from "@/components/booking/BookingSummary";

interface Rating {
  stars: number;
  count: number;
  percentage: number;
}

interface Review {
  id: number;
  rating: number;
  title: string;
  comment: string;
  user: {
    name: string;
    image: string;
  };
  date: string;
}

interface Product {
  id: number;
  image: string[];
  title: string;
  description: string;
  price: number;
  location: {
    address: string;
    city: string;
    country: string;
  };
  rating: number;
  reviews: Review[];
  host: {
    name: string;
    image: string;
    isSuperhost: boolean;
  };
  livingRooms: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  amenities: string[];
  ratings: Rating[];
  totalRatings: number;
  averageRating: number;
}

const getAmenityIcon = (amenity: string) => {
  const amenityLower = amenity.toLowerCase();
  if (amenityLower.includes("wifi")) return <FaWifi />;
  if (amenityLower.includes("parking")) return <FaParking />;
  if (amenityLower.includes("air") || amenityLower.includes("ac"))
    return <FaSnowflake />;
  if (amenityLower.includes("shower") || amenityLower.includes("bath"))
    return <FaShower />;
  if (amenityLower.includes("coffee") || amenityLower.includes("breakfast"))
    return <FaCoffee />;
  if (amenityLower.includes("tv") || amenityLower.includes("television"))
    return <FaTv />;
  if (amenityLower.includes("kitchen") || amenityLower.includes("dining"))
    return <FaUtensils />;
  return <FaCheck />;
};

export default function ProductDetail() {
  const params = useParams();
  const router = useRouter();
  const productId = params?.id;
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showAlternateHeader, setShowAlternateHeader] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("description");
  const galleryRef = useRef<HTMLDivElement>(null);
  const [isFavorite, setIsFavorite] = useState(false);

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    // Could add API call to save favorite status
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setShowAlternateHeader(true);
      } else {
        setShowAlternateHeader(false);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [lastScrollY]);

  // Outside click handler for gallery
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        galleryRef.current &&
        !galleryRef.current.contains(event.target as Node)
      ) {
        setIsGalleryOpen(false);
      }
    };

    if (isGalleryOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isGalleryOpen]);

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setIsLoading(true);

        if (!productId) {
          throw new Error("Product ID is missing");
        }

        const response = await axios.get(`/product/get-product/${productId}`);

        if (response.status < 200 || response.status >= 300) {
          throw new Error("Failed to fetch product details");
        }

        const productData = Array.isArray(response.data)
          ? response.data[0]
          : response.data;

        // Transform backend data to match your frontend Product interface
        const transformedProduct = {
          id: productData._id,
          image: productData.images || [productData.image || ""],
          title: productData.name || "Product Name",
          description: productData.description || "No description available",
          price: productData.price || 0,
          location: productData.location || {
            address: "N/A",
            city: "N/A",
            country: "N/A",
          },
          rating: productData.averageRating || 0,
          reviews:
            productData.reviews?.map((r: any, i: number) => ({
              id: i,
              rating: r.rating || 0,
              title: "Review",
              comment: r.comment || "",
              user: {
                name: r.userId || "Anonymous",
                image: "https://via.placeholder.com/150",
              },
              date: new Date(r.createdAt).toLocaleDateString(),
            })) || [],
          host: {
            name: "Host",
            image: "https://via.placeholder.com/150",
            isSuperhost: false,
          },
          amenities: productData.amenities || [
            "WiFi",
            "Parking",
            "Air Conditioning",
          ],
          livingRooms: productData.livingRooms || 1,
          bedrooms: productData.bedrooms || 1,
          beds: productData.beds || 1,
          bathrooms: productData.bathrooms || 1,
          ratings: [
            { stars: 5, count: 0, percentage: 0 },
            { stars: 4, count: 0, percentage: 0 },
            { stars: 3, count: 0, percentage: 0 },
            { stars: 2, count: 0, percentage: 0 },
            { stars: 1, count: 0, percentage: 0 },
          ],
          totalRatings: productData.reviews?.length || 0,
          averageRating: productData.averageRating || 0,
        };

        setProduct(transformedProduct);
        setIsSuccess(true);
      } catch (error) {
        console.error("Error fetching product details:", error);
        setIsError(
          error instanceof Error ? error.message : "An error occurred"
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (productId) {
      fetchProductDetails();
    } else {
      setIsError("No product ID provided");
      setIsLoading(false);
    }
  }, [productId]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-t-rose-500 border-rose-200 rounded-full animate-spin mx-auto"></div>
          <p className="mt-6 text-xl text-gray-700 font-medium">
            Đang tải thông tin...
          </p>
          <p className="text-gray-500">Chỉ mất vài giây thôi</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center bg-red-100 rounded-full">
            <svg
              className="w-12 h-12 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            Đã xảy ra lỗi
          </h2>
          <p className="text-gray-600 mb-6">{isError}</p>
          <button
            className="w-full py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-lg transition duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2"
            onClick={() => window.location.reload()}
          >
            Thử lại
          </button>
          <button
            className="w-full mt-3 py-3 border border-gray-300 text-gray-700 rounded-lg transition duration-200 font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            onClick={() => router.back()}
          >
            Quay lại trang trước
          </button>
        </div>
      </div>
    );
  }

  if (!product) {
    return <div>Loading...</div>;
  }

  // Full screen gallery modal
  const GalleryModal = () => (
    <AnimatePresence>
      {isGalleryOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black z-50 flex items-center justify-center"
        >
          <div ref={galleryRef} className="w-full h-full flex flex-col p-4">
            <div className="flex justify-between items-center text-white mb-4">
              <button
                onClick={() => setIsGalleryOpen(false)}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full"
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
              <div className="text-center">
                <p className="text-lg font-medium">
                  {selectedImage + 1} / {product.image.length}
                </p>
              </div>
              <div className="w-10"></div>
            </div>

            <div className="flex-grow relative">
              <div className="absolute inset-0 flex items-center">
                <button
                  onClick={() =>
                    setSelectedImage(
                      (prev) =>
                        (prev - 1 + product.image.length) % product.image.length
                    )
                  }
                  className="absolute left-4 z-10 p-2 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-70"
                >
                  <FaChevronLeft size={24} />
                </button>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedImage}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="w-full h-full flex items-center justify-center"
                  >
                    <img
                      src={product.image[selectedImage]}
                      alt={`Gallery image ${selectedImage + 1}`}
                      className="max-h-full max-w-full object-contain"
                    />
                  </motion.div>
                </AnimatePresence>

                <button
                  onClick={() =>
                    setSelectedImage(
                      (prev) => (prev + 1) % product.image.length
                    )
                  }
                  className="absolute right-4 z-10 p-2 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-70"
                >
                  <FaChevronRight size={24} />
                </button>
              </div>
            </div>

            <div className="mt-4 overflow-auto">
              <div className="flex gap-2 justify-center">
                {product.image.map((img, idx) => (
                  <div
                    key={idx}
                    className={`w-20 h-20 rounded-lg overflow-hidden cursor-pointer border-2 ${
                      selectedImage === idx
                        ? "border-white"
                        : "border-transparent"
                    }`}
                    onClick={() => setSelectedImage(idx)}
                  >
                    <img
                      src={img}
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      {/* Main Header - Shows when scrolling up or at top */}
      <header
        className={`fixed top-0 left-0 w-full bg-white shadow-sm z-40 transition-transform duration-300 ${
          showAlternateHeader ? "-translate-y-full" : "translate-y-0"
        }`}
      ></header>

      {/* Alternate Header - Shows when scrolling down */}
      <header
        className={`fixed top-0 left-0 w-full bg-white shadow-md z-40 transition-transform duration-300 ${
          showAlternateHeader ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-medium">
              ₫{product.price}{" "}
              <span className="text-sm font-normal text-gray-600">/ đêm</span>
            </h2>
            <div className="flex items-center">
              <FaStar className="text-yellow-400" />
              <span className="ml-1 font-medium">{product.rating}</span>
              <span className="ml-1 text-gray-500">
                ({product.reviews.length} đánh giá)
              </span>
            </div>
          </div>
          <button
            className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 transition-all duration-300 text-white px-6 py-2 rounded-full font-semibold shadow-lg shadow-rose-200 hover:shadow-rose-300"
            onClick={() => setShowBookingModal(true)}
          >
            Đặt phòng
          </button>
        </div>
      </header>

      <div className="container mx-auto px-4 pt-20 md:pt-15 pb-16 max-w-7xl">
        {/* Product Title & Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 text-gray-900">
            {product.title}
          </h1>
          <div className="flex flex-wrap items-center justify-between gap-y-3">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <div className="flex items-center">
                <FaStar className="text-yellow-400" />
                <span className="ml-1 font-medium">{product.rating}</span>
                <span className="mx-1 text-gray-400">•</span>
                <span className="underline cursor-pointer text-gray-700">
                  {product.reviews.length} đánh giá
                </span>
              </div>
              <span className="hidden sm:block text-gray-400">•</span>
              <div className="flex items-center">
                <FaMapMarkerAlt className="mr-1 text-gray-500" />
                <span className="text-gray-700">
                  {product.location.city}, {product.location.country}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={toggleFavorite}
                className={`flex items-center gap-2 hover:bg-gray-100 px-4 py-2 rounded-full transition-all duration-200 ${
                  isFavorite ? "text-rose-500" : "text-gray-700"
                }`}
              >
                <FaHeart className={isFavorite ? "fill-current" : ""} />
                <span>{isFavorite ? "Đã lưu" : "Lưu"}</span>
              </button>

              <button className="flex items-center gap-2 hover:bg-gray-100 px-4 py-2 rounded-full transition-all">
                <FaShare />
                <span>Chia sẻ</span>
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Image Gallery */}
        <div className="relative mb-12">
          <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-2 rounded-2xl overflow-hidden h-[300px] md:h-[500px]">
            {/* Main large image */}
            <div className="md:col-span-2 md:row-span-2 relative">
              <img
                src={product.image[0]}
                alt={product.title}
                className="w-full h-full object-cover cursor-pointer"
                onClick={() => {
                  setSelectedImage(0);
                  setIsGalleryOpen(true);
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 hover:opacity-100 transition-opacity"></div>
            </div>

            {/* Smaller images */}
            {product.image.slice(1, 5).map((img, index) => (
              <div key={index} className="hidden md:block relative">
                <img
                  src={img}
                  alt={`${product.title} - image ${index + 2}`}
                  className="w-full h-full object-cover cursor-pointer"
                  onClick={() => {
                    setSelectedImage(index + 1);
                    setIsGalleryOpen(true);
                  }}
                />
                <div className="absolute inset-0 bg-black/10 opacity-0 hover:opacity-100 transition-opacity"></div>
              </div>
            ))}

            {/* Show all photos button */}
            <button
              onClick={() => setIsGalleryOpen(true)}
              className="absolute bottom-6 right-6 bg-white hover:bg-gray-100 px-6 py-3 rounded-full shadow-lg font-semibold text-sm transition-all duration-300 flex items-center gap-2 z-10"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                  clipRule="evenodd"
                />
              </svg>
              Xem tất cả ảnh
            </button>
          </div>
        </div>

        {/* Main Content - Better layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2">
            {/* Host Info */}
            <div className="flex justify-between items-start mb-8 pb-8 border-b border-gray-200">
              <div>
                <h2 className="text-2xl font-bold mb-2">
                  {product.title} - Chủ nhà {product.host.name}
                </h2>
                <div className="flex flex-wrap gap-2 items-center text-gray-700">
                  <span>
                    {product.livingRooms} • {product.bedrooms}•{product.beds}•
                    {product.bathrooms}
                  </span>
                  <span className="text-gray-400">•</span>
                  <span>Tối đa {product.beds} khách</span>
                </div>

                {product.host.isSuperhost && (
                  <div className="mt-3">
                    <span className="bg-rose-50 text-rose-600 px-3 py-1 rounded-full text-sm font-medium inline-block">
                      ⭐ Chủ nhà siêu cấp
                    </span>
                  </div>
                )}
              </div>

              <img
                src={product.host.image}
                alt={product.host.name}
                className="w-14 h-14 rounded-full ring-2 ring-white shadow-md"
              />
            </div>

            {/* Tabbed Navigation for Content */}
            <div className="mb-8">
              <div className="flex border-b border-gray-200 mb-6 overflow-x-auto hide-scrollbar">
                <motion.button
                  whileHover={{ y: -2 }}
                  onClick={() => setActiveTab("description")}
                  className={`px-5 py-3 font-medium whitespace-nowrap ${
                    activeTab === "description"
                      ? "border-b-2 border-gray-800 text-gray-800"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Mô tả
                </motion.button>
                <motion.button
                  whileHover={{ y: -2 }}
                  onClick={() => setActiveTab("amenities")}
                  className={`px-5 py-3 font-medium whitespace-nowrap ${
                    activeTab === "amenities"
                      ? "border-b-2 border-gray-800 text-gray-800"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Tiện nghi
                </motion.button>
                <motion.button
                  whileHover={{ y: -2 }}
                  onClick={() => setActiveTab("reviews")}
                  className={`px-5 py-3 font-medium whitespace-nowrap ${
                    activeTab === "reviews"
                      ? "border-b-2 border-gray-800 text-gray-800"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Đánh giá ({product.reviews.length})
                </motion.button>
                <motion.button
                  whileHover={{ y: -2 }}
                  onClick={() => setActiveTab("location")}
                  className={`px-5 py-3 font-medium whitespace-nowrap ${
                    activeTab === "location"
                      ? "border-b-2 border-gray-800 text-gray-800"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Vị trí
                </motion.button>
              </div>

              {/* Tab Content */}
              <div className="min-h-[300px]">
                {/* Description Tab */}
                {activeTab === "description" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h3 className="text-xl font-semibold mb-4">Về nơi này</h3>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line mb-6">
                      {product.description}
                    </p>

                    <div className="p-6 bg-gray-50 rounded-xl border border-gray-100 mt-6">
                      <h4 className="font-semibold mb-3">Quy tắc chỗ ở</h4>
                      <ul className="space-y-2 text-gray-700">
                        <li className="flex items-start">
                          <svg
                            className="mr-2 w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            ></path>
                          </svg>
                          <span>Nhận phòng sau 14:00</span>
                        </li>
                        <li className="flex items-start">
                          <svg
                            className="mr-2 w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            ></path>
                          </svg>
                          <span>Trả phòng trước 12:00</span>
                        </li>
                        <li className="flex items-start">
                          <svg
                            className="mr-2 w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                            ></path>
                          </svg>
                          <span>Không hút thuốc</span>
                        </li>
                      </ul>
                    </div>
                  </motion.div>
                )}

                {/* Amenities Tab */}
                {activeTab === "amenities" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h3 className="text-xl font-semibold mb-6">
                      Tiện nghi tại chỗ ở
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
                      {product.amenities.map((amenity, index) => (
                        <div key={index} className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center text-gray-700">
                            {getAmenityIcon(amenity)}
                          </div>
                          <span className="text-gray-800">{amenity}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Reviews Tab */}
                {activeTab === "reviews" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex flex-col md:flex-row gap-8 mb-8">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold mb-4">
                          <div className="flex items-center gap-2">
                            <FaStar className="text-yellow-400" />
                            <span>{product.averageRating}</span>
                            <span className="text-gray-700">·</span>
                            <span>{product.totalRatings} đánh giá</span>
                          </div>
                        </h3>

                        <div className="space-y-2">
                          {product.ratings.map((rating) => (
                            <div
                              key={rating.stars}
                              className="flex items-center gap-2"
                            >
                              <span className="w-1 text-gray-600">
                                {rating.stars}
                              </span>
                              <div className="flex-grow h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-yellow-400 rounded-full"
                                  style={{ width: `${rating.percentage}%` }}
                                ></div>
                              </div>
                              <span className="w-8 text-right text-gray-500 text-sm">
                                {rating.count}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="md:w-64 p-6 bg-yellow-50 rounded-xl flex flex-col items-center justify-center">
                        <div className="font-bold text-4xl text-yellow-600 mb-2">
                          {product.averageRating}
                        </div>
                        <div className="flex mb-2">
                          {[...Array(5)].map((_, i) => (
                            <FaStar
                              key={i}
                              className={
                                i < Math.floor(product.averageRating)
                                  ? "text-yellow-400"
                                  : "text-gray-300"
                              }
                            />
                          ))}
                        </div>
                        <div className="text-sm text-gray-600">
                          Trên tổng số {product.totalRatings} đánh giá
                        </div>
                      </div>
                    </div>

                    {/* Review List */}
                    <div className="mt-8 space-y-8">
                      {product.reviews.map((review) => (
                        <motion.div
                          key={review.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.5 }}
                          className="p-6 bg-white rounded-xl border border-gray-100 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start">
                            <img
                              src={review.user.image}
                              alt={review.user.name}
                              className="w-12 h-12 rounded-full mr-4 object-cover"
                            />
                            <div>
                              <h4 className="font-medium text-gray-900">
                                {review.user.name}
                              </h4>
                              <div className="flex items-center mt-1">
                                {[...Array(5)].map((_, i) => (
                                  <FaStar
                                    key={i}
                                    className={
                                      i < review.rating
                                        ? "text-yellow-400 w-4 h-4"
                                        : "text-gray-300 w-4 h-4"
                                    }
                                  />
                                ))}
                                <span className="ml-2 text-sm text-gray-500">
                                  {review.date}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="mt-4 text-gray-700 whitespace-pre-line">
                            {review.title && (
                              <p className="font-medium mb-1">{review.title}</p>
                            )}
                            {review.comment}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Location Tab */}
                {activeTab === "location" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    <h3 className="text-xl font-semibold mb-3">Vị trí</h3>
                    <p className="text-gray-700">
                      {product.location.address}, {product.location.city},{" "}
                      {product.location.country}
                    </p>

                    <div className="aspect-video bg-gray-100 rounded-xl overflow-hidden">
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-center p-8">
                          <FaMapMarkerAlt className="mx-auto text-4xl text-gray-400 mb-2" />
                          <p className="text-gray-600">
                            Bản đồ hiện chưa được tải
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 bg-gray-50 rounded-xl border border-gray-100 mt-4">
                      <h4 className="font-semibold mb-3">Khám phá khu vực</h4>
                      <ul className="space-y-3">
                        <li className="flex justify-between">
                          <span className="text-gray-700">
                            Trung tâm thành phố
                          </span>
                          <span className="text-gray-900 font-medium">
                            2 km
                          </span>
                        </li>
                        <li className="flex justify-between">
                          <span className="text-gray-700">
                            Sân bay gần nhất
                          </span>
                          <span className="text-gray-900 font-medium">
                            15 km
                          </span>
                        </li>
                        <li className="flex justify-between">
                          <span className="text-gray-700">Bãi biển</span>
                          <span className="text-gray-900 font-medium">
                            500 m
                          </span>
                        </li>
                      </ul>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Booking Card */}
          <div>
            <BookingSummary
              product={product}
              setShowBookingModal={setShowBookingModal}
            />
          </div>
        </div>
      </div>

      {/* Mobile Booking Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 lg:hidden z-40">
        <div className="container mx-auto max-w-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-bold">
                ₫{product.price}
                <span className="text-sm font-normal text-gray-600">
                  {" "}
                  / đêm
                </span>
              </p>
              <div className="flex items-center text-sm">
                <FaStar className="text-yellow-400 mr-1" />
                <span>{product.rating}</span>
                <span className="mx-1 text-gray-400">·</span>
                <span className="text-gray-600">
                  {product.totalRatings} đánh giá
                </span>
              </div>
            </div>
            <button
              onClick={() => setShowBookingModal(true)}
              className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-6 py-3 rounded-full font-bold shadow-lg"
            >
              Đặt ngay
            </button>
          </div>
        </div>
      </div>

      {/* Render the booking modal */}
      <BookingForm
        product={product}
        showBookingModal={showBookingModal}
        setShowBookingModal={setShowBookingModal}
      />

      {/* Gallery Modal */}
      <GalleryModal />
    </>
  );
}
