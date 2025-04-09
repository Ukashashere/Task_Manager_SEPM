import axios from "axios";

const API_URL = "http://localhost:8800/api/tasks";

// Function to create a task
export const createTask = async (taskData) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No token found. Please log in again.");

    const response = await axios.post(`${API_URL}/create`, taskData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Function to update a task
export const updateTask = async (taskId, updatedData) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No token found. Please log in again.");

    const response = await axios.put(`${API_URL}/${taskId}`, updatedData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Function to fetch all tasks
export const getTasks = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No token found. Please log in again.");

    const response = await axios.get(`${API_URL}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
