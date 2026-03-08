import eventManager from "../core/event"
import stateManager from "../core/state"
import ui from "../core/ui"
import { addSysbtn } from "../core/widgets/btnbar"
import { makeDraggable } from "../core/widgets/drag"
import element from "../core/widgets/element"
import { getClass } from "../core/widgets/player"
import { makeScaleable } from "../core/widgets/scale"

const gui = {
    name: "GUI",
    description: "Partyframes/Targetframes/chat customizations",
    state: {
        "_transform": {
            "partyframes": {
                "height": 60,
                "width": 120,
                "_drag": true,
                "_scale": true,
                "left": 591,
                "top": 675
            },
            "ufplayer": {
                "_drag": true,
                "top": -476,
                "left": -339
            },
            "uftarget": {
                "top": -482,
                "left": 340,
                "_drag": true
            },
            "targetframes": {
                "height": 30,
                "width": 195,
                "_scale": true
            },
            "chatPanel": {
                "_drag": true,
                "left": 0,
                "top": 0
            },
            "skillbar": {
                "_drag": true,
                "left": -279,
                "top": -74
            }
        },
        "_configs": {
            "partyframes": {
                "colors": {
                    "kek-bgc0": {
                        "top": [
                            "#5a3816",
                            0
                        ],
                        "middle": [
                            "#70563c",
                            50
                        ],
                        "bottom": [
                            "#8B6D4D",
                            100
                        ]
                    },
                    "kek-bgc1": {
                        "top": [
                            "#11698d",
                            0
                        ],
                        "middle": [
                            "#0992cc",
                            49
                        ],
                        "bottom": [
                            "#159cd4",
                            100
                        ]
                    },
                    "kek-bgc2": {
                        "top": [
                            "#76b935",
                            0
                        ],
                        "middle": [
                            "#76c134",
                            50
                        ],
                        "bottom": [
                            "#79c232",
                            100
                        ]
                    },
                    "kek-bgc3": {
                        "top": [
                            "#20367f",
                            0
                        ],
                        "middle": [
                            "#2644a7",
                            50
                        ],
                        "bottom": [
                            "#3859c7",
                            100
                        ]
                    },
                    "kek-bgc4": {
                        "top": [
                            "#2ba71e",
                            0
                        ],
                        "middle": [
                            "#0fce00",
                            49
                        ],
                        "bottom": [
                            "#20b611",
                            100
                        ]
                    },
                    "kek-bgc5": {
                        "top": [
                            "#9f0707",
                            0
                        ],
                        "middle": [
                            "#c62527",
                            49
                        ],
                        "bottom": [
                            "#F42929",
                            100
                        ]
                    }
                },
                "playerPerRow": 5,
                "buffSize": 17,
                "buffTextSize": 10,
                "buffPosition": 0,
                "gridGap": 10
            },
            "targetframes": {
                "buffSize": 25,
                "buffTextSize": 15
            },
            "skillbar": {
                "skillsPerRow": 20,
                "slotSize": 35
            },
            "chatPanel": {
                "colors": {
                    "textglobal": "#ffcb9d",
                    "textnotice": "#9de74d",
                    "textparty": "#2ed3f6",
                    "textfaction": "#f68e7a",
                    "textclan": "#de8b09",
                    "textsystem": "#4de751",
                    "textto": "#ef3eff",
                    "textfrom": "#ef3eff"
                },
                "fontSize": 15,
                "blackChat": 1,
                "height": 250,
                "width": 470
            }
        },
        "_color": true,
        "_lock": false
    },
    defaultState: {
        "_transform": {
            "partyframes": {
                "height": 60,
                "width": 120,
                "_drag": true,
                "_scale": true,
                "left": 591,
                "top": 675
            },
            "ufplayer": {
                "_drag": true,
                "top": -476,
                "left": -339
            },
            "uftarget": {
                "top": -482,
                "left": 340,
                "_drag": true
            },
            "targetframes": {
                "height": 30,
                "width": 195,
                "_scale": true
            },
            "chatPanel": {
                "_drag": true,
                // "left": 44,
                // "top": 644
            },
            "skillbar": {
                "_drag": true,
                "left": -279,
                "top": -74
            }
        },
        "_configs": {
            "partyframes": {
                "colors": {
                    "kek-bgc0": {
                        "top": [
                            "#5a3816",
                            0
                        ],
                        "middle": [
                            "#70563c",
                            50
                        ],
                        "bottom": [
                            "#8B6D4D",
                            100
                        ]
                    },
                    "kek-bgc1": {
                        "top": [
                            "#11698d",
                            0
                        ],
                        "middle": [
                            "#0992cc",
                            49
                        ],
                        "bottom": [
                            "#159cd4",
                            100
                        ]
                    },
                    "kek-bgc2": {
                        "top": [
                            "#76b935",
                            0
                        ],
                        "middle": [
                            "#76c134",
                            50
                        ],
                        "bottom": [
                            "#79c232",
                            100
                        ]
                    },
                    "kek-bgc3": {
                        "top": [
                            "#20367f",
                            0
                        ],
                        "middle": [
                            "#2644a7",
                            50
                        ],
                        "bottom": [
                            "#3859c7",
                            100
                        ]
                    },
                    "kek-bgc4": {
                        "top": [
                            "#2ba71e",
                            0
                        ],
                        "middle": [
                            "#0fce00",
                            49
                        ],
                        "bottom": [
                            "#20b611",
                            100
                        ]
                    },
                    "kek-bgc5": {
                        "top": [
                            "#9f0707",
                            0
                        ],
                        "middle": [
                            "#c62527",
                            49
                        ],
                        "bottom": [
                            "#F42929",
                            100
                        ]
                    }
                },
                "playerPerRow": 5,
                "buffSize": 17,
                "buffTextSize": 10,
                "buffPosition": 0,
                "gridGap": 10
            },
            "targetframes": {
                "buffSize": 25,
                "buffTextSize": 15
            },
            "skillbar": {
                "skillsPerRow": 12,
                "slotSize": 35
            },
            "chatPanel": {
                "colors": {
                    "textglobal": "#ffcb9d",
                    "textnotice": "#9de74d",
                    "textparty": "#2ed3f6",
                    "textfaction": "#f68e7a",
                    "textclan": "#de8b09",
                    "textsystem": "#4de751",
                    "textto": "#ef3eff",
                    "textfrom": "#ef3eff"
                },
                "fontSize": 15,
                "blackChat": 1,
                "height": 250,
                "width": 470
            }
        },
        "_color": true,
        "_lock": false
    },
    _profiles: true,
    style: ".svelte-svpjti {display: none;}",
    gradientNames: [
        "kek-bgc0",
        "kek-bgc1",
        "kek-bgc2",
        "kek-bgc3",
        "kek-bgc5",
        "kek-bgc4",
    ],
    start() {
        this.makeElementsDraggable();
        eventManager.on("ui.partyframes", this.handlePartyframes, this);
        eventManager.on("ui.chatPanel", this.handleChatPanel, this);
        eventManager.on("ui.targetframes", this.handleTargetframes, this);
        eventManager.on("ui.partyGrid", this.handlePartyGrid, this);
        eventManager.on("ui.uftarget", this.handleTargetGrid, this);
        eventManager.on("ui.ufplayer", this.handleTargetGrid, this);
        eventManager.on("ui.skillbar", this.handleSkillbar, this);
        eventManager.on("ui.uftarget", this.handleUftargetMutations, this)
        eventManager.on("click.lockUI", this.toggleLockUI, this);
        eventManager.on("click.toggleColors", this.toggleColorize, this)
        eventManager.on("click.importGUI", this.handleImportUI, this)
        eventManager.on("click.exportGUI", this.handleExportUI, this)
        eventManager.on("click.resetGUI", this.handleResetUI, this)
        eventManager.on("ui.sysbtnbar", this.addBtn, this)
        if (ui.sysbtnbar) {
            if (!this.lockBtn) {
                console.log("adding button manually!")
                this.addBtn(ui.sysbtnbar)
            }
        }
    },
    stop() {
        eventManager.off("ui.partyframes", this.handlePartyframes, this);
        eventManager.off("ui.chatPanel", this.handleChatPanel, this);
        eventManager.off("ui.targetframes", this.handleTargetframes, this);
        eventManager.off("ui.partyGrid", this.handlePartyGrid, this);
        eventManager.off("ui.uftarget", this.handleTargetGrid, this);
        eventManager.off("ui.ufplayer", this.handleTargetGrid, this);
        eventManager.off("ui.skillbar", this.handleSkillbar, this);
        eventManager.off("ui.uftarget", this.handleUftargetMutations, this)
        eventManager.off("click.lockUI", this.toggleLockUI, this);
        eventManager.off("click.toggleColors", this.toggleColorize, this)
        eventManager.off("click.importGUI", this.handleImportUI, this)
        eventManager.off("click.exportGUI", this.handleExportUI, this)
        eventManager.off("click.resetGUI", this.handleResetUI, this)
        eventManager.off("ui.sysbtnbar", this.addBtn, this)
        if (this.lockBtn) {
            this.lockBtn.remove()
            this.lockBtn = null
        }
    },
    lockBtn: null,
    addBtn(sysbtnbar) {
        sysbtnbar = sysbtnbar.element
        const lockBtn = this.createBtn("Lck🔒", "Lock UI", this.handleLockBtn.bind(this));

        this.lockBtn = lockBtn

        addSysbtn(sysbtnbar, lockBtn)
    },
    handleLockBtn(button) {
        if (this.state._lock) {
            button.classList.add("textgreen")
            button.classList.remove("textsecondary")
        } else {
            button.classList.remove("textgreen")
            button.classList.add("textsecondary")
        }
        button.addEventListener("click", () => {
            this.toggleLockUI()
            if (this.state._lock) {
                button.classList.add("textgreen")
                button.classList.remove("textsecondary")
            } else {
                button.classList.remove("textgreen")
                button.classList.add("textsecondary")
            }
        })
    },
    createBtn(text, title, handleFunc) {
        const button = element("div", {
            className: "btn border black textsecondary",
            textContent: text,
            tooltip: title,
            style: "padding-left: 3px; padding-right: 3px; margin: 2px;"
        }).element

        handleFunc(button)

        return button
    },
    toggleLockUI() {
        this.state._lock ^= 1
        // const windowSettings = localState.getWindowSettings()
        // if(windowSettings) {
        //     console.log(windowSettings)
        //     for(let setting of windowSettings) {
        //         setting.locked = this.state._lock
        //     }
        //     localState.setWindowSettings(windowSettings)
        // }
        // location.reload()
    },
    toggleColorize() {
        this.state._color = !this.state._color;
        window.location.reload()
    },
    partyColors: {
        "kek-bgc0": {
            top: ["#5a3816", 0],
            middle: ["#70563c", 50],
            bottom: ["#8B6D4D", 100],
        },
        "kek-bgc1": {
            top: ["#11698d", 0],
            middle: ["#0992cc", 49],
            bottom: ["#159cd4", 100],
        },
        "kek-bgc2": {
            top: ["#76b935", 0],
            middle: ["#76c134", 50],
            bottom: ["#79c232", 100],
        },
        "kek-bgc3": {
            top: ["#20367f", 0],
            middle: ["#2644a7", 50],
            bottom: ["#3859c7", 100],
        },
        "kek-bgc4": {
            top: ["#2ba71e", 0],
            middle: ["#0fce00", 49],
            bottom: ["#20b611", 100],
        },
        "kek-bgc5": {
            top: ["#9f0707", 0],
            middle: ["#c62527", 49],
            bottom: ["#F42929", 100],
        },
    },
    chatColors: {
        textglobal: "#ffcb9d",
        textnotice: "#9de74d",
        textparty: "#2ed3f6",
        textfaction: "#f68e7a",
        textclan: "#de8b09",
        textsystem: "#4de751",
        textto: "#ef3eff",
        textfrom: "#ef3eff",
    },
    makeElementsDraggable() {
        for (let name in this.state._transform) {
            const transform = this.state._transform[name];

            if (name == "chatPanel") {
                eventManager.on(`ui.${name}`, (element) => {
                    makeDraggable(element.element.parentNode, transform);
                });
            } else {
                eventManager.on(`ui.${name}`, (element) => {
                    makeDraggable(element.element, transform);
                });
            }
        }
    },

    // Add the party color button to your HTML
    // Adjust class names and styling according to your UI
    createInputParty(placeholder, prop) {
        const handleInputField = () => {
            let inputValue = parseInt(inputField.value);
            if (inputValue > 50) {
                inputField.value = 50;
            }

            if (inputValue < 1) {
                inputField.value = 1;
            }

            inputValue = parseInt(inputField.value);

            // Use prop as the key for the property in this.state._configs.partyframes
            this.state._configs.partyframes[prop] = inputValue;
            this.updatePartyStyle();
        };
        const inputField = document.createElement("input");
        inputField.placeholder = placeholder;
        inputField.title = `${placeholder}`;
        inputField.style.width = "70px";
        inputField.style.height = "40px";
        inputField.type = "number";
        inputField.value = this.state._configs.partyframes[prop];
        inputField.classList.add("kek-ui-input");

        inputField.style.display = "none";

        // Add an event listener for the input event
        inputField.addEventListener("input", handleInputField);
        return inputField;
    },

    handlePartyframes(partyframes) {
        partyframes = partyframes.element
        this.updatePartyStyle();
        // Create Horizontal Stack Button
        const buffPositionBtn = document.createElement("div");
        buffPositionBtn.textContent = "Change Buff Position";
        buffPositionBtn.addEventListener("click", () => {
            this.toggleBuffPosition()
        });
        buffPositionBtn.title = "Click to change buff orientation";
        buffPositionBtn.style.zIndex = "1";
        buffPositionBtn.classList.add(
            "horizontal-btn",
            "kek-ui-btn",
            "btn",
            "black",
            "textsecondary"
        );
        buffPositionBtn.style.marginRight = "10px";

        // Function to check if the partyframes element is available

        const scaleBtn = document.createElement("div");
        scaleBtn.title = "Hold and Drag to change size";
        scaleBtn.textContent = "Change Size";
        scaleBtn.classList.add(
            "scale-btn-party",
            "btn",
            "black",
            "textsecondary",
            "kek-ui-btn"
        );
        scaleBtn.style.zIndex = "1";
        // scaleBtn.style.height = btnSize + "px"
        // scaleBtn.style.width = btnSize + "px"
        scaleBtn.style.marginRight = "10px";

        makeScaleable(partyframes, scaleBtn, this.state._transform.partyframes);

        // Create the party color button element
        const partyColorButton = document.createElement("div");
        partyColorButton.textContent = "Colors";
        partyColorButton.style.marginRight = "10px";
        partyColorButton.style.zIndex = "1";
        partyColorButton.title = "Click to change party colors";
        partyColorButton.addEventListener("click", (e) => {
            if (e.target === partyColorButton) {
                this.openPartyColorCustomization(e);
            }
        });
        partyColorButton.classList.add(
            "partyColorButton",
            "kek-ui-btn",
            "btn",
            "black",
            "textsecondary"
        );

        scaleBtn.style.display = "none";
        buffPositionBtn.style.display = "none";
        partyColorButton.style.display = "none";

        if (!partyframes.querySelector(".kek-ui-input")) {
            const playerPerRowInput = this.createInputParty(
                "Player Per Row",
                "playerPerRow"
            );
            const buffSizeInput = this.createInputParty("Party Buff Size", "buffSize");
            const buffTextSizeInput = this.createInputParty(
                "Party Buff Stack Text Size",
                "buffTextSize"
            );
            const gridGapInput = this.createInputParty("Grid Space", "gridGap");

            // Create a flex container for the inputs
            const inputContainer = document.createElement("div");
            inputContainer.style.display = "flex";
            inputContainer.style.left = "10px";
            inputContainer.style.top = "-50px";
            inputContainer.style.position = "absolute";
            inputContainer.classList.add("ignoreScale");
            inputContainer.classList.add("inputContainerKEK");
            inputContainer.appendChild(partyColorButton);
            inputContainer.appendChild(buffPositionBtn);
            inputContainer.appendChild(scaleBtn);
            inputContainer.appendChild(playerPerRowInput);
            inputContainer.appendChild(buffSizeInput);
            inputContainer.appendChild(buffTextSizeInput);
            inputContainer.appendChild(gridGapInput);

            partyframes.insertBefore(inputContainer, partyframes.firstChild);
        }

        const grids = partyframes.children
        for (let grid of grids) {
            if (!grid.classList.contains("grid")) continue
            this.handlePartyGrid({ element: grid })
        }
    },

    handleRightSpanMutations(node) {
        const rightSpan = node.querySelector("span.right");
        // Check if right span is found
        if (rightSpan && !rightSpan.classList.contains("mutationObserving")) {
            // console.log("Observing", rightSpan.closest(".left").textContent)
            // Create a MutationObserver to watch for changes in the right span's character data
            let prevText = rightSpan.textContent;
            const rightSpanObserver = new MutationObserver(() => {
                if (
                    prevText.trim().toLowerCase() == "offline" ||
                    prevText.trim().toLowerCase() == "dead"
                ) {
                    // console.log(
                    //     "Character data of right span changed:",
                    //     rightSpan.textContent
                    // );
                    const grid = rightSpan.closest(".grid");
                    this.colorizeGrid(grid);
                }
                prevText = rightSpan.textContent;
                // Perform your actions when character data changes
            });

            rightSpanObserver.observe(rightSpan, {
                characterData: true,
                attributes: false,
                childList: false,
                subtree: true,
            });
            rightSpan.classList.add("mutationObserving");
        }
    },

    handleUftargetMutations(uftarget) {
        uftarget = uftarget.element
        if (uftarget && !uftarget.classList.contains("mutationObserving")) {
            const classIcon = uftarget.querySelector(".icon")
            const handleMutation = (mutationsList, observer) => {
                for (const mutation of mutationsList) {
                    if (mutation.type === "attributes") {
                        const target = mutation.target
                        if (target.classList.contains("pclass")) {
                            this.colorizeGrid(uftarget)
                        }
                    }
                }
            }
            const uftargetObserver = new MutationObserver(handleMutation);

            uftargetObserver.observe(classIcon, { attributes: true })
            uftarget.classList.add("mutationObserving")
        }
    },

    copyArticleSender(article) {
        const senderElement = article.querySelector(".name");
        const copySender = senderElement.textContent;

        // Perform copy to clipboard logic (use a temporary textarea, document.execCommand, or Clipboard API)
        // Example using Clipboard API:
        if (copySender) {
            navigator.clipboard
                .writeText(copySender)
                .then(() =>
                    console.log("Article sender copied to clipboard:", copySender)
                )
                .catch((error) => console.error("Copy failed:", error));
        }
    },

    // Function to copy content of an article
    copyArticleContent(article) {
        const contentSpan = article.querySelector(".content");
        const copyContent = contentSpan.nextElementSibling.textContent;
        // Perform copy to clipboard logic (use a temporary textarea, document.execCommand, or Clipboard API)
        // Example using Clipboard API:
        if (copyContent) {
            navigator.clipboard
                .writeText(copyContent)
                // .then(() => console.log("Article content copied to clipboard"), copyContent)
                .catch((error) => console.error("Copy failed:", error));
        }
    },
    // Function to get party colors from localStorage
    getPartyColors() {
        return this.state._configs.partyframes.colors;
    },
    // Function to set party colors to localStorage
    setPartyColors(colors) {
        this.state._configs.partyframes.colors = colors;
    },

    updatePartyStyle() {
        const partyColors = this.getPartyColors();

        const partyframes = document.querySelector(".partyframes");

        partyframes.style.gridTemplateColumns = `repeat(${this.state._configs.partyframes.playerPerRow}, auto)`;
        partyframes.style.gap = `${this.state._configs.partyframes.gridGap}px`;

        const grids = partyframes.children
        for (let grid of grids) {
            if (!grid.classList.contains("grid")) continue
            this.handleBuffarray(grid)
        }
        // Create a style string based on partyColors
        const styleString = Object.entries(partyColors)
            .map(([key, values]) => {
                const [topColor, topPercentage] = values.top;
                const [middleColor, middlePercentage] = values.middle;
                const [bottomColor, bottomPercentage] = values.bottom;

                return `
        .${key} {
        background: linear-gradient(0deg, ${topColor} ${topPercentage}%, ${middleColor} ${middlePercentage}%, ${bottomColor} ${bottomPercentage}%);
        }
        `;
            })
            .join("\n");

        // Remove existing style tag with ID 'partyStyleKEK'
        const existingStyleTag = document.getElementById("partyStyleKEK");
        if (existingStyleTag) {
            existingStyleTag.remove();
        }

        // Create a new style tag
        const styleTag = document.createElement("style");
        styleTag.id = "partyStyleKEK";
        styleTag.classList.add("ignoreScale");
        styleTag.textContent = styleString;
        // console.log(styleTag)
        // Append the style tag to the partyframes
        document.body.insertBefore(styleTag, document.body.firstChild);
    },

    updateTargetStyle() {
        const targetframes = document.querySelector(".targetframes")
        const grids = targetframes.children
        for (let grid of grids) {
            if (!grid.classList.contains("grid")) continue
            this.handleBuffarray(grid)
        }
    },

    toggleBuffPosition() {
        this.state._configs.partyframes.buffPosition = this.state._configs.partyframes.buffPosition == 0 ? 1 : 0
        const partyframes = document.querySelector(".partyframes")
        const grids = partyframes.children
        for (let grid of grids) {
            if (!grid.classList.contains("grid")) continue
            this.handleBuffarray(grid)
        }
    },

    getClassName(idx) {
        return {
            0: "Warrior",
            1: "Mage",
            2: "Archer",
            3: "Shaman",
            4: "Wardens/Conjurer",
            5: "Enemy/Monster",
        }[idx];
    },
    // Function to open party color customization
    openPartyColorCustomization(e) {
        const existingUI = document.querySelector(".party-color-customizationKEK");
        if (existingUI) {
            existingUI.parentNode.remove();
            return;
        }

        const partyColors = this.getPartyColors(); // Fetch partyColors from localStorage

        // Create color customization UI
        const partyColorButton = document.querySelector(".partyColorButton");
        const mainContainer = document.createElement("div");
        mainContainer.className = "widow panel-black border black";
        const colorCustomizationUI = document.createElement("div");
        colorCustomizationUI.className =
            "party-color-customizationKEK panel-black bar";
        colorCustomizationUI.style.position = "absolute";
        colorCustomizationUI.style.display = "grid";
        colorCustomizationUI.style.gridTemplateColumns = "repeat(1, auto)";
        colorCustomizationUI.style.top = partyColorButton.offsetTop - 300 + "px";
        colorCustomizationUI.style.left =
            partyColorButton.offsetLeft + partyColorButton.offsetWidth + 10 + "px";

        for (const key in partyColors) {
            const flexContainer = document.createElement("div");
            flexContainer.style.display = "flex";
            flexContainer.style.alignItems = "center";
            const colorItem = document.createElement("div");
            colorItem.className = "color-item-party btn black textsecondary";
            const classIdx = key.split("bgc")[1];
            colorItem.textContent = this.getClassName(classIdx);

            // Create color picker for the top color
            const topColorPicker = this.createColorPicker(
                "Top Color",
                "top",
                partyColors[key].top[0],
                (value) => {
                    this.handlePartyColorChange(key, "top", value);
                }
            );

            // Create color picker for the middle color
            const middleColorPicker = this.createColorPicker(
                "Middle Color",
                "middle",
                partyColors[key].middle[0],
                (value) => {
                    this.handlePartyColorChange(key, "middle", value);
                }
            );

            // Create color picker for the bottom color
            const bottomColorPicker = this.createColorPicker(
                "Bottom Color",
                "bottom",
                partyColors[key].bottom[0],
                (value) => {
                    this.handlePartyColorChange(key, "bottom", value);
                }
            );

            // Create percentage inputs for the top, middle, and bottom colors
            const topPercentageInput = this.createPercentageInput(
                key,
                "top",
                partyColors[key].top[1]
            );
            const middlePercentageInput = this.createPercentageInput(
                key,
                "middle",
                partyColors[key].middle[1]
            );
            const bottomPercentageInput = this.createPercentageInput(
                key,
                "bottom",
                partyColors[key].bottom[1]
            );
            const dummyDiv = document.createElement("div");
            const dummyContainer = document.createElement("div");
            dummyContainer.className = "bar  svelte-i7i7g5";
            dummyDiv.classList.add("progressBar", `kek-bgc${classIdx}`);
            dummyDiv.style.height = "50px";
            dummyDiv.style.width = "120px";
            dummyContainer.style.marginLeft = "20px";
            const dummyLeft = document.createElement("span");
            dummyLeft.classList.add("left");
            dummyLeft.textContent = "Dummy";
            dummyLeft.style.marginLeft = "5px";
            const dummyRight = document.createElement("span");
            dummyRight.classList.add("right", "svelte-i7i7g5");
            dummyRight.textContent = "0/0";

            dummyDiv.appendChild(dummyLeft);
            dummyDiv.appendChild(dummyRight);

            colorItem.style.width = "150px";
            colorItem.style.padding = "10px";

            dummyContainer.appendChild(dummyDiv);

            flexContainer.appendChild(colorItem);
            flexContainer.appendChild(topColorPicker);
            topColorPicker.style.margingLeft = "5px";
            flexContainer.appendChild(topPercentageInput);
            flexContainer.appendChild(middleColorPicker);
            flexContainer.appendChild(middlePercentageInput);
            flexContainer.appendChild(bottomColorPicker);
            flexContainer.appendChild(bottomPercentageInput);
            flexContainer.appendChild(dummyContainer);
            flexContainer.style.padding = "5px";
            colorCustomizationUI.appendChild(flexContainer);
        }
        const resetBtn = document.createElement("button");
        resetBtn.classList.add("btn", "black", "textsecondary");
        resetBtn.textContent = "Reset";
        resetBtn.addEventListener("click", () => {
            this.setPartyColors(this.partyColors);
            this.openPartyColorCustomization();
            this.updatePartyStyle();
        });
        colorCustomizationUI.appendChild(resetBtn);
        mainContainer.appendChild(colorCustomizationUI);
        colorCustomizationUI.style.zIndex = 20;
        // console.log(e.target)
        e.target.parentNode.appendChild(mainContainer);
    },

    // Function to handle party color change
    handlePartyColorChange(key, section, value) {
        const partyColors = this.getPartyColors();
        partyColors[key][section][0] = value;
        this.setPartyColors(partyColors);
    },

    createColorPicker(title, type, initialValue, eventHandler) {
        const colorPicker = document.createElement("input");
        colorPicker.type = "color";
        colorPicker.title = title;
        colorPicker.style.height = "35px";
        colorPicker.style.width = "35px";
        colorPicker.value = initialValue;
        colorPicker.style.flex = 1;
        colorPicker.addEventListener("input", (event) => {
            event.stopPropagation();
            eventHandler(event.target.value);
            this.updatePartyStyle();
        });

        return colorPicker;
    },
    // Helper function to create a percentage input
    createPercentageInput(key, section, value) {
        const percentageInput = document.createElement("input");
        percentageInput.type = "number";
        percentageInput.placeholder = "Percentage";
        percentageInput.value = value;
        percentageInput.title = "Percentage value";
        percentageInput.style.width = "45px";
        percentageInput.style.flex = 1;
        percentageInput.style.height = "35px";
        percentageInput.addEventListener("input", (event) => {
            event.stopPropagation();
            let inputValue = parseInt(event.target.value);

            // Ensure the input value is within the range of 0 to 100
            if (inputValue < 0) {
                inputValue = 0;
            } else if (inputValue > 100) {
                inputValue = 100;
            }

            // Update the input value
            percentageInput.value = inputValue;

            // Call the handler function
            this.handlePartyPercentageChange(key, section, inputValue);
        });
        return percentageInput;
    },

    // Function to handle party percentage change
    handlePartyPercentageChange(key, section, value) {
        const partyColors = this.getPartyColors();
        partyColors[key][section][1] = parseInt(value);
        this.setPartyColors(partyColors);
    },
    // Function to open chat color customization
    openChatColorCustomization(e) {
        const existingCustomizationPanel = document.querySelector(
            ".chat-color-customizationKEK"
        );

        if (existingCustomizationPanel) {
            existingCustomizationPanel.remove();
            return;
        }
        const chatColors = this.getChatColors(); // Fetch chatColors from localStorage

        // Create color customization UI
        const colorCustomizationUI = document.createElement("div");
        colorCustomizationUI.className = "chat-color-customizationKEK panel-black";
        colorCustomizationUI.style.position = "absolute";
        colorCustomizationUI.style.display = "grid";
        colorCustomizationUI.style.gridTemplateColumns = "repeat(2, auto)";
        colorCustomizationUI.style.top = chat.offsetTop - 400 + "px";
        colorCustomizationUI.style.left = chat.offsetLeft + "px";

        const resetBtn = document.createElement("button");
        const resetDiv = document.createElement("div");
        resetBtn.className = "btn black textsecondary";
        resetBtn.textContent = "Reset";
        resetBtn.addEventListener("click", () => {
            this.setChatColors(this.chatColors);
            this.openChatColorCustomization();
            this.updateChatStyle();
        });
        colorCustomizationUI.appendChild(resetBtn);
        colorCustomizationUI.appendChild(resetDiv);
        for (const key in chatColors) {
            const colorItem = document.createElement("div");
            colorItem.className = "color-item";
            colorItem.textContent = key.split("text")[1].toUpperCase();

            const colorPicker = document.createElement("input");
            colorPicker.type = "color";
            colorPicker.value = chatColors[key];
            colorPicker.addEventListener("input", (event) => {
                event.stopPropagation();
                this.handleChatColorChange(key, event.target.value);
            });

            colorItem.style.width = "100px";
            colorItem.style.padding = "10px";
            colorPicker.style.width = "30px";
            colorPicker.style.height = "30px";
            colorCustomizationUI.appendChild(colorItem);
            colorCustomizationUI.appendChild(colorPicker);
        }
        colorCustomizationUI.style.zIndex = 2;
        e.target.appendChild(colorCustomizationUI);
    },

    // Function to handle color changes and update localStorage
    handleChatColorChange(key, color) {
        const chatColors = this.getChatColors();
        chatColors[key] = color;
        this.setChatColors(chatColors); // Store updated chatColors in localStorage
        this.updateChatStyle(); // Update chat style with new colors
    },

    // Function to fetch chatColors from localStorage
    getChatColors() {
        return this.state._configs.chatPanel.colors;
    },

    // Function to store chatColors in localStorage
    setChatColors(chatColors) {
        this.state._configs.chatPanel.colors = chatColors;
    },

    // Function to create input elements
    createInputChat(placeholder, value, type = "number") {
        const input = document.createElement("input");
        input.type = type;
        input.className = "kek-ui-input";
        input.placeholder = placeholder;
        input.title = `${placeholder}`;
        input.value = value || "";
        return input;
    },

    // Function to handle input changes
    handleInputChangeChat(prop) {
        return (event) => {
            // Initialize this.state._configs.chatPanel if it doesn't exist
            this.state._configs.chatPanel = this.state._configs.chatPanel || {};

            const inputValue = event.target.value;
            this.state._configs.chatPanel[prop] = inputValue;
            // console.log(inputValue)
            this.updateChatStyle(); // Update chat style after props change
        };
    },

    // Function to update chat style based on props
    updateChatStyle() {
        // const chat = document.querySelector("#chat");
        // if (!chat) return;
        // const existingChatStyles = chat.querySelector(".chat-styles-kek");
        // if (existingChatStyles) {
        //     existingChatStyles.remove();
        // }

        // const chatStyles = document.createElement("style");
        // chatStyles.className = "chat-styles-kek";

        // const chatColors = this.getChatColors();

        // for (const className in chatColors) {
        //     const color = chatColors[className];
        //     // Append CSS rule for each class
        //     chatStyles.appendChild(
        //         document.createTextNode(`.${className} { color: ${color}; }`)
        //     );
        // }

        // chat.appendChild(chatStyles);

        // chat.style.fontSize = this.state._configs.chatPanel.fontSize + "px";
        // if (this.state._configs.chatPanel.blackChat == 0) {
        //     chat.classList.remove("panel-black");
        // } else {
        //     chat.classList.add("panel-black");
        // }
        // chat.style.height = this.state._configs.chatPanel.height + "px";
        // chat.style.width = this.state._configs.chatPanel.width + "px";
    },
    // Function to position input over chat
    positionOverChat(input) {
        const chatParentRect = chat.parentNode.getBoundingClientRect();
        const chatRect = chat.getBoundingClientRect();
        const offsetTop = 40;
        input.style.position = "absolute";
        input.style.left = chatRect.left - chatParentRect.left + "px";
        input.style.top = chatRect.top - chatParentRect.top - offsetTop + "px";
    },

    handleChatPanel(chatPanel) {
        chatPanel = chatPanel.element
        chatPanel.scrollTop = chatPanel.scrollHeight + 10

        chatPanel.addEventListener("contextmenu", (event) => {
            const targetArticle = event.target.closest("article");
            if (targetArticle) {
                // Right-clicked on an article, handle copy logic here
                event.preventDefault();
                const menu = document.querySelector(".context");
                // console.log(menu)
                const copyChoice = document.createElement("div");
                copyChoice.classList.add("choice");
                copyChoice.textContent = "Copy";
                copyChoice.addEventListener("click", () => {
                    this.copyArticleContent(targetArticle);
                    menu.remove();
                });
                menu.appendChild(copyChoice);

                // console.log(menu)
                const copyName = document.createElement("div");
                copyName.classList.add("choice");
                copyName.textContent = "Copy Name";
                copyName.addEventListener("click", () => {
                    this.copyArticleSender(targetArticle);
                    menu.remove();
                });
                menu.appendChild(copyName);
            }
        });


        this.updateChatStyle();
        // Create input elements for font-size, height, and width
        // const fontSizeInput = this.createInputChat(
        //     "Font Size",
        //     this.state._configs.chatPanel.fontSize
        // );
        // const heightInput = this.createInputChat(
        //     "Chat Height",
        //     this.state._configs.chatPanel.height
        // );
        // const widthInput = this.createInputChat(
        //     "Chat Width",
        //     this.state._configs.chatPanel.width
        // );
        // const blackChatCheckInput = this.createInputChat(
        //     "Black Chat?",
        //     this.state._configs.chatPanel.blackChat
        // );
        // Add a button for chat color customization
        // const chatColorButton = document.createElement("div");
        // chatColorButton.className = "kek-ui-btn btn black textsecondary";
        // chatColorButton.textContent = "Colors";
        // chatColorButton.title = "Click to change chat colors";
        // chatColorButton.style.width = "300px";
        // chatColorButton.addEventListener("click", (e) => {
        //     if (e.target === chatColorButton) {
        //         this.openChatColorCustomization(e);
        //     }
        // });

        // Create a flex container for input elements
        // const inputContainer = document.createElement("div");
        // inputContainer.style.display = "flex";
        // inputContainer.style.position = "absolute";
        // inputContainer.style.top = chat.offsetTop + "px";
        // inputContainer.style.left = chat.offsetLeft + chat.offsetWidth + 10 + "px"; // Adjust the offset as needed

        // Append input elements to the flex container
        // inputContainer.appendChild(chatColorButton);
        // inputContainer.appendChild(fontSizeInput);
        // inputContainer.appendChild(heightInput);
        // inputContainer.appendChild(widthInput);
        // inputContainer.appendChild(blackChatCheckInput);

        // chat.parentNode.insertBefore(inputContainer, chat.parentNode.firstChild);
        // chat.parentNode.appendChild(blackChatCheckbox)
        // this.positionOverChat(inputContainer);
        // Event listeners for input elements
        // fontSizeInput.addEventListener(
        //     "input",
        //     this.handleInputChangeChat("fontSize")
        // );
        // heightInput.addEventListener("input", this.handleInputChangeChat("height"));
        // widthInput.addEventListener("input", this.handleInputChangeChat("width"));
        // blackChatCheckInput.addEventListener(
        //     "input",
        //     this.handleInputChangeChat("blackChat")
        // );

        // fontSizeInput.style.display = "none";
        // heightInput.style.display = "none";
        // widthInput.style.display = "none";
        // blackChatCheckInput.style.display = "none";
        // chatColorButton.style.display = "none";
    },

    handleTargetframes(targetframes) {
        targetframes = targetframes.element
        const scaleBtnPlayer = document.createElement("div");
        scaleBtnPlayer.textContent = "Change Size";
        scaleBtnPlayer.title = "Hold and Drag to change Size";
        scaleBtnPlayer.classList.add("scale-btn-player");
        scaleBtnPlayer.classList.add("kek-ui-btn", "btn", "black", "textsecondary");
        scaleBtnPlayer.style.display = "none";

        makeScaleable(
            targetframes,
            scaleBtnPlayer,
            this.state._transform.targetframes
        );

        // buffArrayResizing(ufplayer.querySelector(".buffarray"), targetBuffSize)
        // colorizeGrid(ufplayer)

        const buffSizeInput = this.createInputTarget("Buff Size", "buffSize");
        const buffTextSizeInput = this.createInputTarget(
            "Buff Text Size",
            "buffTextSize"
        );

        // Create a flex container for the inputs
        const inputContainer = document.createElement("div");
        inputContainer.style.display = "flex";
        inputContainer.style.left = "10px";
        inputContainer.style.top = "-50px";
        inputContainer.style.position = "absolute";
        inputContainer.style.zIndex = 1;
        inputContainer.classList.add("ignoreScale");
        inputContainer.classList.add("inputContainerKEK");
        scaleBtnPlayer.style.flex = 1;
        buffSizeInput.style.flex = 1;
        buffTextSizeInput.style.flex = 1;
        inputContainer.appendChild(scaleBtnPlayer);
        inputContainer.appendChild(buffSizeInput);
        inputContainer.appendChild(buffTextSizeInput);

        setTimeout(() => {
            const ufplayer = document.querySelector("#ufplayer");
            ufplayer.insertBefore(inputContainer, ufplayer.firstChild);
        }, 300);
    },

    createInputTarget(placeholder, prop) {
        const inputField = document.createElement("input");
        inputField.placeholder = placeholder;
        inputField.style.width = "120px";
        inputField.style.height = "40px";
        inputField.title = `${placeholder}`;
        inputField.type = "number";
        inputField.value = this.state._configs.targetframes[prop];
        inputField.classList.add("kek-ui-input");

        inputField.style.display = "none";

        const handleInputField = () => {
            let inputValue = parseInt(inputField.value);

            if (inputValue > 50) {
                inputField.value = 50;
            }

            if (inputValue < 1) {
                inputField.value = 1;
            }

            inputValue = parseInt(inputField.value);
            this.state._configs.targetframes[prop] = inputValue;
            this.updateTargetStyle()
        };

        // Add an event listener for the input event
        inputField.addEventListener("input", handleInputField);
        return inputField;
    },

    updateSkillbarStyle(skillbar) {
        const slots = skillbar.querySelectorAll(".slot");

        for (let slot of slots) {
            slot.style.height = this.state._configs.skillbar.slotSize + "px";
            slot.style.width = this.state._configs.skillbar.slotSize + "px";
        }

        skillbar.style.gridAutoRows = "initial";
        skillbar.style.gridAutoColumns = "unset";
        skillbar.style.gridAutoFlow = "dense";
        skillbar.style.gridTemplateColumns = `repeat(${this.state._configs.skillbar.skillsPerRow}, auto)`;

        const existingStyle = document.querySelector("#skillbarStyle")
        if (existingStyle) {
            existingStyle.remove()
        }
        const skillbarStyle = element("style", {
            textContent: `#skillbar .overlay img {
                height: ${this.state._configs.skillbar.slotSize}px;
                width: ${this.state._configs.skillbar.slotSize}px; 
            }`,
            id: "skillbarStyle"
        }).element

        skillbar.insertBefore(skillbarStyle, skillbar.firstChild)
    },

    createInputSkillbar(placeholder, prop, skillbar) {
        const inputField = document.createElement("input");
        inputField.placeholder = placeholder;
        inputField.style.width = "120px";
        inputField.style.height = "40px";
        inputField.title = `${placeholder}`;
        inputField.type = "number";
        inputField.value = this.state._configs.skillbar[prop];
        inputField.classList.add("kek-ui-input");

        inputField.style.display = "none";

        const handleInputField = () => {
            let inputValue = parseInt(inputField.value);

            if (inputValue > 50) {
                inputField.value = 50;
            }

            if (inputValue < 1) {
                inputField.value = 1;
            }

            inputValue = parseInt(inputField.value);
            this.state._configs.skillbar[prop] = inputValue;
            this.updateSkillbarStyle(skillbar);
        };

        // Add an event listener for the input event
        inputField.addEventListener("input", handleInputField);
        return inputField;
    },

    handleTargetGrid(grid) {
        grid = grid.element
        let bar = grid.querySelector(".bar");
        if (bar) {
            bar.style.width = this.state._transform.targetframes.width + "px";
            bar.style.height = this.state._transform.targetframes.height + "px";
        }
        this.colorizeGrid(grid);
        this.handleBuffarray(grid)
    },

    handlePartyGrid(grid) {
        // console.log(grid)
        grid = grid.element
        grid.style.width = this.state._transform.partyframes.width + "px";
        grid.style.height = this.state._transform.partyframes.height + "px";
        if (this.state._color) grid.style.gridTemplate = 'none';
        let bar = grid.querySelector(".bar");
        if (bar) {
            bar.style.width = this.state._transform.partyframes.width + "px";
            bar.style.height = this.state._transform.partyframes.height + "px";
        }

        this.colorizeGrid(grid);
        this.handleRightSpanMutations(grid)
        this.handleBuffarray(grid)
        // Remove specific styles
    },

    colorizeGrid(grid) {
        if (this.state._color == false) {
            return
        };
        const iconContainer = grid.querySelector(".iconcontainer");
        if (iconContainer) {
            const img = iconContainer.querySelector("img");
            if (img) {
                let classIdx = getClass(img.src);
                if (!classIdx) classIdx = 5
                // console.log(classIdx, grid.querySelector(".left").textContent, img.src)
                const hpBar = grid.querySelector(".progressBar");
                if (hpBar) {
                    this.gradientNames.forEach((className) => {
                        hpBar.classList.remove(className);
                    });
                    hpBar.classList.add(`kek-bgc${classIdx}`);
                    iconContainer.style.display = "none";
                }
            }
        }
    },

    handleSkillbar(skillbar) {
        skillbar = skillbar.element
        this.updateSkillbarStyle(skillbar);
        const container = document.createElement("div");
        container.style.display = "flex";
        container.style.position = "absolute";
        container.style.left = "10px";
        container.style.top = "-50px";
        // console.log("creating new slider for skill bar")
        const perRowInput = this.createInputSkillbar(
            "Skills Per Row",
            "skillsPerRow",
            skillbar
        );
        const sizeInput = this.createInputSkillbar("Skill Icon Size", "slotSize", skillbar);

        container.appendChild(sizeInput);
        container.appendChild(perRowInput);

        skillbar.appendChild(container);
    },

    handleBuffarray(grid) {
        if (grid.id == "ufplayer" || grid.id == "uftarget") {
            this.buffArrayResizing(grid)
        } else {
            this.buffArrayResizing(grid)
            this.repositionBuffarray(grid)
        }
    },

    repositionBuffarray(grid) {
        let offset;
        let state = this.state._configs.partyframes.buffPosition
        const buffarray = grid.querySelector('.buffarray');
        if (buffarray) {
            let buffSize
            // Reposition buffarray on top of grid element
            if (buffarray && state == 0) {
                // console.log("buff array with state 0 so row")
                buffarray.style.position = 'absolute';
                buffSize = this.state._configs.partyframes.buffSize
                const parent = grid.parentNode
                if (parent.style.height) {
                    offset = 1 * parseInt(parent.style.height.split("px")[0]) - buffSize
                } else {
                    offset = -1 * buffSize
                }

                buffarray.style.top = offset + "px";
                buffarray.style.left = '0';
            } else if (buffarray && state == 1) {
                // console.log("buff array with state 1 so column")
                buffarray.style.position = '';
                buffarray.style.top = '';
                buffarray.style.left = '';
            }
        }
    },

    buffArrayResizing(grid) {
        const buffarray = grid.querySelector('.buffarray');

        if (buffarray && buffarray instanceof HTMLElement) {
            let iconSize
            let isUfplayer = false
            iconSize = this.state._configs.partyframes.buffSize

            if (buffarray.parentNode.parentNode.id == "ufplayer" || buffarray.parentNode.parentNode.id == "uftarget") {
                iconSize = this.state._configs.targetframes.buffSize || iconSize
                isUfplayer = true
            } else {
                buffarray.style.pointerEvents = "none"
            }
            buffarray.style.margin = "0px"

            const icons = buffarray.querySelectorAll(".icon")
            if (icons) {
                for (let icon of icons) {
                    icon.style.maxWidth = iconSize + "px"
                }
            }
            let style = buffarray.querySelector('style.buffTextSize');
            // If the style tag doesn't exist, create and append it
            if (!style) {
                style = document.createElement('style');
                style.classList.add('buffTextSize');
                buffarray.insertBefore(style, buffarray.firstChild);
            }

            // Change the contents of the style tag
            let fontSize = 15
            if (!isUfplayer) {
                fontSize = this.state._configs.partyframes.buffTextSize
                style.textContent = `.partyframes .stacks.svelte-1nn7wcb {
                    font-size: ${fontSize}px;
                    }
                    .partyframes .buffarray .overlay img {
                        height: ${iconSize}px;
                        width: ${iconSize}px;
                    }
                    `;
            } else {
                fontSize = this.state._configs.targetframes.buffTextSize
                style.textContent = `.stacks.svelte-1nn7wcb {
                    font-size: ${fontSize}px;
                    }
                    .buffarray .overlay img {
                        height: ${iconSize}px;
                        width: ${iconSize}px;
                    }
                    `;
            }

            // Function to handle mutations in the .buffarray.default element
            if (!buffarray.classList.contains("mutationObserving")) {
                function handleBuffArrayChanges(mutationsList, observer) {
                    for (const mutation of mutationsList) {
                        if (mutation.type === 'childList') {
                            const addedNodes = mutation.addedNodes
                            addedNodes.forEach(node => {
                                if (node instanceof HTMLElement) {
                                    const icon = node.querySelector(".icon")
                                    if (icon) {
                                        icon.style.maxWidth = iconSize + "px"
                                    }
                                }
                            })

                        }
                    }
                }

                // Create a MutationObserver to watch for changes in the .buffarray.default element
                const buffArrayObserver = new MutationObserver(handleBuffArrayChanges);
                buffArrayObserver.observe(buffarray, { childList: true, subtree: false });
                buffarray.classList.add("mutationObserving")
            }
        }

    },

    handleExportUI(event) {
        const menu = event.target
        if (menu.classList.contains("choice-item") && !menu.classList.contains("inputActiveKEK")) {
            menu.classList.add("inputActiveKEK")            // Retrieve saved props for all players from the new structure
            const guiState = stateManager.getModState(this.name)
            // console.log(guiState)
            // Create buttons for each player

            const presetSelect = element("select").css("btn grey").on("input", e => {
                // console.log(e.target.value)
                const profileName = e.target.value
                const propsString = JSON.stringify(guiState[profileName])
                presetSelect.remove()
                menu.classList.remove("inputActiveKEK")
                // console.log(propsString)
                navigator.clipboard.writeText(propsString).then(() => {
                    const info = element("div").css("textprimary title").text(`${profileName}'s profile in clipboard!`)
                    menu.appendChild(info.element)
                    setTimeout(() => {
                        info.remove()
                    }, 2000)
                }).catch((error) => {
                    console.error("Error copying to clipboard:", error)
                })
            })

            presetSelect.add(element("option").text("--- select profile ---"))
            for (const presetName in guiState) {
                if (!presetName.startsWith("_")) {
                    const option = element("option").text(presetName)
                    presetSelect.add(option)
                }
            }
            menu.appendChild(presetSelect.element)
        }
    },

    handleImportUI(event) {

        const target = event.target
        if (target.classList.contains("choice-item") && !target.classList.contains("inputActiveKEK")) {
            target.classList.add("inputActiveKEK")
            // console.log(event.target)
            // Create a container for the textarea and the "Import" button
            const container = document.createElement('div');

            // Create a text area for user input
            const textarea = document.createElement('textarea');
            textarea.placeholder = 'Paste your configuration here...';
            textarea.style.width = '300px';
            textarea.style.height = '150px';

            // Create an "Import" button
            const importButton = document.createElement('button');
            importButton.className = "btn black";
            const importSpan = document.createElement("span");
            importSpan.classList.add("textsecondary");
            importSpan.textContent = "Import";

            const importFailSpan = document.createElement("span");
            importFailSpan.classList.add("textsecondary");
            importFailSpan.textContent = "Import Failed!";

            const importSuccessSpan = document.createElement("span");
            importSuccessSpan.classList.add("textsecondary");
            importSuccessSpan.textContent = "Import Success!";

            importButton.appendChild(importSpan);
            importButton.style.padding = "10px";
            importButton.style.height = ""

            event.target.appendChild(textarea);
            event.target.appendChild(importButton);

            const removeDelay = 1000
            // Add event listener to handle the "Import" button
            importButton.addEventListener('click', () => {
                const importData = textarea.value.trim();


                if (!importData) {
                    textarea.remove()
                    importButton.innerHTML = importFailSpan.outerHTML

                    setTimeout(() => {
                        importButton.remove()
                        target.classList.remove("inputActiveKEK")
                    }, removeDelay);
                    return; // Exit if no data is provided
                }

                try {
                    // Parse the import data into an object
                    const importedState = JSON.parse(importData);
                    console.log(importedState)
                    if (importedState && typeof importedState === 'object') {
                        // Update the props variable
                        this.state = importedState;

                        // Log or notify about the successful import
                        console.log('Configuration imported successfully.');

                        // Change the button text to "Imported!" for a brief moment
                        importButton.innerHTML = importSuccessSpan.outerHTML
                        textarea.remove()
                        setTimeout(() => {
                            importButton.remove()
                            target.classList.remove("inputActiveKEK")
                        }, removeDelay);
                        window.location.reload()

                    } else {
                        textarea.remove()
                        importButton.innerHTML = importFailSpan.outerHTML


                        setTimeout(() => {
                            importButton.remove()
                            target.classList.remove("inputActiveKEK")
                        }, removeDelay);

                        console.log("NOT AN OBJECT");
                    }
                } catch (error) {
                    textarea.remove()
                    importButton.innerHTML = importFailSpan.outerHTML


                    setTimeout(() => {
                        importButton.remove()
                        target.classList.remove("inputActiveKEK")
                    }, removeDelay);

                    console.error('Error parsing or importing configuration:', error);
                    // Handle error, e.g., notify the user about the incorrect format
                }
            });
        }
    },

    handleResetUI(event) {
        this.state = this.defaultState
        event.target.textContent = "Success!"
        setTimeout(() => {
            if (event.target) {
                event.target.textContent = "ResetUI"
            }
        }, 500)
        window.location.reload()
    }
};

export default gui;
