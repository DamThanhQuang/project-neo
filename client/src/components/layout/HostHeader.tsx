"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  FiCalendar,
  FiStar,
  FiMenu,
  FiX,
  FiGrid,
  FiHelpCircle,
  FiMessageCircle,
} from "react-icons/fi";
import { IoHomeOutline } from "react-icons/io5";

// Định nghĩa interface cho item điều hướng
interface NavigationItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

// Dữ liệu điều hướng
const navigation: NavigationItem[] = [
  {
    name: "Hôm nay",
    href: "/host/dashboard/today",
    icon: FiGrid,
  },
  {
    name: "Lịch",
    href: "/host/dashboard/calendar",
    icon: FiCalendar,
  },
  {
    name: "Nhà/Phòng cho thuê",
    href: "/host/dashboard/listing",
    icon: IoHomeOutline,
  },
  {
    name: "Đánh giá",
    href: "/host/dashboard/reviews",
    icon: FiStar,
  },
  {
    name: "Tin nhắn",
    href: "/host/dashboard/messages",
    icon: FiMessageCircle,
  },
];

// Component NavLink tái sử dụng
const NavLink = ({
  item,
  isActive,
  isMobile = false,
  onClick,
}: {
  item: NavigationItem;
  isActive: boolean;
  isMobile?: boolean;
  onClick?: () => void;
}) => (
  <Link
    href={item.href}
    className={`
      flex items-center rounded-md transition-all duration-200 ease-in-out
      ${isMobile ? "px-4 py-3 text-base" : "px-3 py-2 text-sm"}
      ${
        isActive
          ? "text-rose-600 bg-rose-50 font-semibold"
          : "text-gray-600 hover:text-rose-500 hover:bg-gray-50 font-medium"
      }
    `}
    onClick={onClick}
  >
    <item.icon className={`${isMobile ? "mr-3" : "mr-2"} h-5 w-5`} />
    {item.name}
  </Link>
);

export default function HostHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <nav className="sticky top-0 z-10 bg-white w-full shadow-sm border-b border-gray-100">
      <div className="w-full px-4 py-3">
        <div className="flex justify-between items-center max-w-[2520px] mx-auto xl:px-20 md:px-10 sm:px-2">
          {/* Logo */}
          <Link
            href="/host"
            className="text-rose-500 font-bold text-2xl flex items-center gap-2 hover:opacity-90 transition"
          >
            <Image
              src="https://img.icons8.com/?size=100&id=UH55vOLfw0MO&format=png&color=000000"
              alt="Tripadvisor Logo"
              width={180}
              height={40}
              className="h-8 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                item={item}
                isActive={isActive(item.href)}
              />
            ))}

            {/* Help Button */}
            <button className="flex items-center text-gray-600 hover:text-rose-500 hover:bg-gray-50 p-2 rounded-full transition-colors">
              <FiHelpCircle className="h-5 w-5" />
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-gray-600 hover:text-rose-500 focus:outline-none p-1 rounded-md transition-colors"
            onClick={toggleMenu}
            aria-label={isMenuOpen ? "Đóng menu" : "Mở menu"}
          >
            {isMenuOpen ? (
              <FiX className="h-6 w-6" />
            ) : (
              <FiMenu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation với hiệu ứng mở/đóng */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            isMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="space-y-1 pt-3 pb-3 border-t border-gray-100 mt-2">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                item={item}
                isActive={isActive(item.href)}
                isMobile={true}
                onClick={closeMenu}
              />
            ))}

            {/* Help Button cho mobile */}
            <button className="flex items-center w-full px-4 py-3 text-base font-medium text-gray-600 hover:text-rose-500 hover:bg-gray-50 rounded-md transition-colors">
              <FiHelpCircle className="mr-3 h-5 w-5" />
              Trợ giúp
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
