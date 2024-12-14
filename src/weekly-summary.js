import { getTasksFromStorage } from './utils.js';

$(document).ready(() => {
  function generateWeeklySummary() {
    const tasks = getTasksFromStorage();
    const grouped = tasks.reduce((acc, task) => {
      const week = getWeek(task.date);
      acc[week] = acc[week] || { completed: 0, pending: 0, elapsedTime: 0 };
      acc[week].completed += task.done ? 1 : 0;
      acc[week].pending += task.done ? 0 : 1;
      acc[week].elapsedTime += task.elapsedTime || 0;
      return acc;
    }, {});

    const sortedWeeks = Object.keys(grouped).sort();
    const summaryDiv = $("#weekly-summary");

    sortedWeeks.forEach((week) => {
      const summary = grouped[week];
      summaryDiv.append(`
        <div class="summary-item">
          <h3>Week ${week}</h3>
          <p>Completed: ${summary.completed}</p>
          <p>Pending: ${summary.pending}</p>
          <p>Elapsed Time: ${formatTime(summary.elapsedTime)}</p>
        </div>
      `);
    });
  }

  function getWeek(date) {
    const current = new Date(date);
    const firstDayOfYear = new Date(current.getFullYear(), 0, 1);
    const pastDaysOfYear = (current - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  }

  function formatTime(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
    const seconds = (totalSeconds % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  }

  generateWeeklySummary();

  $("#back-to-main").on("click", () => {
    window.location.href = "index.html";
  });
});
