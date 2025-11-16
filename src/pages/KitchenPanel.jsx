// src/pages/KitchenPanel.jsx
import { useState } from "react";
// import Navbar from "../components/AdminNavbar"; // Kitchen belongs to staff/admin layout
import KitchenNavbar from "../components/KitchenNavbar";

export default function KitchenPanel() {
  // Fake order data (Replace with backend later)
  const [orders, setOrders] = useState([
    {
      id: "ORD-1001",
      table: 5,
      items: [
        { name: "Margherita Pizza", qty: 1 },
        { name: "Caesar Salad", qty: 2 },
      ],
      status: "Placed",
      time: "12:43 PM",
      new: true,
    },
    {
      id: "ORD-1002",
      table: 2,
      items: [
        { name: "Cheeseburger Deluxe", qty: 1 },
        { name: "Pasta Alfredo", qty: 1 },
      ],
      status: "In-Progress",
      time: "12:40 PM",
      new: false,
    },
    {
      id: "ORD-1003",
      table: 8,
      items: [
        { name: "Fries", qty: 3 },
        { name: "Chicken Wrap", qty: 2 },
      ],
      status: "Completed",
      time: "12:35 PM",
      new: false,
    },
  ]);

  const updateStatus = (id, newStatus) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === id ? { ...order, status: newStatus, new: false } : order
      )
    );
  };

  const [filter, setFilter] = useState("All");

  const filteredOrders =
    filter === "All"
      ? orders
      : orders.filter((order) => order.status === filter);

  return (
    <div className="min-h-screen bg-[#FFF5EE]">
      <KitchenNavbar />

      <div className="max-w-6xl mx-auto px-6 pt-24 pb-16">

        {/* Heading */}
        <h1 className="text-4xl font-bold text-center text-[#2E2E2E] mb-10">
          Kitchen Orders Panel
        </h1>

        {/* Filters */}
        <div className="flex justify-center gap-4 mb-10">
          {["All", "Placed", "In-Progress", "Completed"].map((option) => (
            <button
              key={option}
              onClick={() => setFilter(option)}
              className={`px-4 py-2 rounded-lg font-medium shadow-sm transition ${
                filter === option
                  ? "bg-[#FF4C29] text-white"
                  : "bg-white text-gray-700 hover:bg-[#FFEDE5]"
              }`}
            >
              {option}
            </button>
          ))}
        </div>

        {/* Orders List */}
        <div className="space-y-6">
          {filteredOrders.length === 0 ? (
            <p className="text-center text-gray-500 text-lg">
              No orders under this status.
            </p>
          ) : (
            filteredOrders.map((order) => (
              <div
                key={order.id}
                className={`bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition border-l-8 ${
                  order.status === "Placed"
                    ? "border-[#FF4C29]"
                    : order.status === "In-Progress"
                    ? "border-[#FFA41B]"
                    : "border-green-500"
                }`}
              >
                {/* Header Line */}
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-[#2E2E2E]">
                    Order {order.id}
                  </h2>

                  <span className="text-gray-500 text-sm">{order.time}</span>
                </div>

                {/* Table Number + New Badge */}
                <div className="flex items-center gap-3 mb-4">
                  <p className="text-gray-700 font-medium text-lg">
                    Table: {order.table}
                  </p>

                  {order.new && (
                    <span className="bg-[#FF4C29] text-white text-xs px-2 py-1 rounded-full font-semibold">
                      NEW
                    </span>
                  )}
                </div>

                {/* Items */}
                <div className="bg-[#FFF5EE] rounded-xl p-4 mb-4">
                  {order.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between text-gray-700 text-lg py-1"
                    >
                      <span>{item.name}</span>
                      <span className="font-semibold">×{item.qty}</span>
                    </div>
                  ))}
                </div>

                {/* Status Controls */}
                <div className="flex items-center gap-4">

                  <button
                    onClick={() => updateStatus(order.id, "Placed")}
                    className={`px-4 py-2 rounded-lg font-medium transition ${
                      order.status === "Placed"
                        ? "bg-[#FF4C29] text-white"
                        : "bg-white text-gray-700 hover:bg-[#FFEDE5]"
                    }`}
                  >
                    Placed
                  </button>

                  <button
                    onClick={() => updateStatus(order.id, "In-Progress")}
                    className={`px-4 py-2 rounded-lg font-medium transition ${
                      order.status === "In-Progress"
                        ? "bg-[#FFA41B] text-white"
                        : "bg-white text-gray-700 hover:bg-[#FFEDE5]"
                    }`}
                  >
                    In-Progress
                  </button>

                  <button
                    onClick={() => updateStatus(order.id, "Completed")}
                    className={`px-4 py-2 rounded-lg font-medium transition ${
                      order.status === "Completed"
                        ? "bg-green-600 text-white"
                        : "bg-white text-gray-700 hover:bg-[#E9FCE9]"
                    }`}
                  >
                    Completed
                  </button>

                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
