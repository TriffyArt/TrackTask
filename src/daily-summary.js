import { getTasksFromStorage } from './utils.js';

$(document).ready(function () {
  // Function to generate daily summary chart
  function generateDailySummaryChart() {
    const tasks = getTasksFromStorage();
    
    // Filter tasks for today
    const today = new Date().toISOString().split('T')[0]; // Get today's date (YYYY-MM-DD)
    const todayTasks = tasks.filter(task => new Date(task.startTime).toISOString().split('T')[0] === today);

    if (todayTasks.length === 0) {
      $('#daily-summary').html('<p>No tasks for today.</p>');
      return;
    }
    
    // Count the number of completed and pending tasks
    const completedTasks = todayTasks.filter(task => task.done).length;
    const pendingTasks = todayTasks.length - completedTasks;

    // Calculate total time spent (in milliseconds) for today's tasks
    const totalElapsedTime = todayTasks.reduce((total, task) => {
      const endTime = task.done ? task.elapsedTime + (Date.now() - task.startTime) : task.elapsedTime;
      return total + endTime;
    }, 0);

    const totalElapsedTimeFormatted = formatTime(totalElapsedTime); // Format total time into HH:MM:SS

    // Prepare data for the chart
    const data = {
      labels: ['Completed Tasks', 'Pending Tasks'],
      datasets: [{
        label: 'Task Status',
        data: [completedTasks, pendingTasks],
        backgroundColor: ['#4CAF50', '#FF9800'],
        hoverBackgroundColor: ['#45a049', '#e68929'],
      }]
    };

    // Configure the chart
    const config = {
      type: 'pie',
      data: data,
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
          tooltip: {
            callbacks: {
              label: function (tooltipItem) {
                if (tooltipItem.label === 'Completed Tasks') {
                  return `Completed: ${completedTasks}`;
                } else if (tooltipItem.label === 'Pending Tasks') {
                  return `Pending: ${pendingTasks}`;
                }
                return tooltipItem.label;
              }
            }
          }
        }
      }
    };

    // Create the chart
    const ctx = $('#daily-summary-chart')[0].getContext('2d');
    new Chart(ctx, config);

    // Display total time spent
    $('#total-time-spent').text(`Total Time Spent Today: ${totalElapsedTimeFormatted}`);
  }

  // Format elapsed time (in milliseconds) into HH:MM:SS
  function formatTime(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, "0");
    const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, "0");
    const seconds = (totalSeconds % 60).toString().padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  }

  // Call the generateDailySummaryChart function when the page is ready
  generateDailySummaryChart();
});
