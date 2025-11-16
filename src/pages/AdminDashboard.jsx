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
  ArrowDown
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
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

  // sample static chart data (unchanged)
  const weeklyRevenueData = [
    { day: "Mon", revenue: 25400, orders: 42 },
    { day: "Tue", revenue: 28900, orders: 48 },
    { day: "Wed", revenue: 22100, orders: 37 },
    { day: "Thu", revenue: 31200, orders: 52 },
    { day: "Fri", revenue: 35800, orders: 61 },
    { day: "Sat", revenue: 42300, orders: 71 },
    { day: "Sun", revenue: 38200, orders: 64 }
  ];

  const topSellingItems = [
    { name: "Margherita Pizza", sales: 145, revenue: 72500 },
    { name: "Chicken Biryani", sales: 132, revenue: 66000 },
    { name: "Beef Burger", sales: 98, revenue: 44100 },
    { name: "Pasta Alfredo", sales: 87, revenue: 39150 },
    { name: "Caesar Salad", sales: 76, revenue: 30400 }
  ];

  const orderStatusData = [
    { name: "Completed", value: 49, color: "#10B981" },
    { name: "Pending", value: 8, color: "#F59E0B" },
    { name: "Cancelled", value: 3, color: "#EF4444" }
  ];

  const peakHoursData = [
    { hour: "9 AM", orders: 5 },
    { hour: "10 AM", orders: 12 },
    { hour: "11 AM", orders: 18 },
    { hour: "12 PM", orders: 32 },
    { hour: "1 PM", orders: 45 },
    { hour: "2 PM", orders: 38 },
    { hour: "3 PM", orders: 22 },
    { hour: "4 PM", orders: 15 },
    { hour: "5 PM", orders: 28 },
    { hour: "6 PM", orders: 41 },
    { hour: "7 PM", orders: 52 },
    { hour: "8 PM", orders: 48 }
  ];

  useEffect(() => {
    // Basic guard: if auth loaded and not admin, send to login
    if (!loading) {
      if (!user || user.role !== "admin") {
        navigate("/login");
        return;
      }
    }

    // Fetch stats (only if user exists)
    const fetchStats = async () => {
      setStatsLoading(true);
      setStatsError("");
      try {
        const headers = { "Content-Type": "application/json" };
        // attach Authorization only if token exists and non-empty
        if (user && user.token) headers["Authorization"] = `Bearer ${user.token}`;

        const res = await fetch("/api/admin/stats", { headers });

        if (!res.ok) {
          const errorBody = await res.json().catch(() => ({}));
          const msg = errorBody.message || `Error ${res.status}`;
          throw new Error(msg);
        }

        const data = await res.json();

        // Defensive assignments (ensure numbers)
        setTotalOrdersToday(Number(data.totalOrdersToday || 0));
        setRevenueToday(Number(data.revenueToday || 0));
        setRevenueWeek(Number(data.revenueWeek || 0));
      } catch (err) {
        console.error("Failed to fetch admin stats:", err);
        setStatsError(err.message || "Failed to load stats");
        // keep KPI values as 0 as fallback
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">Admin Dashboard</h1>
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

        {/* Error banner (visible if statsError) */}
        {statsError && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700">
            <strong>Error loading stats:</strong> {statsError}
            <div className="text-sm mt-1">Check backend `/api/admin/stats` and that the admin token is valid.</div>
          </div>
        )}

        {/* KPI Cards (3 columns now) */}
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
            <h3 className="text-gray-600 text-sm font-medium mb-1">Total Orders Today</h3>
            <p className="text-3xl font-bold text-gray-800">{showNumber(totalOrdersToday)}</p>
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
            <h3 className="text-gray-600 text-sm font-medium mb-1">Revenue Today</h3>
            <p className="text-3xl font-bold text-gray-800">{showNumber(revenueToday, true)}</p>
            <p className="text-xs text-gray-500 mt-2">
              Avg. order: {statsLoading ? "—" : (totalOrdersToday ? `₨ ${Math.round(revenueToday / Math.max(1, totalOrdersToday)).toLocaleString()}` : "—")}
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
            <h3 className="text-gray-600 text-sm font-medium mb-1">Weekly Revenue</h3>
            <p className="text-3xl font-bold text-gray-800">{showNumber(revenueWeek, true)}</p>
            <p className="text-xs text-gray-500 mt-2">Last 7 days</p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Weekly Revenue Chart */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6 border border-orange-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">Weekly Revenue Trend</h2>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span>Revenue</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weeklyRevenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#FF4C29" 
                  strokeWidth={3}
                  dot={{ fill: '#FF4C29', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Order Status Pie Chart */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-orange-100">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Order Status</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={orderStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={90}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {orderStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Selling Items */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-orange-100">
            <div className="flex items-center gap-2 mb-6">
              <Star className="w-6 h-6 text-orange-500" />
              <h2 className="text-xl font-bold text-gray-800">Top Selling Items</h2>
            </div>
            <div className="space-y-4">
              {topSellingItems.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-linear-to-r from-orange-50 to-transparent rounded-xl hover:from-orange-100 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-linear-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{item.name}</p>
                      <p className="text-sm text-gray-500">{item.sales} orders</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-orange-600">₨ {item.revenue.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Peak Hours Chart */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-orange-100">
            <div className="flex items-center gap-2 mb-6">
              <ChefHat className="w-6 h-6 text-orange-500" />
              <h2 className="text-xl font-bold text-gray-800">Peak Hours</h2>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={peakHoursData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="hour" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                />
                <Bar 
                  dataKey="orders" 
                  fill="url(#colorGradient)" 
                  radius={[8, 8, 0, 0]}
                />
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FF4C29" />
                    <stop offset="100%" stopColor="#FFA41B" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}