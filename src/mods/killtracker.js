import eventManager from "../core/event";
import profileManager from "../core/profile";
import element from "../core/widgets/element";
import { createGrid, createWindow } from "../core/widgets/widgets"
import { getClass } from "../core/widgets/player";
import ui from "../core/ui";

const killTracker = {
    name: "Kill Tracker",
    description: "Right click anywhere to clear filters, heavy load!",
    state: {
        isTitle: 0,
        killsInfo: [],
        topFameData: [],
        topCurrencyData: [],
        _transform: { left: 100, top: 100, _drag: true },
        filters: {
            faction: "",
            name: "",
            targetClass: "",
            type: "",
            time: ""
        },
        sorting: {
            column: "Time", // Default sorting column
            order: "desc"   // Default sorting order (asc or desc)
        },
        selectedTab: "latestKills",
        trackAllKills: 1,
        killsDataThreshold: 100,
        fameDataThreshold: 20,
        currencyDataThreshold: 20,
        vgKillsCount: 0,
        blKillsCount: 0,
        lastKillTime: 0,
        resetTime: 0
    },
    settings: {
        isTitle: {
            control: "checkbox",
            desc: "Show Widget Title",
            comment: "show/hide title 'Kills:'",
            onupdate: "updateBtnTitle"
        },
        trackAllKills: { control: "checkbox", desc: "Extended Tracking Mode", comment: "Toggle to track kills for all participants" },
        killsDataThreshold: { control: "range", min: 100, max: 1000, step: 100, desc: "Kills History", comment: "Maximum limit for stored kill data." },
        fameDataThreshold: { control: "range", min: 20, max: 100, step: 10, desc: "Top Fame History", comment: "Maximum limit for fame history data." },
        currencyDataThreshold: { control: "range", min: 20, max: 100, step: 10, desc: "Top Currency History", comment: "Maximum limit for currency history data." },
    },
    style: `
        .tab-selected {
            background-color: #000000 !important;
        }
        .tab-button {
            display: flex;
            align-items: center
        }
    `,
    hotkey: {
        "Open Kill Tracker": { key: "z", callback: "generateUI" }
    },
    btnResetTime: Date.now(),
    sortingDisplay: null,
    frame: null,
    factionFilterInput: null,
    nameFilterInput: null,
    targetClassFilterInput: null,
    timeFilterInput: null,
    typeFilterInput: null,
    tracking: true,
    columnNames: [
        "Name", "Target", "Fame", "Currency", "Type", "Time"
    ],
    columnToAttribute: {
        Currency: "currencyString",
        Fame: "fame",
        Time: "time"
    },
    killTrackerBtn: null,
    deleteBtn: null,
    vgElement: null,
    blElement: null,
    killsTextSpan: null,
    start() {
        // this.state.killsInfo = []
        // this.state.topCurrencyData = []
        // this.state.topFameData = []
        eventManager.on("ui.chatArticle", this.handleArticle, this)
        eventManager.on("click.killtracker", this.generateUI, this)
        eventManager.on("ui.partyBtnbar", this.addBtn, this)
        eventManager.on("ui.channelSelect", this.handleChannelSelect, this)
        if (ui.partyBtnbar) {
            if (!this.killTrackerBtn) {
                this.addBtn(ui.partyBtnbar)
            }
        }
    },
    stop() {
        eventManager.off("ui.chatArticle", this.handleArticle, this)
        eventManager.off("click.killtracker", this.generateUI, this)
        eventManager.off("ui.partyBtnbar", this.addBtn, this)
        eventManager.off("ui.channelSelect", this.handleChannelSelect, this)
        if (this.killTrackerBtn) {
            this.killTrackerBtn.remove()
            this.killTrackerBtn = null
        }
    },
    resetCounters() {
        this.state.vgKillsCount = 0
        this.state.blKillsCount = 0

        const parsedTime = this.parseTimestamp(Date.now())
        const hourMinStr = parsedTime.h + ":" + parsedTime.m

        if(this.timeFilterInput) {
        this.timeFilterInput.value = hourMinStr
        this.timeFilterInput.dispatchEvent(new InputEvent("input", { bubbles: true }))
        }
    },
    getTimestamp(h, m) {
        const now = new Date();
        now.setHours(h);
        now.setMinutes(m);
        return now.getTime();
    },
    parseTimestamp(timestamp) {
        const date = new Date(timestamp);
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return { h: hours, m: minutes };
    },
    handleChannelSelect(channelSelect) {
        channelSelect = channelSelect.element
        const pvpChannel = channelSelect.children[3]
        if (pvpChannel.classList.contains("textgrey")) {
            this.tracking = false
        } else {
            this.tracking = true
        }
        channelSelect.addEventListener("click", (e) => {
            const target = e.target
            if (target.nodeName == "SMALL" && target.textContent.toLowerCase() == "pvp") {
                const isPvpChannelActive = target.classList.contains("textgrey")
                if (isPvpChannelActive) {
                    // console.log("pvp active")
                    this.tracking = false
                } else {
                    // console.log("pvp inactive")
                    target.classList.add("disabled")
                    setTimeout(() => {
                        // console.log("setting tracking to true")
                        target.classList.remove("disabled")
                        this.tracking = true
                    }, 200)
                }
            }
        })
    },
    addBtn(partyBtnbar) {
        partyBtnbar = partyBtnbar.element
        const btn = element("div").css("btn black textwhite")
        const vgElement = element("span").css("textf0")
        const blElement = element("span").css("textf1")
        const killsTextSpan = element("span").css("textexp").text(`${this.state.isTitle && "Kills: " || ""}`)
        const separator = element("img").css("svgicon").attr("src", "/data/ui/icons/pvp.svg").style({ filter: "brightness(0.5)", margin: "0 4px" })

        btn
            .add(killsTextSpan)
            .add(vgElement)
            .add(separator)
            .add(blElement)
            .on("click", this.generateUI.bind(this))

        partyBtnbar.appendChild(btn.element)

        this.killTrackerBtn = btn
        this.vgElement = vgElement
        this.blElement = blElement
        this.btnLabel = killsTextSpan
        btn.element.addEventListener("contextmenu", () => {
            this.resetCounters()
            this.updateKillTrackerBtn()
        })
        this.updateKillTrackerBtn()
    },
    updateBtnTitle() {
        this.btnLabel.text(`${this.state.isTitle && "Kills: " || ""}`)
    },
    getFactionKillCount() {
        const currentTime = Date.now();
        this.btnResetTime = currentTime
        // Count kills for each faction using reduce
        const lastHourRecords = this.state.killsInfo.filter(killInfo => {
            return (currentTime - killInfo.time) < 3600000; // 3600000 milliseconds = 1 hour
        });
        const { vgKillsCount, blKillsCount } = lastHourRecords.reduce((counts, killInfo) => {
            if (killInfo.faction == 0) {
                counts.vgKillsCount++;
            } else if (killInfo.faction == 1) {
                counts.blKillsCount++;
            }
            return counts;
        }, { vgKillsCount: 0, blKillsCount: 0 });

        this.state.vgKillsCount = vgKillsCount
        this.state.blKillsCount = blKillsCount
    },
    updateKillTrackerBtn(killInfo) {
        if (killInfo) {
            if (killInfo.faction == 0) this.state.vgKillsCount++
            else this.state.blKillsCount++
        }

        this.vgElement.text(this.state.vgKillsCount)
        this.blElement.text(this.state.blKillsCount)
    },
    getCurrency(currencyString) {
        if (!currencyString) return 0
        let [copper, silver, gold] = currencyString.split(" ").reverse()
        copper = parseInt(copper) || 0, silver = parseInt(silver) || 0, gold = parseInt(gold) || 0
        let total = copper + silver * 100 + gold * 100 * 100
        return total
    },
    //target = other player, type = 1/0 = killed/died
    addData(pKilled, pKilledLevel, pKilledClass, pKilledFaction, pDead, pDeadLevel, pDeadClass, pDeadFaction, fame, currencyString) {
        fame = parseInt(fame)

        const killInfo = {
            name: pKilled,
            level: pKilledLevel,
            class: pKilledClass,
            faction: pKilledFaction,
            target: pDead,
            targetLevel: pDeadLevel,
            targetClass: pDeadClass,
            targetFaction: pDeadFaction,
            fame: fame,
            currencyString: currencyString,
            type: 2,
            time: Date.now(),
        }
        this.state.lastKillTime = killInfo.time
        if (!this.state.trackAllKills && !(pKilled == profileManager.playerName || pDead == profileManager.playerName)) {
            return
        }

        if (pDead == profileManager.playerName) {

            killInfo.name = pDead
            killInfo.level = pDeadLevel
            killInfo.class = pDeadClass
            killInfo.faction = pDeadFaction

            killInfo.target = pKilled
            killInfo.targetLevel = pKilledLevel
            killInfo.targetClass = pKilledClass
            killInfo.targetFaction = pKilledFaction

            killInfo.type = 0
            killInfo.fame *= -1
        } else if (pKilled == profileManager.playerName) {
            killInfo.type = 1
        }
        // console.log(
        //     `Adding data to kill tracker:
        //     name: ${profileManager.playerName}, level: ${profileManager.playerLevel}, class: ${profileManager.playerClass},
        //     target: ${target}, level: ${targetLevel}, class: ${targetClass},
        //     fame: ${fame},
        //     type: ${type},
        //     currency: ${currencyString},
        //     time: ${Date.now()}
        //     `
        // )

        this.state.killsInfo.push(killInfo)
        if (this.state.killsInfo.length > this.state.killsDataThreshold) {
            this.state.killsInfo.shift()
        }
        this.addToTopData("topFameData", "fame", "fameDataThreshold", killInfo);
        this.addToTopData("topCurrencyData", "currencyString", "currencyDataThreshold", killInfo);
        this.updateGrid()
        this.updateKillTrackerBtn(killInfo)
    },

    addToTopData(dataArrayName, sortProperty, thresholdName, killInfo) {
        const limit = this.state[thresholdName]
        const data = this.state[dataArrayName];
        let insertIndex = 0;

        // Find the correct position for the new entry
        while (insertIndex < data.length) {
            let newVal, currentVal
            newVal = killInfo[sortProperty]
            currentVal = data[insertIndex][sortProperty]

            if (sortProperty == "currencyString") {
                newVal = this.getCurrency(newVal)
                currentVal = this.getCurrency(currentVal)
            }
            if (newVal <= currentVal)
                insertIndex++;
            else {
                break
            }
        }


        // Insert the new entry at the correct position
        data.splice(insertIndex, 0, killInfo);

        // Keep only the top 'limit' entries and remove the last element if needed
        if (data.length > limit) {
            data.pop();
        }
    },

    createTab(tabName, textContent) {
        const isSelected = this.state.selectedTab === tabName;

        const tab = element("div", {
            textContent: textContent,
            className: `btn black textsecondary ${isSelected ? "tab-button tab-selected" : "tab-button"}`,
        }).element;

        tab.addEventListener("click", () => {
            this.state.selectedTab = tabName
            const allTabs = this.frame.querySelectorAll(".tab-button")
            allTabs.forEach(tab => {
                if (tab.textContent.split(" ").join("").toLowerCase() == tabName.toLowerCase()) {
                    tab.classList.add("tab-selected")
                } else {
                    tab.classList.remove("tab-selected")
                }
            })
            this.updateGrid()
        })

        return tab;
    },
    clearData() {
        this.state.killsInfo = []
        this.state.topCurrencyData = []
        this.state.topFameData = []
    },
    handleArticle(chatArticle) {
        if (!this.tracking) return
        const { channel, text: pvpContent } = chatArticle.obj
        chatArticle = chatArticle.element
        if (channel && channel.textContent.trim().toLowerCase() === "pvp") {

            const pvpInfo = pvpContent.children[0].children
            let [
                pKilledClass,
                pKilledLevel,
                pKilled,
                pDeadClass,
                pDeadLevel,
                pDead,
                fame,
                currencyString
            ] = pvpInfo
            let pKilledFaction, pDeadFaction
            pKilledClass = getClass(pKilledClass.src)
            pDeadClass = getClass(pDeadClass.src)

            pKilledLevel = pKilledLevel.textContent
            pKilledFaction = pKilled.className[pKilled.className.length - 1]
            pKilled = pKilled.textContent

            pDeadLevel = pDeadLevel.textContent
            pDeadFaction = pDead.className[pDead.className.length - 1]
            pDead = pDead.textContent

            if (!fame) fame = "0"
            else fame = fame.textContent

            if (!currencyString) currencyString = "0"
            else currencyString = currencyString.textContent.trim()

            // console.log(`Player Killed: ${pKilled}`);
            // console.log(`Player Dead: ${pDead}`);
            // console.log(`Fame: ${fame}`);
            // console.log(`Currency: ${currencyString}`);


            this.addData(pKilled, pKilledLevel, pKilledClass, pKilledFaction, pDead, pDeadLevel, pDeadClass, pDeadFaction, fame, currencyString)
        }
    },
    clearLatestKills() {
        this.state.killsInfo = []
        this.updateGrid()
    },
    inputDisplayEle: null,
    createFilterInput(placeholder, attribute) {
        const inputMouseEnter = (e) => {
            const displayEle = element("div", {
                className: "btn black textprimary",
                textContent: e.target.placeholder,
                style: `
                position: absolute;
                top: ${e.target.offsetTop - 40}px;
                left: ${e.target.offsetLeft}px;
                padding: 5px`
            }).element
            this.inputDisplayEle = displayEle
            e.target.parentNode.appendChild(displayEle)
        }
        const inputMouseLeave = (e) => {
            if (this.inputDisplayEle) {
                this.inputDisplayEle.remove()
                this.inputDisplayEle = null
            }
        }
        const input = element("input", {
            type: "text",
            placeholder: placeholder,
            value: this.state.filters[attribute] || "",
            className: "btn black textsilver"
        }).element;

        if (attribute == "time") {
            input.type = "time"
            const parsedTime = this.parseTimestamp(this.state.filters[attribute])
            const hourMinStr = parsedTime.h + ":" + parsedTime.m

            input.value = hourMinStr
        }
        input.addEventListener("input", (event) => {
            this.state.filters[attribute] = event.target.value;
            if (attribute == "time") {
                const [h, m] = event.target.value.split(":")
                this.state.filters[attribute] = this.getTimestamp(h, m)
            }
            // console.log(this.state.filters[attribute], attribute)
            this.updateGrid();
        });

        input.addEventListener("contextmenu", (event) => {
            event.preventDefault()
            event.stopPropagation()
            event.target.value = ""
            this.state.filters[attribute] = event.target.value;
            this.updateGrid();
        });

        input.addEventListener("mouseenter", inputMouseEnter)
        input.addEventListener("mouseout", inputMouseLeave)
        return input;
    },

    updateSortingDisplay() {
        this.sortingDisplay.textContent = `Sorting: ${this.state.sorting.column} in ${this.state.sorting.order == "asc" ? "Ascending" : "Descending"}`
    },

    generateUI() {
        const existing = document.querySelector(".killtrackerKEK")
        if (existing) {
            existing.remove()
            return
        }
        const killWindow = createWindow("Kill Tracker", "100px", "100px", this.state._transform).element
        const gridContainer = createGrid(this.columnNames, "killtrackerGrid").element

        this.frame = killWindow

        killWindow.addEventListener("contextmenu", (event) => {
            event.preventDefault()
            this.nameFilterInput.value = ""
            this.targetClassFilterInput.value = ""
            this.typeFilterInput.value = ""
            this.factionFilterInput.value = ""
            for (let filterName in this.state.filters) {
                if (filterName == "time") continue
                this.state.filters[filterName] = ""
            }
            this.updateGrid()
        })
        const titleframe = killWindow.querySelector(".titleframe")
        const sortingDisplay = element("div", {
            className: "btn black textgrey sortingDisplay tab-button",
            textContent: `Sorting: ${this.state.sorting.column} in ${this.state.sorting.order == "asc" ? "Ascending" : "Descending"}`
        }).element

        this.sortingDisplay = sortingDisplay


        const overflowContainer = element("div", {
            className: "overflowContainer",
            style: "overflow: hidden; max-height: 450px"
        }).element

        overflowContainer.addEventListener("wheel", (event) => {
            // Adjust the scrollTop property based on your scrolling logic
            overflowContainer.scrollTop += event.deltaY;
        });

        const tabContainer = element("div", {
            className: "tab-container",
            style: "display: flex; flex-direction: row; margin-right: 10px",
        }).element;

        const latestKillsTab = this.createTab("latestKills", "Latest Kills");
        const topFameTab = this.createTab("topFame", "Top Fame");
        const topCurrencyTab = this.createTab("topCurrency", "Top Currency");

        const deleteBtn = element("div", {
            className: "btn black textgrey tab-button",
            textContent: "Delete Latest"
        }).element
        deleteBtn.addEventListener("click", (e) => {
            this.clearLatestKills()
        })

        tabContainer.appendChild(latestKillsTab);
        tabContainer.appendChild(topFameTab);
        tabContainer.appendChild(topCurrencyTab);
        tabContainer.appendChild(sortingDisplay);
        tabContainer.appendChild(deleteBtn);

        titleframe.insertBefore(tabContainer, titleframe.childNodes[1])

        const filterContainer = element("div", {
            className: "filter-container",
            style: "display: flex; flex-direction: row;"
        }).element;
        const factionFilterInput = this.createFilterInput("T. Faction Filter(0/1)", "faction")
        // Add input for name filter
        const nameFilterInput = this.createFilterInput("Name/Target Filter", "name");
        // Add input for targetClass filter
        const targetClassFilterInput = this.createFilterInput("T. Class (0/1/2/3)", "targetClass");

        const typeFilterInput = this.createFilterInput("Type (0/1/2)", "type");

        const timeFilterInput = this.createFilterInput("Time", "time");

        this.timeFilterInput = timeFilterInput
        this.nameFilterInput = nameFilterInput
        this.targetClassFilterInput = targetClassFilterInput
        this.typeFilterInput = typeFilterInput
        this.factionFilterInput = factionFilterInput

        filterContainer.appendChild(nameFilterInput);
        filterContainer.appendChild(factionFilterInput);
        filterContainer.appendChild(targetClassFilterInput);
        filterContainer.appendChild(typeFilterInput);
        filterContainer.appendChild(timeFilterInput);

        overflowContainer.appendChild(gridContainer)

        killWindow.appendChild(filterContainer)
        killWindow.appendChild(overflowContainer)

        document.body.appendChild(killWindow)

        this.updateGrid()
    },

    updateGrid() {
        const existing = document.querySelector(".killtrackerGrid")
        if (!existing) return

        const gridParent = existing.parentNode
        existing.remove()

        const grid = createGrid(this.columnNames, "killtrackerGrid").element
        gridParent.appendChild(grid)

        let dataToShow, selectedTab = this.state.selectedTab

        if (selectedTab == "latestKills") {
            dataToShow = this.sortData([...this.state.killsInfo])
            const columnHeaders = grid.querySelectorAll(".grid-header");
            columnHeaders.forEach((header, index) => {
                if (this.columnToAttribute.hasOwnProperty(header.textContent)) {
                    // console.log("applying sorting on", header)
                    header.addEventListener("click", () => {
                        this.updateSorting(header.textContent)
                        this.updateGrid()
                    });
                }
            });

        } else if (selectedTab == "topFame") {
            dataToShow = this.state.topFameData
        } else {
            dataToShow = this.state.topCurrencyData
        }
        const filteredKills = dataToShow.filter((killInfo) => {
            let targetMatch = killInfo.target === this.state.filters.name
            let nameMatch = killInfo.name === this.state.filters.name
            let targetClassMatch = killInfo.targetClass == this.state.filters.targetClass;
            let typeMatch = killInfo.type == this.state.filters.type
            let factionMatch = killInfo.targetFaction == this.state.filters.faction
            let timeMatch = killInfo.time >= this.state.filters.time

            if (this.state.filters.name == "") nameMatch = true
            if (this.state.filters.targetClass == "") targetClassMatch = true
            if (this.state.filters.type == "") typeMatch = true
            if (this.state.filters.faction == "") factionMatch = true
            if (this.state.filters.time == "") timeMatch = true

            return timeMatch && (targetMatch || nameMatch) && targetClassMatch && typeMatch && factionMatch;
        });

        // console.log(filteredKills, grid)

        filteredKills.forEach(killInfo => {
            for (const [key, value] of Object.entries(killInfo)) {
                if (["targetFaction", "faction", "targetClass", "class", "level", "targetLevel"].includes(key)) continue
                const killItem = element("div", {
                    className: "btn black textsecondary kill-item",
                    textContent: value,
                    style: "text-align: left; padding-left: 10px"
                }).element
                if (key == "fame") {
                    killItem.style.textAlign = "center"
                    killItem.style.paddingLeft = "0"
                    killItem.textContent = value.toLocaleString()
                    killItem.classList.remove("textsecondary")

                    if (killInfo.type == 0) {
                        killItem.classList.add("textred")
                    } else if (killInfo.type == 1) {
                        killItem.classList.add("textgreen")
                    } else {
                        killItem.classList.add("textfame")
                    }

                } else if (key == "type") {
                    let displayVal
                    if (value == 1) displayVal = "Kill"
                    else if (value == 0) displayVal = "Death"
                    else displayVal = "Neutral"

                    killItem.textContent = displayVal
                    killItem.addEventListener("click", (event) => {
                        this.typeFilterInput.value = value
                        this.typeFilterInput.dispatchEvent(new InputEvent("input", { bubbles: true }))
                    })
                } else if (key == "time") {
                    const timestamp = value
                    const date = new Date(timestamp);

                    const day = String(date.getDate()).padStart(2, '0');
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const hours = String(date.getHours()).padStart(2, '0');
                    const minutes = String(date.getMinutes()).padStart(2, '0');

                    const formattedDate = `${hours}:${minutes} ${day}-${month} `;
                    killItem.textContent = formattedDate
                    killItem.addEventListener("click", (e) => {
                        this.timeFilterInput.value = `${hours}:${minutes}`
                        this.timeFilterInput.dispatchEvent(new InputEvent("input", { bubbles: true }))
                    })
                } else if (key == "currencyString") {
                    killItem.style.textAlign = "center"
                    killItem.style.paddingLeft = "0"

                    killItem.textContent = ""
                    let [copper, silver, gold] = value.split(" ").reverse()
                    copper = copper || 0, silver = silver || 0, gold = gold || 0

                    const copperImg = element("img", {
                        src: `/data/ui/currency/copper.avif`,
                        style: "height: 1em; vertical-align: -0.23em;"
                    }).element

                    const silverImg = element("img", {
                        src: `/data/ui/currency/silver.avif`,
                        style: "height: 1em; vertical-align: -0.23em;"
                    }).element

                    const goldImg = element("img", {
                        src: `/data/ui/currency/gold.avif`,
                        style: "height: 1em; vertical-align: -0.23em;"
                    }).element

                    const copperText = element("span", {
                        className: "textcopper",
                        textContent: copper
                    }).element

                    const silverText = element("span", {
                        className: "textsilver",
                        textContent: silver
                    }).element

                    const goldText = element("span", {
                        className: "textgold",
                        textContent: gold
                    }).element

                    if (gold !== 0) {
                        killItem.appendChild(goldText)
                        killItem.appendChild(goldImg)
                    }
                    if (silver !== 0) {
                        killItem.appendChild(silverText)
                        killItem.appendChild(silverImg)
                    }
                    killItem.appendChild(copperText)
                    killItem.appendChild(copperImg)


                } else if (key == "name" || key == "target") {
                    const classIcon = element("img", {
                        style: "height: 1.1em; vertical-align: -0.23em;",
                    }).element
                    const levelEle = document.createTextNode("69 ")
                    const nameEle = element("span", {
                        textContent: value
                    }).element

                    killItem.textContent = ""
                    if (key == "name") {
                        nameEle.classList.add(`textf${killInfo.faction}`)
                        classIcon.src = `/data/ui/classes/${killInfo.class}.avif`
                        levelEle.textContent = `${killInfo.level} `
                    } else {
                        nameEle.classList.add(`textf${killInfo.targetFaction}`)
                        classIcon.src = `/data/ui/classes/${killInfo.targetClass}.avif`
                        levelEle.textContent = `${killInfo.targetLevel} `
                    }
                    killItem.appendChild(classIcon)
                    killItem.appendChild(levelEle)
                    killItem.appendChild(nameEle)

                    killItem.addEventListener("click", (event) => {
                        this.nameFilterInput.value = value
                        this.nameFilterInput.dispatchEvent(new InputEvent("input", { bubbles: true }))
                    })
                }
                grid.appendChild(killItem)
            }
        })
    },

    sortData(dataToSort) {
        const sortProperty = this.columnToAttribute[this.state.sorting.column];

        if (sortProperty) {
            dataToSort.sort((a, b) => {
                let valueA = a[sortProperty];
                let valueB = b[sortProperty];

                const multiplier = (this.state.sorting.order === "asc") ? 1 : -1;

                if (sortProperty == "currencyString") {
                    valueA = this.getCurrency(valueA)
                    valueB = this.getCurrency(valueB)
                }
                return multiplier * (valueA - valueB);
            });
        }
        this.updateSortingDisplay()
        return dataToSort
    },

    updateSorting(column) {
        if (this.state.sorting.column === column) {
            // Toggle the sorting order if clicking on the same column
            this.state.sorting.order = (this.state.sorting.order === "asc") ? "desc" : "asc";
        } else {
            // Change the sorting column if clicking on a different header
            this.state.sorting.column = column;
        }
    },

}
/* < article class="line svelte-16y0b84" > 
<div class="linewrap svelte-16y0b84">
    <span class="time svelte-16y0b84">10.59</span>
    <span class="textpvp content svelte-16y0b84"><span class="capitalize channel svelte-16y0b84">pvp</span></span>
    <span class="textpvp svelte-16y0b84"><img class="texticon" src="/data/ui/classes/3.avif?v=8594485"><span class="textwhite">45</span>
    <span class="textf1">09110</span> killed <img class="texticon" src="/data/ui/classes/0.avif?v=8594485"><span class="textwhite">45</span>
    <span class="textf0">Scrizzz</span> for <span class="textfame"><img class="svgicon" src="/data/ui/currency/fame.svg?v=8594485">27</span>
    </span>
</div>
</article> */

export default killTracker