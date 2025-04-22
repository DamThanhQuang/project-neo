import { motion } from "framer-motion";

interface ProductDescriptionProps {
  description: {
    description: string;
    descriptionDetail: string;
    guestsAmenities: string;
    interactionWithGuests: string;
  };
}

export default function ProductDescription({
  description,
}: ProductDescriptionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h3 className="text-xl font-semibold mb-4">Về nơi này</h3>
      <p className="text-gray-700 leading-relaxed whitespace-pre-line mb-6">
        {description.description}
      </p>

      <h4 className="text-xl font-semibold mb-4">Chỗ ở</h4>
      <p className="text-gray-700 leading-relaxed whitespace-pre-line mb-6">
        {description.descriptionDetail}
      </p>

      <h4 className="text-xl font-semibold mb-4">
        Tiện nghi khách có quyền sử dụng
      </h4>
      <p className="text-gray-700 leading-relaxed whitespace-pre-line mb-6">
        {description.guestsAmenities}
      </p>

      <h4 className="text-xl font-semibold mb-4">Những điều cần lưu ý khác</h4>
      <p className="text-gray-700 leading-relaxed whitespace-pre-line mb-6">
        {description.interactionWithGuests}
      </p>

      <div className="p-6 bg-gray-50 rounded-xl border border-gray-100 mt-6">
        <h4 className="font-semibold mb-3">Quy tắc chỗ ở</h4>
        <ul className="space-y-2 text-gray-700">
          <li className="flex items-start">
            <svg
              className="mr-2 w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            <span>Nhận phòng sau 14:00</span>
          </li>
          <li className="flex items-start">
            <svg
              className="mr-2 w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            <span>Trả phòng trước 12:00</span>
          </li>
          <li className="flex items-start">
            <svg
              className="mr-2 w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
              ></path>
            </svg>
            <span>Không hút thuốc</span>
          </li>
        </ul>
      </div>
    </motion.div>
  );
}
