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
  FaChevronDown,
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNavMenuOpen, setIsNavMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const pathname = usePathname();
  const userMenuRef = useRef<HTMLDivElement>(null);
  const navMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
      
      if (
        navMenuRef.current &&
        !navMenuRef.current.contains(event.target as Node)
      ) {
        setIsNavMenuOpen(false);
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
    setIsNavMenuOpen(false);
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

        const firstName = userData.firstName || "";
        const lastName = userData.lastName || "";
        const fullName = firstName && lastName ? `${firstName} ${lastName}` : '';
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
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-3">
          {/* Logo Section */}
          <div className="flex items-center">
            <Link href="/home" className="flex items-center transition-transform hover:scale-105">
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
            className="hidden md:flex relative mx-4 flex-grow max-w-md group"
          >
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search places, hotels, activities..."
              className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 
                      focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent 
                      transition-all duration-300 shadow-sm group-hover:shadow-md"
            />
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
            <button
              type="submit"
              className="absolute right-2 top-1.5 bg-emerald-500 hover:bg-emerald-600 
                       text-white p-1.5 rounded-full transition-all duration-300 
                       transform hover:scale-105"
              aria-label="Search"
            >
              <FaSearch className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden inline-flex items-center p-2 text-gray-500 rounded-lg 
                     hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 
                     transition-all duration-200"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <FaTimes className="w-6 h-6" />
            ) : (
              <FaBars className="w-6 h-6" />
            )}
          </button>

          {/* Compact Desktop Navigation */}
          <div className="hidden md:flex items-center">
            <div className="flex items-center border border-gray-200 rounded-full px-3 py-1.5 shadow-sm hover:shadow-md transition-all duration-200">
              {/* Navigation Menu Dropdown */}
              <div className="relative mr-3" ref={navMenuRef}>
                <button 
                  onClick={() => setIsNavMenuOpen(!isNavMenuOpen)}
                  className="flex items-center space-x-1 focus:outline-none"
                  aria-label="Navigation menu"
                >
                  <FaBars className="text-gray-600 w-4 h-4" />
                  <FaChevronDown className={`w-3 h-3 text-gray-500 ml-1 transition-transform duration-200 ${isNavMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {/* Nav Links Dropdown */}
                <AnimatePresence>
                  {isNavMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 5, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 5, scale: 0.98 }}
                      transition={{ duration: 0.2 }}
                      className="absolute left-0 mt-2 w-48 bg-white rounded-xl shadow-lg 
                               py-2 z-50 border border-gray-100 overflow-hidden"
                    >
                      {navLinks.map((link) => (
                        <Link
                          key={link.name}
                          href={link.href}
                          className={`flex items-center px-4 py-2.5 text-sm
                                    ${isActiveLink(link.href)
                                      ? "bg-emerald-50 text-emerald-700"
                                      : "text-gray-700 hover:bg-gray-50"
                                    } transition-colors`}
                          onClick={() => setIsNavMenuOpen(false)}
                        >
                          {link.icon}
                          {link.name}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              {/* Divider */}
              <div className="h-6 w-px bg-gray-300 mx-2"></div>

              {/* User Menu - Desktop */}
              {isLoggedIn && user ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center focus:outline-none 
                             transition-transform hover:scale-105 rounded-full"
                    aria-label="Open user menu"
                  >
                    <div className="relative">
                      <img
                        className="w-8 h-8 rounded-full border-2 border-white shadow-sm 
                                 object-cover ring-1 ring-emerald-50"
                        src={user.avatar}
                        alt={user.name}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src =
                            "https://flowbite.com/docs/images/people/profile-picture-5.jpg";
                        }}
                      />
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 
                                    border-2 border-white rounded-full"></span>
                    </div>
                  </button>

                  {/* User Dropdown Menu */}
                  <AnimatePresence>
                    {isUserMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 5, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 5, scale: 0.98 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg 
                                 py-2 z-50 border border-gray-100 overflow-hidden"
                      >
                        <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r 
                                     from-emerald-50 to-white">
                          <p className="text-sm font-medium text-gray-900">
                            {user.name}
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            {user.email}
                          </p>
                        </div>

                        <Link
                          href="/profile"
                          className="flex items-center px-4 py-2.5 text-sm text-gray-700 
                                   hover:bg-gray-50 transition-colors"
                        >
                          <FaUser className="w-4 h-4 mr-3 text-emerald-600" />
                          Profile
                        </Link>

                        <Link
                          href="/settings"
                          className="flex items-center px-4 py-2.5 text-sm text-gray-700 
                                   hover:bg-gray-50 transition-colors"
                        >
                          <FaCog className="w-4 h-4 mr-3 text-emerald-600" />
                          Settings
                        </Link>

                        <div className="border-t border-gray-100 my-1"></div>

                        <Link
                          href="/host"
                          className="flex items-center px-4 py-2.5 text-sm text-gray-700 
                                   hover:bg-gray-50 transition-colors"
                        >
                          <FaBriefcase className="w-4 h-4 mr-3 text-emerald-600" />
                          Quản lý căn hộ, phòng cho thuê
                        </Link>

                        <Link
                          href="/trip"
                          className="flex items-center px-4 py-2.5 text-sm text-gray-700 
                                   hover:bg-gray-50 transition-colors"
                        >
                          <IoIosAirplane className="w-4 h-4 mr-3 text-emerald-600" />
                          Chuyến đi của bạn
                        </Link>

                        <div className="border-t border-gray-100 my-1"></div>

                        <button
                          onClick={handleSignOut}
                          className="flex w-full items-center px-4 py-2.5 text-sm text-red-600 
                                   hover:bg-red-50 transition-colors"
                        >
                          <FaSignOutAlt className="w-4 h-4 mr-3" />
                          Sign out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="text-sm font-medium text-gray-700 hover:text-emerald-600 transition-colors"
                >
                  Log in
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="md:hidden bg-white border-t border-gray-200 shadow-lg"
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
                  className="w-full pl-10 pr-4 py-2.5 rounded-full border border-gray-300 
                           focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
                />
                <FaSearch className="absolute left-3 top-3.5 text-gray-400" />
                <button 
                  type="submit"
                  className="absolute right-2 top-2 bg-emerald-500 text-white p-1.5 rounded-full"
                  aria-label="Search"
                >
                  <FaSearch className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>

            {/* Mobile Navigation Links */}
            <nav className="px-2 py-3 space-y-1 bg-gray-50">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`flex items-center px-3 py-3 rounded-lg ${
                    isActiveLink(link.href)
                      ? "bg-emerald-50 text-emerald-700 shadow-sm"
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
              <div className="px-5 py-3 border-t border-gray-200 bg-white">
                <div className="flex items-center space-x-3 mb-3 pb-3 border-b border-gray-100">
                  <img
                    className="w-12 h-12 rounded-full object-cover border-2 border-emerald-100 
                             shadow-sm"
                    src={user.avatar}
                    alt={user.name}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src =
                        "https://flowbite.com/docs/images/people/profile-picture-5.jpg";
                    }}
                  />
                  <div>
                    <p className="font-medium text-gray-900">{user.name}</p>
                    <p className="text-sm text-gray-500 truncate">{user.email}</p>
                  </div>
                </div>

                <div className="space-y-0.5">
                  <Link
                    href="/profile"
                    className="flex items-center py-2.5 text-gray-700 hover:bg-gray-50 
                             rounded-lg px-2 transition-colors"
                  >
                    <FaUser className="w-4 h-4 mr-3 text-emerald-600" />
                    Profile
                  </Link>

                  <Link
                    href="/settings"
                    className="flex items-center py-2.5 text-gray-700 hover:bg-gray-50 
                             rounded-lg px-2 transition-colors"
                  >
                    <FaCog className="w-4 h-4 mr-3 text-emerald-600" />
                    Settings
                  </Link>

                  <Link
                    href="/host"
                    className="flex items-center py-2.5 text-gray-700 hover:bg-gray-50 
                             rounded-lg px-2 transition-colors"
                  >
                    <FaBriefcase className="w-4 h-4 mr-3 text-emerald-600" />
                    Quản lý căn hộ, phòng cho thuê
                  </Link>
                  <Link
                    href="/trip"
                    className="flex items-center py-2.5 text-gray-700 hover:bg-gray-50 
                             rounded-lg px-2 transition-colors"
                  >
                    <IoIosAirplane className="w-4 h-4 mr-3 text-emerald-600" />
                    Chuyến đi của bạn
                  </Link>
                  
                  <div className="pt-2 mt-2 border-t border-gray-100">
                    <button
                      onClick={handleSignOut}
                      className="flex w-full items-center py-2.5 text-red-600 hover:bg-red-50 
                               rounded-lg px-2 transition-colors"
                    >
                      <FaSignOutAlt className="w-4 h-4 mr-3" />
                      Sign out
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="px-5 py-4 border-t border-gray-200">
                <Link
                  href="/login"
                  className="block w-full bg-emerald-600 hover:bg-emerald-700 text-center 
                           text-white py-3 rounded-lg font-medium transition-colors shadow-sm 
                           hover:shadow-md"
                >
                  Log in
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}