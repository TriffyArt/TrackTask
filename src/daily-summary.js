import { getTasksFromStorage } from './utils.js';

$(document).ready(() => {
  function generateDailySummary() {
    const tasks = getTasksFromStorage();
    const grouped = tasks.reduce((acc, task) => {
      acc[task.date] = acc[task.date] || { completed: 0, pending: 0, elapsedTime: 0 };
      acc[task.date].completed += task.done ? 1 : 0;
      acc[task.date].pending += task.done ? 0 : 1;
      acc[task.date].elapsedTime += task.elapsedTime || 0;
      return acc;
    }, {});

    const sortedDates = Object.keys(grouped).sort((a, b) => new Date(a) - new Date(b));
    const summaryDiv = $("#daily-summary");

    sortedDates.forEach((date) => {
      const summary = grouped[date];
      summaryDiv.append(`
        <div class="summary-item">
          <h3>${date}</h3>
          <p>Completed: ${summary.completed}</p>
          <p>Pending: ${summary.pending}</p>
          <p>Elapsed Time: ${formatTime(summary.elapsedTime)}</p>
        </div>
      `);
    });
  }

  function formatTime(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
    const seconds = (totalSeconds % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  }

  generateDailySummary();

  $("#back-to-main").on("click", () => {
    window.location.href = "index.html";
  });
});
