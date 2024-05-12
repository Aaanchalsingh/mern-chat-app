// user.routes.js
import express from "express";
import protectRoute from "../middleware/protectRoute.js";
import User from "../models/user.model.js";

import { getUsersForSidebar } from "../controllers/user.controller.js";

const router = express.Router();

router.get("/", protectRoute, getUsersForSidebar);
router.put("/status", protectRoute, async (req, res) => {
  try {
    console.log(req.user);
    const userId = req.user._id;
    const { status } = req.body;
    if (!["online", "busy"].includes(status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }
    await User.findByIdAndUpdate(userId, { status });
    res.status(200).json({ message: "User status updated successfully" });
  } catch (error) {
    console.error("Error updating user status:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
