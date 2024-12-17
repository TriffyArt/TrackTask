$(document).ready(function () {
  // Task Structure: title, description, priority, estimatedTime, startTime, done, elapsedTime, isRunning

  // Load tasks from localStorage and render them
  function loadTasks() {
    const tasks = getTasksFromStorage();
    renderTasks(tasks);
  }

  // Save tasks to localStorage
  function saveTasks(tasks) {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }

  // Retrieve tasks from localStorage
  function getTasksFromStorage() {
    return JSON.parse(localStorage.getItem("tasks")) || [];
  }

  // Render tasks in the UI
  function renderTasks(tasks) {
    const taskList = $("#task-list");
    taskList.empty();
    tasks.forEach((task, index) => {
      displayTask(task, index);
    });
  }

  // Display a single task
  function displayTask(task, index) {
    const readableStartTime = formatReadableTime(task.startTime); // Format readable time
    const taskDiv = $(`  
      <div class="task ${task.done ? "done-task" : ""}" data-index="${index}">
        <div class="task-header">
          <input type="checkbox" class="mark-done" ${task.done ? "checked" : ""} />
          <span class="task-title ${task.done ? "line-through" : ""}"><strong>${task.title}</strong></span>
          <div>
            <button class="edit-task">Edit</button>
            <button class="remove-task">Remove</button>
          </div>
        </div>
        <div class="task-details"><span>Description:</span> ${task.description}</div>
        <div class="task-details"><span>Priority:</span> ${task.priority}</div>
        <div class="task-details"><span>Estimated Time:</span> ${task.estimatedTime}</div>
        <div class="task-details"><span>Start Time:</span> ${readableStartTime}</div>
        <div class="task-timer">
          <span class="elapsed-time">${formatTime(task.elapsedTime || 0)}</span>
          <button class="start-stop-timer">${task.isRunning ? "Stop" : "Start"}</button>
        </div>
      </div>
    `);

    // Attach event listeners for task actions
    taskDiv.find(".mark-done").on("change", () => toggleTaskDone(index));
    taskDiv.find(".edit-task").on("click", () => openEditTaskUI(index, taskDiv));
    taskDiv.find(".remove-task").on("click", () => removeTask(index));
    taskDiv.find(".start-stop-timer").on("click", () => toggleTimer(index));

    // Append to task list
    $("#task-list").append(taskDiv);

    // Restart any active timers
    if (task.isRunning) {
      task.timerId = setInterval(() => {
        const currentElapsedTime = task.elapsedTime + (Date.now() - task.startTime);
        taskDiv.find(".elapsed-time").text(formatTime(currentElapsedTime));
      }, 1000);
    }
  }

  // Format time in HH:MM:SS
  function formatTime(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, "0");
    const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, "0");
    const seconds = (totalSeconds % 60).toString().padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  }

  // Format start time into a readable format
  function formatReadableTime(datetime) {
    const date = new Date(datetime);
    return date.toLocaleString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  // Add a new task
  $("#add-task").on("click", function () {
    const title = $("#task-title").val().trim();
    const description = $("#task-description").val().trim();
    const priority = $("#task-priority").val();
    const estimatedTime = $("#estimated-time").val().trim();
    const startTime = new Date($("#start-time").val()).toISOString(); // Store ISO time format

    if (!title || !description || !priority || !estimatedTime || !startTime) {
      alert("All fields are required!");
      return;
    }

    const newTask = {
      title,
      description,
      priority,
      estimatedTime,
      startTime,
      done: false,
      elapsedTime: 0,
      isRunning: false,
    };

    scheduleTask(newTask); // Correctly call scheduleTask here
    clearInputs(); // Clear inputs after scheduling
  });

  // Clear input fields
  function clearInputs() {
    $("#task-title").val("");
    $("#task-description").val("");
    $("#estimated-time").val("");
    $("#start-time").val("");
  }

  // Toggle task completion
  function toggleTaskDone(index) {
    const tasks = getTasksFromStorage();
    tasks[index].done = !tasks[index].done;
    saveTasks(tasks);
    loadTasks();
  }

  // Toggle the stopwatch for a task
  function toggleTimer(index) {
    const tasks = getTasksFromStorage();
    const task = tasks[index];

    if (task.isRunning) {
      clearInterval(task.timerId);
      task.elapsedTime += Date.now() - task.startTime;
      task.isRunning = false;
      task.timerId = null;
      $(`.task[data-index="${index}"] .start-stop-timer`).text("Start");
    } else {
      task.startTime = Date.now();
      task.isRunning = true;
      task.timerId = setInterval(() => {
        const currentElapsedTime = task.elapsedTime + (Date.now() - task.startTime);
        $(`.task[data-index="${index}"] .elapsed-time`).text(formatTime(currentElapsedTime));
      }, 1000);
      $(`.task[data-index="${index}"] .start-stop-timer`).text("Stop");
    }

    tasks[index] = task;
    saveTasks(tasks);
  }

  // Open edit UI for a task
  function openEditTaskUI(index, taskDiv) {
    const tasks = getTasksFromStorage();
    const task = tasks[index];

    const editUI = $(`  
      <div class="edit-ui">
        <h1>Edit Task</h1>
        <label for="edit-title">Title</label>
        <input type="text" id="edit-title" value="${task.title}" />
        <label for="edit-description">Description</label>
        <textarea id="edit-description">${task.description}</textarea>
        <label for="edit-priority">Priority</label>
        <select id="edit-priority">
          <option value="high" ${task.priority === 'high' ? 'selected' : ''}>High</option>
          <option value="medium" ${task.priority === 'medium' ? 'selected' : ''}>Medium</option>
          <option value="low" ${task.priority === 'low' ? 'selected' : ''}>Low</option>
        </select>
        <label for="edit-estimated-time">Estimated Time</label>
        <input type="text" id="edit-estimated-time" value="${task.estimatedTime}" />
        <label for="edit-start-time">Start Time</label>
        <input type="datetime-local" id="edit-start-time" value="${new Date(task.startTime).toISOString().slice(0, 16)}" />
        <button id="save-edit">Save</button>
        <button id="cancel-edit">Cancel</button>
      </div>
    `);

    taskDiv.append(editUI);

    $("#save-edit").on("click", () => saveEditTask(index));
    $("#cancel-edit").on("click", () => editUI.remove());
  }

  // Save edited task
  function saveEditTask(index) {
    const tasks = getTasksFromStorage();
    const task = tasks[index];

    const newTitle = $("#edit-title").val();
    const newDescription = $("#edit-description").val();
    const newPriority = $("#edit-priority").val();
    const newEstimatedTime = $("#edit-estimated-time").val();
    const newStartTime = new Date($("#edit-start-time").val()).toISOString();

    if (newTitle) task.title = newTitle;
    if (newDescription) task.description = newDescription;
    if (newPriority) task.priority = newPriority;
    if (newEstimatedTime) task.estimatedTime = newEstimatedTime;
    if (newStartTime) task.startTime = newStartTime;

    tasks[index] = task;
    saveTasks(tasks);
    loadTasks();
  }

  // Remove a task
  function removeTask(index) {
    const tasks = getTasksFromStorage();
    const task = tasks[index];

    if (task.isRunning) {
      clearInterval(task.timerId);
    }

    tasks.splice(index, 1); // Remove the task
    saveTasks(tasks);
    loadTasks(); // Re-render task list
  }

  // Search for tasks
  $("#search-task").on("input", function () {
    const keyword = $(this).val().toLowerCase();
    const tasks = getTasksFromStorage();
    const filteredTasks = tasks.filter(task =>
      task.title.toLowerCase().includes(keyword) || task.description.toLowerCase().includes(keyword)
    );
    renderTasks(filteredTasks);
  });

  // Detect scheduling conflicts
  function detectConflicts(newTask) {
    const tasks = getTasksFromStorage();

    return tasks.some(task => {
      const taskStart = new Date(task.startTime).getTime();
      const taskEnd = taskStart + parseTimeToMs(task.estimatedTime);
      const newTaskStart = new Date(newTask.startTime).getTime();
      const newTaskEnd = newTaskStart + parseTimeToMs(newTask.estimatedTime);

      return (
        (newTaskStart >= taskStart && newTaskStart < taskEnd) || 
        (newTaskEnd > taskStart && newTaskEnd <= taskEnd) || 
        (newTaskStart <= taskStart && newTaskEnd >= taskEnd)
      );
    });
  }

  // Convert time in HH:MM format to milliseconds
  function parseTimeToMs(estimatedTime) {
    const [hours, minutes] = estimatedTime.split(":").map(Number);
    return (hours * 60 + minutes) * 60 * 1000; // Convert to milliseconds
  }

  // Schedule a task
  function scheduleTask(newTask) {
    if (detectConflicts(newTask)) {
      alert("Conflict detected. Please choose a new start time.");
      return;
    }

    const tasks = getTasksFromStorage();
    tasks.push(newTask);
    saveTasks(tasks);
    loadTasks();
  }

  // Initial load of tasks
  loadTasks();
});
