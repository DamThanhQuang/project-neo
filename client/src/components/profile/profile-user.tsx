"use client";
import {
  FaMapMarkerAlt,
  FaRegCalendarAlt,
  FaUser,
  FaCamera,
  FaPen,
  FaCog,
  FaEnvelope,
  FaHeart,
  FaCity,
  FaImage,
  FaThumbsUp,
  FaComment,
  FaUserFriends,
  FaBookmark,
  FaChevronRight,
} from "react-icons/fa";
import { Menu, Transition } from "@headlessui/react";
import { Fragment, useState, useEffect } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/solid";
import { motion, AnimatePresence } from "framer-motion";
import EditProfileModal from "./edit-profile";
import axios from "@/lib/axios";
import { isAxiosError } from "axios";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  joinDate?: string;
  location: string;
  contributions?: number;
  likes?: number;
  cities?: number;
  photos?: number;
  description?: string;
  avatar?: string;
  coverImage?: string;
}

// Example data for tabs - replace with real data in a production app
const activityData = {
  reviews: [
    {
      id: 1,
      title: "Amazing experience at Sunset Resort",
      location: "Sunset Resort, Bali",
      date: "2 days ago",
      rating: 5,
      likes: 12,
      replies: 3,
    },
    {
      id: 2,
      title: "Disappointing stay at Mountain View Hotel",
      location: "Mountain View Hotel, Switzerland",
      date: "1 week ago",
      rating: 2,
      likes: 5,
      replies: 8,
    },
  ],
  photos: [
    {
      id: 1,
      url: "https://source.unsplash.com/random/300x300?hotel",
      location: "Grand Hotel",
    },
    {
      id: 2,
      url: "https://source.unsplash.com/random/300x300?beach",
      location: "Paradise Beach",
    },
    {
      id: 3,
      url: "https://source.unsplash.com/random/300x300?restaurant",
      location: "Gourmet Restaurant",
    },
    {
      id: 4,
      url: "https://source.unsplash.com/random/300x300?mountain",
      location: "Mountain Resort",
    },
  ],
};

const ProfileUser = () => {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [coverHover, setCoverHover] = useState(false);

  const fetchProfile = async (id: string) => {
    try {
      setLoading(true);

      const userId = Cookies.get("userId");
      const token = Cookies.get("token");

      // Update the API endpoint to include the user ID
      const response = await axios.get(`user/profile/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Transform the backend data to match our UserProfile interface
      const userData = response.data;
      setProfile({
        id: userData._id || userData.id,
        name: userData.name || `${userData.firstName} ${userData.lastName}`,
        email: userData.email,
        joinDate: new Date(userData.createdAt).toLocaleDateString(),
        location: userData.location || "No location set",
        contributions: userData.contributions || 25,
        likes: userData.likes || 47,
        cities: userData.cities || 12,
        photos: userData.photos || 36,
        description:
          userData.description ||
          "Hello! I'm a travel enthusiast passionate about exploring new places and sharing my experiences with the community. I love discovering hidden gems and authentic local experiences.",
        avatar:
          userData.avatar ||
          "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=80",
        coverImage:
          userData.coverImage ||
          "https://images.unsplash.com/photo-1506929562872-bb421503ef21?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1368&q=80",
      });
    } catch (err) {
      console.error("Error details:", err);
      if (isAxiosError(err)) {
        if (err.response?.status === 401) {
          Cookies.remove("userId");
          Cookies.remove("token");
          router.push("/login");
        } else {
          setError(
            `Failed to load profile: ${
              err.response?.data?.message || "Unknown error"
            }`
          );
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (updatedProfile: Partial<UserProfile>) => {
    try {
      const token = Cookies.get("token");
      console.log("Update with token:", token); // Debug log

      if (!profile?.id) {
        console.log("No profile ID found");
        return;
      }

      //Chuan bi du lieu de update
      const updateData = {
        name: updatedProfile.name,
        location: updatedProfile.location,
        description: updatedProfile.description,
        email: updatedProfile.email,
      };

      console.log("data update:", updateData);

      const response = await axios.put(`user/${profile?.id}`, updateData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      //update user voi data moi
      setProfile((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          ...response.data,
          id: prev.id, // Đảm bảo giữ nguyên ID
        };
      });

      setIsEditModalOpen(false);
    } catch (err) {
      console.error("Update error details:", err);
      if (isAxiosError(err)) {
        if (err.response?.status === 401) {
          Cookies.remove("userId");
          Cookies.remove("token");
          router.push("/login");
        } else {
          setError(
            `Failed to update profile: ${
              err.response?.data?.message || "Unknown error"
            }`
          );
        }
      } else {
        setError("An unexpected error occurred");
      }
    }
  };

  const handleAvatarUpdate = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      const token = Cookies.get("token");
      if (!profile?.id || !token) {
        console.error("Missing profile ID or token");
        return;
      }

      // Tạo form data
      const formData = new FormData();
      formData.append("file", file);

      console.log("Uploading avatar...");

      const response = await axios.put(`user/${profile.id}/avatar`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Avatar update response:", response.data);

      setProfile((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          avatar: response.data.avatar,
        };
      });
    } catch (err) {
      console.error("Avatar update error:", err);
      if (isAxiosError(err)) {
        if (err.response?.status === 401) {
          Cookies.remove("userId");
          Cookies.remove("token");
          router.push("/login");
        } else {
          setError(
            `Failed to update avatar: ${
              err.response?.data?.message || "Unknown error"
            }`
          );
        }
      }
    }
  };

  const handleCoverUpdate = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      const token = Cookies.get("token");
      if (!profile?.id || !token) {
        console.error("Missing profile ID or token");
        return;
      }

      const formData = new FormData();
      formData.append("file", file);

      console.log("Uploading cover image...");

      const response = await axios.put(`user/${profile.id}/cover`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setProfile((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          coverImage: response.data.coverImage,
        };
      });
    } catch (err) {
      setError("Failed to update cover image");
      console.error(err);
    }
  };

  const checkAuth = async () => {
    try {
      const userId = Cookies.get("userId");
      const token = Cookies.get("token");

      if (!userId || !token) {
        console.log("No auth credentials found");
        router.push("/login");
        return;
      }

      await fetchProfile(userId);
    } catch (error) {
      console.error("Auth check error:", error);
      router.push("/login");
    }
  };

  useEffect(() => {
    const userId = Cookies.get("userId");
    if (userId) {
      checkAuth();
      fetchProfile(userId);
    }
  }, [router]);

  // Loading state with better animation
  if (loading) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-indigo-600 border-indigo-200 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium text-lg">
            Loading your profile...
          </p>
        </div>
      </div>
    );
  }

  // Error state with better design
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full text-center">
          <div className="bg-red-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-10 h-10 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
          </div>
          <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // No profile found state
  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full text-center">
          <div className="bg-yellow-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
            <FaUser className="w-10 h-10 text-yellow-600" />
          </div>
          <h2 className="text-xl font-bold mb-2">Profile Not Found</h2>
          <p className="text-gray-600 mb-4">
            We couldn't find your profile information.
          </p>
          <button
            onClick={() => router.push("/login")}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Log In
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-gray-50 min-h-screen">
        {/* Hero Section with Cover Image */}
        <div
          className="relative bg-gradient-to-r from-violet-500 to-indigo-700 h-[300px] md:h-[350px] lg:h-[400px]"
          onMouseEnter={() => setCoverHover(true)}
          onMouseLeave={() => setCoverHover(false)}
        >
          {profile.coverImage && (
            <div className="absolute inset-0 overflow-hidden">
              <div className="w-full h-full relative">
                <img
                  src={profile.coverImage}
                  alt="Cover"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black opacity-30"></div>
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 to-transparent"></div>
              </div>
            </div>
          )}

          <input
            type="file"
            id="cover-upload"
            accept="image/*"
            onChange={handleCoverUpdate}
            className="hidden"
          />

          <AnimatePresence>
            {coverHover && (
              <motion.label
                htmlFor="cover-upload"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute right-6 bottom-6 flex items-center gap-2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-md cursor-pointer hover:bg-white transition-all z-10"
              >
                <FaCamera className="text-gray-700" />
                <span className="font-medium text-gray-800">Update Cover</span>
              </motion.label>
            )}
          </AnimatePresence>

          <div className="container mx-auto px-4 relative h-full flex items-end pb-4">
            <h1 className="text-white text-3xl md:text-4xl font-bold drop-shadow-md">
              {profile.name}
            </h1>
          </div>
        </div>

        <div className="container mx-auto px-4">
          <div className="md:flex gap-6 -mt-16 md:-mt-20 relative z-10">
            {/* Left Column - Profile Card */}
            <div className="md:w-1/3 lg:w-1/4 mb-6 md:mb-0">
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                {/* Avatar Section */}
                <div className="p-6 text-center border-b relative">
                  <div className="relative inline-block">
                    <div className="w-32 h-32 mx-auto rounded-full border-4 border-white shadow-md overflow-hidden">
                      {profile.avatar ? (
                        <img
                          src={profile.avatar}
                          alt={profile.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200">
                          <FaUser className="w-1/2 h-1/2 text-gray-400" />
                        </div>
                      )}
                    </div>

                    <input
                      type="file"
                      id="avatar-upload"
                      accept="image/*"
                      onChange={handleAvatarUpdate}
                      className="hidden"
                    />
                    <label
                      htmlFor="avatar-upload"
                      className="absolute bottom-0 right-0 bg-indigo-600 text-white rounded-full p-2 shadow-lg hover:bg-indigo-700 cursor-pointer transition-colors"
                    >
                      <FaCamera className="w-5 h-5" />
                    </label>
                  </div>

                  <h2 className="mt-4 text-xl font-bold text-gray-800">
                    {profile.name}
                  </h2>

                  <div className="mt-2 flex justify-center gap-2">
                    <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full">
                      Traveler
                    </span>
                    <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                      Elite Reviewer
                    </span>
                  </div>
                </div>

                {/* Profile Details */}
                <div className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-indigo-100 p-2 rounded-lg">
                        <FaEnvelope className="text-indigo-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium text-gray-800">
                          {profile.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="bg-indigo-100 p-2 rounded-lg">
                        <FaMapMarkerAlt className="text-indigo-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Location</p>
                        <p className="font-medium text-gray-800">
                          {profile.location}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="bg-indigo-100 p-2 rounded-lg">
                        <FaRegCalendarAlt className="text-indigo-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Member Since</p>
                        <p className="font-medium text-gray-800">
                          {profile.joinDate}
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsEditModalOpen(true)}
                    className="mt-6 w-full bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <FaPen size={14} />
                    Edit Profile
                  </button>
                </div>

                {/* Stats Section */}
                <div className="bg-gray-50 p-6">
                  <h3 className="text-gray-600 font-medium mb-4">Statistics</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-xl shadow-sm">
                      <div className="flex items-center gap-2 mb-1">
                        <FaComment className="text-indigo-500" />
                        <h4 className="text-gray-600 text-sm">Reviews</h4>
                      </div>
                      <p className="text-2xl font-bold text-gray-800">
                        {profile.contributions}
                      </p>
                    </div>

                    <div className="bg-white p-4 rounded-xl shadow-sm">
                      <div className="flex items-center gap-2 mb-1">
                        <FaThumbsUp className="text-indigo-500" />
                        <h4 className="text-gray-600 text-sm">Likes</h4>
                      </div>
                      <p className="text-2xl font-bold text-gray-800">
                        {profile.likes}
                      </p>
                    </div>

                    <div className="bg-white p-4 rounded-xl shadow-sm">
                      <div className="flex items-center gap-2 mb-1">
                        <FaCity className="text-indigo-500" />
                        <h4 className="text-gray-600 text-sm">Cities</h4>
                      </div>
                      <p className="text-2xl font-bold text-gray-800">
                        {profile.cities}
                      </p>
                    </div>

                    <div className="bg-white p-4 rounded-xl shadow-sm">
                      <div className="flex items-center gap-2 mb-1">
                        <FaImage className="text-indigo-500" />
                        <h4 className="text-gray-600 text-sm">Photos</h4>
                      </div>
                      <p className="text-2xl font-bold text-gray-800">
                        {profile.photos}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Content */}
            <div className="md:w-2/3 lg:w-3/4">
              {/* Navigation Tabs */}
              <div className="bg-white rounded-xl shadow-md mb-6 overflow-hidden">
                <div className="border-b overflow-x-auto hide-scrollbar">
                  <div className="flex min-w-max">
                    {[
                      { id: "profile", label: "About Me" },
                      { id: "reviews", label: "Reviews" },
                      { id: "photos", label: "Photos" },
                      { id: "trips", label: "Trips" },
                      { id: "saved", label: "Saved" },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-6 py-4 text-sm font-medium transition-colors relative ${
                          activeTab === tab.id
                            ? "text-indigo-600"
                            : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                        }`}
                      >
                        {tab.label}
                        {activeTab === tab.id && (
                          <motion.div
                            layoutId="activeTab"
                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"
                          />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Content Area */}
                <div className="p-6">
                  <AnimatePresence mode="wait">
                    {activeTab === "profile" && (
                      <motion.div
                        key="profile"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        <h2 className="text-xl font-bold mb-4">About Me</h2>
                        <div className="prose max-w-none text-gray-600">
                          <p className="mb-6 leading-relaxed">
                            {profile.description}
                          </p>
                        </div>

                        <h3 className="text-lg font-semibold mb-3 mt-8">
                          Areas of Interest
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {[
                            "Beach Resorts",
                            "Mountain Hiking",
                            "Cultural Tourism",
                            "Local Cuisines",
                            "Photography",
                          ].map((interest) => (
                            <span
                              key={interest}
                              className="bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-700"
                            >
                              {interest}
                            </span>
                          ))}
                        </div>

                        <h3 className="text-lg font-semibold mb-3 mt-8">
                          Places Visited
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                          {[
                            "Bali, Indonesia",
                            "Paris, France",
                            "Tokyo, Japan",
                            "New York, USA",
                            "Rome, Italy",
                            "Sydney, Australia",
                          ].map((place) => (
                            <div
                              key={place}
                              className="flex items-center gap-2"
                            >
                              <FaMapMarkerAlt className="text-indigo-500 flex-shrink-0" />
                              <span className="text-gray-700">{place}</span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {activeTab === "reviews" && (
                      <motion.div
                        key="reviews"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        <h2 className="text-xl font-bold mb-4">My Reviews</h2>
                        <div className="space-y-6">
                          {activityData.reviews.map((review) => (
                            <div
                              key={review.id}
                              className="border rounded-xl p-6 hover:shadow-md transition-shadow"
                            >
                              <div className="flex items-start justify-between">
                                <div>
                                  <h3 className="font-semibold text-gray-800">
                                    {review.title}
                                  </h3>
                                  <p className="text-gray-500 text-sm mt-1">
                                    {review.location}
                                  </p>
                                </div>
                                <div className="flex">
                                  {[...Array(5)].map((_, i) => (
                                    <svg
                                      key={i}
                                      className={`w-5 h-5 ${
                                        i < review.rating
                                          ? "text-yellow-400"
                                          : "text-gray-300"
                                      }`}
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                    >
                                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                  ))}
                                </div>
                              </div>

                              <div className="mt-4 text-gray-700">
                                <p>
                                  This is a placeholder review content. In the
                                  production app, this would contain the actual
                                  review text written by the user.
                                </p>
                              </div>

                              <div className="mt-4 pt-4 border-t flex items-center justify-between">
                                <span className="text-gray-500 text-sm">
                                  {review.date}
                                </span>
                                <div className="flex items-center gap-4">
                                  <span className="flex items-center gap-1 text-gray-600 text-sm">
                                    <FaHeart className="text-red-400" />
                                    {review.likes}
                                  </span>
                                  <span className="flex items-center gap-1 text-gray-600 text-sm">
                                    <FaComment className="text-blue-400" />
                                    {review.replies}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {activeTab === "photos" && (
                      <motion.div
                        key="photos"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-6"
                      >
                        <div className="flex justify-between items-center">
                          <h2 className="text-xl font-bold">My Photos</h2>
                          <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center gap-1">
                            <FaImage className="w-4 h-4" />
                            <span>Upload Photos</span>
                          </button>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                          {activityData.photos.map((photo) => (
                            <div
                              key={photo.id}
                              className="rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow group relative"
                            >
                              <img
                                src={photo.url}
                                alt={`Travel photo ${photo.id}`}
                                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                                  <p className="font-medium">
                                    {photo.location}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {activeTab === "trips" && (
                      <motion.div
                        key="trips"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="text-center py-12">
                          <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FaUserFriends className="text-indigo-500 text-2xl" />
                          </div>
                          <h3 className="text-xl font-bold text-gray-800 mb-2">
                            No trips yet
                          </h3>
                          <p className="text-gray-600 mb-6 max-w-md mx-auto">
                            Start planning your next adventure and keep track of
                            all your trips in one place.
                          </p>
                          <button className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors">
                            Plan a New Trip
                          </button>
                        </div>
                      </motion.div>
                    )}

                    {activeTab === "saved" && (
                      <motion.div
                        key="saved"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="flex justify-between items-center mb-6">
                          <h2 className="text-xl font-bold">Saved Places</h2>
                          <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center gap-1">
                            <FaBookmark className="w-4 h-4" />
                            <span>View All</span>
                          </button>
                        </div>

                        <div className="space-y-4">
                          {[
                            {
                              name: "Sunrise Beach Resort",
                              location: "Bali, Indonesia",
                              type: "Resort",
                              saved: "3 days ago",
                              image:
                                "https://source.unsplash.com/random/800x600?beach,resort",
                            },
                            {
                              name: "Mountain View Lodge",
                              location: "Swiss Alps, Switzerland",
                              type: "Lodge",
                              saved: "1 week ago",
                              image:
                                "https://source.unsplash.com/random/800x600?mountain,resort",
                            },
                          ].map((item, idx) => (
                            <div
                              key={idx}
                              className="flex border rounded-xl overflow-hidden hover:shadow-md transition-shadow"
                            >
                              <div className="w-1/3 md:w-1/4 h-32">
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex-1 p-4 flex flex-col justify-between">
                                <div>
                                  <h3 className="font-semibold text-gray-800">
                                    {item.name}
                                  </h3>
                                  <p className="text-gray-500 text-sm">
                                    {item.location}
                                  </p>
                                  <p className="text-xs text-indigo-600 mt-1">
                                    {item.type}
                                  </p>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-gray-500 text-xs">
                                    Saved {item.saved}
                                  </span>
                                  <button className="text-gray-600 hover:text-indigo-600">
                                    <FaChevronRight className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        profile={profile}
        onSave={handleProfileUpdate}
      />
    </>
  );
};

export default ProfileUser;
