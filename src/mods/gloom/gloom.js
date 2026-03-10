import apiManager from "../../core/api";
import element from "../../core/widgets/element";
import eventManager from "../../core/event";
import profileManager from "../../core/profile";
import { createGrid, createWindow } from "../../core/widgets/widgets";
import { addSysbtn } from "../../core/widgets/btnbar";
import ui from "../../core/ui";

const gloom = {
    name: "Gloom Timer/Data",
    state: {
        _transform: {
            "timer": {left: 100, top: 100, _drag: true},
            "personal": {left: 100, top: 100, _drag: true},
            "ranking": {left: 100, top: 100, _drag: true}
        },
    },
    // hotkey: {
    //     "Open Gloom Timer": {callback: "createGloomTimer", key: "n"}
    // },
    start() {
        if (profileManager.playerClass == 3) {
            this.defaultRequiredArg = "hps"
        }
        this.oldOptions = [this.defaultRequiredArg]
        eventManager.on("click.gloomPersonal", this.handlePersonalGloom, this)
        eventManager.on("click.gloomRanking", this.handleGloomRankings, this)
        eventManager.on("ui.sysbtnbar", this.addBtn, this)
        if(ui.sysbtnbar) {
            if(!this.personalGloomBtn && !this.rankingBtn) {
                this.addBtn(ui.sysbtnbar)
            }
        } 
    },
    stop() {
        eventManager.off("click.gloomPersonal", this.handlePersonalGloom, this)
        eventManager.off("click.gloomRanking", this.handleGloomRankings, this)
        eventManager.off("ui.sysbtnbar", this.addBtn, this)
        if(this.personalGloomBtn) {
            this.personalGloomBtn.remove()
            this.personalGloomBtn = null
        }
        if(this.rankingBtn) {
            this.rankingBtn.remove()
            this.rankingBtn = null
        }
    },
    isFetchingPersonal: false,
    gloomRankingData: {},
    gloomPersonalData: {},
    defaultRequiredArg: "dps",
    rankingOpened: false,
    oldOptions: [],
    isFetchingRanking: false,
    requiredButtonGroup: ["dps", "hps", "mps", "kills", "deaths"],
    optionalButtonGroups: {
        faction: ["vg", "bl"],
        class: ["warrior", "mage", "shaman", "archer"],
        duration: ["true"],
    },

    gloomTimerVisible : false,
    gloomTimerInterval: null,
    rankingBtn: null,
    personalGloomBtn: null,
    rankingSvg: `<svg fill="#a6dcd5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" stroke="#ffffff"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M6.5,12h-4a.5.5,0,0,0-.5.5V20H7V12.5A.5.5,0,0,0,6.5,12Z"></path><path d="M14,4H10a.5.5,0,0,0-.5.5V20h5V4.5A.5.5,0,0,0,14,4Z"></path><path d="M21.5,8h-4a.5.5,0,0,0-.5.5V20h5V8.5A.5.5,0,0,0,21.5,8Z"></path></g></svg>`,
    personalGloomSvg: `<svg fill="#a6dcd5" viewBox="0 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg" stroke="#ffffff"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <title>archery-target</title> <path d="M9.791 15.798c0 3.429 2.78 6.209 6.209 6.209s6.209-2.78 6.209-6.209-2.78-6.209-6.209-6.209-6.209 2.78-6.209 6.209zM16.003 12.066c2.062 0 3.734 1.672 3.734 3.734s-1.672 3.734-3.734 3.734c-2.062 0-3.734-1.672-3.734-3.734s1.672-3.734 3.734-3.734zM17.81 15.8c0 0.998-0.809 1.807-1.807 1.807s-1.807-0.809-1.807-1.807c0-0.998 0.809-1.807 1.807-1.807s1.807 0.809 1.807 1.807zM23.148 20.662c0-0 0-0 0-0l1.113 3.669c2.229-2.159 3.615-5.182 3.615-8.53 0-5.832-4.204-10.682-9.748-11.684l-0.79-2.606-3.232-0-0.818 2.727c-5.25 1.227-9.16 5.938-9.16 11.562 0 3.16 1.235 6.032 3.248 8.159l-1.944 6.482h2.926l1.466-4.5c1.304 0.796 2.773 1.348 4.345 1.592v2.909h3.251v-6.116c-0.461 0.076-0.934 0.116-1.416 0.116-0.629 0-1.243-0.068-1.834-0.196-1.236-0.267-2.374-0.799-3.351-1.533-0.927-0.696-1.71-1.575-2.294-2.582 0.004 0.008 0.009 0.015 0.014 0.023-0.747-1.278-1.175-2.765-1.175-4.353 0-3.384 1.946-6.314 4.78-7.732-0.001 0-0.001 0.001-0.002 0.001v0c1.163-0.582 2.475-0.91 3.863-0.91 1.146 0 2.239 0.223 3.239 0.628 3.167 1.282 5.402 4.386 5.402 8.013 0 1.803-0.553 3.478-1.498 4.863-0.636 0.932-1.449 1.733-2.392 2.355 0-0 0-0 0.001-0-0.989 0.652-2.12 1.107-3.336 1.308v3.264c1.571-0.187 3.048-0.681 4.369-1.42l1.401 4.271h2.926l-2.967-9.78c-0 0-0 0-0 0z"></path> </g></svg>`,
    addBtn(sysbtnbar) {
        sysbtnbar = sysbtnbar.element
        const personalGloomBtn = this.createBtn("👹", "Gloom Personal");
        const rankingBtn = this.createBtn("📊", "Gloom Rankings");

        this.rankingBtn = rankingBtn
        this.personalGloomBtn = personalGloomBtn
        
        addSysbtn(sysbtnbar, personalGloomBtn)
        addSysbtn(sysbtnbar, rankingBtn)
    },
    createBtn(text, title) {
        const button = element("div", {
            className: "btn border black textsecondary",
            tooltip: title,
            style: "padding-left: 3px; padding-right: 3px; margin: 2px;"
        }).element

        const icon = element("img").css("svgicon").element
        let encodedURI = ""
        if (title == "Gloom Rankings") {
            encodedURI = encodeURIComponent(this.rankingSvg)
            button.addEventListener("click", this.handleGloomRankings.bind(this))
        }
        if (title == "Gloom Personal") {
            encodedURI = encodeURIComponent(this.personalGloomSvg)
            button.addEventListener("click", this.handlePersonalGloom.bind(this))
        }

        icon.src = `data:image/svg+xml,${encodedURI}`
        button.appendChild(icon)
        return button
    },
    calculateTimeUntilNextGloom(currentTimeUTC, gloomSchedule) {
        const currentHour = currentTimeUTC.getUTCHours();
        const currentMinutes = currentTimeUTC.getUTCMinutes();

        let nextGloomIndex = 0;
        for (let i = 0; i < gloomSchedule.length; i++) {
            if (currentHour < gloomSchedule[i] || (currentHour === gloomSchedule[i] && currentMinutes < 60)) {
                nextGloomIndex = i;
                break;
            }
        }

        let hoursUntilNextGloom = gloomSchedule[nextGloomIndex] - currentHour;
        let minutesUntilNextGloom = 60 - currentMinutes;

        if (minutesUntilNextGloom > 0) {
            hoursUntilNextGloom -= 1;
        }

        const secondsUntilNextGloom = 60 - currentTimeUTC.getUTCSeconds();

        return {
            hours: hoursUntilNextGloom,
            minutes: minutesUntilNextGloom,
            seconds: secondsUntilNextGloom,
        };
    },

    updateGloomTime() {
        const currentTimeUTC = new Date();
        const gloomSchedule = [1, 4, 7, 10, 13, 16, 19, 22]; // Replace with your gloom schedule in UTC
        const timeUntilNextGloom = this.calculateTimeUntilNextGloom(currentTimeUTC, gloomSchedule);
        if(timeUntilNextGloom.hours < 0) {
            timeUntilNextGloom.hours  += 3
        }
        return `${timeUntilNextGloom.hours}h ${timeUntilNextGloom.minutes}m ${timeUntilNextGloom.seconds}s`;
    },

    updateObeliskTime() {
        const currentTime = new Date();
        const gloomSchedule = [1, 4, 7, 10, 13, 16, 19, 22]; // Replace with your gloom schedule in local time
        const timeUntilNextGloom = this.calculateTimeUntilNextGloom(currentTime, gloomSchedule);

        // Adjusting obelisk time by subtracting one hour from gloom time
        let hoursUntilNextObelisk = timeUntilNextGloom.hours - 1;
        const minutesUntilNextObelisk = timeUntilNextGloom.minutes;
        const secondsUntilNextObelisk = timeUntilNextGloom.seconds;

        if (hoursUntilNextObelisk < 0) {
            hoursUntilNextObelisk = 3 - Math.abs(hoursUntilNextObelisk);
        }

        return `${hoursUntilNextObelisk}h ${minutesUntilNextObelisk}m ${secondsUntilNextObelisk}s`;
    },

    createGloomTimer() {
        const focusedElement = document.activeElement;

        // Check if the focused element is an input field
        if (focusedElement.tagName === 'INPUT' || focusedElement.tagName === 'TEXTAREA') {
            return;
        }

        if (this.gloomTimerVisible) {
            const gloomDiv = document.querySelector('.gloomtimerKEK');
            if (gloomDiv) {
                gloomDiv.remove();
            }
            this.gloomTimerVisible = false;
            clearInterval(this.gloomTimerInterval);
        } else {
            
            const gloomDiv = createWindow("Gloom Timer", "100px", "100px", this.state._transform.timer).element

            const gloomGrid = createGrid(["Event", "Time"], "gloomGridKEK").element

            const gloomTimeDiv = document.createElement('div');
            gloomTimeDiv.className = 'textsecondary btn black';
            gloomTimeDiv.textContent = `${this.updateGloomTime()}`;

            const obeliskTimeDiv = document.createElement('div');
            obeliskTimeDiv.className = 'textsecondary btn black';
            obeliskTimeDiv.textContent = `${this.updateObeliskTime()}`;

            gloomGrid.appendChild(element("div", {textContent: "Gloom", className: "btn black textsecondary"}).element)
            gloomGrid.appendChild(gloomTimeDiv)
            gloomGrid.appendChild(element("div", {textContent: "Obelisk", className: "btn black textsecondary"}).element)
            gloomGrid.appendChild(obeliskTimeDiv)

            gloomDiv.appendChild(gloomGrid);
            document.body.appendChild(gloomDiv);
            gloomDiv.style.zIndex = 20
            this.gloomTimerInterval = setInterval(() => {
                if (this.gloomTimerVisible) {
                    gloomTimeDiv.textContent = `${this.updateGloomTime()}`;
                    obeliskTimeDiv.textContent = `${this.updateObeliskTime()}`
                }
            }, 1000);

            this.gloomTimerVisible = true;
        }
    },

    async handlePersonalGloom() {
        const existing = document.querySelector(".gloomdataKEK");
        if (existing) {
            existing.remove();
            return;
        }
        const gloomDataContainer = createWindow(
            "Gloom Data",
            "100px",
            "100px",
            this.state._transform.personal
        ).element;

        const refreshBtn = document.createElement("div");
        refreshBtn.classList.add(
            "btn",
            "black",
            "textprimary",
            "refreshBtnPersonalGloom"
        );
        refreshBtn.textContent = "Refresh";
        refreshBtn.style.padding = "7px";
        refreshBtn.style.margin = "5px";
        if (this.isFetchingPersonal) {
            refreshBtn.classList.remove("black");
            refreshBtn.classList.add("disabled", "grey");
            refreshBtn.textContent = "Refreshing...";
        }
        refreshBtn.addEventListener("click", () => {
            refreshBtn.classList.remove("black");
            refreshBtn.classList.add("disabled", "grey");
            this.isFetchingPersonal = true;
            refreshBtn.textContent = "Refreshing...";
            apiManager
                .request("kek.gloom.personal", {
                    player_name: profileManager.playerName,
                })
                .then((data) => {
                    this.gloomPersonalData = data;
                    this.updateGloomDataGrid(this.gloomPersonalData);
                    const btn = document.querySelector(".refreshBtnPersonalGloom");
                    if (btn) {
                        btn.classList.remove("disabled", "grey");
                        btn.classList.add("black");
                        btn.textContent = "Refresh";
                    }
                    this.isFetchingPersonal = false;
                })
                .catch((err) => {
                    console.log(err);
                    const btn = document.querySelector(".refreshBtnPersonalGloom");
                    if (btn) {
                        btn.classList.remove("disabled", "grey");
                        btn.classList.add("black");
                        btn.textContent = "Refresh";
                    }
                    this.isFetchingPersonal = false;
                });
        });
        refreshBtn.click();
        gloomDataContainer.appendChild(refreshBtn);

        document.body.appendChild(gloomDataContainer);

        this.updateGloomDataGrid(this.gloomPersonalData);
    },
    handleGloomRankings() {
        const existing = document.querySelector(".gloomrankingKEK")
        if (existing) {
            existing.remove()
            return;
        }
        const gloomRankingContainer = createWindow("Gloom Ranking", "100px", "100px", this.state._transform.ranking).element
        // Function to handle clicks on required buttons
        const handleRequiredButtonClick = (e) => {
            e.stopPropagation();
            e.preventDefault();

            const currentBtn = e.target;
            const requiredBtns = document.querySelectorAll(".required-btn-kek");
            if (currentBtn.classList.contains("selected")) {
                currentBtn.classList.remove("grey", "selected")
                currentBtn.classList.add("black")
            } else {
                requiredBtns.forEach((btn) => {
                    if (btn === currentBtn) {
                        btn.classList.add("grey", "selected")
                        btn.classList.remove("black")
                    } else {
                        btn.classList.remove("grey", "selected")
                        btn.classList.add("black")
                    }
                });
            }
        }
        // Function to handle clicks on optional buttons
        const handleOptionalButtonClick = (e, group) => {
            e.stopPropagation();
            e.preventDefault();
            // console.log("clicking")
            const btns = document.querySelectorAll(`.optional-btn-${group}`);
            // console.log(btns, `.optional-button-${group}`)
            const currentBtn = e.target
            if (group) {
                if (currentBtn.classList.contains("selected")) {
                    currentBtn.classList.remove("grey", "selected")
                    currentBtn.classList.add("black")
                } else {
                    btns.forEach((btn) => {
                        if (btn === currentBtn) {
                            btn.classList.add("grey", "selected")
                            btn.classList.remove("black")
                        } else {
                            btn.classList.remove("grey", "selected")
                            btn.classList.add("black")
                        }
                    });
                }
            }
        }
        // Helper function to create buttons for a group
        const createOptionalButtonsForGroup = (group) => {
            const buttonsContainer = document.createElement("div");
            buttonsContainer.className = "optional-buttons-row";

            this.optionalButtonGroups[group].forEach((buttonName) => {
                const button = createButton(buttonName, (e) => handleOptionalButtonClick(e, group), "optional", group);
                if (this.oldOptions.includes(button.value)) {
                    button.classList.remove("black")
                    button.classList.add("grey", "selected")
                }
                buttonsContainer.appendChild(button);
            });

            return buttonsContainer;
        }
        
        // Helper function to create a button
        const createButton = (value, onClick, type, group = "") => {

            const button = document.createElement("div");
            button.value = value
            button.textContent = value.charAt(0).toUpperCase() + value.slice(1);
            if (value.toLowerCase() == "bl" || value.toLowerCase() == "vg") {
                button.textContent = value.toUpperCase()
            }

            button.addEventListener("click", onClick);

            // Add specific classes for styling and identification
            if (type === "submit") {
                button.className = `btn black textprimary submit-btn-kek`;
            }
            if (type === "optional") {
                button.className = `btn black textsecondary optional-btn-${group}`;
            }
            if (type === "required") {
                button.className = `btn black textsecondary required-btn-kek`;
            }

            return button;
        }

        // Function to handle the submit button click
        const handleSubmitClick = (e) => {
            // Gather selected optional button values
            const optionalArgsSelected = [];

            this.rankingOpened = true

            for (const group in this.optionalButtonGroups) {
                const btns = document.querySelectorAll(`.optional-btn-${group}`);
                btns.forEach(btn => {
                    if (btn.classList.contains("selected")) {
                        optionalArgsSelected.push(btn.value)
                    }
                });
            }
            let requiredArgSelected = ""
            const reqBtns = document.querySelectorAll(".required-btn-kek")
            for (let btn of reqBtns) {
                if (btn.classList.contains("selected")) {
                    requiredArgSelected = btn.value
                    break
                }
            }
            this.oldOptions = [...optionalArgsSelected, requiredArgSelected]
            // Update the optionalArgs value based on selected buttons
            const optionalArgs = optionalArgsSelected.length > 0 ? optionalArgsSelected.join(" ") : "none";
            console.log("Optional Args:", optionalArgs);
            console.log("Required Arg:", requiredArgSelected);
            e.target.classList.add("disabled", "grey")
            e.target.classList.remove("black")
            e.target.textContent = "Fetching..."
            this.isFetchingRanking = true
            // Perform the API call or other actions as needed
            apiManager.request("kek.gloom.ranking", 
            { "player_name": profileManager.playerName, "required_arg": requiredArgSelected, "optional_args": optionalArgs })
                .then((data) => {
                    // Handle the API response data
                    // console.log(data);
                    this.updateGloomRankingGrid(data)
                    this.gloomRankingData = data
                    const btn = document.querySelector(".submitBtnGloomRanking")
                    if (btn) {
                        btn.classList.remove("disabled", "grey")
                        btn.classList.add("black")
                        btn.textContent = "Submit"
                    }
                    this.isFetchingRanking = false
                })
                .catch((error) => {
                    console.error(error);
                    const btn = document.querySelector(".submitBtnGloomRanking")
                    if (btn) {
                        btn.classList.remove("disabled", "grey")
                        btn.classList.add("black")
                        btn.textContent = "Submit"
                    }
                    this.isFetchingRanking = false
                });
        }

        const flexContainer = document.createElement("div")
        flexContainer.style.display = "flex"
        flexContainer.classList.add("flex-container-kek")
        flexContainer.style.flexDirection = "row"

        const btnRowContainer = document.createElement("div");
        btnRowContainer.className = "panel-black";

        // Create label for required buttons
        const requiredLabel = document.createElement("div");
        requiredLabel.textContent = "Required";
        requiredLabel.className = "btn black textprimary";


        // Create row for required buttons
        const requiredButtonsRow = document.createElement("div");
        requiredButtonsRow.className = "required-buttons-row";
        requiredButtonsRow.style.padding = "5px"
        requiredButtonsRow.appendChild(requiredLabel)
        this.requiredButtonGroup.forEach((buttonName) => {
            const button = createButton(buttonName, (e) => handleRequiredButtonClick(e), "required");
            if (this.oldOptions.includes(button.value)) {
                button.classList.remove("black")
                button.classList.add("grey", "selected")
            }
            requiredButtonsRow.appendChild(button);
        });
        btnRowContainer.appendChild(requiredButtonsRow);

        const optionalContainer = document.createElement("div");
        optionalContainer.className = "optional-container";
        optionalContainer.style.display = "flex";
        optionalContainer.style.margin = "0";
        optionalContainer.style.padding = "5px";
        // Create labels and rows for optional button groups
        for (const group in this.optionalButtonGroups) {
            const label = document.createElement("div");
            label.textContent = group.charAt(0).toUpperCase() + group.slice(1);
            label.className = "btn black textprimary";

            const buttonsRow = createOptionalButtonsForGroup(group);
            buttonsRow.insertBefore(label, buttonsRow.firstChild)
            optionalContainer.appendChild(buttonsRow);
        }

        const submitBtnContainer = document.createElement("div")
        submitBtnContainer.classList.add("submitBtnContainer")
        // Submit button
        const submitButton = createButton("Submit", (e) => handleSubmitClick(e), "submit");
        submitButton.classList.add("submitBtnGloomRanking")
        if (this.isFetchingRanking == true) {
            submitButton.classList.add("disabled", "grey")
            submitButton.classList.remove("black")
            submitButton.textContent = "Fetching..."
        }

        submitBtnContainer.appendChild(submitButton)

        optionalContainer.appendChild(submitBtnContainer)

        btnRowContainer.appendChild(optionalContainer)

        flexContainer.appendChild(btnRowContainer)

        gloomRankingContainer.appendChild(flexContainer);

        document.body.appendChild(gloomRankingContainer);

        this.updateGloomRankingGrid(this.gloomRankingData)
    },
    updateGloomRankingGrid(data) {
        if (!data) return;
        const existingDataGrid = document.querySelector(".gloomrankingGridKEK")
        if (existingDataGrid) {
            existingDataGrid.remove()
        }
        data = data.data
        if (!data) return;
        const marginVal = "2px"
        const paddingVal = "4px"
        delete data[0].id
        const keys = Object.keys(data[0]);

        // Create column names by capitalizing each key
        const columnNames = keys.map(key => key.charAt(0).toUpperCase() + key.slice(1));


        const grid = createGrid(columnNames, "gloomrankingGridKEK").element

        for (let log of data) {

            for (let col of columnNames) {
                col = col.toLowerCase()
                let cellValue = log[col]

                const cell = document.createElement("div")
                cell.className = "btn black textsecondary personal-gloom-item"
                if (col.toLowerCase() == "faction") {
                    cell.classList.remove("textsecondary")
                    cell.classList.add(`textf${cellValue}`)
                    if (cellValue == 0) {
                        cellValue = "VG"
                    } else {
                        cellValue = "BL"
                    }
                }
                if (col.toLowerCase() == "name" && profileManager.playerName == cellValue) {
                    cell.classList.remove("textsecondary")
                    cell.classList.add("textgreen")
                }
                if (col.toLowerCase() == "class") {
                    const classCode = { 0: 'Warrior', 1: 'Mage', 2: 'Arch', 3: 'Sham' }
                    cellValue = classCode[cellValue]
                }
                cell.textContent = cellValue
                cell.style.margin = marginVal
                cell.style.padding = paddingVal
                grid.appendChild(cell)
            }

        }
        const mainContainer = document.querySelector(".gloomrankingKEK")
        if (mainContainer) {
            const subContainer = mainContainer.querySelector(".flex-container-kek")
            subContainer.appendChild(grid)
        }
    },
    updateGloomDataGrid(data) {
        // console.log("from update gloom grid", data)
        const existingGrid = document.querySelector(".gloomdataGridKEK");
        if (existingGrid) {
            existingGrid.remove();
        }
        const marginVal = "3px";
        const paddingVal = "5px";
        // Extract keys from the data object
        if (!data) return;
        const keys = Object.keys(data);

        // Create column names by capitalizing each key
        const columnNames = keys.map(
            (key) => key.charAt(0).toUpperCase() + key.slice(1)
        );
        columnNames.push("K/D");
        const grid = createGrid(columnNames, "gloomrankingGridKEK").element;
        grid.classList.add("gloomdataGridKEK");
        for (let key in data) {
            let cellValue = data[key];
            const cell = document.createElement("div");
            cell.className = "btn black textsecondary personal-gloom-item";
            cell.textContent = cellValue;
            cell.style.margin = marginVal;
            cell.style.padding = paddingVal;
            grid.appendChild(cell);
        }
        let cellValue = (data.kills / data.deaths).toFixed(2);
        const cellkd = document.createElement("div");
        cellkd.className = "btn black textsecondary personal-gloom-item";
        cellkd.textContent = cellValue;
        cellkd.style.margin = marginVal;
        cellkd.style.padding = paddingVal;
        grid.appendChild(cellkd);

        const mainContainer = document.querySelector(".gloomdataKEK");
        if (mainContainer) {
            mainContainer.appendChild(grid);
        }
    },
};

export default gloom;
