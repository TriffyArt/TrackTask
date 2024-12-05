

$(document).ready(function () {

  function loadTasks() {
    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    $("#task-list").empty(); //clearing current list
    tasks.forEach((task, index) => displayTask(task, index));
  }

  function saveTasks(tasks) {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }
  
  function renderTasks(filteredTasks) {
    $("#task-list").empty(); // Clear existing tasks

    filteredTasks.forEach((task, index) => {
        displayTask(task, index, filteredTasks);
    });
}

  function filterTasks() {
    const selectedPriority = $("#priorityFilter").val()

    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    let filteredTasks = tasks;

    if (selectedPriority !== "all") {
        filteredTasks = tasks.filter(task => task.priority === selectedPriority);
    }

    // Sort tasks by priority
    const priorityOrder = { high: 1, medium: 2, low: 3 };
    filteredTasks.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    renderTasks(filteredTasks);

}


  function displayTask(task, index, filteredTasks) {
    const taskDiv = $(`
           <div class="task" data-index="${index}">
              <div class="task-header">
                  <span><strong>${task.title}</strong></span>
                  <div>
                      <button class="edit-task">Edit</button>
                      <button class="remove-task">Remove</button>
                  </div>
              </div>
  
              <div class="task-details">${task.details}</div>
              <div class="task-details">${task.date}</div>
              <div class="task-details">${task.priority}</div>
          </div>
      `);

    taskDiv.find(".edit-task").on("click", () => editTask(index));
    taskDiv.find(".remove-task").on("click", () => removeTask(index));

    $("#task-list").append(taskDiv);
  }

  $("#priorityFilter").on("change", filterTasks);




  //add task @Triffy
  $("#add-task").on("click", function () {
    const title = $("#task-title").val().trim();
    const details = $("#task-details").val().trim();
    const date = $("#Date").val();
    const priority = $("#priority").val();

    if (!title || !details || !date) {
      alert("All fields are required!");
      return;
    }

    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    tasks.push({ title, details, date, priority });
    saveTasks(tasks);
    loadTasks();
    //empty
    $("#task-title").val("");
    $("#task-details").val("");
    $("#Date").val("");
    $("#priority").val("");
  });

  //edit task @Triffy
  function editTask(index) {
    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    const task = tasks[index];

    const newTitle = prompt("Edit task title:", task.title);
    const newDetails = prompt("Edit task details:", task.details);

    if (newTitle !== null && newTitle.trim() !== "") {
      task.title = newTitle.trim();
    }
    if (newDetails !== null && newDetails.trim() !== "") {
      task.details = newDetails.trim();
    }

    tasks[index] = task;
    saveTasks(tasks);
    loadTasks();
  }

  // Remove task @Triffy
  function removeTask(index) {
    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    tasks.splice(index, 1);
    saveTasks(tasks);
    loadTasks();
  }


  loadTasks();

});

