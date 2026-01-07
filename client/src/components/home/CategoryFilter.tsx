import { useState } from "react";

interface CategoryFilterProps {
  onFilterChange: (category: string) => void;
}

export default function CategoryFilter({
  onFilterChange,
}: CategoryFilterProps) {
  const [activeCategory, setActiveCategory] = useState("all");

  const categories = [
    { id: "all", name: "Tất cả", icon: "🏠" },
    { id: "beach", name: "Bãi biển", icon: "🏖️" },
    { id: "mountain", name: "Núi", icon: "⛰️" },
    { id: "countryside", name: "Nông thôn", icon: "🌄" },
    { id: "city", name: "Thành phố", icon: "🏙️" },
    { id: "tropical", name: "Nhiệt đới", icon: "🌴" },
    { id: "cabin", name: "Cabin", icon: "🏕️" },
    { id: "luxury", name: "Sang trọng", icon: "💎" },
  ];

  const handleCategoryClick = (category: string) => {
    setActiveCategory(category);
    onFilterChange(category);
  };

  return (
    <div className="mb-8 px-4 md:px-6 lg:px-8">
      <div className="relative">
        {/* Gradient fade effects on edges */}
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
        
        <div className="overflow-x-auto pb-2 scrollbar-hide">
          <div className="flex gap-3 md:gap-4 min-w-min px-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category.id)}
                className={`group flex flex-col items-center min-w-[90px] px-5 py-3 rounded-2xl transition-all duration-300 transform hover:scale-105 ${
                  activeCategory === category.id
                    ? "bg-gradient-to-br from-blue-50 to-blue-100 shadow-lg shadow-blue-200/50 border-2 border-blue-500"
                    : "bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md"
                }`}
              >
                <span 
                  className={`text-3xl transition-transform duration-300 ${
                    activeCategory === category.id 
                      ? "scale-110" 
                      : "group-hover:scale-110"
                  }`}
                >
                  {category.icon}
                </span>
                <span 
                  className={`mt-2 text-xs md:text-sm font-semibold whitespace-nowrap transition-colors ${
                    activeCategory === category.id
                      ? "text-blue-700"
                      : "text-gray-700 group-hover:text-gray-900"
                  }`}
                >
                  {category.name}
                </span>
                
                {/* Active indicator dot */}
                {activeCategory === category.id && (
                  <div className="mt-1 w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Optional: Scroll hint for mobile */}
      <div className="flex justify-center mt-2 md:hidden">
        <div className="flex gap-1">
          <div className="w-1.5 h-1.5 bg-gray-300 rounded-full" />
          <div className="w-1.5 h-1.5 bg-gray-300 rounded-full" />
          <div className="w-1.5 h-1.5 bg-gray-300 rounded-full" />
        </div>
      </div>
    </div>
  );
}