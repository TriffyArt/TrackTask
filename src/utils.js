export function getTasksFromStorage() {
  const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
  return tasks;
}
