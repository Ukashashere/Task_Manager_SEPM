import jwt from "jsonwebtoken";
import User from "../models/user.js";

const protectRoute = (req, res, next) => {
  try {
    // Extract token from cookies or Authorization header
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ status: false, message: "Not authorized. Try login again." });
    }

    // Decode the token using JWT_SECRET
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded user data:", decoded); // Debugging line to check the decoded JWT content

    // Attach decoded user data to request object for later use
    req.user = decoded;

    next();
  } catch (error) {
    console.error("Token verification error:", error);
    return res.status(401).json({ status: false, message: "Not authorized. Try login again." });
  }
};


const isAdminRoute = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    return res.status(401).json({
      status: false,
      message: "Not authorized as admin. Try login as admin.",
    });
  }
};

export { isAdminRoute, protectRoute };
