// Retrieve tasks and nextId from localStorage
let taskList = JSON.parse(localStorage.getItem("tasks"));
let nextId = JSON.parse(localStorage.getItem("nextId"));
const taskFormEl = $("#task-form");
const taskTitleEl = $("#task-title");
const taskDescriptionEl = $("#task-description");
const taskDateEl = $("#task-date");


const todoCardsEl = $("#todo-cards");
const inProgressCardsEl = $("#in-progress-cards");
const doneCardsEl = $("#done-cards");

// Todo: create a function to generate a unique task id
function generateTaskId() {
    return new Date().valueOf().toString();
}

// Todo: create a function to create a task card
function createTaskCard(task) {
    const taskCard = $('<div>')
        .addClass('card task-card draggable my-3')
        .attr('data-task-id', task.id);

    // <div class="card task-card draggable my-3" data-task-id="123"></div>

    const cardHeader = $('<div>')
        .addClass('card-header h4')
        .text(task.title);

    // <div class="card-header h4">Task Title</div>

    const cardBody = $('<div>').addClass('card-body');

    // <div class="card-body"></div>

    const cardDescription = $('<p>')
        .addClass('card-text')
        .text(task.description);

    // <p class="card-text">Task Description</p>

    const cardDueDate = $('<p>')
        .addClass('card-text')
        .text(task.dueDate);

    // <p class="card-text">Task Due Date</p>


    // combine all our created elements
    taskCard.append(cardHeader, cardBody);
    cardBody.append(cardDescription, cardDueDate)

    /*
        <div class="card task-card draggable my-3" data-task-id="123">
            <div class="card-header h4">Task Title</div>
            <div class="card-body">
                <p class="card-text">Task Description</p>
                <p class="card-text">Task Due Date</p>
            </div>
        </div>
    */

        if(task.status === "to-do") {
            todoCardsEl.append(taskCard)
        } else if(task.status === "in-progress") {
            inProgressCardsEl.append(taskCard)
        } else if(task.status === "done") {
            doneCardsEl.append(taskCard)
        }

}

// Todo: create a function to render the task list and make cards draggable
function renderTaskList() {
    todoCardsEl.empty();

    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];

    for (let task of tasks) {
        createTaskCard(task);
    }





    $('.draggable').draggable({
        opacity: 0.7,
        zIndex: 100,
        // ? This is the function that creates the clone of the card that is dragged. This is purely visual and does not affect the data.
        helper: function (e) {
            // ? Check if the target of the drag event is the card itself or a child element. If it is the card itself, clone it, otherwise find the parent card  that is draggable and clone that.
            const original = $(e.target).hasClass('ui-draggable')
                ? $(e.target)
                : $(e.target).closest('.ui-draggable');
            // ? Return the clone with the width set to the width of the original card. This is so the clone does not take up the entire width of the lane. This is to also fix a visual bug where the card shrinks as it's dragged to the right.
            return original.clone().css({
                width: original.outerWidth(),
            });
        },
    });


}

// Todo: create a function to handle adding a new task
function handleAddTask(event) {
    event.preventDefault();

    const tasktitle = taskTitleEl.val().trim();
    const taskDescription = taskDescriptionEl.val().trim();
    const taskDate = taskDateEl.val();

    const newTask = {
        id: generateTaskId(),
        title: tasktitle,
        description: taskDescription,
        dueDate: taskDate,
        status: "to-do",
    };

    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    tasks.push(newTask);

    localStorage.setItem("tasks", JSON.stringify(tasks));
}

// Todo: create a function to handle deleting a task
function handleDeleteTask(event) {

}

// Todo: create a function to handle dropping a task into a new status lane
function handleDrop(event, ui) {
    const taskId = ui.draggable[0].dataset.taskId;
    console.log(taskId)

    // ? Get the id of the lane that the card was dropped into
    const newStatus = event.target.id;
    console.log(newStatus)

    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];

    for (let task of tasks) {
        // ? Find the task card by the `id` and update the task status.
        if (task.id === taskId) {
          task.status = newStatus;
        }
      }

        // ? Save the updated tasks to localStorage
        localStorage.setItem("tasks", JSON.stringify(tasks));
}

// Todo: when the page loads, render the task list, add event listeners, make lanes droppable, and make the due date field a date picker
$(document).ready(function () {
    taskFormEl.on("submit", handleAddTask);
    renderTaskList();

    $('.lane').droppable({
        accept: '.draggable',
        drop: handleDrop,
    });
});
