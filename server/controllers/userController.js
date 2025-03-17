import bcrypt from "bcryptjs";
import User from "../models/user.js";
import { createJWT } from "../utils/index.js";
import Notice from "../models/notification.js";

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, isAdmin, role, title } = req.body;

    const userExist = await User.findOne({ email });

    if (userExist) {
      return res.status(400).json({ status: false, message: "User already exists" });
    }

    const user = await User.create({ name, email, password, isAdmin, role, title });

    if (user) {
      if (isAdmin) createJWT(res, user._id);

      user.password = undefined;

      res.status(201).json(user);
    } else {
      return res.status(400).json({ status: false, message: "Invalid user data" });
    }
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({ status: false, message: "Internal server error" });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ status: false, message: "Invalid email or password." });
    }

    if (!user?.isActive) {
      return res.status(401).json({
        status: false,
        message: "User account has been deactivated, contact the administrator",
      });
    }

    const isMatch = await user.matchPassword(password);

    if (user && isMatch) {
      const token = createJWT(res, user._id); // Generate the token
      user.password = undefined;

      // Return the user data and token
      res.status(200).json({
        status: true,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        title: user.title,
        token, // Include the token in the response
      });
    } else {
      return res.status(401).json({ status: false, message: "Invalid email or password" });
    }
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ status: false, message: "Internal server error" });
  }
};

export const logoutUser = async (req, res) => {
  try {
    res.cookie("token", "", {
      httpOnly: true,
      expires: new Date(0),
    });

    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({ status: false, message: "Internal server error" });
  }
};

export const getTeamList = async (req, res) => {
  try {
    const users = await User.find().select("name title role email isActive");
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching team list:", error);
    return res.status(500).json({ status: false, message: "Internal server error" });
  }
};
export const getUsers = async (req, res) => {
  try {
    const users = await User.find(); // Fetch all users from the database
    console.log("Fetched users:", users); // Debugging: Log fetched users
    res.status(200).json(users); // Send the users as a JSON response
  } catch (error) {
    console.error("Error fetching users:", error); // Debugging: Log errors
    res.status(500).json({ message: "Error fetching users", error });
  }
};

export const getNotificationsList = async (req, res) => {
  try {
    const { userId } = req.user;

    const notice = await Notice.find({
      team: userId,
      isRead: { $nin: [userId] },
    }).populate("task", "title");

    res.status(200).json(notice);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return res.status(500).json({ status: false, message: "Internal server error" });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const { userId, isAdmin } = req.user;
    const { _id } = req.body;

    const id = isAdmin && userId === _id ? userId : isAdmin && userId !== _id ? _id : userId;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    user.name = req.body.name || user.name;
    user.title = req.body.title || user.title;
    user.role = req.body.role || user.role;

    const updatedUser = await user.save();
    updatedUser.password = undefined;

    res.status(200).json({ status: true, message: "Profile Updated Successfully.", user: updatedUser });
  } catch (error) {
    console.error("Profile update error:", error);
    return res.status(500).json({ status: false, message: "Internal server error" });
  }
};

export const markNotificationRead = async (req, res) => {
  try {
    const { userId } = req.user;
    const { isReadType, id } = req.query;

    if (isReadType === "all") {
      await Notice.updateMany({ team: userId, isRead: { $nin: [userId] } }, { $push: { isRead: userId } });
    } else {
      await Notice.findOneAndUpdate({ _id: id, isRead: { $nin: [userId] } }, { $push: { isRead: userId } });
    }

    res.status(200).json({ status: true, message: "Notifications marked as read" });
  } catch (error) {
    console.error("Error marking notifications:", error);
    return res.status(500).json({ status: false, message: "Internal server error" });
  }
};

export const changeUserPassword = async (req, res) => {
  try {
    const { userId } = req.user;
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ status: false, message: "Incorrect current password" });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    await user.save();
    res.status(200).json({ status: true, message: "Password changed successfully" });
  } catch (error) {
    console.error("Error changing password:", error);
    return res.status(500).json({ status: false, message: "Internal server error" });
  }
};

export const activateUserProfile = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    user.isActive = req.body.isActive;
    await user.save();

    res.status(200).json({ status: true, message: `User account has been ${user?.isActive ? "activated" : "disabled"}` });
  } catch (error) {
    console.error("Error activating/deactivating user:", error);
    return res.status(500).json({ status: false, message: "Internal server error" });
  }
};

export const deleteUserProfile = async (req, res) => {
  try {
    const { id } = req.params;

    await User.findByIdAndDelete(id);
    res.status(200).json({ status: true, message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return res.status(500).json({ status: false, message: "Internal server error" });
  }
};
