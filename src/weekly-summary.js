import { getTasksFromStorage } from './utils.js';

$(document).ready(() => {
  function generateWeeklySummary() {
    const tasks = getTasksFromStorage();
    const grouped = tasks.reduce((acc, task) => {
      const week = getWeek(task.startTime); // Use startTime to categorize by week
      acc[week] = acc[week] || { completed: 0, pending: 0, elapsedTime: 0 };
      acc[week].completed += task.done ? 1 : 0;
      acc[week].pending += task.done ? 0 : 1;
      acc[week].elapsedTime += task.elapsedTime || 0;
      return acc;
    }, {});

    const sortedWeeks = Object.keys(grouped).sort();
    const summaryDiv = $("#weekly-summary");

    const labels = [];
    const completedData = [];
    const pendingData = [];
    const elapsedTimeData = [];

    sortedWeeks.forEach((week) => {
      const summary = grouped[week];
      labels.push(`Week ${week}`);
      completedData.push(summary.completed);
      pendingData.push(summary.pending);
      elapsedTimeData.push(summary.elapsedTime);
      summaryDiv.append(`
        <div class="summary-item">
          <h3>Week ${week}</h3>
          <p>Completed: ${summary.completed}</p>
          <p>Pending: ${summary.pending}</p>
          <p>Elapsed Time: ${formatTime(summary.elapsedTime)}</p>
        </div>
      `);
    });

    // Create the chart
    const ctx = document.getElementById("weekly-summary-chart").getContext("2d");
    new Chart(ctx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Completed",
            data: completedData,
            backgroundColor: "rgba(0, 123, 255, 0.5)",
            borderColor: "rgba(0, 123, 255, 1)",
            borderWidth: 1,
          },
          {
            label: "Pending",
            data: pendingData,
            backgroundColor: "rgba(220, 53, 69, 0.5)",
            borderColor: "rgba(220, 53, 69, 1)",
            borderWidth: 1,
          },
          {
            label: "Elapsed Time",
            data: elapsedTimeData,
            backgroundColor: "rgba(40, 167, 69, 0.5)",
            borderColor: "rgba(40, 167, 69, 1)",
            borderWidth: 1,
            yAxisID: "y-axis-time", // Use a different y-axis for time
          },
        ],
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
          },
          "y-axis-time": {
            type: "linear",
            position: "right",
            beginAtZero: true,
            ticks: {
              callback: function (value) {
                return formatTime(value); // Format elapsed time on the right axis
              },
            },
          },
        },
      },
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
