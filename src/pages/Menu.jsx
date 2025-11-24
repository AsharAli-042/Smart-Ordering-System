// src/pages/Menu.jsx
import { useEffect, useState, useRef } from "react";
import Navbar from "../components/Navbar";
import MenuItemCard from "../components/MenuItemCard";
import { useCart } from "../contexts/CartContext";
import { ChefHat, Search, Filter, Loader2, UtensilsCrossed } from "lucide-react";

export default function Menu() {
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const categoryRefs = useRef({});
  const topRef = useRef(null);

  const { addItem, totalCount } = useCart();

  useEffect(() => {
    const fetchMenu = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("https://smart-ordering-system.onrender.com/api/menu");
        if (!res.ok) {
          throw new Error(`Failed to load menu: ${res.status}`);
        }
        const data = await res.json();
        setMenuItems(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Fetch menu error:", err);
        setError("Failed to load menu. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, []);

  useEffect(() => {
    const cats = Array.from(
      new Set(menuItems.map((m) => (m.category ? String(m.category).trim() : "Uncategorized")))
    );
    setCategories(cats);
    cats.forEach((c) => {
      if (!categoryRefs.current[c]) categoryRefs.current[c] = { ref: null };
    });
    if (cats.length > 0 && !activeCategory) setActiveCategory(cats[0]);
  }, [menuItems]);

  const scrollToCategory = (cat) => {
    if (!cat || cat === "All") {
      const offset = topRef.current ? topRef.current.getBoundingClientRect().top + window.scrollY - 120 : 0;
      window.scrollTo({ top: Math.max(0, offset), behavior: "smooth" });
      setActiveCategory(null);
      return;
    }
    const entry = categoryRefs.current[cat];
    const el = entry?.ref;
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - 160;
    window.scrollTo({ top: y, behavior: "smooth" });
    setActiveCategory(cat);
  };

  useEffect(() => {
    const handleScroll = () => {
      if (!categories || categories.length === 0) return;
      let nearest = { cat: null, dist: Infinity };
      categories.forEach((cat) => {
        const el = categoryRefs.current[cat]?.ref;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const dist = Math.abs(rect.top - 180);
        if (dist < nearest.dist) nearest = { cat, dist };
      });
      if (nearest.cat && nearest.cat !== activeCategory) {
        setActiveCategory(nearest.cat);
      }
      const firstEl = categoryRefs.current[categories[0]]?.ref;
      if (firstEl) {
        const firstTop = firstEl.getBoundingClientRect().top;
        if (firstTop > 160) {
          setActiveCategory(null);
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    setTimeout(handleScroll, 100);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [categories, activeCategory]);

  const handleAddToCart = (item) => {
    addItem(item);
  };

  // Filter items by search term
  const filteredItems = menuItems.filter(item => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Group filtered items by category
  const grouped = categories.reduce((acc, cat) => {
    acc[cat] = filteredItems.filter((m) => 
      (m.category ? String(m.category).trim() : "Uncategorized") === cat
    );
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-linear-to-br from-orange-50 via-amber-50 to-orange-100">
      <Navbar cartCount={totalCount} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12" ref={topRef}>
        
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-linear-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
              <UtensilsCrossed className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-3">
            Our Delicious Menu
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Discover our carefully curated selection of mouth-watering dishes
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6 max-w-2xl mx-auto">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search for dishes, categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200 text-gray-800 placeholder-gray-400 bg-white shadow-lg"
            />
          </div>
          {searchTerm && (
            <p className="text-sm text-gray-600 mt-2 text-center">
              Found {filteredItems.length} result{filteredItems.length !== 1 ? 's' : ''} for "{searchTerm}"
            </p>
          )}
        </div>

        {/* Category Navigation (Sticky) */}
        <div className="sticky top-20 z-40 bg-linear-to-br from-orange-50 via-amber-50 to-orange-100 py-4 mb-8 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 shadow-md">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-2 mb-2">
              <Filter className="w-5 h-5 text-gray-600 hidden sm:block" />
              <span className="text-sm font-semibold text-gray-700 hidden sm:block">Categories:</span>
            </div>
            <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 no-scrollbar">
              <button
                onClick={() => scrollToCategory("All")}
                className={`shrink-0 px-4 sm:px-6 py-2.5 rounded-xl font-semibold transition-all duration-200 shadow-md ${
                  activeCategory === null 
                    ? "bg-linear-to-r from-orange-500 to-red-500 text-white scale-105 shadow-lg" 
                    : "bg-white text-gray-700 hover:bg-orange-50 hover:text-orange-600"
                }`}
              >
                All Items
              </button>

              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => scrollToCategory(cat)}
                  className={`shrink-0 px-4 sm:px-6 py-2.5 rounded-xl font-semibold transition-all duration-200 shadow-md ${
                    activeCategory === cat 
                      ? "bg-linear-to-r from-orange-500 to-red-500 text-white scale-105 shadow-lg" 
                      : "bg-white text-gray-700 hover:bg-orange-50 hover:text-orange-600"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="bg-white rounded-3xl shadow-lg p-16 text-center border border-orange-100">
            <Loader2 className="w-16 h-16 text-orange-500 mx-auto mb-4 animate-spin" />
            <p className="text-gray-600 font-semibold text-lg">Loading our delicious menu...</p>
          </div>
        ) : error ? (
          /* Error State */
          <div className="bg-white rounded-3xl shadow-lg p-16 text-center border-2 border-red-200">
            <ChefHat className="w-20 h-20 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Oops!</h2>
            <p className="text-red-600 font-semibold mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-linear-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-xl font-bold hover:from-orange-600 hover:to-red-600 transition-all shadow-lg"
            >
              Retry
            </button>
          </div>
        ) : menuItems.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-3xl shadow-lg p-16 text-center border border-orange-100">
            <UtensilsCrossed className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Menu Coming Soon</h2>
            <p className="text-gray-500">We're preparing something delicious for you!</p>
          </div>
        ) : filteredItems.length === 0 ? (
          /* No Search Results */
          <div className="bg-white rounded-3xl shadow-lg p-16 text-center border border-orange-100">
            <Search className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">No items found</h2>
            <p className="text-gray-500 mb-4">Try searching with different keywords</p>
            <button
              onClick={() => setSearchTerm("")}
              className="text-orange-600 hover:text-orange-700 font-semibold"
            >
              Clear search
            </button>
          </div>
        ) : (
          /* Menu Items by Category */
          <>
            {categories.map((cat) => {
              const items = grouped[cat];
              if (!items || items.length === 0) return null;
              
              return (
                <section
                  key={cat}
                  ref={(el) => {
                    if (!categoryRefs.current[cat]) categoryRefs.current[cat] = { ref: el };
                    else categoryRefs.current[cat].ref = el;
                  }}
                  className="mb-12 sm:mb-16"
                >
                  {/* Category Header */}
                  <div className="flex items-center gap-3 mb-6">
                    <ChefHat className="w-8 h-8 text-orange-600" />
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-800">{cat}</h2>
                    <div className="flex-1 h-1 bg-linear-to-r from-orange-500 to-transparent rounded-full ml-4"></div>
                  </div>

                  {/* Items Grid - Responsive */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
                    {items.map((item) => (
                      <MenuItemCard
                        key={item._id || item.id}
                        image={item.image}
                        name={item.name}
                        price={item.price}
                        description={item.description}
                        onAddToCart={() => handleAddToCart(item)}
                      />
                    ))}
                  </div>
                </section>
              );
            })}
          </>
        )}
      </div>

      {/* Custom CSS for hiding scrollbar */}
      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}