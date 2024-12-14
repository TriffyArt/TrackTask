$(document).ready(function () {
  // Load tasks from localStorage and render them
  function loadTasks() {
    const tasks = getTasksFromStorage();
    tasks.sort(sortByPriorityAndDate);
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
    tasks.forEach((task, index) => displayTask(task, index));
  }

  // Filter tasks based on priority
  function filterTasks() {
    const selectedPriority = $("#priorityFilter").val();
    let tasks = getTasksFromStorage();

    if (selectedPriority !== "all") {
      tasks = tasks.filter((task) => task.priority === selectedPriority);
    }

    tasks.sort(sortByPriorityAndDate);
    renderTasks(tasks);
  }

  // Sort tasks by date and priority
  function sortByPriorityAndDate(a, b) {
    const priorityOrder = { high: 1, medium: 2, low: 3 };
    const dateDifference = new Date(a.date) - new Date(b.date);

    return dateDifference !== 0
      ? dateDifference
      : priorityOrder[a.priority] - priorityOrder[b.priority];
  }

  function groupTasksByDate() {
    const tasks = getTasksFromStorage();
  
    // Aggregate elapsed time for each date
    const groupedData = tasks.reduce((acc, task) => {
      if (!acc[task.date]) {
        acc[task.date] = 0; // Initialize elapsed time
      }
      acc[task.date] += task.elapsedTime / 3600000; // Convert ms to hours
      return acc;
    }, {});
  
    // Sort dates and prepare data for the chart
    const sortedDates = Object.keys(groupedData).sort((a, b) => new Date(a) - new Date(b));
    const elapsedTimes = sortedDates.map(date => groupedData[date]);
  
    return { dates: sortedDates, elapsedTimes };
  }
  

  // Display a single task
  function displayTask(task, index) {
    const today = new Date().setHours(0, 0, 0, 0);
    const taskDate = new Date(task.date).setHours(0, 0, 0, 0);

    const isOverdue = taskDate < today;

    const taskDiv = $(
      `<div class="task ${task.done ? "done-task" : ""}" data-index="${index}">
        <div class="task-header">
          <input type="checkbox" class="mark-done" ${task.done ? "checked" : ""} />
          <span class="task-title ${task.done ? "line-through" : isOverdue ? "red-text" : ""}"><strong>${task.title}</strong></span>
          <div>
            <button class="edit-task">Edit</button>
            <button class="remove-task">Remove</button>
          </div>
        </div>
        <div class="task-details"><span>Details:</span> ${task.details}</div>
        <div class="task-details"><span>Due Date:</span> ${task.date}</div>
        <div class="task-details"><span>Priority:</span> ${task.priority}</div>
        <div class="task-timer">
          <span class="elapsed-time">${formatTime(task.elapsedTime || 0)}</span>
          <button class="start-stop-timer">${task.isRunning ? "Stop" : "Start"}</button>
        </div>
      </div>`
    );

    taskDiv.find(".mark-done").on("change", () => toggleTaskDone(index));
    taskDiv.find(".edit-task").on("click", () => openEditTaskUI(index, taskDiv));
    taskDiv.find(".remove-task").on("click", () => removeTask(index));
    taskDiv.find(".start-stop-timer").on("click", () => toggleTimer(index));

    $("#task-list").append(taskDiv);
  }

  // Add a new task
  $("#add-task").on("click", function () {
    const title = $("#task-title").val().trim();
    const details = $("#task-details").val().trim();
    const date = $("#Date").val();
    const priority = $("#priority").val();

    if (!title || !details || !date || !priority) {
      showError("All fields are required!");
      return;
    }
//WARNING:: comment this if statement to add past dates for testinng only the code will not work as expected and will not function properly
    if (new Date(date) < new Date().setHours(0, 0, 0, 0)) {
      showError("Cannot add tasks for past dates!");
      return;
    }

    hideError();

    const tasks = getTasksFromStorage();
    tasks.push({ title, details, date, priority, done: false, elapsedTime: 0, isRunning: false });
    saveTasks(tasks);
    loadTasks();

    clearInputs();
  });

  // Open edit UI for a task
  function openEditTaskUI(index, taskDiv) {
    if (taskDiv.find(".edit-ui").length > 0) return;

    const tasks = getTasksFromStorage();
    const task = tasks[index];

    const editUI = $(
      `<div class="edit-ui">
        <h1 class="font-bold">Edit Title</h1>
        <input type="text" id="edit-title" value="${task.title}" class="edit-input" />
        <h1 class="font-bold">Edit Task</h1>
        <textarea id="edit-details" class="edit-input">${task.details}</textarea>
        <button id="save-edit">Save</button>
        <button id="cancel-edit">Cancel</button>
      </div>`
    );

    taskDiv.append(editUI);

    $("#save-edit").on("click", () => saveEditTask(index));
    $("#cancel-edit").on("click", () => editUI.remove());
  }

  // Save edited task
  function saveEditTask(index) {
    const tasks = getTasksFromStorage();
    const task = tasks[index];

    const newTitle = $("#edit-title").val().trim();
    const newDetails = $("#edit-details").val().trim();

    if (newTitle) task.title = newTitle;
    if (newDetails) task.details = newDetails;

    tasks[index] = task;
    saveTasks(tasks);
    loadTasks();
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
      clearInterval(task.timerInterval);
      task.elapsedTime = Date.now() - task.startTime; // Update elapsed time
      task.isRunning = false;
    } else {
      task.startTime = Date.now() - (task.elapsedTime || 0);
      task.timerInterval = setInterval(() => {
        task.elapsedTime = Date.now() - task.startTime; // Update elapsed time every second
        saveTasks(tasks);
        loadTasks();
      }, 1000);
      task.isRunning = true;
    }
  
    tasks[index] = task;
    saveTasks(tasks);
    loadTasks();
  }
  

  // Format time in HH:MM:SS
  function formatTime(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
    const seconds = (totalSeconds % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  }
  

  // Remove a task
  function removeTask(index) {
    const tasks = getTasksFromStorage();
    tasks.splice(index, 1);
    saveTasks(tasks);
    loadTasks();
  }

  // Show error message
  function showError(message) {
    $("#error-message").text(message).show();
  }

  // Hide error message
  function hideError() {
    $("#error-message").hide();
  }

  // Clear input fields
  function clearInputs() {
    $("#task-title").val("");
    $("#task-details").val("");
    $("#Date").val("");
    $("#priority").val("");
  }

  // Event listener for priority filter
  $("#priorityFilter").on("change", filterTasks);

  // Initial load of tasks
  loadTasks();
});
