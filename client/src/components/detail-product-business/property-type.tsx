"use client";
import { useState } from "react";
import { ChevronDown, Plus, Minus } from "lucide-react";

export default function PropertyType() {
  const [floors, setFloors] = useState(1);
  const [currentFloor, setCurrentFloor] = useState(1);
  const [buildYear, setBuildYear] = useState("");

  return (
    <div className="min-h-screen bg-white">
      <main className="max-w-2xl mx-auto py-6 px-4">
        <h2 className="text-lg font-semibold mb-3">Loại chỗ ở</h2>
        <form className="space-y-3">
          {/* Property Category */}
          <div>
            <label className="block text-xs text-gray-500 mb-0.5">
              Loại nào giống nhà/phòng cho thuê của bạn nhất?
            </label>
            <div className="relative max-w-md">
              <select className="w-full border border-gray-300 rounded-lg py-2 px-3 bg-white appearance-none focus:outline-none focus:ring-1 focus:ring-black text-sm">
                <option>Căn hộ</option>
                <option>Nhà</option>
                <option>Căn hộ phụ</option>
                <option>Không gian độc đáo</option>
                <option>Chỗ nghỉ phục vụ bữa sáng</option>
                <option>Khách sạn boutique</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
            </div>
          </div>

          {/* Property Type */}
          <div>
            <label className="block text-xs text-gray-500 mb-0.5">
              Loại chỗ ở
            </label>
            <div className="relative max-w-md">
              <select className="w-full border border-gray-300 rounded-lg py-2 px-3 bg-white appearance-none focus:outline-none focus:ring-1 focus:ring-black text-sm">
                <option>Nhà</option>
                <option>Nhà phố</option>
                <option>Bungalow</option>
                <option>Cabin</option>
                <option>Nhà gỗ chalet</option>
                <option>Nhà bằng đất</option>
                <option>Lều</option>
                <option>Ngọn hải đăng</option>
                <option>Biệt thự</option>
                <option>Nhà mái vòm</option>
                <option>Nhà nghỉ thôn dã</option>
                <option>Nhà nghỉ nông trại</option>
                <option>Nhà thuyền</option>
                <option>Nhà siêu nhỏ</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
            </div>
            <p className="mt-0.5 text-xs text-gray-500 max-w-md">
              Một ngôi nhà được làm bằng các vật liệu tự nhiên như gỗ và nằm
              giữa khung cảnh thiên nhiên.
            </p>
          </div>

          {/* Rental Type */}
          <div>
            <label className="block text-xs text-gray-500 mb-0.5">
              Loại hình cho thuê
            </label>
            <div className="relative max-w-md">
              <select className="w-full border border-gray-300 rounded-lg py-2 px-3 bg-white appearance-none focus:outline-none focus:ring-1 focus:ring-black text-sm">
                <option>Toàn bộ nhà</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
            </div>
            <p className="mt-0.5 text-xs text-gray-500 max-w-md">
              Khách sẽ dùng toàn bộ chỗ ở này cho riêng mình. Chỗ ở này thường
              có một phòng ngủ, một phòng tắm và bếp.
            </p>
          </div>

          {/* Number of Floors */}
          <div className="max-w-xs">
            <label className="block text-xs text-gray-500 mb-0.5">
              Tòa nhà đó có bao nhiêu tầng?
            </label>
            <div className="flex items-center">
              <button
                type="button"
                onClick={() => setFloors(Math.max(1, floors - 1))}
                className="border border-gray-300 rounded-full p-1.5 hover:bg-gray-100"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="mx-3 text-sm">{floors}</span>
              <button
                type="button"
                onClick={() => setFloors(floors + 1)}
                className="border border-gray-300 rounded-full p-1.5 hover:bg-gray-100"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Current Floor */}
          <div className="max-w-xs">
            <label className="block text-xs text-gray-500 mb-0.5">
              Nhà/phòng cho thuê nằm ở tầng mấy?
            </label>
            <div className="flex items-center">
              <button
                type="button"
                onClick={() => setCurrentFloor(Math.max(1, currentFloor - 1))}
                className="border border-gray-300 rounded-full p-1.5 hover:bg-gray-100"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="mx-3 text-sm">{currentFloor}</span>
              <button
                type="button"
                onClick={() =>
                  setCurrentFloor(Math.min(floors, currentFloor + 1))
                }
                className="border border-gray-300 rounded-full p-1.5 hover:bg-gray-100"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Build Year */}
          <div className="max-w-xs">
            <label className="block text-xs text-gray-500 mb-0.5">
              Năm xây dựng
            </label>
            <input
              type="text"
              value={buildYear}
              onChange={(e) => setBuildYear(e.target.value)}
              className="w-full border border-gray-300 rounded-lg py-1.5 px-3 focus:outline-none focus:ring-1 focus:ring-black text-sm"
              placeholder="Năm xây dựng"
            />
          </div>

          {/* Property Scale */}
          <div>
            <label className="block text-xs text-gray-500 mb-0.5">
              Quy mô chỗ ở
            </label>
            <div className="relative max-w-md">
              <select className="w-full border border-gray-300 rounded-lg py-2 px-3 bg-white appearance-none focus:outline-none focus:ring-1 focus:ring-black text-sm">
                <option>Đơn vị</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
            </div>
            <p className="mt-0.5 text-xs text-gray-500 max-w-md">
              Diện tích không gian trong nhà mà khách được sử dụng.
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="bg-black text-white rounded-lg py-1.5 px-4 text-xs font-medium hover:bg-gray-800"
            >
              Lưu
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
