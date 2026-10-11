
const studyForm = document.getElementById("study-form");
const taskInput = document.getElementById("task");
const subjectInput = document.getElementById("subject");
const deadlineInput = document.getElementById("deadline");

const taskList = document.getElementById("task-list");

const totalTasks = document.getElementById("total-tasks");
const pendingTasks = document.getElementById("pending-tasks");
const completedTasks = document.getElementById("completed-tasks");

const progressText = document.getElementById("progress-text");
const progressBar = document.getElementById("progress-bar");

const filterButtons = document.querySelectorAll(".filter-btn");

let tasks = [];
let currentFilter = "all";

// Load tasks saved in the browser
try {
    const savedTasks = JSON.parse(
        localStorage.getItem("studyTasks") || "[]"
    );

    if (Array.isArray(savedTasks)) {
        tasks = savedTasks.filter(item =>
            item &&
            typeof item.id === "string" &&
            typeof item.name === "string" &&
            typeof item.subject === "string" &&
            typeof item.deadline === "string" &&
            /^\d{4}-\d{2}-\d{2}$/.test(item.deadline) &&
            typeof item.completed === "boolean"
        );
    }
} catch (error) {
    tasks = [];
}

// Save tasks
function saveTasks() {
    try {
        localStorage.setItem("studyTasks", JSON.stringify(tasks));
    } catch (error) {
        alert("Unable to save tasks in this browser.");
    }
}

// Add a new task
studyForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const name = taskInput.value.trim();
    const subject = subjectInput.value.trim();
    const deadline = deadlineInput.value;

    if (!name || !subject || !deadline) {
        alert("Please fill in all fields.");
        return;
    }

    const selectedDate = new Date(deadline + "T00:00:00");

    if (
        Number.isNaN(selectedDate.getTime()) ||
        selectedDate.toISOString().slice(0, 10) !== deadline
    ) {
        alert("Please enter a valid deadline.");
        return;
    }

    const task = {
        id: crypto.randomUUID(),
        name: name,
        subject: subject,
        deadline: deadline,
        completed: false
    };

    tasks.unshift(task);

    saveTasks();
    updateDashboard();
    displayTasks();

    studyForm.reset();
    taskInput.focus();
});

// Update dashboard numbers and progress
function updateDashboard() {
    const total = tasks.length;

    const completed = tasks.filter(
        task => task.completed
    ).length;

    const pending = total - completed;

    const percentage = total === 0
        ? 0
        : Math.round((completed / total) * 100);

    totalTasks.textContent = total;
    pendingTasks.textContent = pending;
    completedTasks.textContent = completed;

    progressText.textContent = percentage + "%";
    progressBar.style.width = percentage + "%";
}

// Display tasks according to selected filter
function displayTasks() {
    taskList.replaceChildren();

    let filteredTasks = tasks;

    if (currentFilter === "pending") {
        filteredTasks = tasks.filter(task => !task.completed);
    } else if (currentFilter === "completed") {
        filteredTasks = tasks.filter(task => task.completed);
    }

    if (filteredTasks.length === 0) {
        const message = document.createElement("li");
        message.className = "empty-message";
        message.textContent = "No tasks to display.";
        taskList.appendChild(message);
        return;
    }

    filteredTasks.forEach(task => {
        const item = document.createElement("li");
        item.className = "task-item";

        if (task.completed) {
            item.classList.add("done");
        }

        const details = document.createElement("div");
        details.className = "task-details";

        const title = document.createElement("h3");
        title.textContent = task.name;

        const subject = document.createElement("p");
        subject.textContent = "Subject: " + task.subject;

        const deadline = document.createElement("p");
        deadline.textContent = "Deadline: " + task.deadline;

        details.append(title, subject, deadline);

        const actions = document.createElement("div");
        actions.className = "task-actions";

        const completeButton = document.createElement("button");
        completeButton.className = "complete-btn";
        completeButton.textContent = task.completed
            ? "Undo"
            : "Complete";

        completeButton.addEventListener("click", () => {
            toggleTask(task.id);
        });

        const deleteButton = document.createElement("button");
        deleteButton.className = "delete-btn";
        deleteButton.textContent = "Delete";

        deleteButton.addEventListener("click", () => {
            deleteTask(task.id);
        });

        actions.append(completeButton, deleteButton);
        item.append(details, actions);
        taskList.appendChild(item);
    });
}

// Mark a task completed or pending
function toggleTask(id) {
    tasks = tasks.map(task => {
        if (task.id === id) {
            return {
                ...task,
                completed: !task.completed
            };
        }

        return task;
    });

    saveTasks();
    updateDashboard();
    displayTasks();
}

// Delete a task
function deleteTask(id) {
    tasks = tasks.filter(task => task.id !== id);

    saveTasks();
    updateDashboard();
    displayTasks();
}

// Handle filter buttons
filterButtons.forEach(button => {
    button.addEventListener("click", () => {
        currentFilter = button.dataset.filter;

        filterButtons.forEach(btn => {
            btn.classList.toggle("active", btn === button);
        });

        displayTasks();
    });
});

// Initialize the planner
updateDashboard();
displayTasks();
