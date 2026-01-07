"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import axios from "@/lib/axios";

// Import components
import CategoryFilter from "./CategoryFilter";
import PropertyCard from "./PropertyCard";
import ErrorState from "./ErrorState";

interface Listing {
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
  category?: string;
}

export default function Home() {
  const router = useRouter();
  const [listings, setListings] = useState<Listing[]>([]);
  const [filteredListings, setFilteredListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState<Record<string, boolean>>({});
  const [activeCategory, setActiveCategory] = useState("all");

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get("/product/get-all-product");

      if (response.status < 200 || response.status >= 300) {
        throw new Error("Failed to fetch products");
      }

      const data = response.data;

      const formattedData = data.map((item: any) => ({
        id: item._id,
        title: item.title,
        location: {
          city: item.location.city,
          country: item.location.country,
        },
        rating: item.rating,
        type: item.type,
        date: item.date,
        price: item.price,
        images: item.images.map((img: string) => img),
        isLiked: item.isLiked || false,
        category: item.category || "all",
      }));

      setListings(formattedData);
      setFilteredListings(formattedData);

      const favoritesMap: Record<string, boolean> = {};
      formattedData.forEach((item: Listing) => {
        favoritesMap[item.id] = item.isLiked;
      });
      setIsFavorite(favoritesMap);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleFilterChange = useCallback(
    (category: string) => {
      setActiveCategory(category);
      if (category === "all") {
        setFilteredListings(listings);
      } else {
        setFilteredListings(
          listings.filter(
            (listing) =>
              listing.category === category ||
              listing.type.toLowerCase().includes(category.toLowerCase())
          )
        );
      }
    },
    [listings]
  );

  const toggleFavorite = (id: string) => {
    setIsFavorite((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const navigateToDetail = (id: string) => {
    if (!id) {
      console.error("Không thể chuyển trang: ID sản phẩm không xác định");
      return;
    }
    router.push(`/product-detail/${id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-6 py-24">
          <div className="text-center">
            <div className="inline-block w-12 h-12 border-3 border-t-rose-500 border-r-rose-500 border-b-transparent border-l-transparent rounded-full animate-spin"></div>
            <p className="mt-6 text-gray-600 font-medium">Đang tải dữ liệu...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchProducts} />;
  }

  // Group listings by location for sections
  const groupedListings = filteredListings.reduce((acc, listing) => {
    const key = listing.location.city;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(listing);
    return acc;
  }, {} as Record<string, Listing[]>);

  return (
    <div className="min-h-screen bg-white">
      {/* Main Content */}
      <main className="pt-6">
        {/* Category Filter - Sticky */}
        <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-[2520px] mx-auto px-10 xl:px-20">
            <CategoryFilter onFilterChange={handleFilterChange} />
          </div>
        </div>

        {/* Property Sections */}
        <div className="max-w-[2520px] mx-auto px-10 xl:px-20">
          {Object.entries(groupedListings).map(([city, cityListings], idx) => (
            <div key={city} className="mb-12">
              {/* Section Header */}
              <div className="flex items-center justify-between mb-6 mt-10">
                <h2 className="text-2xl font-semibold text-gray-900">
                  {idx === 0 && activeCategory === "all" 
                    ? `Nơi lưu trú được ưa chuộng tại ${city}`
                    : `Còn phòng tại ${city} vào cuối tuần này`}
                </h2>
                <button className="text-sm font-semibold text-gray-900 hover:underline flex items-center gap-1">
                  Hiển thị tất cả
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {/* Property Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-x-6 gap-y-8">
                {cityListings.slice(0, 6).map((listing) => (
                  <PropertyCard
                    key={listing.id}
                    listing={listing}
                    onNavigateToDetail={navigateToDetail}
                    isFavorite={isFavorite[listing.id]}
                    toggleFavorite={toggleFavorite}
                  />
                ))}
              </div>
            </div>
          ))}

          {/* Show All Listings if no grouping needed */}
          {Object.keys(groupedListings).length === 0 && (
            <div className="py-10">
              <div className="text-center py-20">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Không tìm thấy chỗ ở phù hợp
                </h3>
                <p className="text-gray-600 mb-6">
                  Hãy thử điều chỉnh bộ lọc hoặc tìm kiếm khác
                </p>
                <button
                  onClick={() => handleFilterChange("all")}
                  className="inline-flex items-center px-6 py-3 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Xóa bộ lọc
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Continue exploring section */}
        <div className="bg-gray-50 border-t border-gray-200 mt-12">
          <div className="max-w-[2520px] mx-auto px-10 xl:px-20 py-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-8">
              Sự lựa chọn hàng đầu của chúng tôi
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {[
                { city: "Hồ Chí Minh", count: "Chỗ ở" },
                { city: "Hà Nội", count: "Chỗ ở" },
                { city: "Đà Nẵng", count: "Chỗ ở" },
                { city: "Nha Trang", count: "Chỗ ở" },
                { city: "Phú Quốc", count: "Chỗ ở" },
                { city: "Đà Lạt", count: "Chỗ ở" }
              ].map((item) => (
                <button
                  key={item.city}
                  className="text-left group"
                >
                  <div className="aspect-square bg-gray-200 rounded-lg mb-2 overflow-hidden">
                    <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 group-hover:scale-105 transition-transform duration-300"></div>
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm">
                    {item.city}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">{item.count}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}