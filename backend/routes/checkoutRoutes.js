import express from "express";
import Stripe from "stripe";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();
const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Ensure URLs are absolute
const ensureAbsoluteUrl = (url) => {
  if (!url) return undefined;
  try {
    return new URL(url).toString();
  } catch {
    const rawClient = process.env.CLIENT_URL || "http://localhost:3000";
    const clientBase = rawClient.startsWith("http") ? rawClient : `http://${rawClient}`;
    try {
      return new URL(url, clientBase).toString();
    } catch {
      return undefined;
    }
  }
};

router.post("/create-checkout-session", async (req, res) => {
  try {
    const { items, userId } = req.body;
    if (!items || !items.length) return res.status(400).json({ error: "Cart is empty" });

    const Product = (await import("../src/models/Product.js")).default;

    const validatedItems = [];
    for (const item of items) {
      const id = item._id || item.id;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: `Invalid product ID: ${id}` });
      }

      const prod = await Product.findById(id).lean();
      if (!prod) {
        return res.status(400).json({ error: `Product not found: ${id}` });
      }

      if (prod.stock < (item.quantity || 1)) {
        return res.status(400).json({
          error: `Insufficient stock for ${prod.name}. Available: ${prod.stock}, requested: ${item.quantity}`,
        });
      }
      validatedItems.push({ ...prod, quantity: item.quantity || 1 });
    }

    const line_items = validatedItems.map(item => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.name,
          images: ensureAbsoluteUrl(item.image) ? [ensureAbsoluteUrl(item.image)] : undefined,
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity || 1,
    }));

    const clientBase = process.env.CLIENT_URL || "http://localhost:3000";

    const metadata = {
      userId: userId || "",
      items: JSON.stringify(
        validatedItems.map((i) => ({
          id: String(i._id),
          name: i.name,
          price: i.price,
          q: i.quantity || 1,
        }))
      ),
    };

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items,
      mode: "payment",
      success_url: `${clientBase}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${clientBase}/checkout/cancel`,
      metadata,
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error("Create checkout session error:", err);
    res.status(500).json({ error: err.message || "Failed to create checkout session" });
  }
});

router.post("/confirm", async (req, res) => {
  try {
    const { sessionId } = req.body;
    if (!sessionId) return res.status(400).json({ error: "sessionId required" });

    const session = await stripe.checkout.sessions.retrieve(sessionId, { expand: ["payment_intent"] });

    const paymentId = typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id || session.id;

    const Order = (await import("../src/models/Order.js")).default;
    const existing = await Order.findOne({ paymentId }).lean();
    if (existing) return res.json({ order: existing, alreadyExists: true });

    let items = [];
    try {
      items = session.metadata?.items ? JSON.parse(session.metadata.items) : [];
    } catch {}

    const Product = (await import("../src/models/Product.js")).default;
    const products = [];
    let totalAmount = 0;

    for (const it of items) {
      const id = it.id || it._id;
      const qty = it.q || it.quantity || 1;

      const prodDoc = mongoose.Types.ObjectId.isValid(id) ? await Product.findById(id).lean() : null;

      if (prodDoc) {
        products.push({ product: new mongoose.Types.ObjectId(id), quantity: qty });
        totalAmount += (prodDoc.price || 0) * qty;
      } else {
        // If product not found, use metadata. This is a fallback.
        products.push({ 
          product: null, // No valid DB product
          name: it.name, // from metadata
          price: it.price, // from metadata
          quantity: qty 
        });
        totalAmount += (it.price || 0) * qty;
      }
    }

    if (!products.length) return res.status(400).json({ error: "No valid products in order" });

    let userId = session.metadata?.userId;

    if (!userId && session.customer_details?.email) {
      try {
        const User = (await import("../src/models/User.js")).default;
        const user = await User.findOne({ email: session.customer_details.email }).lean();
        if (user) userId = user._id.toString();
      } catch {}
    }

    const order = new Order({
      user: userId || undefined,
      products,
      totalAmount,
      status: "Paid",
      paymentId: String(paymentId),
      paidAt: new Date(),
    });

    await order.save();
    res.json({ order, alreadyExists: false });
  } catch (err) {
    console.error("Confirm order error:", err);
    res.status(500).json({ error: err.message || "Failed to confirm order" });
  }
});

export default router;