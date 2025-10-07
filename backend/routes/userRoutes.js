import express from "express";
import { registerUser, loginUser } from "../src/controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
// Inline /me handler to avoid import casing issues in dev environment
router.get('/me', protect, (req, res) => {
	if (!req.user) return res.status(401).json({ message: 'Not authorized' });
	res.json(req.user);
});

export default router;
