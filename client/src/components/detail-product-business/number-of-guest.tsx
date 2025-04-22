"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

export const FetchNumberOfGuest = () => {
  const [guestCount, setGuestCount] = useState(1);

  const incrementGuest = () => {
    setGuestCount((prevCount) => prevCount + 1);
  };

  const decrementGuest = () => {
    if (guestCount > 1) {
      setGuestCount((prevCount) => prevCount - 1);
    }
  };

  // Guest image URLs mapped by index
  const guestImageUrls = [
    "https://a0.muscache.com/im/pictures/mediaverse/MYS%20Number%20of%20Guests/original/674405ba-1473-4a93-8d91-20e177708fcf.png",
    "https://a0.muscache.com/im/pictures/mediaverse/MYS%20Number%20of%20Guests/original/0e6ac8b5-bda6-4b88-a8d9-9e2a17e4061b.png",
    "https://a0.muscache.com/im/pictures/mediaverse/MYS%20Number%20of%20Guests/original/8b0a737b-2c87-43b6-a4a2-dce4ebcb1bdf.png",
    "https://a0.muscache.com/im/pictures/mediaverse/MYS%20Number%20of%20Guests/original/244dc498-e875-449e-b855-5d13b8f44d50.png",
    "https://a0.muscache.com/im/pictures/mediaverse/MYS%20Number%20of%20Guests/original/8b90c490-dac6-456c-9a12-752369fcecc9.png",
    "https://a0.muscache.com/im/pictures/mediaverse/MYS%20Number%20of%20Guests/original/50f7cb91-d0fe-4726-963c-7242660b1db3.png",
    "https://a0.muscache.com/im/pictures/mediaverse/MYS%20Number%20of%20Guests/original/708f660d-443a-4283-9c36-484029accd65.png",
    "https://a0.muscache.com/im/pictures/mediaverse/MYS%20Number%20of%20Guests/original/2a8e78db-8781-4bc7-a746-bef45ed6aed9.png",
    "https://a0.muscache.com/im/pictures/mediaverse/MYS%20Number%20of%20Guests/original/84572734-6766-47a9-9fb8-f7ee9a70f63a.png",
    "https://a0.muscache.com/im/pictures/mediaverse/MYS%20Number%20of%20Guests/original/27a66ad6-58c9-415d-bf4f-ccb96436b617.png",
    "https://a0.muscache.com/im/pictures/mediaverse/MYS%20Number%20of%20Guests/original/2b98033d-d5d8-412c-8611-ef0b03530f6a.png",
    "https://a0.muscache.com/im/pictures/mediaverse/MYS%20Number%20of%20Guests/original/2432a97a-7d97-4815-aea5-5541a342ac62.png",
    "https://a0.muscache.com/im/pictures/mediaverse/MYS%20Number%20of%20Guests/original/354bca63-8008-45d7-b76f-c1c19a788825.png",
    "https://a0.muscache.com/im/pictures/mediaverse/MYS%20Number%20of%20Guests/original/2a8e78db-8781-4bc7-a746-bef45ed6aed9.png",
    "https://a0.muscache.com/im/pictures/mediaverse/MYS%20Number%20of%20Guests/original/674405ba-1473-4a93-8d91-20e177708fcf.png",
    "https://a0.muscache.com/im/pictures/mediaverse/MYS%20Number%20of%20Guests/original/f817a380-05a1-4a1e-9bbe-3ee184aff6b3.png",
    "https://a0.muscache.com/im/pictures/mediaverse/MYS%20Number%20of%20Guests/original/48b87e37-cd4a-4a56-9422-79e278764b6e.png",
  ];

  // Generate an array of guest images based on count
  const guestImages = () => {
    const images = [];
    const imagesToShow = Math.min(guestCount, 16);

    for (let i = 0; i < imagesToShow; i++) {
      const imageUrl = guestImageUrls[Math.min(i, guestImageUrls.length - 1)];

      images.push(
        <motion.div
          key={`guest-${i}`}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 20,
            delay: i * 0.05,
          }}
          className="inline-block -m-1 relative"
        >
          <Image
            src={imageUrl}
            alt={`Guest Icon ${i + 1}`}
            width={80}
            height={80}
            className="drop-shadow-md hover:scale-110 transition-transform"
          />
        </motion.div>
      );
    }

    return images;
  };

  const displayCount = () => {
    if (guestCount > 16) {
      return "16+";
    }
    return guestCount;
  };

  return (
    <motion.div
      className="flex flex-col items-center p-6 bg-white rounded-2xl shadow-lg max-w-3xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">
        Number of Guests
      </h2>

      <div className="mb-8 flex flex-wrap justify-center gap-0 p-2 bg-gray-50 rounded-xl w-full overflow-hidden">
        <AnimatePresence>{guestImages()}</AnimatePresence>
      </div>

      <div className="flex items-center justify-between w-full max-w-xs">
        <motion.button
          onClick={decrementGuest}
          className="w-14 h-14 flex items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-xl text-white shadow-md"
          disabled={guestCount <= 1}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          initial={{ opacity: 0.6 }}
          animate={{
            opacity: guestCount <= 1 ? 0.5 : 1,
            backgroundColor: guestCount <= 1 ? "#ccc" : "#ff385c",
          }}
        >
          <span className="text-2xl">-</span>
        </motion.button>

        <motion.div
          className="font-bold text-8xl text-gray-800"
          key={guestCount}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          {displayCount()}
        </motion.div>

        <motion.button
          onClick={incrementGuest}
          className="w-14 h-14 flex items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-xl text-white shadow-md"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <span className="text-2xl">+</span>
        </motion.button>
      </div>

      <motion.p
        className="mt-5 text-gray-500 text-center"
        animate={{ opacity: [0, 1] }}
        transition={{ delay: 0.5 }}
      >
        Chọn số lượng khách sẽ ở lại
      </motion.p>
    </motion.div>
  );
};
