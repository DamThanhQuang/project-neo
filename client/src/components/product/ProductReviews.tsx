import { motion } from "framer-motion";
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
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex flex-col md:flex-row gap-8 mb-8">
        <div className="flex-1">
          <h3 className="text-xl font-semibold mb-4">
            <div className="flex items-center gap-2">
              <FaStar className="text-yellow-400" />
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
                    className="h-full bg-yellow-400 rounded-full"
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

        <div className="md:w-64 p-6 bg-yellow-50 rounded-xl flex flex-col items-center justify-center">
          <div className="font-bold text-4xl text-yellow-600 mb-2">
            {averageRating}
          </div>
          <div className="flex mb-2">
            {[...Array(5)].map((_, i) => (
              <FaStar
                key={i}
                className={
                  i < Math.floor(averageRating)
                    ? "text-yellow-400"
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
      <div className="mt-8 space-y-8">
        {reviews.map((review) => (
          <motion.div
            key={review.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="p-6 bg-white rounded-xl border border-gray-100 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start">
              <img
                src={review.user.image}
                alt={review.user.name}
                className="w-12 h-12 rounded-full mr-4 object-cover"
              />
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
                          ? "text-yellow-400 w-4 h-4"
                          : "text-gray-300 w-4 h-4"
                      }
                    />
                  ))}
                  <span className="ml-2 text-sm text-gray-500">
                    {review.date}
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-4 text-gray-700 whitespace-pre-line">
              {review.title && (
                <p className="font-medium mb-1">{review.title}</p>
              )}
              {review.comment}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
