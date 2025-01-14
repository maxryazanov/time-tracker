document.addEventListener("DOMContentLoaded", () => {
  const taskList = document.getElementById("task-list");
  const addTaskButton = document.getElementById("add-task");
  const taskNameInput = document.getElementById("task-name");
  const linkInput = document.getElementById("link");
  const checkLink = document.getElementById("checklink");

  // Initializing the state of a checkbox
  const isChecked = localStorage.getItem("checklinkChecked") === "true";
  checkLink.checked = isChecked;
  linkInput.style.display = isChecked ? "block" : "none";

  checkLink.addEventListener("change", function () {
    const isChecked = checkLink.checked;
    linkInput.style.display = isChecked ? "block" : "none";
    localStorage.setItem("checklinkChecked", isChecked);
  });

  // Loading tasks from localStorage
  const loadTasks = () => {
    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    tasks.forEach((task) => addTaskToDOM(task));
  };

  // Saving tasks to localStorage
  const saveTasks = (tasks) => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  };

  // Getting tasks from localStorage
  const getTasks = () => JSON.parse(localStorage.getItem("tasks")) || [];

  // Adding a task to the DOM
  const addTaskToDOM = (task) => {
    const taskItem = document.createElement("li");
    taskItem.className = "task-item";

    // Determine which element to create
    const taskLabel = checkLink.checked
      ? document.createElement("a")
      : document.createElement("span");

    taskLabel.textContent = task.name;
    taskLabel.className = "task-label";

    if (checkLink.checked) {
      taskLabel.href = `${linkInput.value}`;
      taskLabel.target = "_blank";
    }

    const timeDisplay = document.createElement("span");
    timeDisplay.className = "time-display";
    timeDisplay.textContent = formatTime(task.elapsedTime);

    const infoButton = document.createElement("button");
    infoButton.textContent = "Info";
    infoButton.onclick = function () {
      alert(
        `Task: ${task.name}\nElapsed Time: ${formatTime(
          task.elapsedTime
        )}\nLink: ${linkInput.value}`
      );
    };
    infoButton.className = "info-button";

    const trackButton = document.createElement("button");
    trackButton.textContent = task.isRunning ? "Stop" : "Start";
    trackButton.className = "track-button";

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
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

      if (trackButton.textContent === "Start") {
        startTime = Date.now();
        trackButton.textContent = "Stop";
        currentTask.isRunning = true;
        startInterval();
      } else {
        elapsedTime += Date.now() - startTime;
        startTime = null;
        trackButton.textContent = "Start";
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
    taskItem.appendChild(infoButton);
    taskItem.appendChild(trackButton);
    taskItem.appendChild(deleteButton);
    taskList.appendChild(taskItem);

    if (task.isRunning) {
      startInterval();
    }
  };

  // Formatting time in HH:MM:SS
  const formatTime = (milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  // Add new task
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
    linkInput.value = "";
  });

  document.querySelectorAll('.accordion-header').forEach(header => {
    header.addEventListener('click', () => {
        const content = header.nextElementSibling;
        const isActive = content.style.display === 'block';
        
        document.querySelectorAll('.accordion-content').forEach(item => item.style.display = 'none');
        
        if (!isActive) content.style.display = 'block';
    });
});

  // Initializing tasks
  loadTasks();
});
