import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

import userRoutes from "./routes/userRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import checkoutRoutes from "./routes/checkoutRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import webhookRoutes from "./routes/webhook.js";

dotenv.config();

const app = express();

app.use(cors());

// Webhook route must parse raw body
app.use("/webhook", webhookRoutes);

app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB Error:", err));

app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/checkout", checkoutRoutes);
app.use("/api/orders", orderRoutes);

// Development-only debug routes
if (process.env.NODE_ENV !== "production") {
  import("./routes/debugRoutes.js")
    .then(mod => app.use("/api/debug", mod.default))
    .catch(err => console.error("Failed to load debug routes:", err));
}

app.get("/", (req, res) => res.send("Shopping Cart Backend Running"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));