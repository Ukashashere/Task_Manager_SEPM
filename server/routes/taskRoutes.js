import express from "express";
import {
  createSubTask,
  createTask,
  dashboardStatistics,
  deleteRestoreTask,
  duplicateTask,
  getTask,
  getTasks,
  getTrashedTasks,
  postTaskActivity,
  trashTask,
  updateTask,
  
} from "../controllers/taskController.js";
import { isAdminRoute, protectRoute } from "../middlewares/authMiddlewave.js";

const router = express.Router();

router.post("/create", protectRoute, createTask);
router.post("/duplicate/:id", protectRoute, duplicateTask);
router.post("/activity/:id", protectRoute, postTaskActivity);

router.get("/dashboard", protectRoute, dashboardStatistics);
router.get("/", protectRoute, getTasks);
router.get("/trash", protectRoute, getTrashedTasks);
router.get("/:id", protectRoute, getTask);

router.put("/create-subtask/:id", protectRoute, isAdminRoute, createSubTask);
router.put("/trash/:id", protectRoute, trashTask);
router.put("/:id", protectRoute, updateTask);


router.delete(
  "/delete-restore/:id?",
  protectRoute,
  isAdminRoute,
  deleteRestoreTask
);


export default router;