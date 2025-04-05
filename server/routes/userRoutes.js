import express from "express";
import { isAdminRoute, protectRoute } from "../middlewares/authMiddlewave.js";
import {
  activateUserProfile,
  changeUserPassword,
  deleteUserProfile,
  getNotificationsList,
  getTeamList,
  loginUser,
  logoutUser,
  markNotificationRead,
  registerUser,
  updateUserProfile,
  getUsers,
  editUserProfile, // ✅ Import new controller
} from "../controllers/userController.js";

const router = express.Router();

// User registration and authentication routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);

// Routes for fetching team list and notifications
router.get("/get-team", protectRoute, isAdminRoute, getTeamList);
router.get("/notifications", protectRoute, getNotificationsList);

// Routes for updating user profile, marking notifications as read, and changing password
router.put("/profile", protectRoute, updateUserProfile);
router.put("/read-noti", protectRoute, markNotificationRead);
router.put("/change-password", protectRoute, changeUserPassword);

// Route for fetching all users
router.get("/all", protectRoute, getUsers);

// Admin-only routes
router.put("/:id", protectRoute, editUserProfile); // ✅ Update user by ID
router.patch("/:id", protectRoute, isAdminRoute, activateUserProfile); // ✅ Activate/deactivate user
router.delete("/:id", protectRoute, isAdminRoute, deleteUserProfile); // ✅ Delete user

export default router;
