import express from "express";
import Stripe from "stripe";
import dotenv from "dotenv";
import Order from "../src/models/Order.js";
import Product from "../src/models/Product.js";

dotenv.config();
const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// This route must receive the raw body to verify the signature
router.post("/", express.raw({ type: "application/json" }), async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  // Allow test posts in non-production when ?test=true
  const isTestMode = process.env.NODE_ENV !== 'production' && req.query && req.query.test === 'true';
  if (isTestMode) {
    try {
      event = JSON.parse(req.body.toString());
    } catch (err) {
      console.error("Invalid test event body:", err.message);
      return res.status(400).send(`Invalid test event: ${err.message}`);
    }
  } else {
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    try {
      // session.metadata.items contains a JSON string of [{id, quantity}, ...]
      const items = session.metadata?.items ? JSON.parse(session.metadata.items) : [];

      const products = [];
      let totalAmount = 0;

      for (const it of items) {
        // try to fetch the product to validate price
        const prod = await Product.findById(it.id).lean();
        const price = prod ? prod.price : 0;
        products.push({ product: it.id, quantity: it.quantity });
        totalAmount += (price || 0) * (it.quantity || 1);
      }

      // Create Order. If you have session.customer or metadata for user, associate user.
      // If an order with this payment id already exists, skip creating a duplicate
      const paymentId = session.payment_intent || session.id;
      const exists = await Order.findOne({ paymentId }).lean();
      if (exists) {
        console.log('Order already exists for paymentId:', paymentId);
      } else {
        // Try to associate by email if metadata.userId missing
        let userId = session.metadata?.userId;
        if (!userId && session.customer_details?.email) {
          try {
            const User = (await import('../src/models/User.js')).default;
            const u = await User.findOne({ email: session.customer_details.email }).lean();
            if (u) userId = u._id.toString();
          } catch (err) {
            console.warn('Could not lookup user by email in webhook:', err.message);
          }
        }

        // Attempt to decrement stock for each product. If any decrement would cause negative stock,
        // roll back any previous decrements and continue without modifying stock (log the issue).
        const decremented = [];
        let stockIssue = false;

        for (const p of products) {
          try {
            if (!p.product) continue;
            const qty = p.quantity || 1;
            const upd = await Product.updateOne({ _id: p.product, stock: { $gte: qty } }, { $inc: { stock: -qty } });
            // matchedCount may be 0 when product not found or insufficient stock
            if (!upd.matchedCount && !upd.modifiedCount) {
              stockIssue = true;
              console.error(`Insufficient stock or missing product for ${p.product} in webhook order processing`);
              break;
            }
            decremented.push({ id: p.product, qty });
          } catch (err) {
            stockIssue = true;
            console.error('Error decrementing stock for product', p.product, err.message);
            break;
          }
        }

        // If a stock issue occurred, rollback any successful decrements
        if (stockIssue && decremented.length) {
          try {
            for (const d of decremented) {
              await Product.updateOne({ _id: d.id }, { $inc: { stock: d.qty } });
            }
            console.warn('Rolled back partial stock decrements due to stock issue');
          } catch (rbErr) {
            console.error('Failed to rollback stock changes:', rbErr.message);
          }
        }

        const order = new Order({
          // if you saved user id in metadata, use it; otherwise try email mapping
          user: userId || undefined,
          products,
          totalAmount: totalAmount / 1, // store as number
          status: "Paid",
          paymentId,
          paidAt: new Date(),
        });

        await order.save();
        console.log("Order created from webhook, id:", order._id.toString());
      }
    } catch (err) {
      console.error("Error creating order from webhook:", err);
      // don't fail the webhook; log and return 200 so Stripe won't retry forever
    }
  }

  res.json({ received: true });
});

export default router;