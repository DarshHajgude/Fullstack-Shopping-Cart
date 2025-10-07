"use client";
import { useCart } from "../context/CartContext";

export default function CartItem({ item }) {
  const { removeFromCart, updateQuantity } = useCart();

  return (
    <div className="flex items-center justify-between border-b py-2">
      <div>
        <h4 className="font-semibold">{item.name}</h4>
        <p>${item.price}</p>
      </div>
      <div className="flex items-center space-x-2">
        <button
          onClick={() => updateQuantity(item.id || item._id, (item.quantity || 1) - 1)}
          className="bg-gray-200 px-2 rounded"
        >
          -
        </button>
        <span>{item.quantity}</span>
        <button
          onClick={() => updateQuantity(item.id || item._id, (item.quantity || 1) + 1)}
          className="bg-gray-200 px-2 rounded"
        >
          +
        </button>
        <button
          onClick={() => removeFromCart(item.id || item._id)}
          className="bg-red-500 text-white px-3 py-1 rounded"
        >
          Remove
        </button>
      </div>
    </div>
  );
}
