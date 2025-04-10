import React from "react";

const STAGE_COLUMNS = ["todo", "in progress", "completed"];

const getStageClass = (stage) => {
  switch (stage) {
    case "todo":
      return "bg-blue-100";
    case "in progress":
      return "bg-yellow-100";
    case "completed":
      return "bg-green-100";
    default:
      return "bg-gray-100";
  }
};

const BoardView = ({ tasks = [] }) => {
  const groupedTasks = STAGE_COLUMNS.map((stage) => ({
    stage,
    items: tasks.filter((task) => task.stage?.toLowerCase() === stage),
  }));

  return (
    <div className="flex gap-4 w-full overflow-x-auto pb-4">
      {groupedTasks.map(({ stage, items }) => (
        <div
          key={stage}
          className="min-w-[300px] flex-1 bg-gray-100 rounded-lg shadow p-4"
        >
          <h2 className="text-lg font-semibold capitalize mb-4">
            {stage.replace(/-/g, " ")}
          </h2>
          <div className="flex flex-col gap-3">
            {items.map((task) => (
              <div
                key={task._id}
                className={`p-4 rounded-lg shadow-md border border-gray-200 ${getStageClass(task.stage)}`}
              >
                <h3 className="text-base font-medium">{task.title}</h3>
                <p className="text-sm text-gray-600">
                  {task.description || "No description"}
                </p>
                <div className="text-xs mt-2 font-medium">
                  Priority:{" "}
                  <span className="italic">{task.priority || "Normal"}</span>
                </div>
              </div>
            ))}
            {items.length === 0 && (
              <p className="text-sm italic text-gray-500">No tasks</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default BoardView;
