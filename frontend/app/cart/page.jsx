"use client";
import { useCart } from "../context/CartContext"; // ✅ fixed path
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import CartItem from "../components/CartItem";

export default function CartPage() {
  const { cart, removeFromCart, clearCart } = useCart();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  if (!cart.length)
    return <p className="text-center text-gray-600 mt-10">Your cart is empty 🛒</p>;

  return (
    <div className="max-w-3xl mx-auto mt-10 bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Your Cart</h2>
      {cart.map((item) => (
        <CartItem key={item.id || item._id} item={item} />
      ))}

      <div className="text-right font-bold text-lg mb-4">
        Total: ${cart.reduce((acc, item) => acc + item.price * item.quantity, 0).toFixed(2)}
      </div>
      <div className="flex justify-between items-center border-t pt-4">
        <button
          onClick={clearCart}
          className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
        >
          Clear Cart
        </button>
        <CheckoutButton
          loading={loading}
          setLoading={setLoading}
        />
      </div>
    </div>
  );
}

function CheckoutButton({ loading, setLoading }) {
  const router = useRouter();
  const { user } = useAuth();
  const isAuthed = !!user;

  const handleCheckout = () => {
    if (loading) return;
    if (!isAuthed) return; // Block interaction when unauthenticated
    setLoading(true);
    router.push("/checkout");
  };

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleCheckout}
        disabled={loading || !isAuthed}
        aria-disabled={!isAuthed}
        className={`${!isAuthed ? "bg-gray-300 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"} text-white px-6 py-2 rounded disabled:opacity-60`}
        title={!isAuthed ? "Please login to proceed to checkout" : undefined}
      >
        {loading ? "Processing..." : "Proceed to Checkout"}
      </button>
      {!isAuthed && (
        <button
          onClick={() => router.push(`/login?redirect=/checkout`)}
          className="px-4 py-2 rounded border border-blue-600 text-blue-600 hover:bg-blue-50"
        >
          Login to continue
        </button>
      )}
    </div>
  );
}
