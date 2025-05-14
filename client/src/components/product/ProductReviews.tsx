import { AnimatePresence, motion } from "framer-motion";
import { use, useState } from "react";
import { FaStar } from "react-icons/fa";

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
  const [hoveredLikeId, setHoveredLikeId] = useState<number | null>(null);
  const feedbackEmojis = ["", "😞", "🙁", "😐", "🙂", "😄"];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Guest Favorite Badges */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex items-center bg-white rounded-lg border border-gray-100 p-2 shadow-sm">
          <img
            src="https://a0.muscache.com/im/pictures/airbnb-platform-assets/AirbnbPlatformAssets-GuestFavorite/original/78b7687c-5acf-4ef8-a5ea-eda732ae3b2f.png"
            alt="Guest Favorite Badge"
            className="h-10 w-10 mr-3"
          />
          <div>
            <p className="font-medium text-sm">Khách yêu thích</p>
            <p className="text-xs text-gray-500">
              Một trong những địa điểm được đánh giá cao nhất
            </p>
          </div>
        </div>

        <div className="flex items-center bg-white rounded-lg border border-gray-100 p-2 shadow-sm">
          <img
            src="https://a0.muscache.com/im/pictures/airbnb-platform-assets/AirbnbPlatformAssets-GuestFavorite/original/b4005b30-79ff-4287-860c-67829ecd7412.png"
            alt="Top Rated Badge"
            className="h-10 w-10 mr-3"
          />
          <div>
            <p className="font-medium text-sm">Đánh giá xuất sắc</p>
            <p className="text-xs text-gray-500">Dịch vụ chất lượng hàng đầu</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8 mb-8">
        <div className="flex-1">
          <h3 className="text-xl font-semibold mb-4">
            <div className="flex items-center gap-2">
              <FaStar className="text-black-400" />
              <span>{averageRating}</span>
              <span className="text-gray-700">·</span>
              <span>{totalRatings} đánh giá</span>
            </div>
          </h3>

          <div className="space-y-2">
            {ratings.map((rating) => (
              <div key={rating.stars} className="flex items-center gap-2">
                <span className="w-1 text-gray-600">{rating.stars}</span>
                <div className="flex-grow h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-black-400 rounded-full"
                    style={{ width: `${rating.percentage}%` }}
                  ></div>
                </div>
                <span className="w-8 text-right text-gray-500 text-sm">
                  {rating.count}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="md:w-64 p-6 bg-black-50 rounded-xl flex flex-col items-center justify-center">
          <div className="font-bold text-4xl text-black-600 mb-2">
            {averageRating}
          </div>
          <div className="flex mb-2">
            {[...Array(5)].map((_, i) => (
              <FaStar
                key={i}
                className={
                  i < Math.floor(averageRating)
                    ? "text-black-400"
                    : "text-gray-300"
                }
              />
            ))}
          </div>
          <div className="text-sm text-gray-600">
            Trên tổng số {totalRatings} đánh giá
          </div>
        </div>
      </div>
      {/* Review List */}
      <div className="mt-6 space-y-4">
        {reviews.map((review) => (
          <motion.div
            key={review.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="p-3 bg-white rounded-lg border border-gray-100 hover:shadow-sm transition-shadow"
          >
            <div className="flex items-start">
              <img
                src={review.user.image}
                alt={review.user.name}
                className="w-8 h-8 rounded-full mr-3 object-cover"
              />
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-sm text-gray-900">
                      {review.user.name}
                    </h4>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <FaStar
                          key={i}
                          className={
                            i < review.rating
                              ? "text-black-400 w-3 h-3"
                              : "text-gray-300 w-3 h-3"
                          }
                        />
                      ))}
                      <span className="ml-1 text-xs text-gray-500">
                        {review.date}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-2 text-sm text-gray-700 whitespace-pre-line">
                  {review.title && (
                    <p className="font-medium text-sm mb-0.5">{review.title}</p>
                  )}
                  {review.comment}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
