import express from "express";
import Order from "../src/models/Order.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Return orders for the authenticated user only.
router.get("/", protect, async (req, res) => {
  try {
    const userOrders = await Order.find({ user: req.user._id }).populate('products.product').lean();
    res.json(userOrders);
  } catch (err) {
    console.error('Error fetching orders:', err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Admin-only: return all orders
router.get('/all', protect, admin, async (req, res) => {
  try {
    const orders = await Order.find().populate('products.product').lean();
    res.json(orders);
  } catch (err) {
    console.error('Error fetching all orders:', err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Get single order by id (owner or admin)
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('products.product').lean();
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (req.user.isAdmin || (order.user && order.user.toString() === req.user._id.toString())) {
      return res.json(order);
    }
    return res.status(403).json({ error: 'Not authorized' });
  } catch (err) {
    console.error('Error fetching order:', err);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// Admin: update status and set lifecycle timestamps
router.post('/:id/status', protect, admin, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    order.status = status;
    const now = new Date();
    if (status === 'Paid') order.paidAt = order.paidAt || now;
    if (status === 'Shipped') order.packedAt = order.packedAt || now;
    if (status === 'Dispatched') order.dispatchedAt = order.dispatchedAt || now;
    if (status === 'Delivered') order.deliveredAt = order.deliveredAt || now;

    await order.save();
    res.json(order);
  } catch (err) {
    console.error('Error updating order status:', err);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

export default router;
