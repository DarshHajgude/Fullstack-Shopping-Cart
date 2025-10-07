"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { cart } = useCart();
  const { user, logout } = useAuth(); // ✅ Use AuthContext for user
  const [showDropdown, setShowDropdown] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true); // mark hydration
  }, []);

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
  };

  return (
    <nav className="bg-white shadow-md p-4 flex justify-between items-center sticky top-0 z-50">
      {/* Logo */}
      <Link href="/" className="flex items-center">
        <img
          src="/logo.png"
          alt="ShopEasy Logo"
          width={120}
          height={40}
          className="object-contain hover:scale-105 transition-transform border border-transparent hover:border-blue-500 rounded"
        />
      </Link>

      {/* Right Icons */}
      <div className="flex items-center gap-4">
        {/* Cart Icon */}
        <Link href="/cart" className="relative text-2xl">
          🛒
          <span
            className={`absolute -top-2 -right-2 bg-red-600 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center ${
              !mounted || cart.length === 0 ? "opacity-0 pointer-events-none" : ""
            }`}
          >
            {mounted ? cart.reduce((sum, item) => sum + (item.quantity || 0), 0) : ""}
          </span>
        </Link>

        {/* Logged-in User */}
        {user ? (
          <div className="flex items-center gap-4">
            {user.isAdmin && (
              <Link href="/admin/orders" className="px-3 py-2 hover:underline">
                Admin
              </Link>
            )}
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 border p-2 rounded hover:bg-gray-100"
              >
                👤 <span className="font-medium">{mounted ? user.name : ""}</span>
              </button>
              {showDropdown && (
                <div className="absolute right-0 mt-2 bg-white border rounded shadow-md w-32">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          // Logged-out buttons
          <div className="flex items-center gap-2">
            <Link
              href="/register"
              className="px-4 py-2 border rounded hover:bg-gray-100"
            >
              Sign up
            </Link>
            <Link
              href="/login"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Login
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
