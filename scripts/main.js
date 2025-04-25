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
      taskLabel.href = task.link;
      taskLabel.target = "_blank";
    }

    const timeDisplay = document.createElement("span");
    timeDisplay.className = "time-display";
    timeDisplay.textContent = formatTime(task.elapsedTime);

    const infoButton = document.createElement("button");
    infoButton.textContent = "Info";
    infoButton.className = "info-button";
    infoButton.onclick = function () {
      Swal.fire({
        title: `Task: ${task.name}`,
        html: `
          Created date: ${task.id}<br />
          Elapsed Time: ${formatTime(task.elapsedTime)}<br />
          Link: <a href="${task.link}" target="_blank">${task.link}</a><br /><br />
          <button id="copyTaskLink" style="margin-top:10px;padding:6px 12px;">📋 Copy name and link</button>
          <div id="copiedMessage" style="margin-top:10px; color:green; display:none;">Copied!</div>
        `,
        icon: 'info',
        confirmButtonText: 'Close',
        didOpen: () => {
          const copyButton = document.getElementById('copyTaskLink');
          const copiedMsg = document.getElementById('copiedMessage');
    
          copyButton.addEventListener('click', function () {
            const slackFormatted = `${task.name} (${task.link})`;
            navigator.clipboard.writeText(slackFormatted).then(() => {
              copiedMsg.style.display = 'block';
              copiedMsg.textContent = 'Copied!';
              
              // Hide messages after 2 seconds
              setTimeout(() => {
                copiedMsg.style.display = 'none';
              }, 2000);
            }).catch(err => {
              copiedMsg.style.color = 'red';
              copiedMsg.textContent = 'Error copying!';
              copiedMsg.style.display = 'block';
            });
          });
        }
      });    
    };


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
    const taskLink = linkInput.value.trim();
    const nowDate = new Date();
    const taskDate = nowDate.toISOString().slice(0, 16).replace('T', ' ');
    if (taskName === "") return;

    const tasks = getTasks();
    const newTask = {
      id: taskDate,
      name: taskName,
      link: taskLink,
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

// let notes = JSON.parse(localStorage.getItem('notes')) || [];

//         function addNote() {
//             const text = document.getElementById('noteText').value;
//             const category = document.getElementById('noteCategory').value;
//             const date = new Date().toLocaleString();
//             if (!text) return;
//             notes.push({ text, category, date });
//             localStorage.setItem('notes', JSON.stringify(notes));
//             document.getElementById('noteText').value = '';
//             renderNotes();
//         }

//         function deleteNote(index) {
//             notes.splice(index, 1);
//             localStorage.setItem('notes', JSON.stringify(notes));
//             renderNotes();
//         }

//         function renderNotes(filter = 'all') {
//             const notesList = document.getElementById('notesList');
//             notesList.innerHTML = '';
//             notes.filter((n, i) => filter === 'all' || n.category === filter)
//                  .forEach((n, i) => {
//                      const div = document.createElement('div');
//                      div.className = `note ${n.category}`;
//                      div.innerHTML = `
//                          <p>${n.text}</p>
//                          <span class="note-date">${n.date}</span>
//                          <button class="delete-btn" onclick="deleteNote(${i})">&#10006;</button>
//                      `;
//                      notesList.appendChild(div);
//                  });
//         }

//         function filterNotes(category) {
//             renderNotes(category);
//         }

//         renderNotes();



// Service Worker
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js")
      .then(() => console.log("SW registered!"))
      .catch(err => console.error("SW Error:", err));
}


let notes = JSON.parse(localStorage.getItem('notes')) || [];
let sortOrder = 'desc'; // 'desc' - новые сверху, 'asc' - старые сверху

function addNote() {
    const text = document.getElementById('noteText').value;
    const category = document.getElementById('noteCategory').value;
    const date = new Date().toISOString(); // ISO-формат для точной сортировки
    if (!text) return;
    notes.push({ text, category, date });
    localStorage.setItem('notes', JSON.stringify(notes));
    document.getElementById('noteText').value = '';
    renderNotes();
}

function deleteNote(index) {
    notes.splice(index, 1);
    localStorage.setItem('notes', JSON.stringify(notes));
    renderNotes();
}

function toggleSortOrder() {
    sortOrder = sortOrder === 'desc' ? 'asc' : 'desc';
    document.getElementById('sortOrder').textContent = sortOrder === 'desc' ? 'Newest' : 'Oldest';
    renderNotes();
}

function renderNotes(filter = 'all') {
    const notesList = document.getElementById('notesList');
    notesList.innerHTML = '';

    // Сортируем по дате
    const sortedNotes = [...notes].sort((a, b) => 
        sortOrder === 'desc' ? new Date(b.date) - new Date(a.date) : new Date(a.date) - new Date(b.date)
    );

    sortedNotes.filter(n => filter === 'all' || n.category === filter)
        .forEach((n, i) => {
            const div = document.createElement('div');
            div.className = `note ${n.category}`;
            div.innerHTML = `
                <p>${n.text}</p>
                <span class="note-date">${new Date(n.date).toLocaleString()}</span>
                <button class="delete-btn" onclick="deleteNote(${notes.indexOf(n)})">&#10006;</button>
            `;
            notesList.appendChild(div);
        });
}

function filterNotes(category) {
    renderNotes(category);
}

renderNotes();
