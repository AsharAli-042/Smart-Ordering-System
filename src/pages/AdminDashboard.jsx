// src/pages/AdminDashboard.jsx
// import Navbar from "../components/Navbar";
import AdminNavbar from "../components/AdminNavbar";
import { 
  TrendingUp, 
  ShoppingBag, 
  DollarSign, 
  Users, 
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
  Legend,
  ResponsiveContainer
} from "recharts";

export default function AdminDashboard() {
  // Temporary placeholder values
  const totalOrdersToday = 57;
  const bestSellingItem = "Margherita Pizza";
  const revenueToday = 34250;
  const revenueWeek = 178300;
  const activeCustomers = 234;
  const avgOrderValue = 601;
  const pendingOrders = 8;
  const completedOrders = 49;

  // Sample data for charts
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

  return (
    <div className="min-h-screen bg-linear-to-br from-orange-50 via-amber-50 to-orange-100">
      <AdminNavbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
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

        {/* Main KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
              {totalOrdersToday}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              {pendingOrders} pending • {completedOrders} completed
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
              ₨ {revenueToday.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Avg. order: ₨ {avgOrderValue}
            </p>
          </div>

          {/* Active Customers */}
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-orange-100">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-linear-to-br from-blue-100 to-blue-200 p-3 rounded-xl">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex items-center gap-1 text-green-600 text-sm font-semibold">
                <ArrowUp className="w-4 h-4" />
                15%
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">
              Active Customers
            </h3>
            <p className="text-3xl font-bold text-gray-800">
              {activeCustomers}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              This week
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
              ₨ {revenueWeek.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Last 7 days
            </p>
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