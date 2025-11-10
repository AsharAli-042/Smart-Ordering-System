// src/pages/Menu.jsx
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import MenuItemCard from "../components/MenuItemCard";
import { useCart } from "../contexts/CartContext";

export default function Menu() {
  const [menuItems, setMenuItems] = useState([]);
  const { addItem, totalCount } = useCart(); // use totalCount for badge if needed

  useEffect(() => {
    const fetchMenu = async () => {
      const res = await fetch("http://localhost:5000/api/menu");
      const data = await res.json();
      setMenuItems(data);
    };
    fetchMenu();
  }, []);


  const handleAddToCart = (item) => {
    addItem(item);
    // you can show notification here
  };
  

  return (
    <div className="min-h-screen bg-[#FFF5EE]">
      <Navbar cartCount={totalCount}/>

      <div className="max-w-7xl mx-auto px-6 pt-24 pb-12">
        <h1 className="text-3xl font-bold text-[#2E2E2E] text-center mb-10">
          Explore Our Menu
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {menuItems.map((item) => (
            <MenuItemCard
              key={item.id}
              image={item.image}
              name={item.name}
              price={item.price}
              description={item.description}
              onAddToCart={() => handleAddToCart(item)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
