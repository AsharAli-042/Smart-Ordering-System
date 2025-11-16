// src/pages/AdminFeedback.jsx
import React, { useEffect, useState } from "react";
import AdminNavbar from "../components/AdminNavbar";
import { MessageSquare, Star, TrendingUp, Filter, Search, Calendar } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

/**
 * Small helper component that shows a toggleable response textarea and saves the response.
 * Emits a custom event 'feedback:response:updated' on success so the parent can update UI.
 */
function RespondBlock({ feedbackId, initialResponse = "" }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState(initialResponse || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    setError("");
    if (!text.trim()) {
      setError("Response cannot be empty");
      return;
    }
    setSaving(true);
    try {
      const authRaw = localStorage.getItem("auth");
      const headers = { "Content-Type": "application/json" };
      if (authRaw) {
        try {
          const parsed = JSON.parse(authRaw);
          if (parsed?.token) headers.Authorization = `Bearer ${parsed.token}`;
        } catch (e) {}
      }

      const res = await fetch(`http://localhost:5000/api/admin/feedback/${feedbackId}/respond`, {
        method: "POST",
        headers,
        body: JSON.stringify({ response: text.trim() }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || `Error ${res.status}`);
      }

      const body = await res.json();
      // notify parent to update local state
      window.dispatchEvent(
        new CustomEvent("feedback:response:updated", {
          detail: { id: feedbackId, response: body.response, responseAt: body.responseAt },
        })
      );
      setOpen(false);
    } catch (err) {
      console.error("Failed to save response:", err);
      setError(err.message || "Failed to save response");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => setOpen((o) => !o)}
          className="text-sm text-orange-600 hover:text-orange-700 font-medium"
        >
          {open ? "Cancel" : initialResponse ? "Edit Response" : "Respond"}
        </button>
      </div>

      {open && (
        <div className="mt-3">
          <textarea
            rows={3}
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500"
            placeholder="Write response to customer..."
          />
          {error && <div className="text-sm text-red-600 mt-1">{error}</div>}
          <div className="mt-2 flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-[#FF4C29] text-white px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Response"}
            </button>
            <button
              onClick={() => {
                setOpen(false);
                setText(initialResponse || "");
              }}
              className="text-sm px-3 py-2 rounded-lg border"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminFeedback() {
  const { user } = useAuth();

  // local UI state
  const [filterRating, setFilterRating] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // feedback data from backend
  const [feedbacks, setFeedbacks] = useState([]);
  const [fbLoading, setFbLoading] = useState(true);
  const [fbError, setFbError] = useState("");

  // fetch feedbacks on mount
  useEffect(() => {
    let mounted = true;
    const fetchFeedbacks = async () => {
      setFbLoading(true);
      setFbError("");
      try {
        const headers = { "Content-Type": "application/json" };
        if (user && user.token) headers.Authorization = `Bearer ${user.token}`;

        const res = await fetch("http://localhost:5000/api/admin/feedback", { headers });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.message || `Error ${res.status}`);
        }
        const data = await res.json();
        if (mounted) setFeedbacks(data || []);
      } catch (err) {
        console.error("Failed to fetch feedbacks:", err);
        if (mounted) setFbError(err.message || "Failed to load feedbacks");
      } finally {
        if (mounted) setFbLoading(false);
      }
    };

    fetchFeedbacks();
    return () => {
      mounted = false;
    };
  }, [user]);

  // update local feedbacks when a response is saved (RespondBlock dispatches the event)
  useEffect(() => {
    const handler = (e) => {
      const { id, response, responseAt } = e.detail || {};
      if (!id) return;
      setFeedbacks((prev) => prev.map((f) => (String(f.id) === String(id) ? { ...f, response, responseAt } : f)));
    };
    window.addEventListener("feedback:response:updated", handler);
    return () => window.removeEventListener("feedback:response:updated", handler);
  }, []);

  // derived stats
  const totalFeedback = feedbacks.length;
  const averageRating = totalFeedback
    ? (feedbacks.reduce((acc, it) => acc + (it.rating || 0), 0) / totalFeedback).toFixed(1)
    : "0.0";
  const fiveStarCount = feedbacks.filter((it) => it.rating === 5).length;
  const fiveStarPercentage = totalFeedback ? Math.round((fiveStarCount / totalFeedback) * 100) : 0;

  // filtering
  const filteredFeedback = feedbacks.filter((item) => {
    const matchesRating = filterRating === "all" || item.rating === parseInt(filterRating);
    const q = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !q ||
      (item.message || "").toLowerCase().includes(q) ||
      (item.customerName || "").toLowerCase().includes(q) ||
      (String(item.orderId || "")).toLowerCase().includes(q);
    return matchesRating && matchesSearch;
  });

  const ratingDistribution = [5, 4, 3, 2, 1].map((rating) => {
    const count = feedbacks.filter((item) => item.rating === rating).length;
    return {
      rating,
      count,
      percentage: totalFeedback ? Math.round((count / totalFeedback) * 100) : 0,
    };
  });

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
            <h1 className="text-4xl font-bold text-gray-800">Customer Feedback</h1>
          </div>
          <p className="text-gray-600">Monitor and analyze customer satisfaction</p>
        </div>

        {/* Error / Loading */}
        {fbError && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700">
            Error loading feedbacks: {fbError}
          </div>
        )}
        {fbLoading && (
          <div className="mb-4 p-3 rounded-lg bg-yellow-50 border border-yellow-200 text-yellow-700">
            Loading feedbacks…
          </div>
        )}

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
                    star <= Math.round(Number(averageRating)) ? "text-yellow-500 fill-yellow-500" : "text-gray-300"
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
                  <span className="text-xs font-semibold text-gray-700 w-8">{item.rating}★</span>
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-linear-to-r from-orange-500 to-red-500" style={{ width: `${item.percentage}%` }} />
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
          {fbLoading ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-orange-100">
              <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Loading feedback…</p>
            </div>
          ) : filteredFeedback.length > 0 ? (
            filteredFeedback.map((item) => (
              <div
                key={item.id}
                className={`bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-6 border-2 ${getRatingBg(item.rating)}`}
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-4">
                  {/* Left Section - Customer Info */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-linear-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0">
                      {(item.customerName || "G").charAt(0)}
                    </div>

                    <div>
                      <h3 className="font-bold text-gray-800 text-lg">{item.customerName || "Guest"}</h3>
                      <p className="text-sm text-gray-600">{/* optional itemOrdered field */}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-500">{item.createdAt ? new Date(item.createdAt).toLocaleString() : "—"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Section - Rating & Order */}
                  <div className="flex flex-col items-start lg:items-end gap-2">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-5 h-5 ${star <= item.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`}
                        />
                      ))}
                      <span className={`ml-2 font-bold text-lg ${getRatingColor(item.rating)}`}>{item.rating ?? 0}.0</span>
                    </div>

                    <div className="bg-gray-100 px-3 py-1 rounded-lg">
                      <span className="text-xs text-gray-600">Order: </span>
                      <span className="text-xs font-bold text-gray-800">{item.orderId ?? "N/A"}</span>
                    </div>
                  </div>
                </div>

                {/* Comment */}
                <div className="bg-white bg-opacity-60 rounded-xl p-4 border border-gray-200">
                  <p className="text-gray-700 leading-relaxed">"{item.message}"</p>
                </div>

                {/* Respond area */}
                <div className="flex flex-col gap-3 mt-4 w-full">
                  {item.response ? (
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <div className="text-sm text-gray-700 mb-2">
                        <strong>Admin response:</strong>
                      </div>
                      <div className="text-sm text-gray-600">{item.response}</div>
                      {item.responseAt && <div className="text-xs text-gray-400 mt-2">Responded: {new Date(item.responseAt).toLocaleString()}</div>}
                    </div>
                  ) : null}

                  <RespondBlock feedbackId={item.id} initialResponse={item.response} />
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
