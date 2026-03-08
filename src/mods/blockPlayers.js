import eventManager from "../core/event"
import { createWindow } from "../core/widgets/widgets"

const blockPlayers = {
    name: "Block players",
    state: {
        blockedPlayersList: [],
        _transform: { left: 100, top: 100, _drag: true }
    },
    hotkey: {
        "Open Blocked Players": { key: ",", callback: "generateUI" }
    },
    start() {
        eventManager.on("ui.chatArticle", this.handleChatArticle, this)
        eventManager.on("click.blockPlayers", this.generateUI, this)
        eventManager.on("ui.chatPanel", this.handleChatPanel, this)
    },
    stop() {
        eventManager.off("ui.chatArticle", this.handleChatArticle, this)
        eventManager.off("click.blockPlayers", this.generateUI, this)
        eventManager.off("ui.chatPanel", this.handleChatPanel, this)
    },
    handleChatArticle(chatArticle) {
        chatArticle = chatArticle.element
        const sender = chatArticle.querySelector(".sender .name")
        if (sender) {
            const senderName = sender.textContent.toLowerCase().trim()
            if (this.state.blockedPlayersList.includes(senderName)) {
                chatArticle.style.display = "none"
            }
        }
    },
    unblockPlayer(playerName) {
        playerName = playerName.toLowerCase()
        // Access or initialize blockedPlayers as a Set in props
        let blockedPlayers = new Set(this.state.blockedPlayersList) || new Set();

        // Check if playerName is in blockedPlayers
        if (blockedPlayers.has(playerName)) {
            // Remove playerName from blockedPlayers
            blockedPlayers.delete(playerName);
            blockedPlayers = Array.from(blockedPlayers)
            this.state.blockedPlayersList = [...blockedPlayers]
        }
    },
    blockPlayer(playerName) {
        playerName = playerName.toLowerCase()
        // Access or initialize blockedPlayers as a Set in props
        const blockedPlayers = new Set(this.state.blockedPlayersList) || new Set();
        // Check if playerName is not already in blockedPlayers
        if (!blockedPlayers.has(playerName)) {
            // Add playerName to blockedPlayers
            blockedPlayers.add(playerName);
            this.state.blockedPlayersList = Array.from(blockedPlayers)
        }
    },
    generateUI(event) {
        const updateBlockedPlayersList = () => {
            const listContainer = document.querySelector(".blocked-players-list")
            if (!listContainer) return
            listContainer.innerHTML = ''; // Clear the list
            const blockedPlayers = this.state.blockedPlayersList;

            if (blockedPlayers) {
                const maxItemsPerRow = 7;

                // Set the styles for the blockedPlayersList
                listContainer.style.display = "grid";
                listContainer.style.gridTemplateColumns = `repeat(${maxItemsPerRow}, auto)`;

                // console.log(blockedPlayers)
                for (let playerName of blockedPlayers) {
                    const blockedPlayerItem = document.createElement('div');
                    blockedPlayerItem.className = 'blocked-player-item btn black textsecondary';
                    // blockedPlayerItem.style.padding = "15px"
                    blockedPlayerItem.style.margin = "1px"
                    blockedPlayerItem.style.display = "flex";
                    blockedPlayerItem.style.justifyContent = "space-between";
                    blockedPlayerItem.textContent = playerName;

                    blockedPlayerItem.addEventListener('click', () => {
                        this.unblockPlayer(playerName);
                        updateBlockedPlayersList(); // Update the list after unblocking
                    });


                    listContainer.appendChild(blockedPlayerItem);
                }
            }
        }
        const existing = document.querySelector(".blockedplayersKEK")
        if(existing) {
            existing.remove()
            return
        }
        const windowPanel = createWindow("Blocked Players", "100px", "100px", this.state._transform).element

        const blockPlayerFrame = document.createElement("div")
        blockPlayerFrame.className = "panel-black bar slot"

        const blockedPlayersList = document.createElement('div');
        blockedPlayersList.className = 'blocked-players-list panel-black bar slot';

        const inputField = document.createElement('input');
        inputField.type = 'text';
        inputField.placeholder = 'Enter player name';

        const blockButton = document.createElement('div');
        blockButton.className = 'btn black textsecondary';
        blockButton.textContent = 'Block Player';
        blockButton.style.marginTop = "5px"
        blockButton.addEventListener('click', () => {
            const playerName = inputField.value.trim();
            if (playerName) {
                this.blockPlayer(playerName);
                inputField.value = ''; // Clear the input field
                updateBlockedPlayersList();
            }
        });

        blockPlayerFrame.appendChild(inputField);
        blockPlayerFrame.appendChild(blockButton);

        // Add elements to the window panel
        windowPanel.appendChild(blockPlayerFrame);
        windowPanel.appendChild(blockedPlayersList);

        document.body.appendChild(windowPanel);

        // Update blocked players list
        updateBlockedPlayersList();

        // Function to update the blocked players list
    },
    handleChatPanel(chatPanel) {
        chatPanel = chatPanel.element
        chatPanel.addEventListener("contextmenu", (event) => {
            const menu = document.querySelector(".panel.context")
            if (menu && !menu.classList.contains("kek-ui-menu")) {
                menu.classList.add("kek-ui-menu")
                const playerNameEle = menu.querySelector(".choice.disabled")
                if (playerNameEle) {
                    const playerName = playerNameEle.textContent.trim()
                    // console.log("right clicked on " + playerName)

                    const blockDiv = document.createElement("div")
                    blockDiv.classList.add("choice")
                    blockDiv.textContent = "Block"
                    menu.appendChild(blockDiv)
                    blockDiv.addEventListener("click", () => {
                        console.log("blocking " + playerName)
                        this.blockPlayer(playerName)
                        menu.remove()
                    })
                }
            }
        })
    },
}

export default blockPlayers