import express from "express";
import {
  addToCart,
  deleteCart,
  getCartProducts,
  removeAllFromCart,
  updateQuantity,
} from "../controllers/cart.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", protectRoute, getCartProducts);
router.post("/", protectRoute, addToCart);
router.delete("/", protectRoute, removeAllFromCart);
router.delete("/clear", protectRoute, deleteCart); // This function is called after user purchase the products completely
router.put("/:id", protectRoute, updateQuantity);

export default router;
