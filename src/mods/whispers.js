import eventManager from "../core/event";
import log from "../core/logger";
import profileManager from "../core/profile";
import { addPartybtn } from "../core/widgets/btnbar";
import element from "../core/widgets/element";
import { createWindow } from "../core/widgets/widgets";
import chatEmoji from "./chatEmoji";

const whispers = {
    name: "Whispers",
    whisperBtn: null,
    state: {
        whisperLogs: {},
        _transform: { top: 100, left: 100, _drag: true }
    },
    hotkey: {
        "Open Whispers": { key: "/", callback: "generateUI" }
    },
    currentSenderName: "",
    currentMessage: "",
    sendInput: null,
    start() {
        eventManager.on("click.whispers", this.generateUI, this)
        eventManager.on("ui.chatArticle", this.handleChatArticle, this)
        // eventManager.on("ui.partyBtnbar", this.handlePartyBtn, this)
        eventManager.on("ui.channelSelect", this.addControlBtn, this)
    },
    stop() {
        eventManager.off("click.whispers", this.generateUI, this)
        eventManager.off("ui.chatArticle", this.handleChatArticle, this)
        // eventManager.off("ui.partyBtnbar", this.handlePartyBtn, this)
        if (document.contains(this.whisperBtn)) this.whisperBtn.remove()
    },
    addControlBtn(channelSelect) {
        this.controlBtn = element("small")
            .css("btn border black textgrey")
            .text("Whispers")
            .style({ lineHeight: "1em", marginRight: "4px" })
            .on("click", () => {this.generateUI()})
        channelSelect.element.appendChild(this.controlBtn.element)
    },
    toggleControlBtn() {
        ["textgrey", "textprimary"].forEach(c => this.controlBtn.toggle(c))
    },
    handleChatArticle(chatArticle) {
        const { sender_name, text, channel } = chatArticle.obj
        chatArticle = chatArticle.element
        if (channel?.textContent == "to" || channel?.textContent == "from") {
            const senderName = sender_name.textContent
            const type = channel.textContent, message = text.textContent
            // console.log(type, senderName, message)
            this.addWhisperLog(type, senderName, message, profileManager.playerName)
            if (this.currentSenderName == senderName) {
                this.displayWhisperLogs(senderName)
            }
            this.updateSenderNameList()
        }
    },
    calculateTotalNotSeen(logs) {
        // Calculate the total number of not seen (where log.seen is equal to 0)
        const totalNotSeen = logs.reduce((totalNotSeen, log) => totalNotSeen + (log.seen === 0 ? 1 : 0), 0);
        // console.log(totalNotSeen, logs);
        return totalNotSeen;
    },
    // Function to fetch all sender names from whisper logs sorted by total number of seen
    fetchAllSenderNames() {
        // Get an array of sender names
        const senderNames = Object.keys(this.state.whisperLogs);

        // Sort sender names based on the total number of seen
        senderNames.sort((a, b) => {
            const totalSeenA = this.state.whisperLogs[a] ? this.calculateTotalNotSeen(this.state.whisperLogs[a]) : 0;
            const totalSeenB = this.state.whisperLogs[b] ? this.calculateTotalNotSeen(this.state.whisperLogs[b]) : 0;

            return totalSeenB - totalSeenA;
        });

        const senderObj = {}
        const newWhisperLogs = {}
        for (let name of senderNames) {
            newWhisperLogs[name] = this.state.whisperLogs[name]
        }
        this.state.whisperLogs = newWhisperLogs
        for (let name of senderNames) {
            senderObj[name] = this.state.whisperLogs[name][this.state.whisperLogs[name].length - 1].seen
        }
        // Return the sorted array of sender names
        // console.log(senderNames)
        return senderObj;
    },
    // addWhisperLog("from", "testingthing", "hey there new here", playerNameKEK)
    // Function to update the logs for a given sender
    updateWhisperLogs(senderName, logs) {
        this.state.whisperLogs[senderName] = logs;
    },

    addWhisperLog(type, senderName, content, receiverName) {
        // Create a new log entry
        const logEntry = { content, type, receiver: receiverName, seen: 0 };

        // Check if the sender already has logs
        if (this.state.whisperLogs[senderName]) {
            // Append the new log entry to the existing logs
            this.state.whisperLogs[senderName].push(logEntry);

            // Check if the array length exceeds the maximum allowed
            const maxLogsAllowed = 20; // Adjust this value as needed
            if (this.state.whisperLogs[senderName].length > maxLogsAllowed) {
                // Remove the oldest log (first in the array)
                this.state.whisperLogs[senderName].shift();
            }
        } else {
            // Create a new array for the sender and add the log entry
            this.state.whisperLogs[senderName] = [logEntry];
        }
    },
    // Function to fetch all logs for a given sender
    fetchWhisperLogs(senderName) {
        // Check if logs exist for the specified sender
        if (this.state.whisperLogs[senderName]) {
            // Return the logs for the sender
            return this.state.whisperLogs[senderName];
        } else {
            // Return an empty array if no logs found for the sender
            return [];
        }
    },
    chatInputListener(event) {
        const emojis = chatEmoji.state.emojiList
        const chatInput = event.target
        // console.log(chatInput.value)
        const inputValue = chatInput.value;

        let replacedValue = inputValue;

        for (const [emote, emoji] of Object.entries(emojis)) {
            replacedValue = replacedValue.replace(new RegExp(emote, 'g'), emoji);
        }

        // Update the input value with replaced emotes
        chatInput.value = replacedValue;
    },
    // Function to handle whisper logs

    generateUI() {
        // Fetch all sender names from whisper logs
        const existing = document.querySelector(".whispersKEK")
        this.toggleControlBtn()
        if (existing) {
            existing.remove()
            return
        }
        let senderObj = this.fetchAllSenderNames();
        let senderNames = Object.keys(senderObj)
        // Create a new window
        const window = createWindow('Whispers', "100px", "0px", this.state._transform, this.toggleControlBtn.bind(this)).element;
        const titleFrame = window.querySelector(".titleframe")
        titleFrame.style.borderBottom = "2px solid #393636"

        const senderContainer = document.createElement("div")
        senderContainer.classList.add("senderContainerKEK")
        senderContainer.style.display = "flex"
        senderContainer.style.flexDirection = "column"

        const whisperContainer = document.createElement("div")
        whisperContainer.style.display = "flex"
        whisperContainer.style.flexDirection = "column"

        whisperContainer.classList.add("whisperContainerKEK")

        let senderMaxHeight = 400
        // Create a div for sender names list
        const senderNamesDiv = document.createElement('div');
        senderNamesDiv.classList.add("senderNamesListContainerKEK")
        senderNamesDiv.style.overflow = 'hidden';
        senderNamesDiv.style.height = senderMaxHeight + "px"
        // Add event listeners to handle scrolling
        senderNamesDiv.addEventListener('wheel', (event) => {
            // Adjust the scrollTop property based on your scrolling logic
            senderNamesDiv.scrollTop += event.deltaY;
        });
        // Create an unordered list for sender names
        const senderNamesList = document.createElement('div');
        senderNamesList.classList.add("senderNamesListKEK")
        senderNamesList.style.display = "flex"
        senderNamesList.style.flexDirection = "column"

        // Add sender names to the list
        senderNames.forEach(senderName => {
            const listItem = document.createElement('div');
            const hasSeen = senderObj[senderName]
            if (hasSeen == 0) {
                listItem.textContent = senderName + " (new)";
            } else {
                listItem.textContent = senderName;
            }
            listItem.classList.add("btn", "black", "textsecondary", "border")
            listItem.addEventListener('click', (e) => {
                this.handleSenderNameClick(e, senderName)
            });
            listItem.style.padding = "10px"
            senderNamesList.appendChild(listItem);
        });
        // Create an input for sorting sender names
        const sortInput = document.createElement('input');
        sortInput.setAttribute('placeholder', 'Search Names...');
        sortInput.addEventListener('input', this.handleSortInput.bind(this));
        sortInput.style.padding = "10px"
        // Append sender names list to the div
        senderNamesDiv.appendChild(senderNamesList);

        // Create a div for whisper logs
        const whisperLogsDiv = document.createElement('div');
        let whisperWidth = 600
        let whisperMaxHeight = 400
        whisperLogsDiv.classList.add("whisperLogsListContainerKEK")
        whisperLogsDiv.style.height = whisperMaxHeight + "px"
        whisperLogsDiv.style.overflow = 'hidden';

        // Add event listeners to handle scrolling
        whisperLogsDiv.addEventListener('wheel', (event) => {
            // Adjust the scrollTop property based on your scrolling logic
            whisperLogsDiv.scrollTop += event.deltaY;
        });
        // Create an unordered list for whisper logs

        const whisperLogsList = document.createElement('div');
        whisperLogsList.style.width = whisperWidth + "px"
        whisperLogsList.id = "whisperLogsList"

        // Create an input for sending whispers
        const sendInput = document.createElement('input');
        sendInput.setAttribute('placeholder', 'Type your message...');
        sendInput.addEventListener('keypress', this.handleSendWhisperInput.bind(this));
        sendInput.style.padding = "10px"
        sendInput.style.width = whisperWidth + "px"
        sendInput.addEventListener('input', this.chatInputListener.bind(this));
        this.sendInput = sendInput

        sortInput.classList.add("btn", "black", "textsecondary")
        sendInput.classList.add("btn", "black", "textsecondary")
        // Append whisper logs list to the div
        whisperLogsDiv.appendChild(whisperLogsList);

        const flexContainer = document.createElement("div")
        flexContainer.style.display = "flex"
        // Append whisper logs div to the window
        senderContainer.appendChild(sortInput);
        senderContainer.appendChild(senderNamesDiv);

        whisperContainer.appendChild(whisperLogsDiv);
        whisperContainer.appendChild(sendInput);

        flexContainer.appendChild(senderContainer);
        flexContainer.appendChild(whisperContainer);

        window.appendChild(flexContainer)

        document.body.appendChild(window)
    },

    handleSenderNameClick(e, senderName) {
        // console.log(e.target, senderName)
        const titleEle = document.querySelector(".whispersKEK .title")
        e.stopPropagation()
        const clickedItem = e.target
        this.currentSenderName = senderName
        this.displayWhisperLogs(senderName)
        if (titleEle) {
            titleEle.style.width = "300px"
            titleEle.textContent = "Whispering " + this.currentSenderName
        }
        // Remove gray class and add black class for all sender name items
        const senderNamesList = document.querySelectorAll('.senderNamesListKEK .btn');
        senderNamesList.forEach(item => {
            item.classList.remove('grey');
            item.classList.add('black');
        });
        this.updateSenderNameList()
    },
    // Function to display whisper logs for a selected sender
    displayWhisperLogs(senderName) {
        // Fetch whisper logs for the selected sender
        let logs = this.fetchWhisperLogs(senderName);

        // Get the whisper logs list element
        const whisperLogsList = document.querySelector('#whisperLogsList');
        if (!whisperLogsList) return
        // Clear existing logs
        whisperLogsList.innerHTML = '';

        // Add logs to the list
        logs.forEach(log => {
            const listItem = document.createElement('div');
            listItem.classList.add("btn", "black", "textsecondary");

            // Set text alignment based on the log type
            listItem.style.margin = "5px";
            // Set maxLettersPerLine only if content length exceeds the threshold

            const threshold = 300
            if (log.content.trim().length > 40) {
                listItem.style.width = `300px`;
            } else {
                listItem.style.width = `fit-content`;
            }
            // Calculate dynamic width based on the content length and max letters per line

            listItem.style.whiteSpace = 'normal';
            listItem.style.padding = "7px"
            listItem.textContent = `${log.content}`;

            // Set flex alignment based on the log type
            listItem.style.marginLeft = log.type === 'from' ? '10' : 'auto';
            listItem.style.marginRight = log.type === 'to' ? '10' : 'auto';
            whisperLogsList.appendChild(listItem);
            log.seen = 1;
        });
        whisperLogsList.parentNode.scrollTop = whisperLogsList.parentNode.scrollHeight
        // Save the updated logs back to localStorage
        this.updateWhisperLogs(senderName, logs);
    },
    // Function to update the sender name list
    updateSenderNameList(updatedSenderObj) {
        let senderObj, senderNames
        const senderNamesListContainer = document.querySelector('.senderNamesListKEK');
        if (!senderNamesListContainer) return;
        if (!updatedSenderObj) {
            senderObj = this.fetchAllSenderNames()
        } else {
            senderObj = updatedSenderObj
        }

        senderNames = Object.keys(senderObj)

        // Get the sender names list container
        // Remove the existing sender name items
        senderNamesListContainer.innerHTML = '';

        // Add sender names to the list
        senderNames.forEach(senderName => {
            const listItem = document.createElement('div');
            const hasSeen = senderObj[senderName]
            if (hasSeen == 0) {
                listItem.textContent = senderName + " (new)";
            } else {
                listItem.textContent = senderName;
            }
            listItem.classList.add('btn', 'black', 'textsecondary', 'border');
            // console.log(senderName, this.currentSenderName)
            if (senderName == this.currentSenderName) {
                listItem.classList.remove("black")
                listItem.classList.add("grey")
            }
            listItem.addEventListener('click', (e) => {
                this.handleSenderNameClick(e, senderName)
            });
            listItem.style.padding = '10px';
            senderNamesListContainer.appendChild(listItem);
        });
    },
    // Function to handle input for sorting sender names
    handleSortInput(event) {
        let senderObj = this.fetchAllSenderNames()
        let senderNames = Object.keys(senderObj)
        const searchTerm = event.target.value.toLowerCase();
        const filteredSenderNames = senderNames.filter(senderName => senderName.toLowerCase().includes(searchTerm));
        const newSenderObj = {}
        for (let name of filteredSenderNames) {
            newSenderObj[name] = senderObj[name]
        }
        this.updateSenderNameList(newSenderObj);
    },
    // Function to handle input for sending whispers
    handleSendWhisperInput(event) {
        if (event.key === 'Enter') {
            // Call your this.sendWhisper function here
            this.sendWhisper(event.target.value);
            // Clear the input after pressing Enter
            event.target.value = '';
        }
    },

    sendWhisper(content) {
        if (this.currentSenderName == "") {
            return
        }
        this.currentMessage = content

        const chatInput = document.querySelector(".chatsection input");
        document.body.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, keyCode: 13 }));
        if (chatInput) {
            chatInput.value = `/${this.currentSenderName} `;
            chatInput.dispatchEvent(new InputEvent('input', { bubbles: true }));
            setTimeout(() => {
                chatInput.value = `${this.currentMessage}`
                chatInput.dispatchEvent(new KeyboardEvent("input", { bubbles: true }))
                setTimeout(() => {
                    chatInput.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, keyCode: 13 }))
                    this.sendInput.focus()
                }, 0)
            }, 0)
        }
    },

    handlePartyBtn(partyBtnbar) {
        partyBtnbar = partyBtnbar.element
        const btn = element("div", {
            className: "btn border black textsecondary",
            textContent: "Whispers"
        }).element
        btn.addEventListener("click", this.generateUI.bind(this))
        this.whisperBtn = btn
        addPartybtn(partyBtnbar, btn)
    },
}

export default whispers