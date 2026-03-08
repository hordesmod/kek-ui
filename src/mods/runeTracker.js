import eventManager from "../core/event";
import profileManager from "../core/profile";
import { makeDraggable } from "../core/widgets/drag";
import ui from "../core/ui"
import element from "../core/widgets/element"

const runeTracker = {
    name: "Rune Tracker",
    description: "Monitor and manage runes for your party",
    state: {
        activeTab: "rawCount",
        allRuneData: [],
        isActive: false,
        _transform: {left: 100, top: 100, _drag: true}
    },
    hotkey: {
        "Open Rune Tracker": {key: "h", callback: "generateUI"}
    },
    runeTrackerOpen: false,
    runeData: [],
    paddingValue: "5px",
    marginValue: "3px", 
    idx: 0,
    start() {
        this.idx = this.state.allRuneData.length - 1
        this.runeData = this.state.allRuneData[this.idx]
        // eventManager.on("click.runeTracker", this.generateUI, this)
        eventManager.on("ui.chatArticle", this.handleChatArticle, this)

        if (ui?.partyBtnbar?.element) {
            this.addBtn(ui.partyBtnbar.element)
        }
        eventManager.on("ui.partyBtnbar", this.addBtn, this)

    },
    stop() {
        eventManager.off("ui.partyBtnbar", this.addBtn, this)
        eventManager.off("ui.chatArticle", this.handleChatArticle, this)
    },
    addBtn(partyBtnbar) {
        partyBtnbar = partyBtnbar.element
        const btnImg = element("img").css("icon svelte-erbdzy").attr("src", "data/items/rune/rune6_q0.avif")
        this.btn = element("div").css("btn border black textgrey")
            .on("click", this.generateUI.bind(this))
            .add(btnImg)

        partyBtnbar.appendChild(this.btn.element)
    },

    runeNames: ["Lucid", "Melant", "Turim", "Fundo", "Amari"],
    handleChatArticle(chatArticle) {
        chatArticle = chatArticle.element
        const noticeSpan = chatArticle.querySelectorAll(".textnotice")[1]
        if(noticeSpan) {
            const textContent = noticeSpan.textContent.trim();
            // console.log('Original Text:', textContent);

            const matchResult = textContent.match(/^(.*?)\s+received\s+(.*?)\s*x(\d+)\s*\.?$/);
            const leavePartyMatch = textContent.match(/^(.*?)\s+has left your party\.$/);

            if (leavePartyMatch) {
                const playerNameLeft = leavePartyMatch[1];
                // console.log('Player has left the party:', playerNameLeft);
                this.changePlayerState(playerNameLeft, 0)
            }
            if (matchResult) {
                const name = matchResult[1];
                const itemDescription = matchResult[2];
                const numberOfItems = parseInt(matchResult[3]);

                // console.log('Name:', name);
                // console.log('Item Description:', itemDescription)
                // console.log('Number of Items:', numberOfItems);
                const itemName = itemDescription.split(" ")[1]
                const tierInfo = itemDescription.split(" ")[0]
                const tier = parseInt(tierInfo.split("T")[1])
                // console.log('Item Name:', itemName);
                // console.log('Item Tier:', tier);
                if(itemName.trim().toLowerCase() == "rune") {
                    this.addRuneData(name, tier - 1, numberOfItems)
                }
            } else {
            }
        }
    },
    getActiveTab() {
        return this.state.activeTab
    },
    // Function to set the active rune tab in localStorage
    setActiveTab(value) {
        this.state.activeTab = value
    },

    getRuneName(tier) {
        const tierToName = {
            0: "Lucid",
            1: "Melant",
            2: "Turim",
            3: "Fundo",
            4: "Amari"
        }

        return tierToName[tier - 1]
    },
    // Function to save rune tracker data in local storage
    saveRuneData(data) {
        let storedRuneData = data || {}
        this.state.allRuneData = storedRuneData
    },
    // Function to get rune tracker data from local storage or use default testData
    getRuneData() {
        return this.state.allRuneData
    },

    // Function to get the length of saved rune tracker data
    getRuneTrackerDataLength() {
        return this.state.allRuneData.length
    },

    // Function to add quantity to both tabs' rune data and update UI
    addRuneData(playerName, runeIdx, qty) {
        let currentRuneData
        if (this.state.allRuneData) {
            currentRuneData = this.state.allRuneData[this.state.allRuneData.length - 1]
        }
        if (!currentRuneData) return;
        // Iterate over each tab and add quantity to the tab's rune data or set base value if not found

        if (this.getRuneTrackerState()) {
            for (const tab in currentRuneData) {
                // Skip properties that are not tabs
                if (tab == "activeTab") {
                    continue;
                }

                // Check if the player exists in the tab's data
                if (!currentRuneData[tab][playerName]) {
                    // Initialize the data structure for the player if not found
                    currentRuneData[tab][playerName] = {};
                    this.runeNames.forEach((runeName, runeIdx) => {
                        currentRuneData[tab][playerName][runeIdx] = 0;
                    });
                    if (!currentRuneData[tab].by) {
                        currentRuneData[tab].by = "Amari"
                    }
                }

                // Add quantity to the tab's rune data or set base value if not found
                currentRuneData[tab][playerName][runeIdx] = (currentRuneData[tab][playerName][runeIdx] || 0) + qty;
                currentRuneData[tab][playerName].state = 1

            }


            // Save the updated data
        }
        this.saveRuneData(this.state.allRuneData);
        this.updateRuneTracker();
    },

    //state = 1 for in party, 0 for not in party
    changePlayerState (name, state) {
        if(!this.runeData || !this.runeData.rawCount || !this.runeData.manualCount) return
        if (this.runeData.rawCount[name]) {
            this.runeData.rawCount[name].state = state
        }
        if (this.runeData.manualCount[name]) {
            this.runeData.manualCount[name].state = state
        }
        this.saveRuneData(this.state.allRuneData)
        this.updateRuneTracker()

    },

    getRuneTrackerState() {
        return this.state.isActive
    },
    
    // Function to update the Rune Tracker UI
    updateRuneTracker() {
        // console.log(this.runeTrackerOpen)
        const existingRuneTracker = document.querySelector(".runeTrackerKEK")
        if (this.runeTrackerOpen == false) return;
        if (existingRuneTracker) {
            existingRuneTracker.remove()
        }

        const runeTrackerContainer = document.createElement('div');
        makeDraggable(runeTrackerContainer, this.state._transform)
        runeTrackerContainer.className = 'window panel-black runeTrackerKEK';

        const runeGridContainer = document.createElement('div');
        runeGridContainer.className = 'panel-black';
        runeGridContainer.style.display = 'grid';
        runeGridContainer.style.gridTemplateColumns = `auto repeat(${this.runeNames.length}, auto)`;

        const titleFrame = document.createElement('div');
        titleFrame.className = 'titleframe svelte-yjs4p5';
        titleFrame.style.display = "flex";
        titleFrame.style.justifyContent = "space-between";

        const startBtn = document.createElement('button');
        startBtn.style.padding = "10px"
        startBtn.style.flex = 1
        startBtn.style.width = "100px"
        const runeTrackerState = this.getRuneTrackerState()
        if (runeTrackerState) {
            startBtn.textContent = "Stop";
            startBtn.className = `btn textprimary rune-tracker-startbtn red`
        } else {
            startBtn.textContent = "Start";
            startBtn.className = `btn textprimary rune-tracker-startbtn grey`
        }

        startBtn.addEventListener('click', () => {
            if (startBtn.textContent == "Start") {
                // Start functionality
                startBtn.textContent = "Stop";
                startBtn.className = "btn textprimary rune-tracker-startbtn red"; // Change class as needed

                // Set isRuneTrackerActive to true in local storage
                this.state.isActive = true
            } else {
                // Stop functionality
                // Add any additional logic needed when stopping

                // Change button text and style back to start functionality
                startBtn.textContent = "Start";
                startBtn.className = "btn textsecondary rune-tracker-startbtn grey"; // Change class as needed

                // Set isRuneTrackerActive to false in local storage
                this.state.isActive = false
            }
        });
        const newBtn = document.createElement('button');
        newBtn.style.padding = "10px"
        newBtn.style.flex = 1
        newBtn.textContent = "New";
        newBtn.style.width = "100px"
        newBtn.className = `btn textprimary rune-tracker-btn grey`

        // Add event listener to the start button
        newBtn.addEventListener('click', () => {
            // Start functionality
            if (this.state.allRuneData) {
                this.idx = this.state.allRuneData.length;
            } else {
                this.idx = 0
            }
            const newState = { "manualCount": {}, "rawCount": {} };

            this.runeData = newState;

            // Push the new state to the array
            this.state.allRuneData.push(newState);

            // Limit the array length to 10
            const maxLength = 10;
            if (this.state.allRuneData.length > maxLength) {
                // If the array exceeds the limit, remove the first element
                this.state.allRuneData.shift();

                // Decrement this.idx by 1
                this.idx = Math.max(0, this.idx - 1);
            }

            // Save the updated array to localStorage
            this.saveRuneData(this.state.allRuneData);

            this.updateRuneTracker();
        });

        // console.log(dataToShow, "from handleUI", activeTab)
        // Add elements to the title frame
        const title = document.createElement('div');
        title.className = 'textprimary title svelte-yjs4p5';
        title.style.width = "200px";
        title.style.padding = "10px";
        title.textContent = "Rune Tracker";

        titleFrame.appendChild(title);
        titleFrame.appendChild(startBtn);
        titleFrame.appendChild(newBtn);

        // Add elements to the window panel
        runeTrackerContainer.appendChild(titleFrame);

        // Create header row for player names
        const playerHeader = document.createElement('div');
        playerHeader.className = 'btn black textprimary rune-tracker-item';
        playerHeader.textContent = 'Players';
        playerHeader.style.width = '100px'; // Width of player names
        playerHeader.style.padding = this.paddingValue;
        playerHeader.style.margin = this.marginValue;
        runeGridContainer.appendChild(playerHeader);


        // Append the rune grid container to the main container
        runeTrackerContainer.appendChild(runeGridContainer);
        runeTrackerContainer.style.zIndex = 10
        // Set a fixed height and enable vertical scrolling for the rune grid container
        runeTrackerContainer.style.height = 'calc(100vh - 500px)'; // Adjust the height as needed
        // Set overflow to hidden for both x and y
        runeTrackerContainer.style.overflow = 'hidden';

        // Add event listeners to handle scrolling
        runeTrackerContainer.addEventListener('wheel', (event) => {
            // Adjust the scrollTop property based on your scrolling logic
            runeTrackerContainer.scrollTop += event.deltaY;
        });
        // Append the main container to the .layout element in the document
        document.body.appendChild(runeTrackerContainer);
        let dataToShow;
        //prev next btns
        if (this.runeData) {
            // Create elements for navigation buttons and input field
            const navigateContainer = document.createElement('div');
            navigateContainer.style.display = 'flex';
            navigateContainer.style.marginTop = '10px';

            const indexInput = document.createElement('input');

            const prevButton = document.createElement('button');
            prevButton.className = "btn grey textsecondary"
            prevButton.textContent = '<';
            prevButton.style.padding = "10px"
            prevButton.style.marginLeft = "5px"
            prevButton.addEventListener('click', () => {
                if (this.idx > 0) {
                    this.idx--;
                    indexInput.value = this.idx
                    this.runeData = this.state.allRuneData[this.idx]
                    // console.log(this.idx, runeData)
                    this.updateRuneTracker()
                }
            });

            const nextButton = document.createElement('button');
            nextButton.textContent = '>';
            nextButton.style.padding = "10px"
            nextButton.className = "btn grey textsecondary"
            nextButton.addEventListener('click', () => {
                const dataLength = this.getRuneTrackerDataLength();
                if (this.idx < dataLength - 1) {
                    this.idx++;
                    indexInput.value = this.idx
                    this.runeData = this.state.allRuneData[this.idx]
                    // console.log(this.idx, runeData)
                    this.updateRuneTracker()
                }
            });

            indexInput.type = 'number';
            indexInput.className = 'input';
            indexInput.style.width = '50px';
            indexInput.value = this.idx
            indexInput.style.padding = "7px"

            // Add an input event listener to handle real-time updates
            indexInput.addEventListener('input', () => {
                // Ensure the input value is a positive integer
                const targetIndex = parseInt(indexInput.value, 10);
                if (!isNaN(targetIndex) && targetIndex >= 0) {
                    this.idx = targetIndex;
                    indexInput.value = this.idx
                    this.runeData = this.state.allRuneData[this.idx]
                    // console.log(this.idx, runeData)
                    this.updateRuneTracker()
                }
            });


            // Add the navigation container to the main container

            let activeTab = this.getActiveTab() || 'rawCount';
            dataToShow = this.runeData[activeTab]
            // Create tab buttons
            const rawCountTabButton = this.createTabButton('Raw Count', 'rawCount');
            const manualCountTabButton = this.createTabButton('Manual Count', 'manualCount');

            titleFrame.appendChild(rawCountTabButton);
            titleFrame.appendChild(manualCountTabButton);
            // Add navigation elements to the container
            titleFrame.appendChild(prevButton);
            titleFrame.appendChild(indexInput);
            titleFrame.appendChild(nextButton);
        }
        // Create close button element
        const closeBtn = document.createElement('img');
        closeBtn.src = '/data/ui/icons/cross.svg?v=8498194';
        closeBtn.className = 'btn black svgicon';

        // Append close button to titleFrame
        titleFrame.appendChild(closeBtn);

        // Add event handler to the close button
        closeBtn.addEventListener('click', () => {
            // Remove the runeTrackerContainer when the close button is clicked
            runeTrackerContainer.remove();
            this.runeTrackerOpen = false
        });

        //cells
        if (dataToShow) {
            // Create header row for rune names
            this.runeNames.forEach(runeName => {
                const runeHeader = document.createElement('div');
                runeHeader.className = 'btn black textprimary rune-tracker-item';
                runeHeader.textContent = runeName;
                runeHeader.style.padding = this.paddingValue;
                runeHeader.style.margin = this.marginValue;
                runeHeader.addEventListener('click', () => {
                    this.runeData[this.getActiveTab()].by = runeName
                    this.saveRuneData(this.state.allRuneData)
                    this.sortAndUpdateRuneTracker(dataToShow, runeName);
                });
                runeGridContainer.appendChild(runeHeader);
            });

            // Create rows for player names and rune counts
            for (const playerName in dataToShow) {
                if (playerName === "by") { continue; }
                const playerRow = document.createElement('div');
                playerRow.className = 'btn black textsecondary rune-tracker-item';
                playerRow.textContent = playerName;
                const isMe = playerName == profileManager.playerName
                const state = this.runeData.rawCount[playerName].state
                if (isMe) {
                    playerRow.classList.add("textgreen")
                }
                if (state === 0) {
                    playerRow.classList.add("textgrey")
                }
                playerRow.style.width = '100px'; // Width of player names
                playerRow.style.padding = this.paddingValue;
                playerRow.style.margin = this.marginValue;
                runeGridContainer.appendChild(playerRow);

                for (let tier = 0; tier < this.runeNames.length; tier++) {
                    const runeCell = document.createElement('div');
                    runeCell.className = 'btn black textsecondary rune-tracker-item';
                    if (isMe) {
                        runeCell.classList.add("textgreen")
                    }
                    if (state === 0) {
                        runeCell.classList.add("textgrey")
                    }
                    runeCell.textContent = dataToShow[playerName][tier] !== null ? dataToShow[playerName][tier] : 'N/A';
                    runeCell.style.padding = this.paddingValue;
                    runeCell.style.margin = this.marginValue;

                    // Add event listeners to the cell for incrementing and decrementing values
                    if (this.getActiveTab() == "manualCount") {
                        runeCell.addEventListener('click', () => {
                            // Increment the value on click
                            dataToShow[playerName][tier]++;
                            // console.log(dataToShow, "from update rune cell")
                            this.saveRuneData(this.state.allRuneData);
                            this.updateRuneTracker()
                        });

                        runeCell.addEventListener('contextmenu', (event) => {
                            event.preventDefault();
                            // Decrement the value on right-click
                            console.log("from context menu in cell")
                            dataToShow[playerName][tier] = Math.max(0, dataToShow[playerName][tier] - 1);
                            this.saveRuneData(this.state.allRuneData);
                            this.updateRuneTracker()
                        });
                    }

                    runeGridContainer.appendChild(runeCell);
                }
            }

        }

    },
    // Function to handle the creation and removal of the Rune Tracker UI
    generateUI() {
        if (this.runeTrackerOpen) {
            // Close the existing Rune Tracker if open
            const existingRuneTracker = document.querySelector('.runeTrackerKEK');
            if (existingRuneTracker) {
                existingRuneTracker.remove();
            }
            this.runeTrackerOpen = false;
            return;
        }
        this.runeTrackerOpen = true;
        this.updateRuneTracker()
    },
    // Function to update the class of a tab button based on the active tab
    updateTabButtonClass(button, tab) {
        const isActive = this.getActiveTab() == tab
        button.className = `btn textprimary rune-tracker-btn ${isActive ? 'disabled black' : 'grey'}`;
    },
    // Function to create a tab button
    createTabButton(text, tab) {
        const tabButton = document.createElement('button');
        this.updateTabButtonClass(tabButton, tab)
        tabButton.style.padding = "10px"
        tabButton.style.flex = 1
        tabButton.style.width = "130px"
        tabButton.textContent = text;
        tabButton.value = tab
        tabButton.addEventListener('click', () => {
            this.setActiveTab(tabButton.value)
            this.saveRuneData(this.state.allRuneData)
            this.updateRuneTracker()
            // Update classes for all tab buttons
            const tabButtons = document.querySelectorAll('.rune-tracker-btn');
            // console.log(tabButtons)
            tabButtons.forEach(button => this.updateTabButtonClass(button, button.value));
        });
        return tabButton;
    },
    // Function to get sorted data based on the selected rune and tab
    getSortedData(data, runeName) {
        const sortedData = {};

        const sortedPlayerNames = Object.keys(data).filter(playerName => playerName !== "by").sort((a, b) => {
            const aValue = data[a][this.runeNames.indexOf(runeName)];
            const bValue = data[b][this.runeNames.indexOf(runeName)];
            return bValue - aValue;
        });
        // console.log(data)
        sortedPlayerNames.forEach((playerName) => {
            sortedData[playerName] = data[playerName];
        });
        sortedData.by = data.by
        return sortedData;
    },
    // Function to sort the rune data and update the UI
    sortAndUpdateRuneTracker(data, runeName) {
        const sortedData = this.getSortedData(data, runeName);
        // const deepCopySortedData = JSON.parse(JSON.stringify(sortedData)); // Deep copy
        // console.log(deepCopySortedData)
        this.runeData[this.getActiveTab()] = sortedData;
        // Update the Rune Tracker UI with the sorted data
        // this.saveRuneData(runeData, this.idx);
        this.updateRuneTracker();
    }

}

export default runeTracker