import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

interface PropertyCardProps {
  listing: {
    id: string;
    title: string;
    location: {
      city: string;
      country: string;
    };
    rating: number;
    type: string;
    date: string;
    price: string;
    images: string[];
    isLiked: boolean;
  };
  onNavigateToDetail: (id: string) => void;
  isFavorite: boolean;
  toggleFavorite: (id: string) => void;
}

export default function PropertyCard({
  listing,
  onNavigateToDetail,
  isFavorite,
  toggleFavorite,
}: PropertyCardProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % listing.images.length);
  };

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex(
      (prev) => (prev - 1 + listing.images.length) % listing.images.length
    );
  };

  return (
    <motion.div
      className="relative cursor-pointer rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300 }}
      onClick={() => onNavigateToDetail(listing.id)}
    >
      {/* Carousel */}
      <div className="relative rounded-xl overflow-hidden aspect-square group">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.5 }}
            className="w-full h-full"
          >
            <Image
              src={listing.images[currentIndex]}
              alt={`${listing.location.city}, ${listing.location.country}`}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="hover:opacity-95 transition object-cover"
            />
          </motion.div>
        </AnimatePresence>

        {/* Prev button */}
        <button
          onClick={handlePrevImage}
          className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        {/* Next button */}
        <button
          onClick={handleNextImage}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>

        {/* Like button */}
        <button
          className="absolute top-3 right-3 p-1 z-10 text-white"
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(listing.id);
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill={isFavorite ? "currentColor" : "none"}
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className={`w-7 h-7 ${isFavorite ? "text-red-500" : "text-white"}`}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
            />
          </svg>
        </button>

        {/* Liked badge */}
        {listing.isLiked && (
          <div className="absolute top-3 left-3 bg-white bg-opacity-90 text-black text-xs font-medium py-1 px-2 rounded-md shadow-sm z-10 flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-3 h-3 text-red-500 mr-1"
            >
              <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
            </svg>
            Được khách yêu thích
          </div>
        )}

        {/* Image indicator dots */}
        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
          {listing.images.map((_, index) => (
            <div
              key={`dot-${index}`}
              className={`h-1.5 w-1.5 rounded-full transition-all duration-200 ${
                index === currentIndex ? "bg-white w-2.5" : "bg-white/60"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Property info */}
      <div className="mt-3 px-1">
        <div className="flex flex-col space-y-1">
          <div className="flex justify-between items-center">
            <h3 className="font-medium text-base truncate max-w-[70%]">
              {listing.title}
            </h3>
            <div className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-4 h-4 text-yellow-500"
              >
                <path
                  fillRule="evenodd"
                  d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="ml-1 text-sm font-medium">{listing.rating}</span>
            </div>
          </div>
          <p className="text-gray-600 text-sm">
            {listing.location.city}, {listing.location.country}
          </p>
          <p className="text-gray-500 text-sm">
            {listing.type} · {listing.date}
          </p>
          <p className="mt-1 text-sm">
            <span className="font-semibold">{listing.price}</span>
            <span className="text-gray-500"> / đêm</span>
          </p>
        </div>
      </div>
    </motion.div>
  );
}
