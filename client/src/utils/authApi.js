// src/utils/authApi.js
import axios from "axios";

const API_URL = "http://localhost:8800/api/user"; // Replace with your backend URL

export const authApi = {
  // Login API
  login: async (credentials) => {
    try {
      const response = await axios.post(`${API_URL}/login`, credentials);
      return response.data; // Return user data (token, info, etc.)
    } catch (error) {
      console.error("Login error:", error.response?.data || error.message);
      return { success: false, message: error.response?.data?.message || "Login failed. Please try again." };
    }
  },

  // Register API
  register: async (userData) => {
    try {
      const response = await axios.post(`${API_URL}/register`, userData);
      return response.data;
    } catch (error) {
      console.error("Registration error:", error.response?.data || error.message);
      return { success: false, message: error.response?.data?.message || "Registration failed. Please try again." };
    }
  },

  // Logout API
  logout: async () => {
    try {
      await axios.post(`${API_URL}/logout`);
      return { success: true, message: "Logged out successfully" };
    } catch (error) {
      console.error("Logout error:", error.response?.data || error.message);
      return { success: false, message: "Logout failed. Please try again." };
    }
  },

  // Fetch user details (if required)
  getUserDetails: async (token) => {
    try {
      const response = await axios.get(`${API_URL}/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error("User details error:", error.response?.data || error.message);
      return { success: false, message: "Failed to fetch user details." };
    }
  },

  // Change Password API
  changePassword: async (data, token) => {
    try {
      const response = await axios.post(`${API_URL}/change-password`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      console.error("Change password error:", error.response?.data || error.message);
      return { success: false, message: error.response?.data?.message || "Password change failed. Try again." };
    }
  },
};
