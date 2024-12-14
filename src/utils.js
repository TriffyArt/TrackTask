export function getTasksFromStorage() {
    return JSON.parse(localStorage.getItem("tasks")) || [];
  }
  