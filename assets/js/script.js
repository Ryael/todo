/* Table of Contents */

/* 01. Navigation Bar */
/* 02. Mobile Navigation */
/* 03. To-Do List Storage & State */
/* 04. Task Rendering */
/* 05. Add New Item */
/* 06. Toggle Completion */
/* 07. Singular Deletion */
/* 08. Batch Deletion */

/* 01. Navigation Bar */

const myNav = document.querySelector("#navigation-bar");
const navMenu = document.querySelector("#navigation-menu");
const menuLinks = navMenu ? navMenu.querySelectorAll(".navigation-link") : [];
const colourLogo = myNav ? myNav.querySelector("#navigation-logo-colour") : null;

// Sticky navigation bar.
// These changes are toggled whenever the 10px threshold is scrolled past.
function setNavbarTransparency() {
  if (!myNav) return;

  const isScrolled = window.scrollY > 10;
  myNav.classList.toggle("scroll", isScrolled);
  if (colourLogo) {
    colourLogo.classList.toggle("black", isScrolled);
  }
  menuLinks.forEach((link) => link.classList.toggle("black", isScrolled));
}

window.addEventListener("load", setNavbarTransparency);
window.addEventListener("scroll", setNavbarTransparency);

/* 02. Mobile Navigation */

const toggleButton = document.querySelector(".mobile-button");
const mobileLinks = document.querySelectorAll(".mobile-links");

if (toggleButton) {
  // Keep aria-expanded synced with the mobile menu state.
  toggleButton.addEventListener("click", () => {
    const isOpen = document.body.classList.toggle("mobile-navigation-active");
    toggleButton.setAttribute("aria-expanded", String(isOpen));
  });

  // Close mobile menu when navigating from a mobile link.
  mobileLinks.forEach((link) => {
    link.addEventListener("click", () => {
      document.body.classList.remove("mobile-navigation-active");
      toggleButton.setAttribute("aria-expanded", "false");
    });
  });
}

/* 03. To-Do List Storage & State */

const STORAGE_KEY = "focusTiming.tasks";
let tasks = loadTasks();

const itemInput = document.querySelector("#item-input");
const errorText = document.querySelector("#error-text");
const addButton = document.querySelector("#add-button");
const deleteAllButton = document.querySelector("#delete-all-button");
const todoList = document.querySelector("#to_do-list");

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

// Fall back to an empty list on first visit or bad JSON.
function loadTasks() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === null) return [];

  try {
    return JSON.parse(saved);
  } catch (error) {
    console.error("Could not read saved tasks:", error);
    return [];
  }
}

/* 04. Task Rendering */

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

  item.append(checkbox, textSpan, deleteButton);
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

/* 05. Add New Item */

const MAX_TASK_LENGTH = 40;

function addTask() {
  if (!itemInput || !errorText) return;

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

/* 06. Toggle Completion */

function toggleTask(id) {
  const task = tasks.find((item) => item.id === id);
  if (!task) return;

  task.isDone = !task.isDone;
  saveTasks();
  loadTodoList();
}

/* 07. Singular Deletion */

function deleteTask(id) {
  tasks = tasks.filter((task) => task.id !== id);
  saveTasks();
  loadTodoList();
}

/* 08. Batch Deletion */

// Prevent deletion when no items to delete.
function clearAllTasks() {
  if (tasks.length === 0) {
    if (errorText) errorText.textContent = "Nothing to delete.";
    return;
  }

  if (!confirm("Are you sure you want to delete everything?")) return;

  tasks = [];
  if (errorText) errorText.textContent = "";
  saveTasks();
  loadTodoList();
}

/* Event Listeners & Init */

if (addButton) {
  addButton.addEventListener("click", addTask);
}

if (itemInput) {
  itemInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      addTask();
    }
  });
}

if (deleteAllButton) {
  deleteAllButton.addEventListener("click", clearAllTasks);
}

loadTodoList();

