"use client";

import axios from "axios";

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export const loginUser = async (email, password) => {
  try {
    const res = await axios.post(`${API_URL}/api/users/login`, { email, password });
    return res.data; // { token, user }
  } catch (err) {
    console.error("Login error:", err.response?.data || err.message);
    throw err.response?.data || err;
  }
};

export const registerUser = async (name, email, password) => {
  try {
    const res = await axios.post(`${API_URL}/api/users/register`, { name, email, password });
    return res.data;
  } catch (err) {
    console.error("Register error:", err.response?.data || err.message);
    throw err.response?.data || err;
  }
};

export const fetchProducts = async () => {
  try {
    const res = await axios.get(`${API_URL}/api/products`);
    return res.data;
  } catch (err) {
    console.error("Fetch products error:", err.response?.data || err.message);
    throw err.response?.data || err;
  }
};

export const createCheckoutSession = async (cart, userId) => {
  if (!cart || !cart.length) throw new Error("Cart is empty");

  try {
    const res = await axios.post(
      `${API_URL}/api/checkout/create-checkout-session`,
      { items: cart, userId }, // pass userId if logged in
      { headers: { "Content-Type": "application/json" } }
    );

    if (!res.data.url) throw new Error("No checkout URL returned from server");

    return res.data; // { url }
  } catch (err) {
    console.error("Create checkout session error:", err.response?.data || err.message);
    throw err.response?.data || err;
  }
};

export const confirmOrder = async (sessionId, token) => {
  if (!sessionId) throw new Error("Session ID required");

  try {
    const res = await axios.post(
      `${API_URL}/api/checkout/confirm`,
      { sessionId },
      {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      }
    );

    return res.data; // { order, alreadyExists }
  } catch (err) {
    console.error("Confirm order error:", err.response?.data || err.message);
    throw err.response?.data || err;
  }
};