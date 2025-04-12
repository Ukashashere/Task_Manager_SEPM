import Notice from "../models/notification.js";
import Task from "../models/task.js";
import User from "../models/user.js";

// ✅ Create a task
export const createTask = async (req, res) => {
  try {
    const { userId } = req.user;
    const { title, team, stage, date, priority, assets } = req.body;

    const task = await Task.create({
      title,
      team,
      stage: stage.toLowerCase(),
      date,
      priority: priority.toLowerCase(),
      assets,
      activities: {
        type: "assigned",
        activity: `New task has been assigned to you and ${team.length - 1} others.`,
        by: userId,
      },
    });

    const notifications = team.map(user => ({
      team: user,
      text: `You’ve been assigned a new task: "${title}".`,
      task: task._id,
    }));

    await Notice.insertMany(notifications);

    res.status(200).json({ status: true, task, message: "Task created successfully." });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};

// ✅ Duplicate a task
export const duplicateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ status: false, message: "Task not found." });

    const newTask = await Task.create({
      ...task.toObject(),
      title: task.title + " - Duplicate",
    });

    newTask.team = task.team;
    newTask.subTasks = task.subTasks;
    newTask.assets = task.assets;
    newTask.priority = task.priority;
    newTask.stage = task.stage;

    await newTask.save();

    const text = `New task has been assigned to you${
      task.team.length > 1 ? ` and ${task.team.length - 1} others.` : "."} Priority: ${task.priority}. Date: ${task.date.toDateString()}`;

    const notifications = task.team.map(user => ({
      team: user,
      text,
      task: newTask._id,
    }));

    await Notice.insertMany(notifications);

    res.status(200).json({ status: true, message: "Task duplicated successfully." });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};

// ✅ Add task activity
export const postTaskActivity = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.user;
    const { type, activity } = req.body;

    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ status: false, message: "Task not found." });

    task.activities.push({ type, activity, by: userId });
    await task.save();

    res.status(200).json({ status: true, message: "Activity posted successfully." });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};

// ✅ Dashboard stats
export const dashboardStatistics = async (req, res) => {
  try {
    const { userId, isAdmin } = req.user;

    const allTasks = isAdmin
      ? await Task.find({ isTrashed: false }).populate("team", "name role title email").sort({ _id: -1 })
      : await Task.find({ isTrashed: false, team: { $all: [userId] } }).populate("team", "name role title email").sort({ _id: -1 });

    const users = await User.find({ isActive: true }).select("name title role isAdmin createdAt").limit(10).sort({ _id: -1 });

    const groupTaskks = allTasks.reduce((result, task) => {
      const stage = task.stage;
      result[stage] = (result[stage] || 0) + 1;
      return result;
    }, {});

    const groupData = Object.entries(
      allTasks.reduce((result, task) => {
        result[task.priority] = (result[task.priority] || 0) + 1;
        return result;
      }, {})
    ).map(([name, total]) => ({ name, total }));

    res.status(200).json({
      status: true,
      message: "Successfully",
      totalTasks: allTasks.length,
      last10Task: allTasks.slice(0, 10),
      users: isAdmin ? users : [],
      tasks: groupTaskks,
      graphData: groupData,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};

// ✅ Get all tasks
export const getTasks = async (req, res) => {
  try {
    const { stage, isTrashed } = req.query;

    const query = {};
    if (stage) query.stage = stage;
    query.isTrashed = isTrashed === "true";

    const tasks = await Task.find(query).populate("team", "name title email").sort({ _id: -1 });

    res.status(200).json({ status: true, tasks });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};

// ✅ Get single task
export const getTask = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findById(id)
      .populate("team", "name title role email")
      .populate("activities.by", "name");

    if (!task) return res.status(404).json({ status: false, message: "Task not found." });

    res.status(200).json({ status: true, task });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};

// ✅ Create subtask
export const createSubTask = async (req, res) => {
  try {
    const { title, tag, date } = req.body;
    const { id } = req.params;

    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ status: false, message: "Task not found." });

    task.subTasks.push({ title, tag, date });
    await task.save();

    res.status(200).json({ status: true, message: "SubTask added successfully." });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};

// ✅ Update task
export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, date, team, stage, priority, assets } = req.body;

    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ status: false, message: "Task not found." });

    task.title = title;
    task.date = date;
    task.priority = priority.toLowerCase();
    task.assets = assets;
    task.stage = stage.toLowerCase();
    task.team = team;

    await task.save();

    res.status(200).json({ status: true, message: "Task updated successfully." });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};

// ✅ Trash a task
export const trashTask = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ status: false, message: "Task not found." });

    task.isTrashed = true;
    await task.save();

    res.status(200).json({ status: true, message: `Task trashed successfully.` });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};

// ✅ Delete or Restore task(s)
export const deleteRestoreTask = async (req, res) => {
  const { id } = req.params;
  const rawAction = req.query.actionType;
  const actionType = rawAction?.toLowerCase().trim();

  console.log("🧩 Raw actionType from query:", rawAction);
  console.log("🔍 Cleaned actionType:", actionType);

  if (!id || !actionType) {
    return res.status(400).json({
      status: false,
      message: "Missing task ID or actionType.",
    });
  }

  try {
    let updatedTask;

    switch (actionType) {
      case "trash":
        updatedTask = await Task.findByIdAndUpdate(
          id,
          { isTrashed: true },
          { new: true }
        );
        return res.status(200).json({
          status: true,
          message: "Task trashed successfully.",
          data: updatedTask,
        });

      case "restore":
        updatedTask = await Task.findByIdAndUpdate(
          id,
          { isTrashed: false },
          { new: true }
        );
        return res.status(200).json({
          status: true,
          message: "Task restored successfully.",
          data: updatedTask,
        });

      default:
        return res.status(400).json({
          status: false,
          message: "Invalid actionType.",
        });
    }
  } catch (error) {
    console.error("❌ Error in deleteRestoreTask:", error);
    return res.status(500).json({
      status: false,
      message: "Server error.",
    });
  }
};

// ✅ Restore all tasks
export const restoreAllTasks = async (req, res) => {
  try {
    // Update all trashed tasks to restore them
    const updatedTasks = await Task.updateMany(
      { isTrashed: true },  // Condition to find trashed tasks
      { $set: { isTrashed: false } }  // Update the isTrashed field to false (restore)
    );

    if (updatedTasks.nModified === 0) {
      return res.status(404).json({ status: false, message: "No tasks found to restore." });
    }

    res.status(200).json({ status: true, message: "All tasks restored successfully." });
  } catch (error) {
    console.error("❌ Error in restoreAllTasks:", error);
    return res.status(500).json({ status: false, message: "Server error." });
  }
};

// ✅ Get trashed tasks
export const getTrashedTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ isTrashed: true }).sort({ updatedAt: -1 });
    res.status(200).json({ status: true, tasks });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};
// ✅ Permanently delete a single task
export const permanentlyDeleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({ status: false, message: "Task not found." });
    }

    if (!task.isTrashed) {
      return res.status(400).json({ status: false, message: "Task must be trashed before permanent deletion." });
    }

    await Task.findByIdAndDelete(id);
    await Notice.deleteMany({ task: id });

    res.status(200).json({ status: true, message: "Task permanently deleted." });
  } catch (error) {
    console.error("❌ Error in permanentlyDeleteTask:", error);
    return res.status(500).json({ status: false, message: "Server error." });
  }
};

// ✅ Permanently delete all trashed tasks
export const permanentlyDeleteAllTasks = async (req, res) => {
  try {
    const trashedTasks = await Task.find({ isTrashed: true });

    if (trashedTasks.length === 0) {
      return res.status(404).json({ status: false, message: "No trashed tasks to delete." });
    }

    const trashedTaskIds = trashedTasks.map(task => task._id);

    await Task.deleteMany({ _id: { $in: trashedTaskIds } });
    await Notice.deleteMany({ task: { $in: trashedTaskIds } });

    res.status(200).json({ status: true, message: "All trashed tasks permanently deleted." });
  } catch (error) {
    console.error("❌ Error in permanentlyDeleteAllTasks:", error);
    return res.status(500).json({ status: false, message: "Server error." });
  }
};
