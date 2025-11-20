// src/pages/Menu.jsx
import { useEffect, useState, useRef } from "react";
import Navbar from "../components/Navbar";
import MenuItemCard from "../components/MenuItemCard";
import { useCart } from "../contexts/CartContext";

export default function Menu() {
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const categoryRefs = useRef({});
  const topRef = useRef(null);

  const { addItem, totalCount } = useCart(); // use totalCount for badge if needed

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/menu");
        if (!res.ok) {
          console.error("Failed to load menu:", res.status);
          return;
        }
        const data = await res.json();
        setMenuItems(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Fetch menu error:", err);
      }
    };
    fetchMenu();
  }, []);

  // Build categories and refs when menuItems change
  useEffect(() => {
    const cats = Array.from(
      new Set(menuItems.map((m) => (m.category ? String(m.category).trim() : "Uncategorized")))
    );
    setCategories(cats);
    // ensure refs exist for each category
    cats.forEach((c) => {
      if (!categoryRefs.current[c]) categoryRefs.current[c] = { ref: null };
    });
    // set initial active category to first category (if any)
    if (cats.length > 0 && !activeCategory) setActiveCategory(cats[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [menuItems]);

  // helper to scroll to a category section (account for fixed navbar)
  const scrollToCategory = (cat) => {
    if (!cat || cat === "All") {
      // scroll to top
      const offset = topRef.current ? topRef.current.getBoundingClientRect().top + window.scrollY - 120 : 0;
      window.scrollTo({ top: Math.max(0, offset), behavior: "smooth" });
      setActiveCategory(null);
      return;
    }
    const entry = categoryRefs.current[cat];
    const el = entry?.ref;
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - 120; // 120 px offset for header
    window.scrollTo({ top: y, behavior: "smooth" });
    setActiveCategory(cat);
  };

  // update which category is active while scrolling
  useEffect(() => {
    const handleScroll = () => {
      if (!categories || categories.length === 0) return;
      let nearest = { cat: null, dist: Infinity };
      categories.forEach((cat) => {
        const el = categoryRefs.current[cat]?.ref;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        // distance from top offset (use 140 to account for header + category bar)
        const dist = Math.abs(rect.top - 140);
        if (dist < nearest.dist) nearest = { cat, dist };
      });
      if (nearest.cat && nearest.cat !== activeCategory) {
        setActiveCategory(nearest.cat);
      }
      // if we've scrolled above first section, clear active
      const firstEl = categoryRefs.current[categories[0]]?.ref;
      if (firstEl) {
        const firstTop = firstEl.getBoundingClientRect().top;
        if (firstTop > 120) {
          setActiveCategory(null);
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    // run once
    setTimeout(handleScroll, 100);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [categories, activeCategory]);

  const handleAddToCart = (item) => {
    addItem(item);
    // optional: show toast
  };

  // group items by category
  const grouped = categories.reduce((acc, cat) => {
    acc[cat] = menuItems.filter((m) => (m.category ? String(m.category).trim() : "Uncategorized") === cat);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-[#FFF5EE]">
      <Navbar cartCount={totalCount} />
      <div className="max-w-7xl mx-auto px-6 pt-28 pb-12" ref={topRef}>
        <h1 className="text-3xl font-bold text-[#2E2E2E] text-center mb-6">Explore Our Menu</h1>

        {/* Category nav (sticky) */}
        <div className="sticky top-24 z-40 bg-[#FFF5EE] py-3 mb-6">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex gap-3 overflow-x-auto no-scrollbar py-1">
              <button
                onClick={() => scrollToCategory("All")}
                className={`whitespace-nowrap px-4 py-2 rounded-full font-medium border ${
                  activeCategory === null ? "bg-[#FF4C29] text-white border-[#FF4C29]" : "bg-white text-gray-700 border-gray-200"
                }`}
              >
                All
              </button>

              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => scrollToCategory(cat)}
                  className={`whitespace-nowrap px-4 py-2 rounded-full font-medium border ${
                    activeCategory === cat ? "bg-[#FF4C29] text-white border-[#FF4C29]" : "bg-white text-gray-700 border-gray-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* If no menu items */}
        {menuItems.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-orange-100">
            <p className="text-gray-500 text-xl font-semibold mb-2">No menu items yet</p>
            <p className="text-gray-400">Please check back later</p>
          </div>
        ) : (
          <>
            {/* Optionally: show all items first if "All" desired
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-10">
              {menuItems.map((item) => (
                <MenuItemCard
                  key={item._id || item.id}
                  image={item.image}
                  name={item.name}
                  price={item.price}
                  description={item.description}
                  onAddToCart={() => handleAddToCart(item)}
                />
              ))}
            </div> */}

            {/* Category sections */}
            {categories.map((cat) => (
              <section
                key={cat}
                ref={(el) => {
                  if (!categoryRefs.current[cat]) categoryRefs.current[cat] = { ref: el };
                  else categoryRefs.current[cat].ref = el;
                }}
                className="mb-12"
              >
                <h2 className="text-2xl font-bold text-gray-800 mb-4">{cat}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {grouped[cat].map((item) => (
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
            ))}
          </>
        )}
      </div>
    </div>
  );
}
