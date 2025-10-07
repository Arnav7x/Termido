# Termido

A lightweight, terminal‑style todo manager that runs entirely in your browser. No build step, no backend, no dependencies — just open the page and start typing.

### Features
- **Terminal UI**: Type commands like `add`, `list`, `done`, and more.
- **Persistent storage**: Tasks are saved to `localStorage` and survive refreshes.
- **Keyboard‑first**: Press Enter to run, Arrow Up/Down to navigate command history.
- **Accessible**: ARIA roles and live regions; works great with screen readers.
- **Zero setup**: Static files only (`index.html`, `styles.css`, `script.js`).

### Quick start
1) Clone or download this repository.
2) Open `index.html` in any modern browser.

Optional: Serve locally (useful if you prefer http:// over file://):

```bash
python3 -m http.server 5173
# then open http://localhost:5173
```

### Usage
Type a command at the `todo>` prompt and press Enter. Type `help` to see this list in the app.

| Command | Description |
| --- | --- |
| `help` | Show available commands |
| `add <text>` | Add a new task |
| `list` / `ls` | Show all tasks |
| `done <id>` | Mark a task as done |
| `undone <id>` / `open <id>` | Mark a task as not done |
| `edit <id> <text>` | Change task text |
| `remove <id>` / `rm <id>` / `delete <id>` | Delete a task |
| `clear` | Delete all tasks |

Example session:

```text
todo> add Buy milk
added  Buy milk
todo> add Read a book
added  Read a book
todo> list
list  1. Buy milk
      2. Read a book
todo> done 1
ok    Task 1 completed.
todo> list
list  1. Buy milk   (done)
      2. Read a book
```

### Keyboard shortcuts
- **Enter**: Run the command
- **Arrow Up/Down**: Browse command history
- **Click anywhere**: Focus the input

### Data & persistence
- Tasks are stored in the browser under the key `terminal_todo_items_v1`.
- To reset, run `clear` in the app or clear site data in your browser.

### Project structure
```
Termido/
  index.html   # App shell & markup
  styles.css   # Theme & layout
  script.js    # Command parser, state, rendering
```

### Deploy
- Any static host works (GitHub Pages, Netlify, Vercel, etc.).
- For GitHub Pages (root): push to `main`, then enable Pages with Source = `Deploy from a branch`, Branch = `main / root`.

### Tech
- Vanilla HTML/CSS/JS
- No external libraries

### Contributing
Issues and PRs are welcome. If you propose a new command, include:
- Command name and syntax
- A brief description
- Expected output and edge cases

