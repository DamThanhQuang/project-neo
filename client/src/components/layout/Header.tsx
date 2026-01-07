"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import Cookies from "js-cookie";
import axios from "@/lib/axios";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaBars,
  FaGlobe,
  FaUser,
  FaSignOutAlt,
} from "react-icons/fa";
import { IoIosAirplane } from "react-icons/io";

interface User {
  name: string;
  email: string;
  avatar?: string;
}

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchFocus, setSearchFocus] = useState<"location" | "dates" | "guests" | null>(null);
  const pathname = usePathname();
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const checkAuth = async () => {
    try {
      const userId = Cookies.get("userId");
      const token = Cookies.get("token");

      if (userId && token) {
        const response = await axios.get(`user/profile/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const userData = response.data;
        const firstName = userData.firstName || "";
        const lastName = userData.lastName || "";
        const fullName =
          firstName && lastName ? `${firstName} ${lastName}` : "";
        setUser({
          name: userData.name || fullName || "User",
          email: userData.email || "",
          avatar:
            userData.avatar ||
            "https://flowbite.com/docs/images/people/profile-picture-5.jpg",
        });

        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
        setUser(null);
      }
    } catch (error) {
      console.error("Failed to fetch user data:", error);
      setIsLoggedIn(false);
      setUser(null);
    }
  };

  const handleSignOut = () => {
    Cookies.remove("userId");
    Cookies.remove("token");
    setIsLoggedIn(false);
    setUser(null);
    window.location.href = "/login";
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-[2520px] mx-auto px-5 sm:px-10 xl:px-20">
        <div className="flex items-center justify-between h-40">
          {/* Logo */}
          <Link
            href="/home"
            className="flex items-center transition-opacity hover:opacity-80"
          >
            <Image
              src="https://upload.wikimedia.org/wikipedia/commons/6/69/Airbnb_Logo_B%C3%A9lo.svg"
              alt="Airbnb"
              width={102}
              height={32}
              className="hidden sm:block"
            />
            <Image
              src="https://upload.wikimedia.org/wikipedia/commons/6/69/Airbnb_Logo_B%C3%A9lo.svg"
              alt="Airbnb"
              width={30}
              height={32}
              className="sm:hidden"
            />
          </Link>

          {/* Center Section - Tabs + Search */}
          <div className="hidden lg:flex flex-col items-center absolute left-1/2 transform -translate-x-1/2">
            {/* Navigation Tabs */}
            <div className="flex items-center gap-8 mb-4">
              <button className="text-sm font-semibold text-gray-900 pb-3 border-b-2 border-gray-900">
                Nơi lưu trú
              </button>
              <button className="text-sm font-medium text-gray-600 hover:text-gray-900 pb-3 border-b-2 border-transparent hover:border-gray-200 transition-colors">
                Trải nghiệm
              </button>
            </div>

            {/* Search Bar */}
            <div className="flex items-center">
            {/* Search Bar */}
            <div className="flex items-center border border-gray-300 rounded-full shadow-sm hover:shadow-md transition-shadow duration-200">
              <button
                onClick={() => setSearchFocus("location")}
                className={`px-6 py-2.5 text-sm font-medium rounded-full transition-colors ${
                  searchFocus === "location"
                    ? "bg-white shadow-lg"
                    : "hover:bg-gray-100"
                }`}
              >
                <div className="text-left">
                  <div className="text-xs font-semibold">Địa điểm</div>
                  <div className="text-gray-500 text-xs">Tìm kiếm điểm đến</div>
                </div>
              </button>
              
              <div className="w-px h-8 bg-gray-300"></div>
              
              <button
                onClick={() => setSearchFocus("dates")}
                className={`px-6 py-2.5 text-sm font-medium rounded-full transition-colors ${
                  searchFocus === "dates"
                    ? "bg-white shadow-lg"
                    : "hover:bg-gray-100"
                }`}
              >
                <div className="text-left">
                  <div className="text-xs font-semibold">Thời gian</div>
                  <div className="text-gray-500 text-xs">Thêm ngày</div>
                </div>
              </button>
              
              <div className="w-px h-8 bg-gray-300"></div>
              
              <button
                onClick={() => setSearchFocus("guests")}
                className={`pl-6 pr-2 py-2.5 text-sm font-medium rounded-full transition-colors flex items-center gap-3 ${
                  searchFocus === "guests"
                    ? "bg-white shadow-lg"
                    : "hover:bg-gray-100"
                }`}
              >
                <div className="text-left">
                  <div className="text-xs font-semibold">Khách</div>
                  <div className="text-gray-500 text-xs">Thêm khách</div>
                </div>
                
                <div className="bg-rose-500 text-white p-2 rounded-full">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </button>
            </div>
          </div>
          </div>

          {/* Mobile Search */}
          <button className="lg:hidden flex-1 mx-4 flex items-center gap-3 border border-gray-300 rounded-full px-4 py-2 shadow-sm hover:shadow-md transition-shadow">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <div className="text-left flex-1">
              <div className="text-sm font-semibold text-gray-900">Tìm kiếm</div>
              <div className="text-xs text-gray-500">Điểm đến • Ngày • Khách</div>
            </div>
          </button>

          {/* Right Section */}
          <div className="flex items-center gap-2">
            {/* Airbnb your home */}
            <Link
              href="/host"
              className="hidden md:block text-sm font-semibold text-gray-900 px-4 py-3 rounded-full hover:bg-gray-100 transition-colors"
            >
              Cho thuê chỗ ở qua Airbnb
            </Link>

            {/* Globe icon */}
            <button className="p-3 rounded-full hover:bg-gray-100 transition-colors">
              <FaGlobe className="w-4 h-4 text-gray-700" />
            </button>

            {/* User Menu */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-3 border border-gray-300 rounded-full pl-3 pr-2 py-1.5 hover:shadow-md transition-shadow"
              >
                <FaBars className="w-4 h-4 text-gray-700" />
                {isLoggedIn && user ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-7 h-7 rounded-full bg-gray-700"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src =
                        "https://flowbite.com/docs/images/people/profile-picture-5.jpg";
                    }}
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-gray-700 flex items-center justify-center">
                    <FaUser className="w-4 h-4 text-white" />
                  </div>
                )}
              </button>

              {/* Dropdown Menu */}
              <AnimatePresence>
                {isUserMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-60 bg-white rounded-xl shadow-xl border border-gray-200 py-2 overflow-hidden"
                  >
                    {isLoggedIn && user ? (
                      <>
                        <Link
                          href="/message"
                          className="block px-4 py-3 text-sm font-medium text-gray-900 hover:bg-gray-50"
                        >
                          Tin nhắn
                        </Link>
                        <Link
                          href="/trip"
                          className="block px-4 py-3 text-sm font-medium text-gray-900 hover:bg-gray-50"
                        >
                          Chuyến đi
                        </Link>
                        <Link
                          href="/wishlist"
                          className="block px-4 py-3 text-sm font-medium text-gray-900 hover:bg-gray-50"
                        >
                          Danh sách yêu thích
                        </Link>
                        
                        <div className="border-t border-gray-200 my-2"></div>
                        
                        <Link
                          href="/host"
                          className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          Cho thuê chỗ ở qua Airbnb
                        </Link>
                        <Link
                          href="/profile"
                          className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          Tài khoản
                        </Link>
                        
                        <div className="border-t border-gray-200 my-2"></div>
                        
                        <button
                          onClick={handleSignOut}
                          className="block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          Đăng xuất
                        </button>
                      </>
                    ) : (
                      <>
                        <Link
                          href="/login"
                          className="block px-4 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-50"
                        >
                          Đăng nhập
                        </Link>
                        <Link
                          href="/register"
                          className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          Đăng ký
                        </Link>
                        
                        <div className="border-t border-gray-200 my-2"></div>
                        
                        <Link
                          href="/host"
                          className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          Cho thuê chỗ ở qua Airbnb
                        </Link>
                        <Link
                          href="/help"
                          className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          Trung tâm trợ giúp
                        </Link>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}