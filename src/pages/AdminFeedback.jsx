// src/pages/AdminFeedback.jsx
//import Navbar from "../components/Navbar";
import AdminNavbar from "../components/AdminNavbar";
import { MessageSquare, Star, TrendingUp, Filter, Search, Calendar } from "lucide-react";
import { useState } from "react";

export default function AdminFeedback() {
  const [filterRating, setFilterRating] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Temporary static feedback (replace with backend data later)
  const feedbackData = [
    {
      id: 1,
      rating: 5,
      comment: "Amazing food! The pizza tasted very fresh. The crust was perfectly crispy and the toppings were generous. Will definitely order again!",
      orderId: "ORD-1024",
      date: "2025-02-18",
      customerName: "Ahmed Khan",
      itemOrdered: "Margherita Pizza"
    },
    {
      id: 2,
      rating: 4,
      comment: "Good service, but the burger was a bit cold when it arrived. The taste was great though, and the fries were amazing!",
      orderId: "ORD-1033",
      date: "2025-02-18",
      customerName: "Sara Ali",
      itemOrdered: "Beef Burger Combo"
    },
  ];

  // Calculate stats
  const totalFeedback = feedbackData.length;
  const averageRating = (feedbackData.reduce((acc, item) => acc + item.rating, 0) / totalFeedback).toFixed(1);
  const fiveStarCount = feedbackData.filter(item => item.rating === 5).length;
  const fiveStarPercentage = ((fiveStarCount / totalFeedback) * 100).toFixed(0);

  // Filter feedback
  const filteredFeedback = feedbackData.filter(item => {
    const matchesRating = filterRating === "all" || item.rating === parseInt(filterRating);
    const matchesSearch = item.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.orderId.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesRating && matchesSearch;
  });

  // Rating distribution
  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: feedbackData.filter(item => item.rating === rating).length,
    percentage: ((feedbackData.filter(item => item.rating === rating).length / totalFeedback) * 100).toFixed(0)
  }));

  const getRatingColor = (rating) => {
    if (rating >= 4) return "text-green-500";
    if (rating === 3) return "text-yellow-500";
    return "text-red-500";
  };

  const getRatingBg = (rating) => {
    if (rating >= 4) return "bg-green-50 border-green-200";
    if (rating === 3) return "bg-yellow-50 border-yellow-200";
    return "bg-red-50 border-red-200";
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-orange-50 via-amber-50 to-orange-100">
      <AdminNavbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <MessageSquare className="w-8 h-8 text-orange-600" />
            <h1 className="text-4xl font-bold text-gray-800">
              Customer Feedback
            </h1>
          </div>
          <p className="text-gray-600">Monitor and analyze customer satisfaction</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Feedback */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-orange-100">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-600 text-sm font-medium">Total Feedback</h3>
              <MessageSquare className="w-5 h-5 text-orange-500" />
            </div>
            <p className="text-3xl font-bold text-gray-800">{totalFeedback}</p>
            <p className="text-xs text-gray-500 mt-1">All time reviews</p>
          </div>

          {/* Average Rating */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-orange-100">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-600 text-sm font-medium">Average Rating</h3>
              <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold text-gray-800">{averageRating}</p>
              <span className="text-gray-500 text-lg">/ 5.0</span>
            </div>
            <div className="flex items-center gap-1 mt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${
                    star <= Math.round(averageRating)
                      ? "text-yellow-500 fill-yellow-500"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* 5-Star Reviews */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-orange-100">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-600 text-sm font-medium">5-Star Reviews</h3>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-gray-800">{fiveStarPercentage}%</p>
            <p className="text-xs text-gray-500 mt-1">{fiveStarCount} excellent reviews</p>
          </div>

          {/* Rating Distribution */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-orange-100">
            <h3 className="text-gray-600 text-sm font-medium mb-3">Rating Breakdown</h3>
            <div className="space-y-2">
              {ratingDistribution.slice(0, 3).map((item) => (
                <div key={item.rating} className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-gray-700 w-8">
                    {item.rating}★
                  </span>
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-linear-to-r from-orange-500 to-red-500"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 w-8">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-orange-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by customer, order ID, or comment..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all"
              />
            </div>

            {/* Rating Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={filterRating}
                onChange={(e) => setFilterRating(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all appearance-none cursor-pointer bg-white"
              >
                <option value="all">All Ratings</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>
            </div>
          </div>
        </div>

        {/* Feedback List */}
        <div className="space-y-6">
          {filteredFeedback.length > 0 ? (
            filteredFeedback.map((item) => (
              <div
                key={item.id}
                className={`bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-6 border-2 ${getRatingBg(item.rating)}`}
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-4">
                  
                  {/* Left Section - Customer Info */}
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="w-12 h-12 bg-linear-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0">
                      {item.customerName.charAt(0)}
                    </div>

                    <div>
                      <h3 className="font-bold text-gray-800 text-lg">{item.customerName}</h3>
                      <p className="text-sm text-gray-600">{item.itemOrdered}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-500">{item.date}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Section - Rating & Order */}
                  <div className="flex flex-col items-start lg:items-end gap-2">
                    {/* Rating Stars */}
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-5 h-5 ${
                            star <= item.rating
                              ? "text-yellow-500 fill-yellow-500"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                      <span className={`ml-2 font-bold text-lg ${getRatingColor(item.rating)}`}>
                        {item.rating}.0
                      </span>
                    </div>

                    {/* Order ID */}
                    <div className="bg-gray-100 px-3 py-1 rounded-lg">
                      <span className="text-xs text-gray-600">Order: </span>
                      <span className="text-xs font-bold text-gray-800">{item.orderId}</span>
                    </div>
                  </div>
                </div>

                {/* Comment */}
                <div className="bg-white bg-opacity-60 rounded-xl p-4 border border-gray-200">
                  <p className="text-gray-700 leading-relaxed">
                    "{item.comment}"
                  </p>
                </div>

                {/* Action Buttons (for future use) */}
                <div className="flex gap-3 mt-4">
                  <button className="text-sm text-orange-600 hover:text-orange-700 font-medium hover:underline">
                    Respond
                  </button>
                  <button className="text-sm text-gray-600 hover:text-gray-700 font-medium hover:underline">
                    Mark as Resolved
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-orange-100">
              <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No feedback matches your filters</p>
              <p className="text-gray-400 text-sm mt-2">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}