// src/components/MenuItemCard.jsx
import React from 'react';

export default function MenuItemCard({ image, name, price, description, onAddToCart }) {

  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-lg transition p-4 flex flex-col">
      <img
        src={image}
        alt={name}
        className="h-40 w-full object-cover rounded-lg mb-4"
      />

      <h3 className="text-lg font-bold text-[#2E2E2E]">{name}</h3>
      <p className="text-sm text-gray-600 mt-1 grow">{description}</p>

      <div className="mt-3 flex items-center justify-between">
        <span className="text-[#FF4C29] font-semibold text-lg">₨ {price}</span>
        
        <button
          // Pass the onAddToCart function directly to the onClick handler
          onClick={onAddToCart}
          className="
            bg-[#FF4C29] text-white px-3 py-1.5 rounded-lg font-medium cursor-pointer
            hover:bg-[#E63E1F]
            transition-transform duration-150 ease-in-out
            active:scale-95
          "
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}