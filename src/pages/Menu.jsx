// src/pages/Menu.jsx
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import MenuItemCard from "../components/MenuItemCard";

export default function Menu() {
  const [menuItems, setMenuItems] = useState([]);

  useEffect(() => {
    const fetchMenu = async () => {
      const res = await fetch("http://localhost:5000/menu");
      const data = await res.json();
      setMenuItems(data);
    };
    fetchMenu();
  }, []);

  const handleAddToCart = (item) => {
    // Get the existing cart items from localStorage
    const existingCart = JSON.parse(localStorage.getItem("cart")) || [];
  
    // Check if the item already exists in the cart
    const itemExists = existingCart.find((cartItem) => cartItem.id === item.id);
  
    if (itemExists) {
      // If item already exists, increase quantity
      const updatedCart = existingCart.map((cartItem) =>
        cartItem.id === item.id
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      );
      localStorage.setItem("cart", JSON.stringify(updatedCart));
    } else {
      // Otherwise, add new item with quantity 1
      const updatedCart = [...existingCart, { ...item, quantity: 1 }];
      localStorage.setItem("cart", JSON.stringify(updatedCart));
    }
  
    // alert(`${item.name} added to cart!`);
  };
  

  return (
    <div className="min-h-screen bg-[#FFF5EE]">
      <Navbar />

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
