import eventManager from "../core/event"
import log from "../core/logger"
import ui from "../core/ui"
import element from "../core/widgets/element"
import gui from "./gui"
import mouseOver from "./mouseOver"

const menuFunctions = {
    "UIMode": uiModeToggle,
    "Mouse Over": () => { eventManager.trigger("click.mouseOver") },
    "Hide EXP": () => { eventManager.trigger("click.expbar") },
    "Picture Mode": togglePictureMode,
    "Blocked Players": () => { eventManager.trigger("click.blockPlayers") },
    "Emoji": () => { eventManager.trigger("click.emojis") },
    "Disable Class Colors": () => { eventManager.trigger("click.toggleColors") },
    "Rune Tracker": () => { eventManager.trigger("click.runeTracker") },
    "Kill Tracker": () => { eventManager.trigger("click.killtracker") },
    "ExportUI": (event) => { eventManager.trigger("click.exportGUI", event) },
    "ImportUI": (event) => { eventManager.trigger("click.importGUI", event) },
    "ResetUI": (event) => { eventManager.trigger("click.resetGUI", event) },
}
let inputDisplayEle = null
function inputMouseEnter(e) {
    const displayEle = element("div", {
        className: "btn black textprimary",
        textContent: e.target.placeholder,
        style: `
        position: absolute;
        top: ${e.target.offsetTop - 40}px;
        left: ${e.target.offsetLeft}px;
        padding: 5px`
    }).element
    inputDisplayEle = displayEle
    e.target.parentNode.appendChild(displayEle)
}
function inputMouseLeave(e) {
    if (inputDisplayEle) {
        inputDisplayEle.remove()
        inputDisplayEle = null
    }
}
function uiModeToggle() {

    // Select all buttons with class 'kek-ui-btn'
    const buttons = document.querySelectorAll('.kek-ui-btn');
    const inputs = document.querySelectorAll(".kek-ui-input")
    // Iterate through the selected buttons
    buttons.forEach(button => {
        // Toggle visibility by setting the 'display' style property
        if (button.style.display == "none") {
            button.style.display = 'inline-block'; // Change to your desired display property
        } else {
            button.style.display = 'none';
        }
    });
    inputs.forEach(input => {
        // Toggle visibility by setting the 'display' style property
        if (input.style.display == "none") {
            input.style.display = 'inline-block'; // Change to your desired display property
        } else {
            input.style.display = 'none';
        }
        input.title = ""

        input.addEventListener("mouseenter", inputMouseEnter)
        input.addEventListener("mouseleave", inputMouseLeave)

    })
}
function togglePictureMode() {
    const layout = document.querySelector(".l-ui.layout")
    if (layout) {
        if (layout.style.display !== "none") {
            layout.style.display = "none"
        } else {
            layout.style.display = "grid"
        }
    }
}

const mainMenu = {
    name: "KEK UI Main Menu",
    menuStatus: {
        "Hide EXP": () => {
            return (ui.expbar.element.style.display == "none") ? true : false
        },
        "Mouse Over": () => {
            return mouseOver.state.enabled ? true : false
        },
        "UIMode": () => {
            const kekInput = document.querySelector(".kek-ui-input")
            if (kekInput)
                return kekInput.style.display == "none" ? false : true
            return false
        },
        "Disable Class Colors": () => {
            return gui.state._color ? false : true
        }
    },
    hotkey: {
        "Open Menu": { key: "u", callback: "generate" }
    },
    start() {

    },
    stop() {

    },
    generate(event) {
        let contextMenu = document.querySelector(".kek-ui-mainmenu");

        if (contextMenu) {
            contextMenu.remove();
            return
        }

        contextMenu = document.createElement('div');
        contextMenu.className = 'widow panel-black border black kek-ui-mainmenu absCentered';

        // Title frame
        const titleFrame = document.createElement('div');
        titleFrame.className = 'titleframe svelte-yjs4p5';
        titleFrame.style.display = 'flex';
        titleFrame.style.justifyContent = 'space-between';

        const title = document.createElement('div');
        title.className = 'textprimary title svelte-yjs4p5';
        title.textContent = 'UI Menu'; // Replace with your title text
        title.style.width = '200px';
        title.style.padding = '10px';
        title.style.fontSize = "20px"

        const closeButton = document.createElement('img');
        closeButton.src = '/data/ui/icons/cross.svg?v=8498194';
        closeButton.className = 'btn black svgicon';
        closeButton.style.padding = "5px"
        closeButton.addEventListener('click', function () {
            contextMenu.remove();
        });

        titleFrame.appendChild(title);
        titleFrame.appendChild(closeButton);
        contextMenu.appendChild(titleFrame);

        const panelBlackBar = document.createElement("div")
        panelBlackBar.className = "panel-black bar"
        // Hardcoded choices
        const choices = [
            'UIMode', "Mouse Over", "Blocked Players",
            "Emoji", "Picture Mode", "Rune Tracker", "Kill Tracker",
            "Disable Class Colors", "ExportUI", "ImportUI", "ResetUI"
        ];

        // Add choices to the context menu
        choices.forEach(choiceText => {
            const choiceElement = document.createElement('div');
            choiceElement.className = 'choice-item btn black textsecondary'; // Updated class to "choice-item"
            choiceElement.textContent = choiceText;
            choiceElement.style.padding = "5px"
            choiceElement.style.fontSize = "15px"
            if (this.menuStatus[choiceText] && typeof this.menuStatus[choiceText] == "function" && this.menuStatus[choiceText]()) {
                choiceElement.classList.add("textgreen")
                choiceElement.classList.remove("textsecondary")
            }
            // Add event listener to each choice (modify as needed)
            choiceElement.addEventListener('click', (event) => {
                if (menuFunctions[choiceText]) {
                    menuFunctions[choiceText](event);
                }
                if (this.menuStatus[choiceText] && typeof this.menuStatus[choiceText] == "function" && this.menuStatus[choiceText]()) {
                    choiceElement.classList.add("textgreen")
                    choiceElement.classList.remove("textsecondary")
                } else {
                    choiceElement.classList.remove("textgreen")
                    choiceElement.classList.add("textsecondary")
                }
            });

            panelBlackBar.appendChild(choiceElement);
        });

        contextMenu.appendChild(panelBlackBar)
        contextMenu.style.zIndex = 9999
        // Append the context menu to the specified element
        const targetElement = document.querySelector('body');

        if (targetElement) {
            targetElement.appendChild(contextMenu);
        }

    },
}

export default mainMenu