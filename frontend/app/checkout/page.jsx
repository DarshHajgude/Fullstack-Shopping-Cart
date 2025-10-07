"use client";
import { useCart } from "../context/CartContext";
import { createCheckoutSession } from "../lib/api";
import { useState } from "react";

export default function Checkout() {
  const { cart, removeFromCart, clearCart, normalizeId } = useCart();

  const totalPrice = cart.reduce((acc, item) => acc + item.price * (item.quantity || 1), 0);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-2xl font-bold mb-6">Your Cart</h1>

      {cart.length === 0 ? (
        <p className="text-gray-600">Your cart is empty.</p>
      ) : (
        <>
          <div className="grid gap-4 mb-4">
            {cart.map((item) => (
              <div key={normalizeId(item)} className="flex justify-between items-center bg-white p-4 rounded shadow">
                <div>
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-gray-500">
                    ${item.price} × {item.quantity || 1}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold">
                    ${((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                  </p>
                  <button
                    onClick={() => removeFromCart(normalizeId(item))}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center font-bold text-lg bg-white p-4 rounded shadow mb-4">
            <span>Total:</span>
            <span>${totalPrice.toFixed(2)}</span>
          </div>

          <StripePayButton cart={cart} />

          <button
            className="w-full mt-2 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            onClick={clearCart}
          >
            Clear Cart
          </button>
        </>
      )}
    </div>
  );
}

function StripePayButton({ cart }) {
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    if (!cart || !cart.length) return alert("Your cart is empty.");
    setLoading(true);

    try {
      const { url } = await createCheckoutSession(cart);
      if (!url) throw new Error("No checkout URL returned from server");

      window.location.href = url;
    } catch (err) {
      console.error("Checkout error:", err);
      alert(err.error || err.message || "Failed to create checkout session");
      setLoading(false);
    }
  };

  return (
    <button
      className="w-full py-3 bg-blue-600 text-white font-bold rounded hover:bg-blue-700 disabled:opacity-60"
      onClick={handlePay}
      disabled={loading}
    >
      {loading ? "Redirecting to payment..." : "Pay Now"}
    </button>
  );
}


