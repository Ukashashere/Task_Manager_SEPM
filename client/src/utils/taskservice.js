import axios from "axios";

const API_URL = "http://localhost:8800/api/tasks"; // Replace with your backend URL

// Function to create a task
export const createTask = async (taskData) => {
  try {
    const token = localStorage.getItem("token"); // Get the token from localStorage
    if (!token) {
      throw new Error("No token found. Please log in again.");
    }

    const response = await axios.post(`${API_URL}/create`, taskData, {
      headers: {
        Authorization: `Bearer ${token}`, // Include the token with "Bearer"
      },
    });
    return response.data; // Return the response data
  } catch (error) {
    throw error.response?.data || error.message; // Throw the error response data or a generic error message
  }
};

// Function to fetch all tasks
export const getTasks = async () => {
  try {
    const token = localStorage.getItem("token"); // Get the token from localStorage
    if (!token) {
      throw new Error("No token found. Please log in again.");
    }

    const response = await axios.get(`${API_URL}`, {
      headers: {
        Authorization: `Bearer ${token}`, // Include the token with "Bearer"
      },
    });
    return response.data; // Return the response data
  } catch (error) {
    throw error.response?.data || error.message; // Throw the error response data or a generic error message
  }
};