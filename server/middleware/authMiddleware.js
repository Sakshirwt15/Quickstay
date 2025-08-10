import { getAuth } from "@clerk/express";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  const { userId } = getAuth(req); // ✅ Get userId from Clerk request

  if (!userId) {
    return res.status(401).json({ success: false, message: "Not authenticated" });
  }

  try {
    const user = await User.findById(userId); // If you store Clerk ID as _id
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(500).json({ success: false, message: "Internal error" });
  }
  
};
