
(function () {
  const STORAGE_KEY = 'terminal_todo_items_v1';

  /** @typedef {{ id: number, title: string, done: boolean }} Task */

  /** @type {Task[]} */
  let tasks = [];
  let nextId = 1;

  const outputEl = document.getElementById('output');
  const inputEl = document.getElementById('commandInput');

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ tasks, nextId }));
  }

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      if (Array.isArray(data.tasks)) {
        tasks = data.tasks;
      }
      if (typeof data.nextId === 'number') {
        nextId = data.nextId;
      } else {
        // Compute next id from existing tasks to be safe
        nextId = tasks.reduce((m, t) => Math.max(m, t.id), 0) + 1;
      }
    } catch (e) {
      // Reset corrupted storage
      tasks = [];
      nextId = 1;
    }
  }

  function print(html) {
    const line = document.createElement('div');
    line.className = 'line';
    line.innerHTML = html;
    outputEl.appendChild(line);
    outputEl.scrollTop = outputEl.scrollHeight;
  }

  function printUser(command) {
    print(`<span class="prefix accent">todo&gt;</span><span class="content"> ${escapeHtml(command)}</span>`);
  }

  function printInfo(text) {
    print(`<span class="prefix muted">info</span><span class="content">${text}</span>`);
  }

  function printError(text) {
    print(`<span class="prefix error">error</span><span class="content">${text}</span>`);
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function renderTasks() {
    if (tasks.length === 0) {
      print(`<span class="prefix muted">list</span><span class="content muted">No tasks</span>`);
      return;
    }
    const listHtml = tasks
      .map((t) => {
        const classes = t.done ? 'task-line task-done' : 'task-line';
        return `<div class="${classes}">` +
          `<span class="task-id">${t.id}.</span>` +
          `<span class="task-title">${escapeHtml(t.title)}</span>` +
        `</div>`;
      })
      .join('');
    print(`<span class="prefix muted">list</span><span class="content">${listHtml}</span>`);
  }

  function showHelp() {
    const rows = [
      ['help', 'Show this help'],
      ['add <text>', 'Add a new task'],
      ['list', 'Show all tasks'],
      ['done <id>', 'Mark a task as done'],
      ['undone <id>', 'Mark a task as not done'],
      ['edit <id> <text>', 'Change task text'],
      ['remove <id>', 'Delete a task'],
      ['clear', 'Delete all tasks'],
    ];
    const html = rows
      .map(([cmd, desc]) => `<span class="muted">${cmd}</span><span>${desc}</span>`)
      .join('');
    print(`<span class="prefix muted">help</span><div class="content help">${html}</div>`);
  }

  function addTask(title) {
    const trimmed = title.trim();
    if (!trimmed) {
      printError('Cannot add empty task.');
      return;
    }
    tasks.push({ id: nextId++, title: trimmed, done: false });
    save();
    print(`<span class="prefix success">added</span><span class="content">${escapeHtml(trimmed)}</span>`);
  }

  function findTaskById(id) {
    return tasks.find((t) => t.id === id);
  }

  function requireId(arg) {
    const id = Number(arg);
    if (!Number.isInteger(id) || id <= 0) {
      printError('Please provide a valid numeric id.');
      return null;
    }
    const task = findTaskById(id);
    if (!task) {
      printError(`Task ${id} not found.`);
      return null;
    }
    return task;
  }

  function setDone(idArg, done) {
    const task = requireId(idArg);
    if (!task) return;
    task.done = done;
    save();
    print(`<span class="prefix success">ok</span><span class="content">Task ${task.id} ${done ? 'completed' : 'reopened'}.</span>`);
  }

  function editTask(idArg, text) {
    const task = requireId(idArg);
    if (!task) return;
    const newTitle = text.trim();
    if (!newTitle) {
      printError('New text cannot be empty.');
      return;
    }
    task.title = newTitle;
    save();
    print(`<span class="prefix success">edited</span><span class="content">${task.id}. ${escapeHtml(newTitle)}</span>`);
  }

  function removeTask(idArg) {
    const task = requireId(idArg);
    if (!task) return;
    tasks = tasks.filter((t) => t.id !== task.id);
    save();
    print(`<span class="prefix success">removed</span><span class="content">Task ${task.id}</span>`);
  }

  function clearTasks() {
    tasks = [];
    nextId = 1;
    save();
    print(`<span class="prefix warning">cleared</span><span class="content">All tasks deleted.</span>`);
  }

  function handle(command) {
    const raw = command;
    const [cmd, ...rest] = raw.trim().split(/\s+/);
    const tail = raw.slice(raw.indexOf(cmd) + cmd.length).trim();

    switch ((cmd || '').toLowerCase()) {
      case '':
        break;
      case 'help':
      case '?':
        showHelp();
        break;
      case 'add':
        addTask(tail);
        break;
      case 'list':
      case 'ls':
        renderTasks();
        break;
      case 'done':
        setDone(rest[0], true);
        break;
      case 'undone':
      case 'open':
        setDone(rest[0], false);
        break;
      case 'edit':
        if (!rest.length) { printError('Usage: edit <id> <text>'); break; }
        editTask(rest[0], tail.replace(/^\S+\s+/, ''));
        break;
      case 'remove':
      case 'rm':
      case 'delete':
        removeTask(rest[0]);
        break;
      case 'clear':
        clearTasks();
        break;
      default:
        printError(`Unknown command: ${escapeHtml(cmd)}. Type 'help'.`);
    }
  }

  function boot() {
    load();
    printInfo('Welcome to Terminal TODO. Type \u2018help\u2019.');
    if (tasks.length) {
      renderTasks();
    }
    inputEl.focus();
  }

  inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const value = inputEl.value;
      printUser(value);
      handle(value);
      inputEl.value = '';
    }
  });

  // Click anywhere to focus input
  document.addEventListener('click', () => inputEl.focus());

  // Basic up/down history
  const history = [];
  let historyIndex = -1;
  inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp') {
      if (historyIndex === -1) historyIndex = history.length;
      historyIndex = Math.max(0, historyIndex - 1);
      inputEl.value = history[historyIndex] || '';
      e.preventDefault();
    } else if (e.key === 'ArrowDown') {
      if (historyIndex !== -1) {
        historyIndex = Math.min(history.length, historyIndex + 1);
        inputEl.value = history[historyIndex] || '';
      }
      e.preventDefault();
    } else if (e.key === 'Enter') {
      const trimmed = inputEl.value.trim();
      if (trimmed) {
        history.push(trimmed);
        historyIndex = -1;
      }
    }
  }, { capture: true });

  window.addEventListener('DOMContentLoaded', boot);
})();


