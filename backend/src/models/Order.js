import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  // user may be undefined for guest checkouts; when present it links orders
  // to a registered user so they appear on the Orders page.
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  products: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      quantity: { type: Number, required: true }
    }
  ],
  totalAmount: { type: Number, required: true },
  status: {
    type: String,
    enum: ["Pending", "Paid", "Shipped", "Delivered"],
    default: "Pending"
  },
  paymentId: { type: String } // Stripe Payment ID
  ,
  // lifecycle timestamps
  paidAt: { type: Date },
  packedAt: { type: Date },
  dispatchedAt: { type: Date },
  deliveredAt: { type: Date }
}, { timestamps: true });

const Order = mongoose.model("Order", orderSchema);
export default Order;
