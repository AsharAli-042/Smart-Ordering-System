import { Routes, Route } from "react-router-dom";
import Signup from "./pages/Signup";

import Login from "./pages/Login";
import StaffLoginSelect from "./pages/StaffLoginSelect";
import AdminLogin from "./pages/AdminLogin";
import KitchenLogin from "./pages/KitchenLogin";

import GlobalOrderNotifier from "./components/GlobalOrderNotifier";

import Menu from "./pages/Menu";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderPlaced from "./pages/OrderPlaced";
import Feedback from "./pages/Feedback";
import AdminDashboard from "./pages/AdminDashboard";
import AdminFeedback from "./pages/AdminFeedback";
import AdminMenu from "./pages/AdminMenu";
import KitchenPanel from "./pages/KitchenPanel";

import RequireChef from "./components/RequireChef";
import RequireAdmin from "./components/RequireAdmin";
import RequireOrderPlaced from "./components/RequireOrderPlaced";
import RequireFeedback from "./components/RequireFeedback";

export default function App() {
  return (
    <>
      <GlobalOrderNotifier />
      <Routes>
        <Route path="/" element={<Menu />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />

        <Route path="/staff-login" element={<StaffLoginSelect />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/kitchen-login" element={<KitchenLogin />} />

        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route
          path="/order-placed"
          element={
            <RequireOrderPlaced>
              <OrderPlaced />
            </RequireOrderPlaced>
          }
        />

        <Route
          path="/feedback"
          element={
            <RequireFeedback>
              <Feedback />
            </RequireFeedback>
          }
        />
        <Route
          path="/admin"
          element={
            <RequireAdmin>
              <AdminDashboard />
            </RequireAdmin>
          }
        />
        <Route
          path="/admin/feedback"
          element={
            <RequireAdmin>
              <AdminFeedback />
            </RequireAdmin>
          }
        />
        <Route
          path="/admin/menu"
          element={
            <RequireAdmin>
              <AdminMenu />
            </RequireAdmin>
          }
        />
        <Route
          path="/kitchen"
          element={
            <RequireChef>
              <KitchenPanel />
            </RequireChef>
          }
        />
      </Routes>
    </>
  );
}
