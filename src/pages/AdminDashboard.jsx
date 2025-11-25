// src/pages/AdminDashboard.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import AdminNavbar from "../components/AdminNavbar";
import {
  TrendingUp,
  ShoppingBag,
  DollarSign,
  Clock,
  Star,
  ChefHat,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // KPI states (default to 0 so UI never shows blank)
  const [totalOrdersToday, setTotalOrdersToday] = useState(0);
  const [revenueToday, setRevenueToday] = useState(0);
  const [revenueWeek, setRevenueWeek] = useState(0);

  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState("");

  // Chart data states
  const [weeklyRevenueData, setWeeklyRevenueData] = useState([]);
  const [topSellingItems, setTopSellingItems] = useState([]);
  const [peakHoursData, setPeakHoursData] = useState([]);
  const [chartsLoading, setChartsLoading] = useState(true);

  // Fetch charts data
  useEffect(() => {
    if (!user) return;

    const fetchCharts = async () => {
      setChartsLoading(true);
      try {
        const headers = {
          "Content-Type": "application/json",
          ...(user && user.token
            ? { Authorization: `Bearer ${user.token}` }
            : {}),
        };

        const [weeklyRes, peakRes, topRes] = await Promise.all([
          fetch(
            "https://smart-ordering-system.onrender.com/api/admin/weekly-revenue?tz=Asia/Karachi",
            { headers }
          ),
          fetch("https://smart-ordering-system.onrender.com/api/admin/peak-hours?tz=Asia/Karachi", {
            headers,
          }),
          fetch("https://smart-ordering-system.onrender.com/api/admin/top-selling?tz=Asia/Karachi", {
            headers,
          }),
        ]);

        if (!weeklyRes.ok || !peakRes.ok || !topRes.ok) {
          const errText = `Charts fetch failed: ${weeklyRes.status}, ${peakRes.status}, ${topRes.status}`;
          throw new Error(errText);
        }

        const weeklyRaw = await weeklyRes.json();
        const peakRaw = await peakRes.json();
        const topRaw = await topRes.json();

        // Normalize weekly data (use Asia/Karachi timezone to match backend aggregation)
        const tz = "Asia/Karachi";
        const days = [];
        for (let i = 6; i >= 0; i--) {
          // build date for each day in PKT by constructing an ISO YYYY-MM-DD using toLocaleString with en-CA
          const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
          const iso = d.toLocaleDateString("en-CA", { timeZone: tz }); // "YYYY-MM-DD"
          const label = new Date(d).toLocaleString("en-US", {
            weekday: "short",
            timeZone: tz,
          });
          days.push({ iso, label });
        }

        const weeklyMap = Object.fromEntries(weeklyRaw.map((w) => [w.date, w]));
        const weeklyNormalized = days.map((d) => {
          const entry = weeklyMap[d.iso];
          return {
            day: d.label,
            revenue: entry ? Number(entry.revenue || 0) : 0,
            orders: entry ? Number(entry.orders || 0) : 0,
          };
        });

        // Normalize peak hours
        const peakNormalized = Array.from({ length: 24 }, (_, h) => {
          const found = peakRaw.find((p) => p.hour === h);
          const label = (() => {
            const hour = h % 12 === 0 ? 12 : h % 12;
            const suffix = h < 12 ? "AM" : "PM";
            return `${hour} ${suffix}`;
          })();
          return { hour: label, orders: found ? found.orders : 0, rawHour: h };
        });

        setWeeklyRevenueData(weeklyNormalized);
        setPeakHoursData(peakNormalized);
        setTopSellingItems(topRaw);
      } catch (err) {
        console.error("Failed to fetch charts:", err);
      } finally {
        setChartsLoading(false);
      }
    };

    fetchCharts();
  }, [user]);

  // Fetch stats
  useEffect(() => {
    if (!loading) {
      if (!user || user.role !== "admin") {
        navigate("/login");
        return;
      }
    }

    const fetchStats = async () => {
      setStatsLoading(true);
      setStatsError("");
      try {
        const headers = { "Content-Type": "application/json" };
        if (user && user.token)
          headers["Authorization"] = `Bearer ${user.token}`;

        const res = await fetch("https://smart-ordering-system.onrender.com/api/admin/stats", { headers });

        if (!res.ok) {
          const errorBody = await res.json().catch(() => ({}));
          const msg = errorBody.message || `Error ${res.status}`;
          throw new Error(msg);
        }

        const data = await res.json();

        setTotalOrdersToday(Number(data.totalOrdersToday || 0));
        setRevenueToday(Number(data.revenueToday || 0));
        setRevenueWeek(Number(data.revenueWeek || 0));
      } catch (err) {
        console.error("Failed to fetch admin stats:", err);
        setStatsError(err.message || "Failed to load stats");
      } finally {
        setStatsLoading(false);
      }
    };

    if (user) fetchStats();
  }, [user, loading, navigate]);

  // Safe display helper
  const showNumber = (val, isCurrency = false) => {
    if (statsLoading) return <span className="text-gray-400">Loading...</span>;
    if (isCurrency) return `₨ ${Number(val || 0).toLocaleString()}`;
    return Number(val || 0);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-orange-50 via-amber-50 to-orange-100">
      <AdminNavbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">
                Admin Dashboard
              </h1>
              <p className="text-gray-600 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Last updated: {new Date().toLocaleString()}
              </p>
            </div>

            <div className="bg-linear-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              <span className="font-semibold">Live Analytics</span>
            </div>
          </div>
        </div>

        {/* Error banner */}
        {statsError && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border-2 border-red-200 text-red-700">
            <strong>Error loading stats:</strong> {statsError}
            <div className="text-sm mt-1">
              Check backend `/api/admin/stats` and that the admin token is
              valid.
            </div>
          </div>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Total Orders Today */}
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-orange-100">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-linear-to-br from-orange-100 to-orange-200 p-3 rounded-xl">
                <ShoppingBag className="w-6 h-6 text-orange-600" />
              </div>
              <div className="flex items-center gap-1 text-green-600 text-sm font-semibold">
                <ArrowUp className="w-4 h-4" />
                12%
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">
              Total Orders Today
            </h3>
            <p className="text-3xl font-bold text-gray-800">
              {showNumber(totalOrdersToday)}
            </p>
          </div>

          {/* Revenue Today */}
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-orange-100">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-linear-to-br from-green-100 to-green-200 p-3 rounded-xl">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex items-center gap-1 text-green-600 text-sm font-semibold">
                <ArrowUp className="w-4 h-4" />
                8%
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">
              Revenue Today
            </h3>
            <p className="text-3xl font-bold text-gray-800">
              {showNumber(revenueToday, true)}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Avg. order:{" "}
              {statsLoading
                ? "—"
                : totalOrdersToday
                ? `₨ ${Math.round(
                    revenueToday / Math.max(1, totalOrdersToday)
                  ).toLocaleString()}`
                : "—"}
            </p>
          </div>

          {/* Weekly Revenue */}
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-orange-100">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-linear-to-br from-purple-100 to-purple-200 p-3 rounded-xl">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div className="flex items-center gap-1 text-red-600 text-sm font-semibold">
                <ArrowDown className="w-4 h-4" />
                3%
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">
              Weekly Revenue
            </h3>
            <p className="text-3xl font-bold text-gray-800">
              {showNumber(revenueWeek, true)}
            </p>
            <p className="text-xs text-gray-500 mt-2">Last 7 days</p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Weekly Revenue Chart */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6 border border-orange-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">
                Weekly Revenue Trend
              </h2>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span>Revenue</span>
              </div>
            </div>

            {chartsLoading ? (
              <div className="h-[300px] flex items-center justify-center">
                <p className="text-gray-400">Loading chart...</p>
              </div>
            ) : weeklyRevenueData.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center">
                <p className="text-gray-400">No revenue data available</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={weeklyRevenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="day" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#FF4C29"
                    strokeWidth={3}
                    dot={{ fill: "#FF4C29", r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Busiest Hours Overview */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-orange-100">
            <div className="flex items-center gap-2 mb-6">
              <ChefHat className="w-6 h-6 text-orange-500" />
              <h2 className="text-xl font-bold text-gray-800">
                Busiest Hours Today
              </h2>
            </div>

            {chartsLoading ? (
              <div className="h-[300px] flex items-center justify-center">
                <p className="text-gray-400">Loading...</p>
              </div>
            ) : peakHoursData.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center">
                <p className="text-gray-400">No data available</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {peakHoursData
                  .filter((p) => p.orders > 0)
                  .sort((a, b) => b.orders - a.orders)
                  .slice(0, 9)
                  .map((p, i) => (
                    <div
                      key={i}
                      className="p-3 bg-linear-to-br from-orange-50 to-orange-100 rounded-xl text-center hover:shadow-md transition-shadow"
                    >
                      <div className="font-bold text-gray-800">{p.hour}</div>
                      <div className="text-sm text-orange-600 font-semibold">
                        {p.orders} orders
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Selling Items */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-orange-100">
            <div className="flex items-center gap-2 mb-6">
              <Star className="w-6 h-6 text-orange-500" />
              <h2 className="text-xl font-bold text-gray-800">
                Top Selling Items
              </h2>
            </div>

            {chartsLoading ? (
              <div className="py-8 text-center">
                <p className="text-gray-400">Loading top items...</p>
              </div>
            ) : topSellingItems.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-gray-400">No items sold yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {topSellingItems.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-linear-to-r from-orange-50 to-transparent rounded-xl hover:from-orange-100 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-linear-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">
                          {item.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {item.sales} orders
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-orange-600">
                        ₨ {Number(item.revenue || 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Peak Hours Bar Chart */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-orange-100">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Peak Hours</h2>

            {chartsLoading ? (
              <div className="h-[300px] flex items-center justify-center">
                <p className="text-gray-400">Loading...</p>
              </div>
            ) : peakHoursData.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center">
                <p className="text-gray-400">No peak hours data</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={peakHoursData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="hour"
                    stroke="#666"
                    interval={Math.max(0, Math.floor(peakHoursData.length / 8))}
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis stroke="#666" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="orders" fill="#FF4C29" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
