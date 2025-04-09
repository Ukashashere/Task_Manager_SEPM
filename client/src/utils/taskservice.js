import axios from "axios";

const API_URL = "http://localhost:8800/api/tasks";

const getToken = () => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No token found. Please log in again.");
  return token;
};

export const createTask = async (taskData) => {
  const token = getToken();
  const response = await axios.post(`${API_URL}/create`, taskData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const updateTask = async (taskId, updatedData) => {
  const token = getToken();
  const response = await axios.put(`${API_URL}/${taskId}`, updatedData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const getTasks = async () => {
  const token = getToken();
  const response = await axios.get(`${API_URL}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// ✅ Fetch trashed tasks (fixed!)
export const getTrashedTasks = async () => {
  const token = getToken();
  const response = await axios.get(`${API_URL}/trash`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data.tasks; // ✅ Fix: return only the tasks array
};

export const restoreTask = async (taskId) => {
  const token = getToken();
  const response = await axios.put(`${API_URL}/restore/${taskId}`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const permanentDeleteTask = async (taskId) => {
  const token = getToken();
  const response = await axios.delete(`${API_URL}/${taskId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const restoreAllTasks = async () => {
  const token = getToken();
  const response = await axios.put(`${API_URL}/restore-all`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const permanentDeleteAllTasks = async () => {
  const token = getToken();
  const response = await axios.delete(`${API_URL}/delete-all`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};
