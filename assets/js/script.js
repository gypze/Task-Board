// Retrieve tasks and nextId from localStorage
let taskList = JSON.parse(localStorage.getItem("tasks")) || [];
let nextId = JSON.parse(localStorage.getItem("nextId")) || 1;

// Generate a unique task id
function generateTaskId() {
  const id = nextId;
  nextId++;
  localStorage.setItem("nextId", JSON.stringify(nextId));
  return id;
}

// Create a task card
function createTaskCard(task) {
  const card = $('<div>') // Create a new div element for the task card
    .addClass('card mb-3 task-card')
    .attr('data-id', task.id)
    .append(
      $('<div>')
        .addClass('card-body')
        .append(
          $('<h5>').addClass('card-title').text(task.title),
          $('<p>').addClass('card-text').text(task.description),
          $('<p>')
            .addClass('card-text')
            .text(`Due: ${dayjs(task.dueDate).format('MM/DD/YYYY')}`),
          $('<button>')
            .addClass('btn btn-danger delete-task')
            .text('Delete')
        )
    );

  // Add a badge to the card based on the task status
  switch (task.status) {
    case 'todo':
      card.addClass('border-primary');
      card.append($('<span>').addClass('badge bg-primary').text('To Do'));
      break;
    case 'in-progress':
      card.addClass('border-warning');
      card.append($('<span>').addClass('badge bg-warning').text('In Progress'));
      break;
    case 'done':
      card.addClass('border-success');
      card.append($('<span>').addClass('badge bg-success').text('Done'));
      break;
  }

  const today = dayjs();
  const dueDate = dayjs(task.dueDate);
  if (dueDate.isBefore(today, 'day')) {
    card.addClass('bg-danger text-white');
  } else if (dueDate.isSame(today, 'day')) {
    card.addClass('bg-warning text-dark');
  }

  // Initialize draggable on the card
  card.draggable({
    revert: true,
    helper: 'clone',
    start: function(event, ui) {
      console.log('Dragging started:', task.id);
      ui.helper.css('z-index', 1000); // Ensure the helper is on top
    }
  });

  return card;
}

// Render the task list and make cards draggable
function renderTaskList() {
  $('#todo-cards, #in-progress-cards, #done-cards').empty();

  taskList.forEach(task => {
    const taskCard = createTaskCard(task);
    $(`#${task.status}-cards`).append(taskCard);
  });

  // Save task list to localStorage
  localStorage.setItem('tasks', JSON.stringify(taskList));
}

// Handle adding a new task
function handleAddTask(event) {
  event.preventDefault();

  const title = $('#task-title').val().trim();
  const description = $('#task-desc').val().trim();
  const dueDate = $('#task-date').val().trim();

  if (title && description && dueDate) {
    const task = {
      id: generateTaskId(),
      title,
      description,
      dueDate,
      status: 'todo'
    };

    taskList.push(task);
    renderTaskList();

    // Clear the form
    $('#task-form')[0].reset();
    $('#formModal').modal('hide');
  }
}

// Handle deleting a task
function handleDeleteTask(event) {
  const taskId = $(event.target).closest('.task-card').data('id');
  console.log('Deleting task with ID:', taskId); // Debugging statement
  taskList = taskList.filter(task => task.id !== taskId);
  renderTaskList();
}

// Handle dropping a task into a new status lane
function handleDrop(event, ui) {
  const card = ui.draggable;
  const status = $(this).attr('id').split('-')[0];
  const taskId = card.data('id');

  taskList.forEach(task => {
    if (task.id === taskId) {
      task.status = status;
    }
  });

  $(this).append(card);
  card.css({ top: 0, left: 0 }); // Reset the position of the card
  localStorage.setItem('tasks', JSON.stringify(taskList)); // Save updated task list to localStorage
}

// When the page loads, render the task list, add event listeners, make lanes droppable, and make the due date field a date picker
$(document).ready(function () {
  renderTaskList();

  $('#task-form').on('submit', handleAddTask);
  $(document).on('click', '.delete-task', handleDeleteTask); // Revert to using event delegation

  $('.lane').droppable({
    accept: '.task-card',
    drop: handleDrop
  });

  $('#task-date').datepicker({
    dateFormat: 'mm/dd/yy'
  });

  console.log('Document ready, draggable and droppable initialized');
});