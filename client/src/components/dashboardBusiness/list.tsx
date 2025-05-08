"use client";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import Link from "next/link";
import axios from "@/lib/axios";
import Cookies from "js-cookie";

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  image: string;
  location?: string | { city?: string; country?: string };
  status?: string;
  createdAt?: string;
  actionRequired?: boolean;
}

export default function List() {
  const [isVisible, setIsVisible] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    setIsVisible(true);

    const fetchData = async () => {
      try {
        const userId = Cookies.get("userId");
        console.log(userId);

        const token = Cookies.get("token");
        const response = await axios.get(`/business/products/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log("Response data:", response.data);
        // Check if the response is an array and has products
        if (!Array.isArray(response.data)) {
          throw new Error("Invalid response format");
        }
        setProducts(response.data);
        console.log("Products fetched:", response.data);

        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load products. Please try again later.");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return `${date.getDate()} tháng ${
      date.getMonth() + 1
    }, ${date.getFullYear()}`;
  };

  // Hàm lọc sản phẩm theo tìm kiếm và trạng thái
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || product.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Phân trang
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProducts.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  // Thay đổi trang
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Lấy danh sách trạng thái duy nhất
  const statusOptions = [
    "all",
    ...Array.from(new Set(products.map((p) => p.status || "Đang thực hiện"))),
  ];

  // Show loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your listings...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="text-center bg-white p-6 rounded-xl shadow-lg max-w-lg">
          <div className="text-rose-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-3">
            Something went wrong
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-rose-500 text-white rounded-full hover:bg-rose-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <section className="flex flex-col items-center min-h-[calc(100vh-80px)] bg-gradient-to-b from-gray-50 to-gray-100 p-4 sm:p-8 md:p-12">
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : -20 }}
          transition={{ duration: 0.6 }}
          className="mb-8 md:mb-12 text-center w-full"
        >
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 tracking-tight">
            Nhà/Phòng cho thuê của bạn
          </h1>
          <p className="mt-3 text-gray-600 text-lg md:text-xl max-w-2xl mx-auto">
            Quản lý và theo dõi tất cả các căn hộ, nhà và phòng cho thuê của bạn
            tại đây
          </p>

          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mt-6"
          >
            <Link
              href={"/host/become-host"}
              className="inline-block px-6 py-3 bg-rose-500 text-white font-semibold rounded-full hover:bg-rose-600 transition-colors duration-300 shadow-md hover:shadow-lg"
            >
              <span className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 2a8 8 0 100 16 8 8 0 000-16zm1.5 11.5a.5.5 0 01-.5.5h-3a.5.5 0 01-.5-.5v-3a.5.5 0 01.5-.5h3a.5.5 0 01.5.5v3z"
                    clipRule="evenodd"
                  />
                </svg>
                Tạo mục cho thuê mới
              </span>
            </Link>
          </motion.div>
        </motion.header>

        {products.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isVisible ? 1 : 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-6xl"
          >
            <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="text-xl font-semibold text-gray-800">
                  Mục cho thuê
                </h2>

                {/* Thêm thanh tìm kiếm và bộ lọc */}
                <div className="mt-4 flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Tìm kiếm theo tiêu đề..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1); // Reset về trang 1 khi tìm kiếm
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                  <div className="w-full md:w-auto">
                    <select
                      value={statusFilter}
                      onChange={(e) => {
                        setStatusFilter(e.target.value);
                        setCurrentPage(1); // Reset về trang 1 khi lọc
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-rose-500"
                    >
                      <option value="all">Tất cả trạng thái</option>
                      {statusOptions
                        .filter((s) => s !== "all")
                        .map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

                {/* Hiển thị số lượng kết quả */}
                <div className="mt-3 text-sm text-gray-500">
                  Hiển thị {filteredProducts.length} kết quả{" "}
                  {searchTerm && `cho "${searchTerm}"`}
                </div>
              </div>

              {currentItems.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {currentItems.map((product) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.4 }}
                      className="p-6 hover:bg-gray-50"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="h-16 w-16 overflow-hidden rounded-md">
                            <img
                              src={
                                product.image ||
                                "https://via.placeholder.com/300x200"
                              }
                              alt={product.title}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div>
                            <h3 className="text-lg font-medium text-gray-800">
                              {product.title}
                            </h3>
                            <p className="text-gray-500 text-sm">
                              {typeof product.location === "object"
                                ? `${product.location.city || ""}, ${
                                    product.location.country || ""
                                  }`
                                : product.location || "Long Biên, Hà Nội"}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col md:items-end">
                          <div className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full inline-block mb-2">
                            {product.status || "Đang thực hiện"}
                          </div>
                          <p className="text-gray-500 text-xs">
                            Nhà/phòng cho thuê được tạo vào{" "}
                            {formatDate(product.createdAt) || "7 tháng 3, 2025"}
                          </p>
                        </div>

                        <div>
                          {product.actionRequired && (
                            <span className="bg-rose-100 text-rose-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                              Yêu cầu hành động
                            </span>
                          )}
                          <Link
                            href={`/host/dashboard/listing/${product.id}/details/photo-tour`}
                            className="block mt-2 text-sm px-4 py-2 bg-gray-100 text-gray-800 rounded-full hover:bg-gray-200 text-center transition-colors"
                          >
                            Chi tiết
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <p className="text-gray-500">
                    Không tìm thấy mục cho thuê nào phù hợp với tìm kiếm của
                    bạn.
                  </p>
                </div>
              )}

              {/* Phân trang */}
              {filteredProducts.length > itemsPerPage && (
                <div className="p-4 flex justify-center">
                  <nav className="flex items-center space-x-1">
                    <button
                      onClick={() => paginate(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className={`px-3 py-1 rounded-md ${
                        currentPage === 1
                          ? "text-gray-400 cursor-not-allowed"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      &laquo;
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (number) => (
                        <button
                          key={number}
                          onClick={() => paginate(number)}
                          className={`px-3 py-1 rounded-md ${
                            currentPage === number
                              ? "bg-rose-500 text-white"
                              : "text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          {number}
                        </button>
                      )
                    )}

                    <button
                      onClick={() =>
                        paginate(Math.min(totalPages, currentPage + 1))
                      }
                      disabled={currentPage === totalPages}
                      className={`px-3 py-1 rounded-md ${
                        currentPage === totalPages
                          ? "text-gray-400 cursor-not-allowed"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      &raquo;
                    </button>
                  </nav>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: isVisible ? 1 : 0, scale: isVisible ? 1 : 0.9 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col items-center bg-white p-6 sm:p-8 rounded-xl shadow-lg w-full max-w-lg md:max-w-xl lg:max-w-2xl border border-gray-100"
          >
            <div className="mb-6 w-full overflow-hidden rounded-xl">
              <img
                src="https://a0.muscache.com/pictures/87444596-1857-4437-9667-4f9cb4f5baf2.jpg"
                alt="home"
                className="w-full h-56 md:h-72 object-cover rounded-xl transform transition-transform duration-700 hover:scale-105"
              />
            </div>

            <div className="text-center">
              <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-3">
                Bạn chưa có mục cho thuê nào
              </h2>
              <p className="text-gray-600 md:text-lg mb-8 max-w-md">
                Tạo mục cho thuê với Airbnb Setup để bắt đầu nhận yêu cầu đặt
                phòng và kiếm thu nhập từ ngôi nhà của bạn.
              </p>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  href="/host/become-host"
                  className="inline-block px-8 py-4 bg-rose-500 text-white text-lg font-semibold rounded-full hover:bg-rose-600 transition-colors duration-300 shadow-md hover:shadow-lg"
                >
                  Bắt đầu ngay
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isVisible ? 1 : 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-8 text-center text-gray-500"
        >
          <p>
            Bạn cần hỗ trợ?{" "}
            <a href="/help" className="text-blue-500 hover:underline">
              Xem hướng dẫn
            </a>
          </p>
        </motion.div>
      </section>
    </>
  );
}
