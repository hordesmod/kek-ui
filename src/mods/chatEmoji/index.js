import eventManager from "../../core/event"
import { makeDraggable } from "../../core/widgets/drag"
import element from "../../core/widgets/element"
import { createWindow } from "../../core/widgets/widgets"

const chatEmoji = {
    name: "Emojis",
    state: {
        emojiList: {
            ":cake": "🎂",
            ":fire": "🔥",
            ":bow": "🏹",
            ":biceps": "💪💪💪",
            ":flushed": "😳",
            ":yum": "😋",
            ":joy": "😂",
            ":katana": "▬▬ι═══════ﺤ",
            ":sad": "( •̯́ ^ •̯̀)",
            ":izi": "ᶻ 𝗓 𐰁",
            ":boo": "👻",
            ":skull": "💀",
            ":nerd": "🤓☝️"
        },
        _transform: {
            top: 100,
            left: 100,
            _drag: true
        }
    },
    hotkey: {
        "Open Emojis": { key: ".", callback: "generateUI" }
    },
    start() {
        eventManager.on("click.emojis", this.generateUI, this)
        eventManager.on("ui.chatInput", this.handleChatInput, this)
        eventManager.on("ui.channelSelect", this.addControlBtn, this)
    },
    stop() {
        eventManager.off("click.emojis", this.generateUI, this)
        eventManager.off("ui.chatInput", this.handleChatInput, this)
    },
    addControlBtn(channelSelect) {
        this.controlBtn = element("small")
            .css("btn border black textgrey")
            .text(this.name)
            .style({ lineHeight: "1em", marginRight: "4px" })
            .on("click", () => {this.generateUI()})
        channelSelect.element.appendChild(this.controlBtn.element)
    },
    toggleControlBtn() {
        ["textgrey", "textprimary"].forEach(c => this.controlBtn.toggle(c))
    },
    generateUI() {
        this.toggleControlBtn()
        const existing = document.querySelector(".emojisKEK")
        if (existing) {
            existing.remove()
            return
        }
        // Function to update the emoji list
        const updateEmojiList = () => {
            const emojiList = document.querySelector(".emoji-list")
            if (!emojiList) return
            emojiList.innerHTML = ''; // Clear the list

            for (let emojiName in this.state.emojiList) {
                const emoji = this.state.emojiList[emojiName]

                const emojiItem = document.createElement('div');
                emojiItem.className = 'emoji-item btn black textsecondary';
                const emojiNameSpan = document.createElement("span")
                emojiNameSpan.classList.add("textsecondary")
                emojiNameSpan.textContent = emojiName

                const emojiSpan = document.createElement("span")
                emojiSpan.classList.add("textsecondary")
                emojiSpan.textContent = emoji

                emojiItem.appendChild(emojiNameSpan)
                emojiItem.appendChild(emojiSpan)
                emojiItem.style.display = "flex"
                emojiItem.style.justifyContent = "space-between"

                emojiItem.addEventListener('contextmenu', function (e) {
                    e.preventDefault()
                    // console.log("deleting item ", emojiName)
                    deleteEmoji(emojiName);
                    updateEmojiList(); // Update the list after deletion
                });
                emojiItem.addEventListener('click', function (e) {
                    // Copy to clipboard
                    navigator.clipboard.writeText(emoji)
                        .then(function () {
                            console.log("Copying item ", emoji);

                            const oldContent = emojiItem.innerHTML
                            // Change text content to "Copied"
                            emojiItem.textContent = "Copied!";
                            emojiItem.classList.add("textgreen")
                            // Revert back to original content after 500ms
                            setTimeout(function () {
                                emojiItem.innerHTML = oldContent;
                                emojiItem.classList.remove("textgreen")
                            }, 500);
                        })
                        .catch(function (err) {
                            console.error('Unable to copy text to clipboard', err);
                        });
                });

                emojiList.appendChild(emojiItem);
            }
        }

        const saveEmoji = (emoji, emojiName) => {
            this.state.emojiList[emojiName] = emoji;
        }

        const deleteEmoji = (emojiName) => {
            delete this.state.emojiList[emojiName];
        }

        const handleExportEmojis = (event) => {
            try {
                const emojisString = JSON.stringify(this.state.emojiList);
                navigator.clipboard.writeText(emojisString).then(() => {
                    console.log('Emojis copied to clipboard successfully.');
                    const oldText = event.target.textContent;
                    event.target.textContent = 'Copied!';
                    event.target.classList.add('textgreen');
                    setTimeout(() => {
                        event.target.textContent = oldText;
                        event.target.classList.remove('textgreen');
                    }, 1000);
                }).catch((error) => {
                    console.error('Error copying emojis to clipboard:', error);
                });
            } catch (error) {
                console.error('Error exporting emojis:', error);
            }
        }

        const handleImportEmojis = (event) => {
            try {
                // Open a text area for user input
                const textarea = document.createElement('textarea');
                textarea.placeholder = 'Paste your emojis here...';

                // Create an "Import" button
                const importButton = document.createElement('button');
                importButton.className = 'btn black textsecondary';
                importButton.textContent = 'Import';

                const container = document.createElement('div');
                container.style.display = 'flex'; // Set display to flex
                container.style.marginBottom = "10px"

                textarea.style.flex = "1"
                importButton.style.flex = "1"
                importButton.style.fontSize = "16px"
                container.appendChild(textarea)
                container.appendChild(importButton)

                // Append the text area and button to the menu item (event.target)
                const emojiList = document.querySelector(".emoji-list")
                event.target.parentNode.parentNode.insertBefore(container, emojiList);

                // Add event listener to handle the "Import" button
                importButton.addEventListener('click', () => {
                    event.stopPropagation();
                    const importButtonMain = document.querySelector('.import-emoji-btn')
                    importButtonMain.classList.remove("importActive")
                    const importData = textarea.value.trim();

                    if (!importData) {
                        importButton.textContent = 'Failed!';

                        // Remove the text area and import button
                        textarea.remove();
                        setTimeout(() => {
                            // Reset the button text to "Import Emojis"
                            importButton.remove();
                            container.remove()
                        }, 1000);
                        return; // Exit if no data is provided
                    }

                    try {
                        // Parse the import data into an object
                        const importedEmojis = JSON.parse(importData);

                        if (importedEmojis && typeof importedEmojis === 'object') {
                            // Merge imported emojis with existing emojis
                            this.state.emojiList = { ...this.state.emojiList, ...importedEmojis };

                            // Log or notify about the successful import
                            console.log('Emojis imported successfully.');

                            // Change the button text to "Successful!" for a brief moment
                            importButton.textContent = 'Successful!';
                            importButton.classList.add("textgreen")
                            // Remove the text area and import button
                            textarea.remove();
                            setTimeout(() => {
                                // Reset the button text to "Import Emojis"

                                importButton.remove();
                                container.remove()

                            }, 1000);
                            updateEmojiList()
                        } else {
                            console.error('Invalid emojis data format.');
                            // Change the button text to "Failed!" for a brief moment
                            importButton.textContent = 'Failed!';
                            // Remove the text area and import button
                            textarea.remove();
                            setTimeout(() => {
                                // Reset the button text to "Import Emojis"
                                importButton.remove();
                                container.remove()

                            }, 1000);
                        }
                    } catch (error) {
                        importSpan.textContent = 'Failed!';

                        // Remove the text area and import button
                        textarea.remove();
                        setTimeout(() => {
                            // Reset the button text to "Import Emojis"
                            importSpan.textContent = 'Import Emojis';

                            importButton.remove();
                            container.remove()

                        }, 1000);
                        // console.error('Error parsing or importing emojis:', error);
                        // Handle error, e.g., notify the user about the incorrect format
                    }
                });
            } catch (error) {
                console.error('Error setting up emojis import:', error);
            }
        }
        // Check if the emoji UI already exists
        const windowPanel = createWindow("Emojis", "100px", "100px", this.state._transform, this.toggleControlBtn.bind(this)).element
        const emojiList = document.createElement('div');
        emojiList.className = 'emoji-list panel-black bar slot';
        emojiList.style.display = "grid";
        emojiList.style.gridTemplateColumns = "repeat(10, auto)";

        const inputField = document.createElement('input');
        inputField.type = 'text';
        inputField.placeholder = 'Paste emoji';
        // Style the input fields for side-by-side placement
        inputField.style.marginRight = '10px';

        const emojiNameField = document.createElement('input');
        emojiNameField.type = 'text';
        emojiNameField.placeholder = 'Enter emoji name';

        const saveButton = document.createElement('div');
        saveButton.className = 'btn black textsecondary';
        saveButton.textContent = 'Save Emoji';
        saveButton.addEventListener('click', function () {
            const emoji = inputField.value.trim();
            const emojiName = emojiNameField.value.trim();

            if (emoji && emojiName) {
                saveEmoji(emoji, emojiName);
                inputField.value = ''; // Clear the input fields
                emojiNameField.value = '';
                updateEmojiList();
            }
        });

        // Add "Export" button
        const exportButton = document.createElement('div');
        exportButton.className = 'btn black textsecondary';
        exportButton.textContent = 'Export Emojis';
        exportButton.addEventListener('click', function (event) {
            handleExportEmojis(event);
        });

        // Add "Import" button
        const importButtonMain = document.createElement('div');
        importButtonMain.className = 'btn black textsecondary import-emoji-btn';
        importButtonMain.textContent = 'Import Emojis';

        importButtonMain.addEventListener('click', function importEmojiBtn(event) {
            if (importButtonMain.classList.contains("importActive")) {
                return;
            }
            importButtonMain.classList.add("importActive")
            handleImportEmojis(event);
            updateEmojiList()
        });

        const inputContainer = document.createElement('div');
        inputContainer.style.display = 'flex'; // Set display to flex
        inputContainer.appendChild(inputField);
        inputContainer.appendChild(emojiNameField);

        const btnContainer = document.createElement('div');
        btnContainer.style.display = 'flex'; // Set display to flex

        btnContainer.appendChild(saveButton);
        btnContainer.appendChild(exportButton);
        btnContainer.appendChild(importButtonMain);

        saveButton.style.flex = '1';
        exportButton.style.flex = '1';
        importButtonMain.style.flex = '1';

        exportButton.style.textAlign = 'center';
        importButtonMain.style.textAlign = 'center';
        saveButton.style.textAlign = 'center';

        inputContainer.style.marginBottom = "10px"
        btnContainer.style.marginBottom = "10px"

        windowPanel.appendChild(inputContainer);
        windowPanel.appendChild(btnContainer)
        windowPanel.appendChild(emojiList);

        // Append the window panel to the body
        document.body.appendChild(windowPanel);

        // Update emoji list
        updateEmojiList();


    },
    handleChatInput(chatInputSection) {
        chatInputSection = chatInputSection.element
        const chatInput = chatInputSection.querySelector("input")
        chatInput.addEventListener('input', this.chatInputListener.bind(this));
    },
    chatInputListener(event) {
        const emojis = this.state.emojiList;
        const chatInput = event.target;
        const inputValue = chatInput.value;
    
        let replacedValue = inputValue;
        let emojiFound = false;
    
        for (const [emote, emoji] of Object.entries(emojis)) {
            if (replacedValue.includes(emote)) {
                replacedValue = replacedValue.replace(new RegExp(emote, 'g'), emoji);
                emojiFound = true;
            }
        }
    
        // Update the input value with replaced emotes if any were found
        if (emojiFound) {
            chatInput.value = replacedValue;
    
            // Dispatch a new InputEvent only if an emoji was found
            const inputEvent = new InputEvent('input', { bubbles: true });
            chatInput.dispatchEvent(inputEvent);
        }
    }
}

export default chatEmoji