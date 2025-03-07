import { useSelector } from "react-redux";
import { Navigate, Outlet, Route, Routes } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Tasks from "./pages/Tasks";
import Users from "./pages/Users";
import Trash from "./pages/Trash";
import TaskDetails from "./pages/TaskDetails";
import Completed from "./pages/completed";
import Progress from "./pages/progress";
import Todo from "./pages/todo";
import Sidebar from "./components/Sidebar"; // Ensure Sidebar exists
import Navbar from "./components/Navbar"; // Ensure Navbar exists
import { Toaster } from "react-hot-toast";

// Layout component for protected routes
function Layout() {
  const user = useSelector((state) => state.auth?.user); // Safe access with optional chaining

  if (user === undefined) {
    return <div>Loading...</div>; // Prevents app crash while Redux state loads
  }

  return user ? (
    <div className="w-full h-screen flex flex-col md:flex-row">
      <div className="w-1/5 h-screen bg-white sticky top-0 hidden md:block">
        <Sidebar />
      </div>
      <div className="flex-1 overflow-y-auto">
        <Navbar />

        <div className="p-4">
          <Outlet />
        </div>
      </div>
    </div>
  ) : (
    <Navigate to="/login" replace />
  );
}

function App() {
  return (
    <>
      <Toaster /> {/* Keep this inside the correct App function */}
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/team" element={<Users />} />
          <Route path="/trashed" element={<Trash />} />
          <Route path="/task/:id" element={<TaskDetails />} />
          <Route path="/completed" element={<Completed />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/todo" element={<Todo />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
