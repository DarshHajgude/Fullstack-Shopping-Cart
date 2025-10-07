"use client";

import { useCart } from "../context/CartContext";
import Link from "next/link";
import Image from "next/image";

export default function ProductCard({ product }) {
  const { addToCart } = useCart();

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
        <button
          onClick={() => addToCart(product)}
          className="mt-2 w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}
