// src/pages/AdminMenu.jsx
import React, { useEffect, useState } from "react";
import AdminNavbar from "../components/AdminNavbar";
import {
  Plus,
  Edit,
  Trash2,
  Image as ImageIcon,
  DollarSign,
  FileText,
  Save,
  X,
  ChefHat,
  Package,
  Search,
  CheckCircle,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export default function AdminMenu() {
  const { user } = useAuth();

  // Menu items from backend
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Toast notification state
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  // Delete confirmation modal state
  const [deleteModal, setDeleteModal] = useState({
    show: false,
    itemId: null,
    itemName: "",
  });

  // --- Form state (include category) ---
  const [formData, setFormData] = useState({
    id: null,
    name: "",
    price: "",
    description: "",
    image: "",
    category: "Starters", // default selection
  });
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Toast notification function
  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 3000);
  };

  // Fetch menu items
  useEffect(() => {
    let mounted = true;
    const fetchMenu = async () => {
      setLoading(true);
      setError("");
      try {
        const headers = { "Content-Type": "application/json" };
        if (user && user.token) headers.Authorization = `Bearer ${user.token}`;

        const res = await fetch("https://smart-ordering-system.onrender.com/api/admin/menu", {
          headers,
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.message || `Error ${res.status}`);
        }
        const data = await res.json();
        if (!mounted) return;
        const normalized = data.map((it) => ({ ...it, id: it._id }));
        setMenuItems(normalized);
      } catch (err) {
        console.error("Failed to load menu items:", err);
        setError(err.message || "Failed to load menu items");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchMenu();
    return () => {
      mounted = false;
    };
  }, [user]);

  const resetForm = () => {
    setFormData({
      id: null,
      name: "",
      price: "",
      description: "",
      image: "",
      category: "Starters",
    });
    setIsEditing(false);
  };

  // Add or Update item
  const handleSubmit = async (e) => {
    e.preventDefault();

    // basic validation
    if (
      !formData.name ||
      formData.price === "" ||
      !formData.description ||
      !formData.image ||
      !formData.category
    ) {
      showToast("Please fill in all fields", "error");
      return;
    }

    setSaving(true);
    try {
      const headers = { "Content-Type": "application/json" };
      if (user && user.token) headers.Authorization = `Bearer ${user.token}`;

      if (isEditing && formData.id) {
        const res = await fetch(
          `https://smart-ordering-system.onrender.com/api/admin/menu/${formData.id}`,
          {
            method: "PUT",
            headers,
            body: JSON.stringify({
              name: formData.name,
              price: Number(formData.price),
              description: formData.description,
              image: formData.image,
              category: formData.category,
            }),
          }
        );

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.message || `Update failed ${res.status}`);
        }
        const updated = await res.json();
        setMenuItems((prev) =>
          prev.map((it) =>
            String(it.id) === String(updated._id)
              ? { ...updated, id: updated._id }
              : it
          )
        );
        showToast("Item updated successfully!", "success");
      } else {
        const res = await fetch("https://smart-ordering-system.onrender.com/api/admin/menu", {
          method: "POST",
          headers,
          body: JSON.stringify({
            name: formData.name,
            price: Number(formData.price),
            description: formData.description,
            image: formData.image,
            category: formData.category,
          }),
        });

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.message || `Create failed ${res.status}`);
        }
        const created = await res.json();
        setMenuItems((prev) => [{ ...created, id: created._id }, ...prev]);
        showToast("New item added successfully!", "success");
      }

      resetForm();
    } catch (err) {
      console.error("Save error:", err);
      showToast(err.message || "Failed to save item", "error");
    } finally {
      setSaving(false);
    }
  };

  // Show delete confirmation modal
  const handleDeleteClick = (item) => {
    setDeleteModal({ show: true, itemId: item.id, itemName: item.name });
  };

  // Confirm delete
  const confirmDelete = async () => {
    const { itemId } = deleteModal;
    setDeleteModal({ show: false, itemId: null, itemName: "" });

    try {
      const headers = { "Content-Type": "application/json" };
      if (user && user.token) headers.Authorization = `Bearer ${user.token}`;

      const res = await fetch(
        `https://smart-ordering-system.onrender.com/api/admin/menu/${itemId}`,
        {
          method: "DELETE",
          headers,
        }
      );

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || `Delete failed ${res.status}`);
      }

      setMenuItems((prev) =>
        prev.filter((item) => String(item.id) !== String(itemId))
      );
      showToast("Item deleted successfully", "success");
    } catch (err) {
      console.error("Delete error:", err);
      showToast(err.message || "Failed to delete item", "error");
    }
  };

  // Cancel delete
  const cancelDelete = () => {
    setDeleteModal({ show: false, itemId: null, itemName: "" });
  };

  // Edit item
  const handleEdit = (item) => {
    setFormData({
      id: item.id,
      name: item.name || "",
      price: item.price || "",
      description: item.description || "",
      image: item.image || "",
      category: item.category || "Other",
    });
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Filter menu items based on search
  const filteredMenuItems = menuItems.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.description || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      String(item.price).includes(searchTerm) ||
      (item.category || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate stats
  const avgPrice =
    menuItems.length > 0
      ? Math.round(
          menuItems.reduce((acc, item) => acc + (Number(item.price) || 0), 0) /
            menuItems.length
        )
      : 0;

  return (
    <div className="min-h-screen bg-linear-to-br from-orange-50 via-amber-50 to-orange-100">
      <AdminNavbar />

      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed top-24 right-6 z-50 animate-slide-in-right">
          <div
            className={`flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl border-2 ${
              toast.type === "success"
                ? "bg-green-50 border-green-500 text-green-800"
                : "bg-red-50 border-red-500 text-red-800"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle className="w-6 h-6 text-green-600" />
            ) : (
              <XCircle className="w-6 h-6 text-red-600" />
            )}
            <p className="font-semibold">{toast.message}</p>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-scale-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800">Delete Item?</h3>
            </div>

            <p className="text-gray-600 mb-6">
              Are you sure you want to delete{" "}
              <span className="font-bold text-gray-800">
                "{deleteModal.itemName}"
              </span>
              ? This action cannot be undone.
            </p>

            <div className="flex gap-3">
              <button
                onClick={cancelDelete}
                className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 bg-linear-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-red-600 hover:to-red-700 transition-all shadow-lg"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
        {/* Header Section */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <ChefHat className="w-8 h-8 text-orange-600" />
            <h1 className="text-4xl font-bold text-gray-800">
              Manage Menu Items
            </h1>
          </div>
          <p className="text-gray-600">
            Add, edit, or remove items from your restaurant menu
          </p>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-orange-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">
                  Total Items
                </p>
                <p className="text-3xl font-bold text-gray-800">
                  {menuItems.length}
                </p>
              </div>
              <Package className="w-10 h-10 text-orange-500 opacity-50" />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-orange-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">
                  Avg. Price
                </p>
                <p className="text-3xl font-bold text-gray-800">₨ {avgPrice}</p>
              </div>
              <DollarSign className="w-10 h-10 text-green-500 opacity-50" />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-orange-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Status</p>
                <p className="text-lg font-bold text-green-600">Active Menu</p>
              </div>
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Error / Loading */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border-2 border-red-200 text-red-700">
            <strong>Error:</strong> {error}
          </div>
        )}
        {loading && (
          <div className="mb-6 p-4 rounded-xl bg-blue-50 border-2 border-blue-200 text-blue-700">
            Loading menu items...
          </div>
        )}

        {/* ADD / EDIT FORM */}
        <div className="bg-white rounded-3xl shadow-2xl mb-12 overflow-hidden border border-orange-100">
          <div className="bg-linear-to-r from-orange-500 to-red-500 px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isEditing ? (
                  <Edit className="w-6 h-6 text-white" />
                ) : (
                  <Plus className="w-6 h-6 text-white" />
                )}
                <h2 className="text-2xl font-bold text-white">
                  {isEditing ? "Edit Menu Item" : "Add New Menu Item"}
                </h2>
              </div>
              {isEditing && (
                <button
                  onClick={resetForm}
                  className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Food Name */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 ml-1">
                  Food Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <ChefHat className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="e.g., Margherita Pizza"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200 text-gray-800 placeholder-gray-400"
                  />
                </div>
              </div>

              {/* Price */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 ml-1">
                  Price (₨)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <DollarSign className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="number"
                    placeholder="e.g., 899"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200 text-gray-800 placeholder-gray-400"
                  />
                </div>
              </div>

              {/* Category select (new) */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 ml-1">
                  Category
                </label>
                <div className="relative">
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full pl-4 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200 bg-white"
                  >
                    <option>Starters</option>
                    <option>Salads</option>
                    <option>Soups</option>
                    <option>Beef Mains</option>
                    <option>Chicken Mains</option>
                    <option>Vegetarian</option>
                    <option>Vegan</option>
                    <option>Desserts</option>
                    <option>Beverages</option>
                    <option>Sides</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2 md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 ml-1">
                  Description
                </label>
                <div className="relative">
                  <div className="absolute top-4 left-4 pointer-events-none">
                    <FileText className="h-5 w-5 text-gray-400" />
                  </div>
                  <textarea
                    rows="4"
                    placeholder="Describe the dish, ingredients, and what makes it special..."
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200 text-gray-800 placeholder-gray-400 resize-none"
                  ></textarea>
                </div>
              </div>

              {/* Image URL */}
              <div className="space-y-2 md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 ml-1">
                  Image URL
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <ImageIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="https://example.com/image.jpg"
                    value={formData.image}
                    onChange={(e) =>
                      setFormData({ ...formData, image: e.target.value })
                    }
                    className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200 text-gray-800 placeholder-gray-400"
                  />
                </div>
                {formData.image && (
                  <div className="mt-3 rounded-xl overflow-hidden border-2 border-gray-200">
                    <img
                      src={formData.image}
                      alt="Preview"
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        e.target.src =
                          "https://via.placeholder.com/400x300?text=Invalid+Image+URL";
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 mt-8">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 sm:flex-none bg-linear-to-r from-orange-500 to-red-500 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:from-orange-600 hover:to-red-600 transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                {isEditing
                  ? saving
                    ? "Updating..."
                    : "Update Item"
                  : saving
                  ? "Adding..."
                  : "Add Item"}
              </button>

              {isEditing && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 sm:flex-none bg-gray-200 text-gray-700 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-300 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <X className="w-5 h-5" />
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* MENU ITEMS LIST HEADER WITH SEARCH */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-bold text-gray-800">Current Menu</h2>
              <span className="bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-semibold">
                {filteredMenuItems.length}{" "}
                {filteredMenuItems.length === 1 ? "Item" : "Items"}
              </span>
            </div>

            {/* Search Bar */}
            <div className="relative w-full sm:w-80">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search menu items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200 text-gray-800 placeholder-gray-400"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>

          {/* Search Results Info */}
          {searchTerm && (
            <p className="text-sm text-gray-600">
              {filteredMenuItems.length === 0 ? (
                <span className="text-red-600">
                  No items found matching "{searchTerm}"
                </span>
              ) : (
                <span>
                  Showing {filteredMenuItems.length} result
                  {filteredMenuItems.length !== 1 ? "s" : ""} for "{searchTerm}"
                </span>
              )}
            </p>
          )}
        </div>

        {/* MENU ITEMS GRID */}
        {filteredMenuItems.length === 0 && !searchTerm ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-orange-100">
            <Package className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-xl font-semibold mb-2">
              No menu items yet
            </p>
            <p className="text-gray-400">
              Add your first item using the form above
            </p>
          </div>
        ) : filteredMenuItems.length === 0 && searchTerm ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-orange-100">
            <Search className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-xl font-semibold mb-2">
              No items found
            </p>
            <p className="text-gray-400">
              Try searching with different keywords
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMenuItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-orange-100 group"
              >
                {/* Image */}
                <div className="relative overflow-hidden h-56">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3">
                    <span className="bg-linear-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                      ₨ {item.price}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-1">
                    {item.name}
                  </h3>
                  <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                    {item.description}
                  </p>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleEdit(item)}
                      className="flex-1 bg-linear-to-r from-blue-500 to-blue-600 text-white px-4 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteClick(item)}
                      className="flex-1 bg-linear-to-r from-red-500 to-red-600 text-white px-4 py-3 rounded-xl font-semibold hover:from-red-600 hover:to-red-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes scale-in {
          from {
            transform: scale(0.9);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }

        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}
