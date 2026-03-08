import eventManager from "../core/event";
import profileManager from "../core/profile";
import ui from "../core/ui";

const skillPreset = {
    name: "Skill Presets",
    state: {
        skillPreset: {},
    },
    _profiles: true,
    start() {
        eventManager.on("ui.skillsMenuParent", this.addskillPresetUI, this);
    },
    stop() {
        eventManager.off("ui.skillsMenuParent", this.addskillPresetUI, this);

    },
    addskillPresetUI(skillsMenu) {
        skillsMenu = skillsMenu.element
        // console.log(
        //     "skills menu found initializing preset functionality for " +
        //     profileManager.playerName
        // );
        if (skillsMenu) {
            const skillListContainer = skillsMenu.querySelector("#skilllist")
            if(skillListContainer) {
                skillListContainer.style.gridTemplateColumns = "repeat(2, auto)"
            }
            // Create a window panel with preset functionality
            const windowPanel = document.createElement("div");
            windowPanel.className = "window panel-black";

            const titleFrame = document.createElement("div");
            titleFrame.className = "titleframe svelte-yjs4p5";

            const savePresetFrame = document.createElement("div");
            savePresetFrame.className = "panel-black bar slot preset-btn-container";
            savePresetFrame.style.display = "grid";
            savePresetFrame.style.gridTemplateColumns = "repeat(2, auto)";

            const title = document.createElement("div");
            title.className = "textprimary title svelte-yjs4p5";
            title.textContent = "Presets";
            title.style.width = "200px";
            title.style.padding = "10px";

            const presetList = document.createElement("div");
            presetList.className = "preset-list panel-black bar slot";

            // Add input field for preset name
            const presetInput = document.createElement("input");
            presetInput.type = "text";
            presetInput.classList.add("btn", "black", "textsecondary")
            presetInput.placeholder = "Enter preset name";
            // Add save button
            const saveButton = document.createElement("div");
            saveButton.className = "btn black textsecondary";
            saveButton.textContent = "Save";
            saveButton.style.textAlign = "center";
            saveButton.addEventListener("click", () => {
                const presetName = presetInput.value.trim();
                if (presetName) {
                    this.savePreset(presetName);
                    presetInput.value = ""; // Clear the input field
                }
            });

            // Add input field for importing this.state.skillPreset
            const importInput = document.createElement("textarea");
            importInput.placeholder = "Enter Preset Data";
            importInput.classList.add("btn", "black", "textsecondary")
            importInput.style.height = "35px";
            importInput.style.overflow = "hidden";
            importInput.addEventListener("wheel", (event) => {
                // Adjust the scrollTop property based on your scrolling logic
                importInput.scrollTop += event.deltaY;
            });
            // Add import button
            const importButton = document.createElement("div");
            importButton.className = "btn black textsecondary";
            importButton.textContent = "Import";
            importButton.style.textAlign = "center";
            importButton.addEventListener("click", (event) => {
                const importedData = importInput.value.trim();
                if (importedData) {
                    // Call the this.savePreset function with the imported data
                    this.importPreset(event, importedData);
                    importInput.value = ""; // Clear the input field after import
                }
            });

            // Append elements to the title frame
            titleFrame.appendChild(title);
            // Append import elements
            savePresetFrame.appendChild(importInput);
            savePresetFrame.appendChild(importButton);

            savePresetFrame.appendChild(presetInput);
            savePresetFrame.appendChild(saveButton);

            // Append elements to the window panel
            windowPanel.appendChild(titleFrame);
            windowPanel.appendChild(savePresetFrame);
            windowPanel.appendChild(presetList);

            // Append the window panel to the skillsMenu
            skillsMenu.appendChild(windowPanel);
            skillsMenu.style.display = "flex";

            // Initialize the preset list
            this.updatePresetList();
        }
    },
    // Example: Set skill points allocation on the page
    setSkillPoints(skillPoints) {
        const skillsMenu = ui.skillsMenuParent.element;
        console.log(skillPoints);
        const skillBoxes = skillsMenu.querySelectorAll(".skillbox"); // Select all skill boxes
        const applyBtn = skillsMenu.querySelector("#tutapplyskills");
        skillBoxes.forEach((skillBox) => {
            const divs = skillBox.children;
            const skillPointsInfo = divs[1];
            const skillBtnInfo = divs[2];
            const skillPointsElement = skillPointsInfo.querySelector(".skillpoints");
            if (skillPointsElement) {
                const skillName = skillBox
                    .querySelector(".textprimary.name")
                    .textContent.trim();
                const btns = skillBtnInfo.querySelectorAll("div.btn");
                let spentPoints =
                    skillPointsElement.querySelectorAll(".btn.incbtn.white").length;
                if (!spentPoints) {
                    spentPoints =
                        skillPointsElement.querySelectorAll(".btn.incbtn.green").length;
                }
                const decBtn = btns[0];
                if (decBtn) {
                    for (let i = 0; i < spentPoints; i++) {
                        decBtn.click();
                    }
                    let incBtn = skillBtnInfo.querySelector("#tutsetskillpoint");
                    if (incBtn) {
                        for (let i = 0; i < skillPoints[skillName]; i++) {
                            incBtn.click();
                        }
                    } else {
                        // Use MutationObserver to wait for #tutsetskillpoint to be added
                        const observer = new MutationObserver(function (mutationsList) {
                            mutationsList.forEach((mutation) => {
                                const addedNodes = Array.from(mutation.addedNodes);
                                const incBtn = addedNodes.find(
                                    (node) => node.id === "tutsetskillpoint"
                                );
                                if (incBtn) {
                                    for (let i = 0; i < skillPoints[skillName]; i++) {
                                        incBtn.click();
                                    }
                                }
                            });
                        });

                        // Configuration of the observer
                        const config = { childList: true, subtree: true };

                        // Start observing the target node (skillBtnInfo)
                        observer.observe(skillBtnInfo, config);
                        // Stop observing after a reasonable time or when the incBtn is found
                        setTimeout(() => observer.disconnect(), 100);
                    }
                }
            }
        });
        setTimeout(() => applyBtn.click(), 500);
    },

    // Example: Get skill points allocation from the page
    getSkillPoints() {
        const skillsMenu = ui.skillsMenuParent.element;
        const skillBoxes = skillsMenu.querySelectorAll(".skillbox"); // Select all skill boxes

        const skillPoints = {};
        skillBoxes.forEach((skillBox) => {
            const divs = skillBox.children;
            const skillPointsInfo = divs[1];
            const skillPointsElement = skillPointsInfo.querySelector(".skillpoints");
            if (skillPointsElement) {
                const skillName = skillBox
                    .querySelector(".textprimary.name")
                    .textContent.trim();
                let spentPoints =
                    skillPointsElement.querySelectorAll(".btn.incbtn.white").length;
                if (!spentPoints) {
                    spentPoints =
                        skillPointsElement.querySelectorAll(".btn.incbtn.green").length;
                }
                console.log(skillName, spentPoints);
                skillPoints[skillName] = spentPoints;
            }
        });

        return skillPoints;
    },
    // Function to update the preset list
    updatePresetList() {
        const presetList = document.querySelector(".preset-list");
        if (!presetList) return;
        presetList.innerHTML = ""; // Clear the preset list

        const container = document.createElement("div");
        container.style.overflow = "hidden"; // Enable scrolling
        container.style.maxHeight = "450px"; // Set the maximum height for the container
        // Add event listeners to handle scrolling
        container.addEventListener("wheel", (event) => {
            // Adjust the scrollTop property based on your scrolling logic
            container.scrollTop += event.deltaY;
        });
        for (const presetName in this.state.skillPreset) {
            const flexContainer = document.createElement("div");
            flexContainer.className = "preset-flex-container"; // Apply styling for the flex container
            flexContainer.style.display = "flex";
            const presetItem = document.createElement("div");
            presetItem.className = "preset-item btn black textsilver";
            presetItem.style.padding = "5px";
            presetItem.style.minWidth = "150px";
            presetItem.textContent = presetName;
            presetItem.addEventListener("click", () => {
                this.loadPreset(presetName);
            });
            // Add delete button
            const deleteButton = document.createElement("div");
            deleteButton.className = "btn black delete-btn textsecondary";
            deleteButton.style.padding = "5px";
            deleteButton.textContent = "X";
            deleteButton.addEventListener("click", (event) => {
                event.stopPropagation(); // Prevent the click event from reaching the presetItem click event
                this.deletePreset(presetName);
            });

            // Add export button
            const exportButton = document.createElement("div");
            exportButton.className = "btn black export-btn textsecondary";
            exportButton.style.padding = "5px";
            exportButton.textContent = "Copy";
            exportButton.addEventListener("click", (event) => {
                event.target.textContent = "Copied!";
                event.stopPropagation(); // Prevent the click event from reaching the presetItem click event
                this.copyPresetToClipboard(presetName);
                setTimeout(() => {
                    event.target.textContent = "Copy";
                }, 500);
            });
            presetItem.style.flex = 1;
            // Append elements to the flex container
            flexContainer.appendChild(presetItem);
            flexContainer.appendChild(exportButton);
            flexContainer.appendChild(deleteButton);

            // Append the flex container to the container
            container.appendChild(flexContainer);
        }

        // Append the container to the presetList
        presetList.appendChild(container);
    },

    // Function to import this.state.skillPreset
    importPreset(event, importedData) {
        event.stopPropagation();
        const target = event.target;
        try {
            const parsedData = JSON.parse(importedData);
            // Validate the imported data format as needed
            if (this.validateImportedData(parsedData)) {
                // Extract presetName and skillPoints from the parsed data
                const presetName = Object.keys(parsedData)[0];
                const skillPoints = parsedData[presetName];

                // Call the this.savePreset function with the imported data
                this.savePreset(presetName, skillPoints);
                this.updatePresetList();
                target.textContent = "Saved!";
                setTimeout(() => {
                    target.textContent = "Import";
                }, 500);
            } else {
                target.textContent = "Failed!";
                setTimeout(() => {
                    target.textContent = "Import";
                }, 500);
            }
        } catch (error) {
            target.textContent = "Failed!";
            setTimeout(() => {
                target.textContent = "Import";
            }, 500);
        }
    },
    // Function to validate the imported data format
    validateImportedData(importedData) {
        return (
            importedData &&
            typeof importedData === "object" &&
            Object.keys(importedData).length === 1 &&
            typeof importedData[Object.keys(importedData)[0]] === "object"
        );
    },
    // Function to copy the preset to the clipboard using Clipboard API
    async copyPresetToClipboard(presetName) {
        let skillPoints = {};
        skillPoints[presetName] = this.state.skillPreset[presetName];

        if (skillPoints) {
            // Convert skillPoints to a string (customize this based on your data structure)
            const skillPointsString = JSON.stringify(skillPoints);

            try {
                // Use Clipboard API to copy the skillPointsString to the clipboard
                await navigator.clipboard.writeText(skillPointsString);
                console.log(`Preset "${presetName}" copied to clipboard`);
            } catch (error) {
                console.error("Unable to copy to clipboard:", error);
            }
        } else {
            alert(`Preset "${presetName}" not found`);
        }
    },
    // Function to load this.state.skillPreset from localStorage
    loadPreset(presetName) {
        const skillPoints = this.state.skillPreset[presetName];

        if (skillPoints) {
            this.setSkillPoints(skillPoints);
            console.log(`Preset "${presetName}" loaded successfully`);
        } else {
            alert(`Preset "${presetName}" not found`);
        }
    },
    // Function to delete a preset from localStorage
    deletePreset(presetName) {
        delete this.state.skillPreset[presetName];
        this.updatePresetList(); // Update the preset list after deletion
    },
    // Function to save this.state.skillPreset to localStorage
    savePreset(presetName, skillPoints) {
        if (!skillPoints) {
            skillPoints = this.getSkillPoints();
        }
        // Use playerName as part of the key
        this.state.skillPreset[presetName] = skillPoints;

        this.updatePresetList();
    },
};

export default skillPreset;
