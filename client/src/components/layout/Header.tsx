"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import Cookies from "js-cookie";
import axios from "@/lib/axios";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  FaBars,
  FaTimes,
  FaBriefcase,
  FaSearch,
  FaUser,
  FaCog,
  FaSignOutAlt,
  FaHotel,
  FaInfoCircle,
  FaConciergeBell,
  FaBell,
} from "react-icons/fa";

interface User {
  name: string;
  email: string;
  avatar?: string;
}

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const pathname = usePathname();
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
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

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

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
        setUser({
          name: userData.name || `${userData.firstName} ${userData.lastName}`,
          email: userData.email,
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search functionality here
    console.log("Searching for:", searchQuery);
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const navLinks = [
    { name: "Home", href: "/home", icon: <FaHotel className="mr-2" /> },
    { name: "About", href: "/about", icon: <FaInfoCircle className="mr-2" /> },
    {
      name: "Services",
      href: "/services",
      icon: <FaConciergeBell className="mr-2" />,
    },
  ];

  const isActiveLink = (path: string) => {
    return pathname === path;
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-3">
          {/* Logo Section */}
          <div className="flex items-center">
            <Link href="/home" className="flex items-center">
              <Image
                src="https://img.icons8.com/?size=100&id=UH55vOLfw0MO&format=png&color=000000"
                alt="Tripadvisor Logo"
                width={180}
                height={40}
                className="h-8 w-auto"
              />
            </Link>
          </div>

          {/* Search Bar - Desktop only */}
          <form
            onSubmit={handleSearch}
            className="hidden md:flex relative mx-4 flex-grow max-w-md"
          >
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search places, hotels, activities..."
              className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
            />
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
            <button
              type="submit"
              className="absolute right-2 top-1.5 bg-green-500 hover:bg-green-600 text-white p-1 rounded-full transition-colors"
            >
              <FaSearch className="w-4 h-4" />
            </button>
          </form>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden inline-flex items-center p-2 text-gray-500 rounded-lg hover:bg-gray-100 focus:outline-none"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <FaTimes className="w-6 h-6" />
            ) : (
              <FaBars className="w-6 h-6" />
            )}
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`px-4 py-2 rounded-md font-medium transition-colors duration-200 flex items-center ${
                  isActiveLink(link.href)
                    ? "bg-green-50 text-green-700"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {link.name}
              </Link>
            ))}

            {/* User Menu - Desktop */}
            {isLoggedIn && user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 ml-2 focus:outline-none"
                >
                  <div className="relative">
                    <img
                      className="w-10 h-10 rounded-full border-2 border-white shadow-sm object-cover"
                      src={user.avatar}
                      alt={user.name}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src =
                          "https://flowbite.com/docs/images/people/profile-picture-5.jpg";
                      }}
                    />
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                  </div>
                </button>

                {/* User Dropdown Menu */}
                {isUserMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg py-2 z-50 border border-gray-100"
                  >
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">
                        {user.name}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {user.email}
                      </p>
                    </div>

                    <Link
                      href="/profile"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <FaUser className="w-4 h-4 mr-3 text-gray-500" />
                      Profile
                    </Link>

                    <Link
                      href="/settings"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <FaCog className="w-4 h-4 mr-3 text-gray-500" />
                      Settings
                    </Link>

                    <div className="border-t border-gray-100 my-1"></div>

                    <Link
                      href="/host"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <FaBriefcase className="w-4 h-4 mr-3 text-gray-500" />
                      Quản lý căn hộ, phòng cho thuê
                    </Link>

                    <div className="border-t border-gray-100 my-1"></div>

                    <button
                      onClick={handleSignOut}
                      className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      <FaSignOutAlt className="w-4 h-4 mr-3" />
                      Sign out
                    </button>
                  </motion.div>
                )}
              </div>
            ) : (
              <div className="flex items-center ml-2">
                <Link
                  href="/login"
                  className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-full font-medium transition-colors"
                >
                  Log in
                </Link>
              </div>
            )}
          </nav>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden bg-white border-t border-gray-200"
        >
          {/* Mobile Search */}
          <form
            onSubmit={handleSearch}
            className="p-4 border-b border-gray-200"
          >
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search places, hotels, activities..."
                className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
            </div>
          </form>

          {/* Mobile Navigation Links */}
          <nav className="px-2 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center px-3 py-3 rounded-md ${
                  isActiveLink(link.href)
                    ? "bg-green-50 text-green-700"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {link.icon}
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Mobile User Menu */}
          {isLoggedIn && user ? (
            <div className="px-5 py-3 border-t border-gray-200">
              <div className="flex items-center space-x-3 mb-3">
                <img
                  className="w-12 h-12 rounded-full object-cover"
                  src={user.avatar}
                  alt={user.name}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src =
                      "https://flowbite.com/docs/images/people/profile-picture-5.jpg";
                  }}
                />
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-gray-500 truncate">{user.email}</p>
                </div>
              </div>

              <div className="space-y-1">
                <Link
                  href="/profile"
                  className="flex items-center py-2 text-gray-700"
                >
                  <FaUser className="w-4 h-4 mr-3 text-gray-500" />
                  Profile
                </Link>

                <Link
                  href="/settings"
                  className="flex items-center py-2 text-gray-700"
                >
                  <FaCog className="w-4 h-4 mr-3 text-gray-500" />
                  Settings
                </Link>

                <Link
                  href="/host"
                  className="flex items-center py-2 text-gray-700"
                >
                  <FaBriefcase className="w-4 h-4 mr-3 text-gray-500" />
                  Quản lý căn hộ, phòng cho thuê
                </Link>

                <button
                  onClick={handleSignOut}
                  className="flex w-full items-center py-2 text-red-600"
                >
                  <FaSignOutAlt className="w-4 h-4 mr-3" />
                  Sign out
                </button>
              </div>
            </div>
          ) : (
            <div className="px-5 py-4 border-t border-gray-200">
              <Link
                href="/login"
                className="block w-full bg-green-600 hover:bg-green-700 text-center text-white py-3 rounded-md font-medium transition-colors"
              >
                Log in
              </Link>
            </div>
          )}
        </motion.div>
      )}
    </header>
  );
}
