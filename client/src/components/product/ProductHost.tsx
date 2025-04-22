import { motion } from "framer-motion";

interface ProductHostProps {
  host: {
    name: string;
    image: string;
    isSuperhost: boolean;
  };
}

export default function ProductHost({ host }: ProductHostProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h3 className="text-xl font-semibold mb-4">Về chủ nhà {host.name}</h3>
      <p className="text-gray-700 mb-4">
        {host.name} là một chủ nhà tuyệt vời với nhiều năm kinh nghiệm trong
        việc cung cấp dịch vụ lưu trú chất lượng. Họ luôn sẵn sàng hỗ trợ và đảm
        bảo rằng bạn có một kỳ nghỉ thoải mái và đáng nhớ.
      </p>
      <div className="flex items-center gap-4">
        <img
          src={host.image}
          alt={host.name}
          className="w-16 h-16 rounded-full border-2 border-white shadow-md"
        />
        <div>
          <h4 className="font-medium text-gray-900">{host.name}</h4>
          <p className="text-gray-600">Chủ nhà</p>
        </div>
      </div>
    </motion.div>
  );
}
