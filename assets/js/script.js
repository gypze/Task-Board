// Retrieve tasks and nextId from localStorage
let taskList = JSON.parse(localStorage.getItem("tasks")) || [];
let nextId = JSON.parse(localStorage.getItem("nextId")) || 1;

// Function to generate a unique task id
function generateTaskId() {
  return nextId++;
}

// Function to create a task card
function createTaskCard(task) {
  return `
    <div class="card task-card mb-3" data-id="${task.id}">
      <div class="card-body">
        <h5 class="card-title">${task.title}</h5>
        <p class="card-text">${task.description}</p>
        <p class="card-text"><small class="text-muted">Due: ${dayjs(task.dueDate).format('MMM D, YYYY')}</small></p>
        <button class="btn btn-danger btn-sm delete-task">Delete</button>
      </div>
    </div>`;
}

// Function to render the task list and make cards draggable
function renderTaskList() {
  const columns = {
    "To Do": $("#todo-cards"),
    "In Progress": $("#in-progress-cards"),
    "Done": $("#done-cards")
  };

  // Clear all columns
  Object.values(columns).forEach(column => column.empty());

  taskList.forEach(task => {
    const taskCard = $(createTaskCard(task));
    
    // Append to the correct column based on task state
    if (columns[task.state]) {
      columns[task.state].append(taskCard);

      // Color coding for due dates
      const dueDate = dayjs(task.dueDate);
      const today = dayjs();
      const twoDaysFromNow = today.add(2, 'day');

      if (dueDate.isBefore(today, 'day')) {
        taskCard.addClass("bg-danger text-white");
      } else if (dueDate.isBetween(today, twoDaysFromNow, 'day')) {
        taskCard.addClass("bg-warning text-dark");
      }
    }
  });

  // Initialize draggable and droppable after rendering
  initializeDragAndDrop();
}

// Function to initialize drag and drop functionality
function initializeDragAndDrop() {
  // Make task cards draggable
  $(".task-card").draggable({
    containment: ".swim-lanes",
    cursor: "move",
    revert: "invalid",
    start: function() {
      $(this).css("z-index", 100);
    },
    stop: function() {
      $(this).css("z-index", "");
    }
  });

  // Make lanes droppable
  $(".lane .card-body").droppable({
    accept: ".task-card",
    drop: handleDrop,
    hoverClass: "ui-state-highlight"
  });
}

// Function to handle adding a new task
function handleAddTask(event) {
  event.preventDefault();

  const title = $("#task-title").val();
  const description = $("#task-description").val();
  const dueDate = $("#task-due-date").val();

  const newTask = {
    id: generateTaskId(),
    title,
    description,
    dueDate,
    state: "To Do"
  };

  taskList.push(newTask);
  localStorage.setItem("tasks", JSON.stringify(taskList));
  localStorage.setItem("nextId", JSON.stringify(nextId));
  renderTaskList();
  $("#formModal").modal('hide');
}

// Function to handle deleting a task
function handleDeleteTask(event) {
  const taskId = $(event.target).closest(".task-card").data("id");
  taskList = taskList.filter(task => task.id !== parseInt(taskId));
  localStorage.setItem("tasks", JSON.stringify(taskList));
  renderTaskList();
}

// Function to handle dropping a task into a new status lane
function handleDrop(event, ui) {
  const taskId = parseInt(ui.draggable.data("id"));
  const newState = $(this).closest(".lane").attr("id");
  
  taskList = taskList.map(task => {
    if (task.id === taskId) {
      // Map lane IDs to state names
      const stateMap = {
        "to-do": "To Do",
        "in-progress": "In Progress",
        "done": "Done"
      };
      task.state = stateMap[newState];
    }
    return task;
  });
  
  localStorage.setItem("tasks", JSON.stringify(taskList));
  renderTaskList();
}

// When the page loads, render the task list, add event listeners, make lanes droppable, and make the due date field a date picker
$(document).ready(function () {
  renderTaskList();

  $("#add-task-form").on("submit", handleAddTask);
  $(document).on("click", ".delete-task", handleDeleteTask);

  $("#task-due-date").datepicker({
    dateFormat: "yy-mm-dd"
  });

  $("#formModal").on('show.bs.modal', function(e){
    $("#add-task-form")[0].reset();
  });
});