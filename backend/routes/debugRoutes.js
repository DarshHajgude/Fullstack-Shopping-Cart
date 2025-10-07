import express from "express";
import Order from "../src/models/Order.js";
import jwt from "jsonwebtoken";
import User from "../src/models/User.js";
import Product from "../src/models/Product.js";

const router = express.Router();

// Development-only: return recent orders without auth for quick debugging.
router.get("/orders", async (req, res) => {
  if (process.env.NODE_ENV === 'production') return res.status(404).send('Not found');
  try {
    const orders = await Order.find().sort({ createdAt: -1 }).limit(20).populate('products.product').lean();
    res.json(orders);
  } catch (err) {
    console.error('Debug orders error:', err);
    res.status(500).json({ error: 'Failed to fetch debug orders' });
  }
});

// Development-only: decode the Authorization token and return the user id
router.get('/tokeninfo', async (req, res) => {
  if (process.env.NODE_ENV === 'production') return res.status(404).send('Not found');
  try {
    const auth = req.headers.authorization || req.headers.Authorization;
    if (!auth || !auth.startsWith('Bearer ')) return res.status(400).json({ error: 'No Bearer token provided' });
    const token = auth.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(400).json({ error: 'Invalid token', message: err.message });
    }

    const user = await User.findById(decoded.id).select('-password').lean();
    res.json({ decoded, user });
  } catch (err) {
    console.error('Token info error:', err);
    res.status(500).json({ error: 'Failed to decode token' });
  }
});

// Development-only: create an order for the token's user (or guest) for quick testing
router.post('/create-order', async (req, res) => {
  if (process.env.NODE_ENV === 'production') return res.status(404).send('Not found');
  try {
    const auth = req.headers.authorization || req.headers.Authorization;
    let userId;
    if (auth && auth.startsWith('Bearer ')) {
      try {
        const token = auth.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.id;
      } catch (e) {
        // ignore invalid token and create guest order
      }
    }

    let products = req.body?.products;
    if (!products || !products.length) {
      // pick the first product from DB
      const first = await Product.findOne().lean();
      if (!first) return res.status(400).json({ error: 'No products available to create order' });
      products = [{ id: first._id.toString(), quantity: 1 }];
    }

    // compute total
    let total = 0;
    const items = [];
    for (const p of products) {
      const prod = await Product.findById(p.id).lean();
      const price = prod ? prod.price : 0;
      items.push({ product: prod ? prod._id : p.id, quantity: p.quantity });
      total += (price || 0) * (p.quantity || 1);
    }

    const order = new Order({
      user: userId || undefined,
      products: items,
      totalAmount: total,
      status: 'Paid',
      paymentId: 'debug-' + Date.now(),
      paidAt: new Date()
    });

    await order.save();
    res.json(order);
  } catch (err) {
    console.error('Create debug order error:', err);
    res.status(500).json({ error: 'Failed to create debug order' });
  }
});

export default router;
