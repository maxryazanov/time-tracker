document.addEventListener("DOMContentLoaded", () => {
    const taskList = document.getElementById("task-list");
    const addTaskButton = document.getElementById("add-task");
    const taskNameInput = document.getElementById("task-name");
  
    // Load tasks from localStorage
    const loadTasks = () => {
      const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
      tasks.forEach((task) => addTaskToDOM(task));
    };
  
    // Save tasks to localStorage
    const saveTasks = (tasks) => {
      localStorage.setItem("tasks", JSON.stringify(tasks));
    };
  
    // Get tasks from localStorage
    const getTasks = () => JSON.parse(localStorage.getItem("tasks")) || [];
  
    // Add a task to the DOM
    const addTaskToDOM = (task) => {
      const taskItem = document.createElement("li");
      taskItem.className = "task-item";
  
      const taskLabel = document.createElement("span");
      taskLabel.textContent = task.name;
  
      const timeDisplay = document.createElement("span");
      timeDisplay.className = "time-display";
      timeDisplay.textContent = formatTime(task.elapsedTime);
  
      const trackButton = document.createElement("button");
      trackButton.textContent = task.isRunning ? "Стоп" : "Старт";
      trackButton.className = "track-button";
  
      const deleteButton = document.createElement("button");
      deleteButton.textContent = "Удалить";
      deleteButton.className = "delete-button";
  
      let startTime = task.isRunning ? Date.now() - task.elapsedTime : null;
      let elapsedTime = task.elapsedTime;
      let interval = null;
  
      const updateDisplay = () => {
        if (startTime) {
          const currentElapsedTime = Date.now() - startTime;
          timeDisplay.textContent = formatTime(elapsedTime + currentElapsedTime);
        } else {
          timeDisplay.textContent = formatTime(elapsedTime);
        }
      };
  
      const startInterval = () => {
        if (!interval) {
          interval = setInterval(updateDisplay, 1000);
        }
      };
  
      const stopInterval = () => {
        if (interval) {
          clearInterval(interval);
          interval = null;
        }
      };
  
      trackButton.addEventListener("click", () => {
        const tasks = getTasks();
        const currentTask = tasks.find((t) => t.id === task.id);
  
        if (trackButton.textContent === "Старт") {
          startTime = Date.now();
          trackButton.textContent = "Стоп";
          currentTask.isRunning = true;
          startInterval();
        } else {
          elapsedTime += Date.now() - startTime;
          startTime = null;
          trackButton.textContent = "Старт";
          currentTask.isRunning = false;
          currentTask.elapsedTime = elapsedTime;
          stopInterval();
          saveTasks(tasks);
        }
      });
  
      deleteButton.addEventListener("click", () => {
        let tasks = getTasks();
        tasks = tasks.filter((t) => t.id !== task.id);
        saveTasks(tasks);
        taskItem.remove();
        stopInterval();
      });
  
      taskItem.appendChild(taskLabel);
      taskItem.appendChild(timeDisplay);
      taskItem.appendChild(trackButton);
      taskItem.appendChild(deleteButton);
      taskList.appendChild(taskItem);
  
      if (task.isRunning) {
        startInterval();
      }
    };
  
    // Format time in HH:MM:SS
    const formatTime = (milliseconds) => {
      const totalSeconds = Math.floor(milliseconds / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      return `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    };
  
    // Add a new task
    addTaskButton.addEventListener("click", () => {
      const taskName = taskNameInput.value.trim();
      if (taskName === "") return;
  
      const tasks = getTasks();
      const newTask = {
        id: Date.now(),
        name: taskName,
        isRunning: false,
        elapsedTime: 0,
      };
  
      tasks.push(newTask);
      saveTasks(tasks);
      addTaskToDOM(newTask);
  
      taskNameInput.value = "";
    });
  
    // Initialize tasks
    loadTasks();
  });
  