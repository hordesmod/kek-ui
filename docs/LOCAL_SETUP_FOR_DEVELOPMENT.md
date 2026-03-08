# Setting Up Local Development Environment for kek-ui
Follow these steps to install all required tools before compiling the mod.

## 1. Download and install Git, VS Code, Node.js
- Git: [https://git-scm.com/](https://git-scm.com/)  
- Node.js: [https://nodejs.org/](https://nodejs.org/)  
- VS Code: [https://code.visualstudio.com/](https://code.visualstudio.com/)
- Optional: Install extensions for JavaScript/Node.js development for better experience.
- Open a terminal in VS Code (View → Terminal)


## 2. Clone the Repository
Clone the repository with minimal history:
```bash
git clone --depth 1 https://github.com/hordesmod/kek-ui.git
cd kek-ui
```

## 3. Install Dependencies
- Install Node.js dependencies:
```bash
npm install
```

## 4. Run in Watch Mode
- to compile all scripts together and watch for any new changes you will make run:
```bash
npm run watch
```

## 5. Set Up Tampermonkey
- Install Tampermonkey in your browser.
- Enable **Developer Mode** in the browser extensions page.
- Go to the Tampermonkey - **Details** enable:
    - **Allow User Scripts**
    - **Allow access to file URLs**
- Add a new script **Tampermonkey → Dashboard → [+]**:
```js
// ==UserScript==
// @name         kek-ui dev
// @description  kek-ui dev
// @version      1
// @namespace    https://hordes.io/play
// @match        https://hordes.io/play
// @icon         https://www.google.com/s2/favicons?sz=64&domain=hordes.io
// @grant        none
// @require      file://d:\dev\kek-ui\dist\kekui.user.js
// ==/UserScript==
```
⚠️ Make sure to change the @require path to where kekui.user.js is located on your machine.

### 6. Run and Test
- Open https://hordes.io/play in your browser.
- Enable "kek-ui dev" in Tampermonkey
- Make edits to your source code.
- Press F5 to reload the game and see changes immediately.