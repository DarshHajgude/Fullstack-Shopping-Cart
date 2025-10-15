"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useCart } from "../../context/CartContext";
import { API_URL } from "../../lib/api";
import React from "react";

export default function ProductPage({ params }) {
  const { id } = React.use(params);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const { cart, addToCart, updateQuantity, removeFromCart, normalizeId } = useCart();
  const router = useRouter();

  const existing = cart.find((p) => normalizeId(p) === id);

  useEffect(() => {
    let mounted = true;

    const fetchProduct = async () => {
      try {
  const res = await axios.get(`${API_URL}/api/products/${id}`);
        if (mounted) setProduct(res.data);
      } catch (err) {
        console.error("Failed to fetch product", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchProduct();
    return () => (mounted = false);
  }, [id]);

  if (loading) return <p className="p-6">Loading product…</p>;
  if (!product) return <p className="p-6 text-red-600">Product not found.</p>;

  const handleAdd = () => addToCart(product, 1);
  const handleIncrement = () => {
    if (!existing) return;
    updateQuantity(normalizeId(existing), existing.quantity + 1);
  };
  const handleDecrement = () => {
    if (!existing) return;
    const newQty = existing.quantity - 1;
    if (newQty <= 0) {
      removeFromCart(normalizeId(existing));
    } else {
      updateQuantity(normalizeId(existing), newQty);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded shadow mt-8">
      <div className="flex gap-6">
        <img
          src={product.images?.[0] || product.image || "/images/product1.jpg"}
          alt={product.name}
          className="w-80 h-80 object-cover rounded"
        />
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{product.name}</h1>
          <p className="mt-2 text-gray-700">
            {product.description || "No description available."}
          </p>
          <div className="mt-4 font-bold text-lg">${product.price?.toFixed(2)}</div>
          <div className="mt-2 text-sm text-gray-600">Stock: {typeof product.stock === 'number' ? product.stock : '—'}</div>

          <div className="mt-4 flex items-center gap-3">
            {existing ? (
              <>
                <button
                  onClick={handleDecrement}
                  className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                >
                  -
                </button>
                <div className="px-3 font-medium">{existing.quantity}</div>
                <button
                  onClick={handleIncrement}
                  className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                >
                  +
                </button>
              </>
            ) : (
              <button
                onClick={handleAdd}
                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
              >
                Add to Cart
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
