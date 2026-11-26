/* Table of Contents */

/* 01. Navigation Bar */
/* 02. Mobile Navigation */
/* 03. To-Do List: Storage & State */
/* 04. To-Do List: Read Task */
/* 05. To-Do List: Create Task */
/* 06. To-Do List: Toggle Task Completion */
/* 07. To-Do List: Singular Task Deletion */
/* 08. To-Do List: Update Task */
/* 08. To-Do List: Batch Task Deletion */

/* 01. Navigation Bar */

const myNav = document.querySelector("#navigation-bar");
const navMenu = document.querySelector("#navigation-menu");
const menuLinks = navMenu.querySelectorAll(".navigation-link");
const colourLogo = myNav.querySelector("#navigation-logo-colour");

// Sticky navigation bar.
// These changes are toggled whenever the 10px threshold is scrolled past.
function setNavbarTransparency() {
  const isScrolled = window.scrollY > 10;
  myNav.classList.toggle("scroll", isScrolled);
  colourLogo.classList.toggle("black", isScrolled);
  menuLinks.forEach((link) => link.classList.toggle("black", isScrolled));
}

window.addEventListener("load", setNavbarTransparency);
window.addEventListener("scroll", setNavbarTransparency);

/* 02. Mobile Navigation */

const toggleButton = document.querySelector(".mobile-button");
const mobileLinks = document.querySelectorAll(".mobile-links");

// Keep aria-expanded synced with the mobile menu state.
toggleButton.addEventListener("click", () => {
  const isOpen = document.body.classList.toggle("mobile-navigation-active");
  toggleButton.setAttribute("aria-expanded", isOpen);
});

// Close mobile menu when navigating from a mobile link.
mobileLinks.forEach((link) => {
  link.addEventListener("click", () => {
    document.body.classList.remove("mobile-navigation-active");
    toggleButton.setAttribute("aria-expanded", "false");
  });
});

/* 03. To-Do List: Storage & State */

const STORAGE_KEY = "focusTiming.tasks";
const MAX_TASK_LENGTH = 35;

const EXAMPLE_TASKS = [
  { id: 1700000001001, text: "Review assessment criteria.", isDone: true },
  { id: 1700000001002, text: "Import Comic Sans to frustrate people.", isDone: false },
  { id: 1700000001003, text: "Maybe submit on time?", isDone: false },
  { id: 1700000001004, text: "Max character limit is 35.", isDone: false },
];

let tasks = loadTasks();

const itemInput = document.querySelector("#item-input");
const errorText = document.querySelector("#error-text");
const addButton = document.querySelector("#add-button");
const deleteAllButton = document.querySelector("#delete-all-button");
const todoList = document.querySelector("#to_do-list");

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

// Example tasks on first visit.
function loadTasks() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === null) {
    const seeded = EXAMPLE_TASKS.map((task) => ({
      id: task.id,
      text: task.text,
      isDone: task.isDone,
    }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
    return seeded;
  }

  try {
    return JSON.parse(saved);
  } catch (error) {
    console.error("Could not read saved tasks:", error);
    return [];
  }
}

/* 04. To-Do List: Read Task */

function createTaskItem(task) {
  const item = document.createElement("li");
  item.dataset.id = task.id;
  if (task.isDone) {
    item.classList.add("completed");
  }

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.className = "checkbox";
  checkbox.checked = task.isDone;
  checkbox.setAttribute("aria-label", `Mark "${task.text}" as completed`);
  checkbox.addEventListener("change", () => toggleTask(task.id));

  const textSpan = document.createElement("span");
  textSpan.classList.add("task-text");
  textSpan.textContent = task.text;

  const updateButton = document.createElement("a");
  updateButton.className = "update-item-button";
  updateButton.dataset.id = task.id;
  updateButton.href = "#";
  updateButton.setAttribute("role", "button");
  updateButton.setAttribute("aria-label", `Update "${task.text}"`);
  updateButton.innerHTML = `<i class="fa-solid fa-pen-to-square" aria-hidden="true"></i>`;
  updateButton.addEventListener("click", (event) => {
    event.preventDefault();
    startEditTask(task.id, item, textSpan);
  });

  const deleteButton = document.createElement("a");
  deleteButton.className = "delete-item-button";
  deleteButton.dataset.id = task.id;
  deleteButton.href = "#";
  deleteButton.setAttribute("role", "button");
  deleteButton.setAttribute("aria-label", `Delete "${task.text}"`);
  deleteButton.innerHTML = `<i class="fa-solid fa-trash" aria-hidden="true"></i>`;
  deleteButton.addEventListener("click", (event) => {
    event.preventDefault();
    deleteTask(task.id);
  });

  item.append(checkbox, textSpan, updateButton, deleteButton);
  return item;
}

// Redraw list from state so the page always matches tasks.
function loadTodoList() {
  if (!todoList) return;

  if (tasks.length === 0) {
    todoList.innerHTML = `<li style="justify-content: center;">Nothing here... yet!</li>`;
    return;
  }

  todoList.innerHTML = "";

  tasks.forEach((task) => {
    todoList.append(createTaskItem(task));
  });
}

/* 05. To-Do List: Create Task */

function addTask() {
  const text = itemInput.value.trim();
  errorText.textContent = "";

  // Reject blank entries.
  if (text === "") {
    errorText.textContent = "Please enter a task.";
    itemInput.focus();
    return;
  }

  // Reject long entries.
  if (text.length > MAX_TASK_LENGTH) {
    errorText.textContent = `Task must be ${MAX_TASK_LENGTH} characters or less.`;
    itemInput.focus();
    return;
  }

  // Use timestamp as a unique id.
  tasks.push({
    id: Date.now(),
    text: text,
    isDone: false,
  });

  saveTasks();
  loadTodoList();
  itemInput.value = "";
  itemInput.focus();
}

/* 06. To-Do List: Toggle Task Completion */

function toggleTask(id) {
  const task = tasks.find((item) => item.id === id);
  if (!task) return;

  task.isDone = !task.isDone;
  saveTasks();
  loadTodoList();
}

/* 07. To-Do List: Singular Task Deletion */

function deleteTask(id) {
  tasks = tasks.filter((task) => task.id !== id);
  saveTasks();
  loadTodoList();
}

/* 08. To-Do List: Update Task */

function startEditTask(id, listItem, textSpan) {
  const task = tasks.find((item) => item.id === id);
  if (!task || !listItem || !textSpan) return;
  if (listItem.querySelector(".edit-task-input")) return;

  errorText.textContent = "";

  const editInput = document.createElement("input");
  editInput.type = "text";
  editInput.className = "edit-task-input";
  editInput.value = task.text;
  editInput.maxLength = MAX_TASK_LENGTH;
  editInput.setAttribute("aria-label", `Edit "${task.text}"`);

  let isFinished = false;

  function commitEdit() {
    if (isFinished) return;
    isFinished = true;

    const updatedText = editInput.value.trim();

    if (updatedText === "") {
      errorText.textContent = "Please enter a task.";
      loadTodoList();
      return;
    }

    if (updatedText.length > MAX_TASK_LENGTH) {
      errorText.textContent = `Task must be ${MAX_TASK_LENGTH} characters or less.`;
      loadTodoList();
      return;
    }

    task.text = updatedText;
    errorText.textContent = "";
    saveTasks();
    loadTodoList();
  }

  editInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      commitEdit();
    } else if (event.key === "Escape") {
      isFinished = true;
      loadTodoList();
    }
  });

  // Save or cancel task update when the input loses focus.
  editInput.addEventListener("blur", commitEdit);

  textSpan.replaceWith(editInput);
  editInput.focus();
  editInput.select();
}

/* 08. To-Do List: Batch Task Deletion */

// Prevent deletion when no items to delete.
function clearAllTasks() {
  if (tasks.length === 0) {
    errorText.textContent = "Nothing to delete.";
    return;
  }

  if (!confirm("Are you sure you want to delete everything?")) return;

  tasks = [];
  errorText.textContent = "";
  saveTasks();
  loadTodoList();
}

/* Event Listeners & Init */

const addButton = document.getElementById("add-button");

if (addButton) {
  addButton.addEventListener("click", handleAddTask);

  itemInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      addTask();
    }
  });

  deleteAllButton.addEventListener("click", clearAllTasks);

  loadTodoList();
}
