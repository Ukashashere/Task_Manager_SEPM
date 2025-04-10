import React, { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import Modal from "./TaskModal"; // We'll define this below

const STATUS_COLUMNS = ["todo", "in progress", "completed"];

const getStatusClass = (status) => {
  switch (status) {
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

const BoardView = ({ tasks = [], onStatusChange, onEdit }) => {
  const [selectedTask, setSelectedTask] = useState(null);

  const groupedTasks = STATUS_COLUMNS.map((status) => ({
    status,
    items: tasks.filter((task) => task.stage?.toLowerCase() === status),
  }));

  const handleDragEnd = (result) => {
    const { source, destination, draggableId } = result;
    if (!destination || source.droppableId === destination.droppableId) return;

    const taskId = draggableId;
    const newStage = destination.droppableId;

    if (onStatusChange) {
      onStatusChange(taskId, newStage);
    }
  };

  return (
    <>
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-4 w-full overflow-x-auto pb-4">
          {groupedTasks.map(({ status, items }) => (
            <Droppable droppableId={status} key={status}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="min-w-[300px] flex-1 bg-gray-100 rounded-lg shadow p-4"
                >
                  <h2 className="text-lg font-semibold capitalize mb-4">
                    {status}
                  </h2>
                  <div className="flex flex-col gap-3">
                    {items.map((task, index) => (
                      <Draggable
                        key={task._id}
                        draggableId={task._id}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            ref={provided.innerRef}
                            className={`p-4 rounded-lg shadow-md border border-gray-200 cursor-pointer ${getStatusClass(task.stage)}`}
                            onClick={() => setSelectedTask(task)}
                          >
                            <h3 className="text-base font-medium">
                              {task.title}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {task.description || "No description"}
                            </p>
                            <div className="text-xs mt-2 font-medium">
                              Priority:{" "}
                              <span className="italic">
                                {task.priority || "Normal"}
                              </span>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                    {items.length === 0 && (
                      <p className="text-sm italic text-gray-500">No tasks</p>
                    )}
                  </div>
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>

      {selectedTask && (
        <Modal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onSave={onEdit}
        />
      )}
    </>
  );
};

export default BoardView;
