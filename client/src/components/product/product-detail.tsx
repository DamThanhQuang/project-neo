"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import {
  FaStar,
  FaHeart,
  FaShare,
  FaMapMarkerAlt,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import axios from "@/lib/axios";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import Cookies from "js-cookie";
import BookingForm from "@/components/booking/BookingForm";
import BookingSummary from "@/components/booking/BookingSummary";
import ProductDescription from "./ProductDescription";
import ProductAmenities, { getAmenityIcon } from "./ProductAmenities";
import ProductReviews from "./ProductReviews";
import ProductLocation from "./ProductLocation";
import ProductHost from "./ProductHost";

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
  description: {
    description: string;
    descriptionDetail: string;
    guestsAmenities: string;
    interactionWithGuests: string;
  };
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

export default function ProductDetail() {
  const params = useParams();
  const router = useRouter();
  const productId = params?.id;
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("description");
  const galleryRef = useRef<HTMLDivElement>(null);
  const [isFavorite, setIsFavorite] = useState(false);

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    // Could add API call to save favorite status
  };

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
          description: productData.description || {
            description: "Product Description",
            descriptionDetail: "Product Details",
            guestsAmenities: "Guest Amenities",
            interactionWithGuests: "Interaction with Guests",
          },
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
      <div className="container mx-auto px-4 pt-10 md:pt-8 pb-16 max-w-7xl">
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
                <motion.button
                  whileHover={{ y: -2 }}
                  onClick={() => setActiveTab("host")}
                  className={`px-5 py-3 font-medium whitespace-nowrap ${
                    activeTab === "host"
                      ? "border-b-2 border-gray-800 text-gray-800"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Chủ nhà
                </motion.button>
              </div>

              {/* Tab Content */}
              <div className="min-h-[300px]">
                {/* Description Tab */}
                {activeTab === "description" && (
                  <ProductDescription description={product.description} />
                )}

                {/* Amenities Tab */}
                {activeTab === "amenities" && (
                  <ProductAmenities amenities={product.amenities} />
                )}

                {/* Reviews Tab */}
                {activeTab === "reviews" && (
                  <ProductReviews
                    reviews={product.reviews}
                    ratings={product.ratings}
                    averageRating={product.averageRating}
                    totalRatings={product.totalRatings}
                  />
                )}

                {/* Location Tab */}
                {activeTab === "location" && (
                  <ProductLocation location={product.location} />
                )}

                {/* Host Tab */}
                {activeTab === "host" && <ProductHost host={product.host} />}
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
