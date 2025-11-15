// src/pages/AdminMenu.jsx
import { useState } from "react";
// import Navbar from "../components/Navbar";
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
  Package
} from "lucide-react";

export default function AdminMenu() {
  // Temporary menu items list (replace with backend data later)
  const [menuItems, setMenuItems] = useState([
    {
      id: 1,
      name: "Margherita Pizza",
      price: 899,
      description: "Classic pizza with mozzarella and basil.",
      image:
        "https://images.unsplash.com/photo-1601924582971-c9d445c77a0e?auto=format&fit=crop&w=800&q=60",
    },
    {
      id: 2,
      name: "Cheeseburger",
      price: 750,
      description: "Juicy beef patty with cheese and fresh veggies.",
      image:
        "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&q=60",
    },
  ]);

  // Form state
  const [formData, setFormData] = useState({
    id: null,
    name: "",
    price: "",
    description: "",
    image: "",
  });

  const [isEditing, setIsEditing] = useState(false);

  const resetForm = () => {
    setFormData({ id: null, name: "", price: "", description: "", image: "" });
    setIsEditing(false);
  };

  // Add or Update item
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name || !formData.price || !formData.description || !formData.image) {
      alert("Please fill in all fields.");
      return;
    }

    if (isEditing) {
      setMenuItems((prev) =>
        prev.map((item) =>
          item.id === formData.id ? formData : item
        )
      );
      alert("Item updated successfully!");
    } else {
      const newItem = { ...formData, id: Date.now() };
      setMenuItems((prev) => [...prev, newItem]);
      alert("New item added!");
    }

    resetForm();
  };

  // Delete item
  const handleDelete = (id) => {
    const confirmDelete = confirm("Are you sure you want to delete this item?");
    if (confirmDelete) {
      setMenuItems((prev) => prev.filter((item) => item.id !== id));
    }
  };

  // Edit item
  const handleEdit = (item) => {
    setFormData(item);
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-orange-50 via-amber-50 to-orange-100">
      <AdminNavbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
        
        {/* Header Section */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <ChefHat className="w-8 h-8 text-orange-600" />
            <h1 className="text-4xl font-bold text-gray-800">
              Manage Menu Items
            </h1>
          </div>
          <p className="text-gray-600">Add, edit, or remove items from your restaurant menu</p>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-orange-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Total Items</p>
                <p className="text-3xl font-bold text-gray-800">{menuItems.length}</p>
              </div>
              <Package className="w-10 h-10 text-orange-500 opacity-50" />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-orange-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Avg. Price</p>
                <p className="text-3xl font-bold text-gray-800">
                  ₨ {menuItems.length > 0 
                    ? Math.round(menuItems.reduce((acc, item) => acc + parseFloat(item.price), 0) / menuItems.length)
                    : 0}
                </p>
              </div>
              <DollarSign className="w-10 h-10 text-green-500 opacity-50" />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-orange-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Status</p>
                <p className="text-lg font-bold text-green-600">Active Menu</p>
              </div>
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* ADD / EDIT FORM */}
        <div className="bg-white rounded-3xl shadow-2xl mb-12 overflow-hidden border border-orange-100">
          {/* Form Header */}
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

          {/* Form Body */}
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

              {/* Description - Full Width */}
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

              {/* Image URL - Full Width */}
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
                        e.target.src = 'https://via.placeholder.com/400x300?text=Invalid+Image+URL';
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
                className="flex-1 sm:flex-none bg-linear-to-r from-orange-500 to-red-500 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:from-orange-600 hover:to-red-600 transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                {isEditing ? "Update Item" : "Add Item"}
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

        {/* MENU ITEMS LIST */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-3xl font-bold text-gray-800">Current Menu</h2>
          <span className="bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-semibold">
            {menuItems.length} {menuItems.length === 1 ? 'Item' : 'Items'}
          </span>
        </div>

        {menuItems.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-orange-100">
            <Package className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-xl font-semibold mb-2">No menu items yet</p>
            <p className="text-gray-400">Add your first item using the form above</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {menuItems.map((item) => (
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
                      onClick={() => handleDelete(item.id)}
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
    </div>
  );
}