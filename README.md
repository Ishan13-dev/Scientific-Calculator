# Advanced Calculator

A responsive, browser-based advanced calculator built with **HTML, CSS and JavaScript**.

**Author:** Ishan Verma  
**License:** MIT  
**Version:** 3.2.0

## Live Demo

https://ishan13-dev.github.io/Advanced-calculator/
> The live deployment should be redeployed after replacing the project files with the updated versions in this package.

## Features

- Basic arithmetic: `+`, `-`, `×`, `÷`, `%`
- Grouping with three bracket types:
  - Parentheses: `()`
  - Square brackets: `[]`
  - Curly brackets: `{}`
- Bracket validation and matching
- Scientific mode with 4×5 button grid
- Square root, powers, trigonometric functions, logarithms
- π and e constants
- Factorial
- Keyboard input
- Dark/light theme with enhanced styling
- Collapsible "My History" section
- Editable display with cursor support
- Calculation history
- Persistent history using `localStorage`
- Delete individual history items
- Responsive layout for desktop, tablet and mobile
- Classical calculator layout
- Trigonometric functions in degrees
- Keyboard shortcuts
- Reduced-motion accessibility support

## Bracket behavior

The calculator accepts expressions such as:

```text
(2 + 3) * 4
[10 + 5] / 3
{2 * [3 + (4 - 1)]}
```

The three bracket types are checked for correct nesting. For example:

```text
{2 + [3 * (4 + 1)]}
```

is valid, while:

```text
{2 + [3 * (4 + 1)]}
```

must keep its opening/closing bracket pairs in the correct order.

Opening brackets can also create implicit multiplication where appropriate, for example:

```text
2(3 + 4)
```

is interpreted as:

```text
2 * (3 + 4)
```

## Keyboard shortcuts

| Key | Action |
|---|---|
| `0-9` | Numbers |
| `+ - * / %` | Operators |
| `( ) [ ] { }` | Brackets |
| `Enter` / `=` | Calculate |
| `Backspace` | Delete one character |
| `Escape` / `C` | Clear |
| `Ctrl + T` | Toggle theme |
| `Ctrl + M` | Toggle basic/scientific mode |
| `Ctrl + L` | Clear history |

## Project structure

```text
advanced-calculator/
├── index.html
├── script_v2.js
├── script_v2.css
└── README.md
```

## Run locally

No build step is required.

1. Download or clone the project.
2. Open `index.html` in a modern browser.
3. For the most reliable local development experience, use a simple static server such as VS Code Live Server.

## Deployment

The project is suitable for static hosting, particularly GitHub Pages.

### GitHub Pages Deployment

1. **Push the project to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git push -u origin main
   ```

2. **Enable GitHub Pages:**
   - Go to your repository on GitHub
   - Click Settings → Pages
   - Under "Source", select the `main` branch
   - Click Save

3. **Access your site:**
   - Your site will be available at `https://YOUR_USERNAME.github.io/YOUR_REPO/`
   - GitHub will automatically deploy changes when you push to the main branch

### Alternative Hosting

The project can also be deployed to other static hosting services like Netlify or Vercel by simply connecting your GitHub repository.

## Technologies

- HTML5
- CSS3
- JavaScript (ES6+)
- Tailwind CSS CDN
- math.js CDN

## Author

**Ishan Verma**

GitHub: https://github.com/ishan13-dev

## License

MIT License
