import React, { useEffect, useState } from "react";
import { FaList } from "react-icons/fa";
import { MdGridView } from "react-icons/md";
import { useParams } from "react-router-dom";
import Loading from "../components/Loader";
import Title from "../components/Title";
import Button from "../components/Button";
import { IoMdAdd } from "react-icons/io";
import Tabs from "../components/Tabs";
import TaskTitle from "../components/TaskTitle";
import BoardView from "../components/BoardView";
import Table from "../components/task/Table";
import AddTask from "../components/task/AddTask";
import { getTasks, updateTask } from "../utils/taskservice";

const TABS = [
  { title: "Board View", icon: <MdGridView /> },
  { title: "List View", icon: <FaList /> },
];

const TASK_TYPE = {
  todo: "bg-blue-600",
  "in progress": "bg-yellow-600",
  completed: "bg-green-600",
};

const Tasks = () => {
  const params = useParams();
  const status = params?.status || "";

  const [selected, setSelected] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState("");
  const [editingTask, setEditingTask] = useState(null);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await getTasks();
      setTasks(response.tasks);
    } catch (err) {
      console.error("Error loading tasks:", err.message);
      setError("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleEditTask = (task) => {
    setEditingTask(task);
    setOpen(true);
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await updateTask(taskId, { stage: newStatus });
      fetchTasks();
    } catch (err) {
      console.error("Failed to update task status:", err.message);
    }
  };

  return loading ? (
    <div className='py-10'>
      <Loading />
    </div>
  ) : (
    <div className='w-full'>
      <div className='flex items-center justify-between mb-4'>
        <Title title={status ? `${status} Tasks` : "Tasks"} />
        {!status && (
          <Button
            onClick={() => {
              setEditingTask(null);
              setOpen(true);
            }}
            label='Create Task'
            icon={<IoMdAdd className='text-lg' />}
            className='flex flex-row-reverse gap-1 items-center bg-blue-600 text-white rounded-md py-2 2xl:py-2.5'
          />
        )}
      </div>

      <Tabs tabs={TABS} setSelected={setSelected}>
        {!status && selected === 0 && (
          <div className='w-full flex justify-between gap-4 md:gap-x-12 py-4'>
            <TaskTitle label='To Do' className={TASK_TYPE.todo} />
            <TaskTitle label='In Progress' className={TASK_TYPE["in progress"]} />
            <TaskTitle label='Completed' className={TASK_TYPE.completed} />
          </div>
        )}

        {selected !== 1 ? (
          <BoardView
            tasks={tasks}
            onEdit={handleEditTask}
            onStatusChange={handleStatusChange}
          />
        ) : (
          <div className='w-full'>
            <Table
              tasks={tasks}
              onEdit={handleEditTask}
              refetch={fetchTasks}
            />
          </div>
        )}
      </Tabs>

      <AddTask
        open={open}
        setOpen={setOpen}
        task={editingTask}
        setTask={setEditingTask}
        key={editingTask ? editingTask._id : "create-task"}
        refetch={fetchTasks}
      />
    </div>
  );
};

export default Tasks;