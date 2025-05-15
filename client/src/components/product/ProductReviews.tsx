import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { FaStar, FaThumbsUp, FaRegThumbsUp } from "react-icons/fa";

interface Rating {
  stars: number;
  count: number;
  percentage: number;
}

interface Review {
  id: number;
  rating: number;
  title: string;
  comment: string;
  user: {
    name: string;
    image: string;
  };
  date: string;
}

interface ProductReviewsProps {
  reviews: Review[];
  ratings: Rating[];
  averageRating: number;
  totalRatings: number;
}

export default function ProductReviews({
  reviews,
  ratings,
  averageRating,
  totalRatings,
}: ProductReviewsProps) {
  const [likedReviews, setLikedReviews] = useState<number[]>([]);
  const [showAllReviews, setShowAllReviews] = useState(false);

  const displayedReviews = showAllReviews ? reviews : reviews.slice(0, 3);

  const handleLikeReview = (reviewId: number) => {
    if (likedReviews.includes(reviewId)) {
      setLikedReviews(likedReviews.filter((id) => id !== reviewId));
    } else {
      setLikedReviews([...likedReviews, reviewId]);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white p-4 md:p-6 rounded-xl"
    >
      <h2 className="text-2xl font-bold mb-6">Đánh giá sản phẩm</h2>

      <div className="flex flex-col md:flex-row gap-8 mb-8">
        {/* Ratings summary section */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-4">
            <FaStar className="text-yellow-500 w-5 h-5" />
            <span className="text-xl font-bold">
              {averageRating.toFixed(1)}
            </span>
            <span className="text-gray-700">·</span>
            <span className="text-gray-700">{totalRatings} đánh giá</span>
          </div>

          <div className="space-y-3">
            {ratings.map((rating) => (
              <div key={rating.stars} className="flex items-center gap-3">
                <span className="w-8 text-gray-700 font-medium">
                  {rating.stars} ★
                </span>
                <div className="flex-grow h-3 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${rating.percentage}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="h-full bg-yellow-500 rounded-full"
                  ></motion.div>
                </div>
                <span className="w-12 text-right text-gray-600 text-sm">
                  {rating.count}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Rating highlight card */}
        <div className="md:w-80 p-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl flex flex-col items-center justify-center shadow-md">
          <div className="flex items-center justify-center mb-6 ">
            <img
              src="https://a0.muscache.com/im/pictures/airbnb-platform-assets/AirbnbPlatformAssets-GuestFavorite/original/78b7687c-5acf-4ef8-a5ea-eda732ae3b2f.png"
              alt="Award Left"
              className="w-20 h-16 object-contain transform transition-transform duration-300"
            />
            <div className="font-bold text-7xl text-gray-800 mx-2">
              {averageRating.toFixed(1)}
            </div>
            <img
              src="https://a0.muscache.com/im/pictures/airbnb-platform-assets/AirbnbPlatformAssets-GuestFavorite/original/b4005b30-79ff-4287-860c-67829ecd7412.png"
              alt="Award Right"
              className="w-20 h-16 object-contain transform transition-transform duration-300"
            />
          </div>

          <div className="flex mb-3">
            {[...Array(5)].map((_, i) => (
              <FaStar
                key={i}
                className={`w-5 h-5 ${
                  i < Math.floor(averageRating)
                    ? "text-yellow-500"
                    : i < averageRating
                    ? "text-gradient-star"
                    : "text-gray-300"
                }`}
              />
            ))}
          </div>
          <div className="text-sm text-gray-600 text-center">
            Dựa trên {totalRatings} đánh giá từ khách hàng
          </div>
        </div>
      </div>

      {/* Reviews list */}
      <h3 className="text-xl font-semibold mb-4">Nhận xét khách hàng</h3>
      <div className="mt-6 space-y-4">
        <AnimatePresence>
          {displayedReviews.map((review) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-all"
            >
              <div className="flex items-start">
                <img
                  src={review.user.image}
                  alt={review.user.name}
                  className="w-10 h-10 rounded-full mr-3 object-cover border border-gray-200"
                />
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {review.user.name}
                      </h4>
                      <div className="flex items-center mt-1">
                        {[...Array(5)].map((_, i) => (
                          <FaStar
                            key={i}
                            className={
                              i < review.rating
                                ? "text-yellow-500 w-4 h-4"
                                : "text-gray-300 w-4 h-4"
                            }
                          />
                        ))}
                        <span className="ml-2 text-xs text-gray-500">
                          {review.date}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleLikeReview(review.id)}
                      className="text-gray-500 hover:text-blue-500 transition-colors"
                    >
                      {likedReviews.includes(review.id) ? (
                        <FaThumbsUp className="w-4 h-4" />
                      ) : (
                        <FaRegThumbsUp className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  <div className="mt-3 text-gray-700">
                    {review.title && (
                      <p className="font-medium mb-1">{review.title}</p>
                    )}
                    <p className="text-sm leading-relaxed">{review.comment}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {reviews.length > 3 && (
        <div className="mt-6 text-center">
          <button
            onClick={() => setShowAllReviews(!showAllReviews)}
            className="px-6 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700 font-medium transition-colors"
          >
            {showAllReviews
              ? "Thu gọn đánh giá"
              : `Xem thêm ${reviews.length - 3} đánh giá`}
          </button>
        </div>
      )}
    </motion.div>
  );
}
