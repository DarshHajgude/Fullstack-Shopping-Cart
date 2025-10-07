"use client";

import { useCart } from "../context/CartContext";
import Link from "next/link";
import Image from "next/image";

export default function ProductCard({ product }) {
  const { cart, addToCart, updateQuantity, normalizeId } = useCart();
  const cartItem = cart.find((item) => normalizeId(item) === normalizeId(product));

  return (
    <div className="border rounded-lg p-4 flex flex-col">
      <Link href={`/product/${product._id || product.id}`}>
        <div className="relative w-full h-48 mb-2">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover rounded"
          />
        </div>
        <h2 className="text-lg font-bold">{product.name}</h2>
        <p className="text-gray-500">{product.description}</p>
      </Link>
      <div className="mt-auto">
        <p className="text-lg font-semibold mt-2">${product.price}</p>
        {cartItem ? (
          <div className="flex items-center justify-center mt-2">
            <button
              onClick={() => updateQuantity(cartItem.id || cartItem._id, (cartItem.quantity || 1) - 1)}
              className="bg-gray-200 px-3 py-1 rounded-l"
            >
              -
            </button>
            <span className="px-4 py-1 bg-gray-100">{cartItem.quantity}</span>
            <button
              onClick={() => updateQuantity(cartItem.id || cartItem._id, (cartItem.quantity || 1) + 1)}
              className="bg-gray-200 px-3 py-1 rounded-r"
            >
              +
            </button>
          </div>
        ) : (
          <button
            onClick={() => addToCart(product)}
            className="mt-2 w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
          >
            Add to Cart
          </button>
        )}
      </div>
    </div>
  );
}
