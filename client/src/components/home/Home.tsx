"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import axios from "@/lib/axios";

// Import components
import HeroSection from "./HeroSection";
import CategoryFilter from "./CategoryFilter";
import PropertyCard from "./PropertyCard";
import ErrorState from "./ErrorState";
import FeaturedDestinations from "./FeaturedDestinations";
import Newsletter from "./Newsletter";

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
  category?: string; // Add category for filtering
}

export default function Home() {
  const router = useRouter();
  const [listings, setListings] = useState<Listing[]>([]);
  const [filteredListings, setFilteredListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState<Record<string, boolean>>({});
  const [imageIndices, setImageIndices] = useState<Record<string, number>>({});
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
        category: item.category || "all", // Default to 'all' if no category
      }));

      setListings(formattedData);
      setFilteredListings(formattedData);

      // Initialize favorites from formattedData
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

  // Display loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-blue-500 border-b-blue-500 border-r-transparent border-l-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  // Display error state
  if (error) {
    return <ErrorState message={error} onRetry={fetchProducts} />;
  }

  return (
    <div>
      {/* Hero Section */}
      <HeroSection />

      <main className="container mx-auto px-4 py-8">
        {/* Category Filter */}
        <CategoryFilter onFilterChange={handleFilterChange} />

        {/* Property Listings */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredListings.map((listing) => (
            <PropertyCard
              key={listing.id}
              listing={listing}
              onNavigateToDetail={navigateToDetail}
              isFavorite={isFavorite[listing.id]}
              toggleFavorite={toggleFavorite}
            />
          ))}
        </div>

        {/* Featured Destinations */}
        <FeaturedDestinations />

        {/* Newsletter Section */}
        <Newsletter />
      </main>
    </div>
  );
}
