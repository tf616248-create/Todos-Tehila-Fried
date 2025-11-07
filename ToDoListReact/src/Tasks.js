import React, { useEffect, useState } from "react";
import { api } from "./service";
import { useNavigate } from "react-router-dom";

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const navigate = useNavigate();

  const loadTasks = async () => {
    try {
      const data = await api.getTasks();
      if (!data) return; // אם אין token, כבר הפנה לעמוד login
      setTasks(data);
    } catch (err) {
      console.error(err);
      alert("Failed to load tasks. You might need to login.");
    }
  };

  const handleAddTask = async () => {
    if (!newTask) return;
    try {
      await api.addTask(newTask);
      setNewTask("");
      loadTasks();
    } catch (err) {
      console.error(err);
      alert("Failed to add task.");
    }
  };
  const toggleComplete = async (id, currentStatus) => {
    try {
      await api.setCompleted(id, !currentStatus);
      await loadTasks(); // Refresh the tasks list
    } catch (error) {
      console.error("Error updating task status:", error);
      alert("Failed to update task status");
    }
  };

  useEffect(() => {
    // בדיקה אם יש token
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    loadTasks();
  }, [navigate]);

  return (
    <div>
      <h2>Tasks</h2>
      <input
        placeholder="New task"
        value={newTask}
        onChange={(e) => setNewTask(e.target.value)}
      />
      <button onClick={handleAddTask}>Add Task</button>
      <ul style={{ listStyle: 'none', padding: 0 }}>
  {tasks.map((task) => (
    <li 
      key={task.id} 
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        margin: '5px 0',
        textDecoration: task.isComplete ? 'line-through' : 'none'
      }}
    >
      <input
        type="checkbox"
        checked={task.isComplete || false}
        onChange={() => toggleComplete(task.id, task.isComplete)}
        style={{ marginRight: '10px' }}
      />
      {task.name}
    </li>
  ))}
</ul>    </div>
  );
}
