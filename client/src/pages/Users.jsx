import React, { useState, useEffect } from "react";
import Title from "../components/Title";
import Button from "../components/Button";
import { IoMdAdd } from "react-icons/io";
import { getInitials } from "../utils";
import clsx from "clsx";
import ConfirmationDialog, { UserAction } from "../components/Dialogs";
import AddUser from "../components/AddUser";
import AddUserForm from "../components/AddUserForm"; // Import the new form
import { authApi } from "../utils/authApi";

const Users = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [openEditForm, setOpenEditForm] = useState(false); // For edit
  const [openAddForm, setOpenAddForm] = useState(false); // For add new
  const [openAction, setOpenAction] = useState(false);
  const [selected, setSelected] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirmMsg, setConfirmMsg] = useState(null);

  const token = localStorage.getItem("token");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      if (!token) {
        throw new Error("No authentication token found.");
      }

      const data = await authApi.getUsers(token);
      if (!data || !Array.isArray(data)) {
        throw new Error("Invalid user data from server");
      }
      setUsers(data);
    } catch (error) {
      console.error("Failed to fetch users:", error.message);
      setError("Failed to load users. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const deleteClick = (id) => {
    const user = users.find((u) => u._id === id);
    setSelected(id);
    setConfirmMsg(`Are you sure you want to delete ${user?.name || "this user"}?`);
    setOpenDialog(true);
  };

  const editClick = (user) => {
    setSelected(user);
    setOpenEditForm(true); // Open edit form
  };

  const handleDelete = async () => {
    try {
      await authApi.deleteUser(selected, token);
      fetchUsers();
    } catch (error) {
      console.error("Failed to delete user:", error.message);
    } finally {
      setSelected(null);
    }
  };

  const TableHeader = () => (
    <thead className="border-b border-gray-300">
      <tr className="text-black text-left">
        <th className="py-2">Full Name</th>
        <th className="py-2">Title</th>
        <th className="py-2">Email</th>
        <th className="py-2">Role</th>
        <th className="py-2">Active</th>
        <th className="py-2">Actions</th>
      </tr>
    </thead>
  );

  const TableRow = ({ user }) => (
    <tr className="border-b border-gray-200 text-gray-600 hover:bg-gray-400/10">
      <td className="p-2">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full text-white flex items-center justify-center text-sm bg-blue-700">
            <span className="text-xs md:text-sm text-center">
              {getInitials(user.name)}
            </span>
          </div>
          {user.name}
        </div>
      </td>
      <td className="p-2">{user.title || "N/A"}</td>
      <td className="p-2">{user.email || "N/A"}</td>
      <td className="p-2">{user.role || "User"}</td>
      <td>
        <button
          className={clsx(
            "w-fit px-4 py-1 rounded-full",
            user?.isActive ? "bg-blue-200" : "bg-yellow-100"
          )}
        >
          {user?.isActive ? "Active" : "Disabled"}
        </button>
      </td>
      <td className="p-2 flex gap-4 justify-end">
        <Button
          className="text-blue-600 hover:text-blue-500 font-semibold sm:px-0"
          label="Edit"
          type="button"
          onClick={() => editClick(user)}
        />
        <Button
          className="text-red-700 hover:text-red-500 font-semibold sm:px-0"
          label="Delete"
          type="button"
          onClick={() => deleteClick(user._id)}
        />
      </td>
    </tr>
  );

  if (loading) return <div className="text-center text-gray-600">Loading users...</div>;
  if (error) return <div className="text-red-600 font-semibold">{error}</div>;

  return (
    <>
      <div className="w-full md:px-1 px-0 mb-6">
        <div className="flex items-center justify-between mb-8">
          <Title title="Team Members" />
          <Button
            label="Add New User"
            icon={<IoMdAdd className="text-lg" />}
            className="flex flex-row-reverse gap-1 items-center bg-blue-600 text-white rounded-md 2xl:py-2.5"
            onClick={() => {
              setSelected(null); // Clear selected user
              setOpenAddForm(true); // Open add form
            }}
          />
        </div>

        <div className="bg-white px-2 md:px-4 py-4 shadow-md rounded">
          <div className="overflow-x-auto">
            <table className="w-full mb-5">
              <TableHeader />
              <tbody>
                {users.map((user, index) => (
                  <TableRow key={index} user={user} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Edit User Form (Prefilled) */}
      <AddUser
        open={openEditForm}
        setOpen={setOpenEditForm}
        userData={selected}
        refetch={fetchUsers}
      />

      {/* Add New User Form (Empty) */}
      <AddUserForm
        open={openAddForm}
        setOpen={setOpenAddForm}
        refetch={fetchUsers}
      />

      <ConfirmationDialog
        open={openDialog}
        setOpen={setOpenDialog}
        msg={confirmMsg}
        onClick={handleDelete}
      />

      <UserAction
        open={openAction}
        setOpen={setOpenAction}
      />
    </>
  );
};

export default Users;