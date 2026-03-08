import apiManager from "../core/api";
import eventManager from "../core/event";
import profileManager from "../core/profile";
import { getItemUI, parseAuxi, getItem, getRarityOfItem, generateItemDescription, getTextColor } from "../core/widgets/item";

const statsSim = {
    name: "Stat Simulation",
    state: {
        statSimulatorOpened: "0",
        currentItemsInfo: {}
    },
    start() {
        this.state.currentItemsInfo = this.getCurrentItemsInfo()
        eventManager.on('ui.characterParent', this.handleStatSimulation, this)
    },
    stop() {
        eventManager.off('ui.characterParent', this.handleStatSimulation, this)
    },
    async fetchRank(buildScore, classId) {
        try {
            // console.log(endpointUrl)
            const response = await apiManager.request("kek.tierlist.rank", { classid: classId, build_score: buildScore })

            return response.rank;
        } catch (error) {
            console.error('Error fetching rank:', error.message);
            return '';// Return a default value or handle the error accordingly
        }
    },

        
    async getStats (items, player, ignoreCurrentGear) {
        // console.log(items)
        const playerClass = player.pclass

        const battleRankPrestige = [4000, 8000, 12000, 16000, 20000, 24000, 28000, 32000, 36000, 40000, 44000, 48000]

        player.prestige = battleRankPrestige[battleRankPrestige.length - 1]

        const normalizeStat = (stat) => {
            stat = String(stat).split(".")
            // console.log(stat)

            if (stat[1]) {
                // console.log(stat[1] / 10 ** (stat[1].length - 1))
                if (stat[1] / 10 ** (stat[1].length - 1) <= 5) {
                    return Math.floor(Number(stat.join(".")))
                } else {
                    return Math.ceil(Number(stat.join(".")))
                }
            }
            return Number(stat.join("."))
        }

        let stats = {}

        if (ignoreCurrentGear == 1) {
            stats = {
                "HP": 100 + player.level * 8,
                "HP Reg./5s": 2,
                "MP": 100,
                "MP Reg./5s": 3,
                "Defense": 15,
                "Block": 0,
                "Min Dmg": 0,
                "Max Dmg": 0,
                "Atk Spd": 10,
                "Critical": 5.0,
                "Haste": 0,
                "Move Spd": 15,
                "Bag Slots": 0,
                "Item Find": 0.5,
                "Gear Score": 0,
                "Strength": 10,
                "Stamina": 12,
                "Dexterity": 10,
                "Intelligence": 10,
                "Wisdom": 10,
                "Luck": 5,
                "Move Spd": 105,
            }
        } else {
            stats = {
                "HP": 0,
                "HP Reg./5s": 0,
                "MP": 0,
                "MP Reg./5s": 0,
                "Defense": 0,
                "Block": 0,
                "Min Dmg": 0,
                "Max Dmg": 0,
                "Atk Spd": 0,
                "Critical": 0,
                "Haste": 0,
                "Move Spd": 0,
                "Bag Slots": 0,
                "Item Find": 0,
                "Gear Score": 0,
                "Strength": 0,
                "Stamina": 0,
                "Dexterity": 0,
                "Intelligence": 0,
                "Wisdom": 0,
                "Luck": 0,
                "Move Spd": 0,
            }
        }

        const statConversionTable = {
            "Strength": { "HP": 2, "HP Reg./5s": 0.03 },
            "Stamina": { "Defense": 1, "HP": 4 },
            "Dexterity": { "Critical": 0.05 },
            "Intelligence": { "MP": 0.8, "Critical": 0.04 },
            "Wisdom": { "MP": 0.8, "Haste": 0.03 },
            "Luck": { "Critical": 0.02, "Item Find": 0.5 }
        }

        const classStat = {
            0: "Strength",
            1: "Intelligence",
            2: "Dexterity",
            3: "Wisdom"
        }

        let bloodlineStat = classStat[playerClass]

        //stats based on level
        if (ignoreCurrentGear == 1) {
            stats[bloodlineStat] += 1 * player.level
            stats["Stamina"] += 2 * (player.level - 1)
            stats[bloodlineStat] += player.level * 3
        }

        const bloodlineStatTable = {
            0: { "Min Dmg": 0.3, "Max Dmg": 0.3, "HP Reg./5s": 0.3 },
            1: { "Min Dmg": 0.4, "Max Dmg": 0.4 },
            2: { "Min Dmg": 0.4, "Max Dmg": 0.4 },
            3: { "Min Dmg": 0.4, "Max Dmg": 0.4 },
        }
        const bloodlineStatBonus = bloodlineStatTable[playerClass]
        for (let stat in bloodlineStatBonus) {
            if (!statConversionTable[bloodlineStat][stat]) {
                statConversionTable[bloodlineStat][stat] = bloodlineStatBonus[stat]
            } else {
                statConversionTable[bloodlineStat][stat] += bloodlineStatBonus[stat]
            }
        }

        for (let item of items) {
            let itemStats = item["stats"]
            for (let statName in itemStats) {
                let statVal = itemStats[statName]["value"]
                if (statName === "Haste" || statName === "Critical" || statName === "Item Find" || statName === "Block") {
                    statVal = parseFloat(itemStats[statName]["value"].split("%")[0])
                }
                if (!stats[statName]) {
                    stats[statName] = statVal
                } else {
                    stats[statName] += statVal
                }
            }
            stats["Gear Score"] += item["gs"]
        }

        //prestige stats
        if (ignoreCurrentGear == 1) {
            const prestigeBonusStats = {
                1: { "Move Spd": 5 },// 5 Movement Speed
                2: { "MP": 50 },// 50 MP
                3: { "Item Find": 15 },// 15% Item Find
                4: { "Min Dmg": 5, "Max Dmg": 5 },// 5 Min & Max Damage
                5: { "MP Reg./5s": 2, "HP Reg./5s": 2 },// 2 HP & MP Reg./5s
                6: { "Mov Spd": 5 },// 5 Movement Speed
                7: { "HP": 30 },// 30 HP
                8: { "Item Find": 15 },// 15% Item Find
                9: { "Critical": 5 },// 5% Critical
                10: { "Haste": 3 },// 3% Haste
                11: { "HP": 30 },// 30 HP
                12: { "Min Dmg": 5, "Max Dmg": 5 }, // 5 Min & Max Damage
            }
            function prestigeToBattleRank(prestige) {
                for (let i = 0; i < battleRankPrestige.length; i++) {
                    if (prestige < battleRankPrestige[i]) {
                        return i;
                    }
                }
                return battleRankPrestige.length;
            }
            let battleRank = prestigeToBattleRank(player.prestige)
            for (let i = 1; i <= battleRank; i++) {
                let prestigeBonusStat = prestigeBonusStats[i]
                for (let stat in prestigeBonusStat) {
                    if (!stats[stat]) {
                        stats[stat] = prestigeBonusStat[stat]
                    } else {
                        stats[stat] += prestigeBonusStat[stat]
                    }
                }
            }
        }

        for (let statName in statConversionTable) {
            const bonusStats = statConversionTable[statName]
            for (let bonusStatName in bonusStats) {
                stats[bonusStatName] += bonusStats[bonusStatName] * stats[statName]
            }
        }

        for (let statName in stats) {
            if (String(stats[statName]).split(".")[1]) {
                const len = String(stats[statName]).split(".")[1].length
                if (len > 3) stats[statName] = parseFloat(stats[statName].toFixed(2))
            }
        }

        const itemSlots = {
            "hammer": "weapon",
            "bow": "weapon",
            "staff": "weapon",
            "sword": "weapon",
            "armlet": "armlet",
            "armor": "armor",
            "bag": "bag",
            "boot": "boot",
            "glove": "glove",
            "ring": "ring",
            "amulet": "amulet",
            "quiver": "offhand",
            "shield": "offhand",
            "totem": "offhand",
            "orb": "offhand"
        }


        const itemsInfo = {}
        //calculations
        for (let item of items) {

            let quality = item.quality
            let type = item.type
            let tier = item.tier
            let upgrade = item.upgrade
            let slot = itemSlots[type]
            let rarity = getRarityOfItem(quality)
            const itemInfo = { type: itemSlots[type], quality: quality, id: item.id, upgrade: upgrade, item: item }
            if (itemSlots[type]) {
                itemsInfo[itemSlots[type]] = itemInfo
            }
            stats["Max Dmg"] = normalizeStat(stats["Max Dmg"])
            stats["Min Dmg"] = normalizeStat(stats["Min Dmg"])
            stats["Item Find"] = Math.round(stats["Item Find"])
            stats["Critical"] = Math.round(10 * stats["Critical"]) / 10
            stats["Haste"] = Math.round(10 * stats["Haste"]) / 10
        }
        let min = stats["Min Dmg"]
        let max = stats["Max Dmg"]
        let crit = stats["Critical"]
        let haste = stats["Haste"]
        let hp = stats["HP"]
        let defense = stats["Defense"]
        let block = stats["Block"]

        let eHP = Math.round(hp / ((1 - ((1 - Math.exp(-defense * 0.0022)) * 0.87)) * (1 - (block / 100) * 0.45)));
        let eDps = Math.round(((min - Math.max(0, min - max) + max) / 2) * (1 + crit / 100) * (1 + haste / 100));
        let eBurst = Math.round(((min - Math.max(0, min - max) + max) / 2) * (1 + crit / 100));
        if (playerClass == 1) {
            eBurst = Math.round(((min - Math.max(0, min - max) + max) / 2) * (((1 + crit / 100) * 0.8) + ((1 + haste / 100) * 0.3)));
        }
        if (playerClass == 0) {
            eHP = Math.round(hp / ((1 - ((1 - Math.exp(-defense * 0.0022)) * 0.87)) * (1 - (block / 100) * 0.6)));
        }
        stats["eHP"] = eHP
        stats["eDps"] = eDps
        stats["eBurst"] = eBurst
        //lowercasing keys of stats
        for (let statName in stats) {
            stats[statName.toLowerCase()] = stats[statName]
            delete stats[statName]
        }
        // console.log(stats)
    
        let buildScore = this.getBuildScore(stats, playerClass)
        stats["build score"] = buildScore

        return { stats, itemsInfo }
    },

    calculateDmgReduction(defense, block) {
        return ((1 - Math.exp(-defense * 0.0022)) * 0.87) + ((block / 100) * 0.6);
    },

    calculateHPValue(defense, block) {
        const baseScore = 1 / (1 - (1 - (1 - (1 - Math.exp(defense * -0.0022)) * 0.87) * (1 - (block / 100) * 0.45)));
        return baseScore
    },

    calculateDpsScore(edps, eburst, ehp, playerClass) {
        if (playerClass == 0) {
            return (Math.log2(edps)
                + Math.log2(eburst)
                + (Math.log(ehp) / Math.log(5))
            ) / 3;
        }
        if (playerClass == 1) {
            return Math.log((eburst + edps) / 2) / Math.log(2);
        }
        if (playerClass == 2) {
            return (Math.log(edps) / Math.log(2) + Math.log(eburst) / Math.log(2)) / 2;
        }
        if (playerClass == 3) {
            return (Math.log2(edps)
                + Math.log2(eburst)
                + Math.log10(ehp)
            ) / 3;
        }
    },

    calculateTankScore(edps, eburst, ehp, haste, defense, block, playerClass) {
        const hpvalue = this.calculateHPValue(defense, block)
        const dmgRed = this.calculateDmgReduction(defense, block)

        if (playerClass == 0) {
            return (Math.log2(ehp) + Math.log2(dmgRed * 100) + Math.log(haste) / Math.log(6)) / 3;
        }
        if (playerClass == 1) {
            return (Math.log(ehp) / Math.log(2.5) + Math.log(eburst) / Math.log(6) + Math.log(edps) / Math.log(6)) / 3;
        }
        if (playerClass == 2) {
            return (Math.log(ehp) / Math.log(2.5) + Math.log(eburst) / Math.log(6) + Math.log(edps) / Math.log(6)) / 3;
        }
        if (playerClass == 3) {
            return (Math.log10(edps)
                + (Math.log(eburst) / Math.log(11))
                + (Math.log2(ehp))
                + (Math.log(hpvalue * 60) / Math.log(7))
                + (Math.log(haste * 8) / Math.log(16))
            ) / 5;
        }
    },

    calculateHybridScore(edps, eburst, ehp, haste, defense, block, playerClass) {
        const hpvalue = this.calculateHPValue(defense, block)
        const dmgRed = this.calculateDmgReduction(defense, block)

        if (playerClass == 0) {
            return (Math.log(edps) / Math.log(4) + Math.log(eburst) / Math.log(5) + Math.log(ehp) / Math.log(5) + Math.log(dmgRed * 100) / Math.log(5)) / 4;
        }
        if (playerClass == 1) {
            return (Math.log(ehp) / Math.log(5) + Math.log(eburst) / Math.log(5) + Math.log(edps) / Math.log(4)) / 3;
        }
        if (playerClass == 2) {
            return (Math.log(ehp) / Math.log(5) + Math.log(eburst) / Math.log(5) + Math.log(edps) / Math.log(4)) / 3;
        }
        if (playerClass == 3) {
            return ((Math.log(edps) / Math.log(3))
                + (Math.log(eburst) / Math.log(4))
                + (Math.log(ehp) / Math.log(6))
                + (Math.log(hpvalue * 50) / Math.log(9))
                + (Math.log(haste * 8) / Math.log(10))
            ) / 5;
        }
    },

    getBuildScore(stats, playerClass) {
        // console.log(stats, playerClass)
        const ehp = stats.ehp
        const edps = stats.edps
        const eburst = stats.eburst
        const defense = stats.defense
        const block = stats.block
        const haste = stats.haste
        // console.log(stats, playerClass)
        // Calculate DPS score (K)
        const dpsScore = this.calculateDpsScore(edps, eburst, ehp, playerClass)
        // Calculate Tank score (L)
        const tankScore = this.calculateTankScore(edps, eburst, ehp, haste, defense, block, playerClass)
        // Calculate Hybrid score (M)
        const hybridScore = this.calculateHybridScore(edps, eburst, ehp, haste, defense, block, playerClass)

        // Calculate Build score

        let buildScore = 0

        if (playerClass == 0) {
            buildScore = ((dpsScore + tankScore / 3 + hybridScore) * 210) / 3;
        }
        if (playerClass == 1) {
            buildScore = ((dpsScore / 3) + tankScore + hybridScore) * 225 / 3;
        }
        if (playerClass == 2) {
            buildScore = ((dpsScore / 3) + tankScore + hybridScore) * 226 / 3;
        }
        if (playerClass == 3) {
            buildScore = ((dpsScore / 1.75) + tankScore + hybridScore) * 235 / 3;
        }

        // console.log(dpsScore, tankScore, hybridScore, buildScore)

        return parseFloat((buildScore).toFixed(3));
    },

    createStatElement(statCol, statName, statValue, extraClass) {
        const statLabel = document.createElement('span');
        statLabel.textContent = statName;
        statLabel.classList.add(extraClass)
        statCol.appendChild(statLabel);

        const statNumber = document.createElement('span');
        statNumber.className = 'statnumber';
        statNumber.textContent = statValue;
        if (!extraClass) {
            statNumber.classList.add("textgold")
            statCol.appendChild(statNumber);
        } else {
            statNumber.classList.add("textpurp")
            const spanContainer = document.createElement("span")
            spanContainer.appendChild(statNumber)
            spanContainer.classList.add(extraClass)
            statCol.appendChild(spanContainer)
        }
        return [statLabel, statNumber];
    },

    handleSimulationUI(charSheetContainer, player) {
        // Function to handle input changes for "Auxi"
        const handleAuxiInput = (inputElement) => {
            inputElement.style.overflow = "hidden"
            inputElement.classList.add("auxi-sim-input")
            inputElement.placeholder = "Auxi"
            inputElement.style.height = "40px"
            inputElement.style.width = "94%";

            inputElement.style.marginLeft = "8px"

            // Add event listeners to handle scrolling
            inputElement.addEventListener('wheel', (event) => {
                // Adjust the scrollTop property based on your scrolling logic
                inputElement.scrollTop += event.deltaY;
            });
            inputElement.addEventListener("input", function (event) {
                const inputValue = event.target.value;

                // Dynamically adjust the height and width based on content
                const lines = inputValue.split('\n').length;
                inputElement.style.height = `${lines * 20 + 20}px`; // Adjust the height based on the number of lines
            });
        }
        if (charSheetContainer) {
            const existing = document.querySelector(".statSimulationKEK")
            if (existing) {
                existing.remove()
                return;
            }

            // console.log(player)

            // Set charSheetContainer display to flex
            charSheetContainer.style.display = "flex";

            // Create a window panel div
            const windowPanel = document.createElement("div");
            windowPanel.classList.add("window", "panel-black", "statSimulationKEK");
            // Create the title frame with "Stat Simulation" title
            const titleFrame = document.createElement("div");
            titleFrame.classList.add("titleframe");
            titleFrame.style.margin = "10px"
            const titleText = document.createElement("div");
            titleText.classList.add("textprimary", "title");
            titleText.textContent = "Stat Simulation";

            titleFrame.appendChild(titleText);

            // Append the title frame to the window panel
            windowPanel.appendChild(titleFrame);

            // Create a slot div with flex grid
            const slotDiv = document.createElement("div");
            slotDiv.classList.add("slot", "panel-black");
            slotDiv.style.display = "grid";
            slotDiv.style.gridTemplateColumns = "repeat(2, auto)";

            // Create 10 inputs (1 for placeholder Auxi and 9 for stats)
            const inputs = ["Weapon", "Armlet", "Armor", "Bag", "Boot", "Glove", "Ring", "Amulet", "Offhand"];
            const auxiInput = document.createElement("textarea")
            handleAuxiInput(auxiInput);

            windowPanel.appendChild(auxiInput)

            inputs.forEach(input => {
                let inputElement
                inputElement = document.createElement("input");
                inputElement.setAttribute("type", "text");

                inputElement.setAttribute("placeholder", input);
                inputElement.classList.add("stat-sim-input");
                inputElement.style.width = "120px";
                inputElement.style.margin = "3px";
                inputElement.classList.add(`${input.toLowerCase()}KEK`);

                const inputWrapper = document.createElement("div");
                inputWrapper.style.position = "relative";
                inputWrapper.style.display = "inline-block";

                // Create overlay for the input
                const overlay = document.createElement("div");
                overlay.classList.add("btn", "black", "textsecondary", "stat-sim-overlay");
                overlay.textContent = inputElement.placeholder;

                // Set overlay position on top of the input
                overlay.style.position = "absolute";
                overlay.style.top = "0";
                overlay.style.left = "0";
                overlay.style.pointerEvents = "none"; // Disable pointer events on the overlay
                overlay.style.width = "120px"
                overlay.style.boxSizing = "border-box"; // Ensure padding and border are included in the total width and height

                overlay.style.padding = "5px 8px";
                overlay.style.margin = "3px";

                // Add input event listener to restrict user input
                inputElement.addEventListener("input", function (event) {
                    if (input !== "Auxi") {
                        const inputValue = event.target.value;
                        const sanitizedValue = inputValue.replace(/[^0-9+]/g, "");
                        event.target.value = sanitizedValue;
                    }
                });

                // Add event listeners to handle overlay visibility
                inputElement.addEventListener("mouseenter", () => {
                    overlay.style.opacity = "0";
                    if (this.state.currentItemsInfo.hasOwnProperty(input.toLowerCase())) {
                        const rect = inputElement.getBoundingClientRect();
                        const absoluteLeft = rect.left + 120
                        const absoluteTop = rect.top
                        const existingItemContainer = document.querySelector(".slotsContainerKEK")
                        if (existingItemContainer) {
                            existingItemContainer.remove()
                        }
                        const slotsContainer = generateItemDescription(this.state.currentItemsInfo[input.toLowerCase()].item, absoluteLeft, absoluteTop);
                        const copyBtnItem = slotsContainer.querySelector(".copyitemBtnKEK")
                        if (copyBtnItem) {
                            copyBtnItem.remove()
                        }
                    }
                });

                inputElement.addEventListener("mouseleave", () => {
                    // Check if the input is focused before changing the overlay's opacity
                    overlay.style.opacity = "1";
                    const existingItemContainer = document.querySelector(".slotsContainerKEK")
                    if (existingItemContainer) {
                        existingItemContainer.remove()
                    }
                });

                // Append the input and overlay to the wrapper div
                inputWrapper.appendChild(inputElement);
                inputWrapper.appendChild(overlay);

                input = input.toLowerCase()
                if (this.state.currentItemsInfo.hasOwnProperty(input)) {
                    const currentItemInfo = this.state.currentItemsInfo[input]
                    inputElement.value = currentItemInfo.id + `+${currentItemInfo.upgrade || 0}`
                    const overlay = inputElement.nextElementSibling
                    if (overlay) {
                        overlay.classList.add("text" + getTextColor(currentItemInfo.quality))
                    }
                }
                slotDiv.appendChild(inputWrapper);
            });

            // Create the Simulate button
            const simulateButton = document.createElement("button");
            simulateButton.textContent = "Simulate";
            simulateButton.classList.add("btn", "black", "textsecondary", "stat-sim-btn", "border");
            simulateButton.style.padding = "5px"
            simulateButton.style.fontSize = "90%"
            simulateButton.style.flex = 1
            // Append the slotDiv to the window panel

            const buttonContainer = document.createElement("div");
            buttonContainer.style.padding = "5px";
            buttonContainer.style.margin = "2px";
            buttonContainer.style.display = "flex"
            // Add click event listener to handle the simulation
            simulateButton.addEventListener('click', async () => {
                simulateButton.classList.add('disabled');
                const charSheet = document.querySelector(".stats2")
                if (!charSheet) return;
                // Get the values of all inputs and combine them into a string
                const auxiInput = document.querySelector(".auxi-sim-input")

                const ignoreGearEle = document.querySelector(".ignoreCurrentGearKEK")
                // console.log(ignoreGearEle, ignoreGearEle.value, parseInt(ignoreGearEle))

                // Get the value of the "Ignore Current Gear" checkbox
                let ignoreCurrentGear = 1
                let dontSimulate = false
                if (ignoreGearEle) {
                    ignoreCurrentGear = ignoreGearEle.value || 1
                }
                const originalStats = this.getStatsUI(charSheet)
                let newStats = {}
                if (auxiInput) {
                    if (auxiInput.value !== "") {
                        const parsedAuxi = parseAuxi(auxiInput.value)
                        const ids = parsedAuxi.ids
                        const itemUpgradeTable = parsedAuxi.itemUpgradeTable
                        const newItems = await getItem(ids, itemUpgradeTable)
                        const { stats, itemsInfo } = await this.getStats(newItems, player, ignoreCurrentGear)
                        newStats = stats
                        this.state.currentItemsInfo = itemsInfo
                        const inputValues = inputs.map(input => {
                            input = input.toLowerCase()
                            const inputElement = slotDiv.querySelector(`.${input.toLowerCase()}KEK`);
                            if (itemsInfo.hasOwnProperty(input)) {
                                const itemInfo = itemsInfo[input]
                                inputElement.value = itemInfo.id + `+${itemInfo.upgrade || 0}`
                                const overlay = inputElement.nextElementSibling
                                if (overlay) {
                                    overlay.className = "btn black textsecondary stat-sim-overlay"
                                    overlay.classList.add("text" + getTextColor(itemInfo.quality))
                                }
                            } else {
                                inputElement.value = ""
                                const overlay = inputElement.nextElementSibling
                                if (overlay) {
                                    overlay.className = "btn black textsecondary overlay"
                                }
                            }
                        });
                        auxiInput.value = ""
                        auxiInput.style.height = "40px"
                        auxiInput.style.width = "94%";
                    }
                    else {
                        const allInputs = windowPanel.querySelectorAll(".stat-sim-input")
                        let inputsEmpty = true
                        for (let input of allInputs) {
                            if (input.value !== "") {
                                inputsEmpty = false
                                break
                            }
                        }
                        if (!inputsEmpty) {
                            const inputValues = inputs.map(input => {
                                const inputElement = slotDiv.querySelector(`.${input.toLowerCase()}KEK`);
                                return inputElement ? inputElement.value : '';
                            });
                            const combinedString = inputValues.join('\n').trim();
                            // Log the combined string and the value of the checkbox
                            // console.log({ "combinedString": parseAuxi(combinedString), ignoreCurrentGear , player});

                            const parsedAuxi = parseAuxi(combinedString)
                            const ids = parsedAuxi.ids
                            const itemUpgradeTable = parsedAuxi.itemUpgradeTable
                            const newItems = await getItem(ids, itemUpgradeTable)
                            const { stats, itemsInfo } = await this.getStats(newItems, player, ignoreCurrentGear)
                            newStats = stats
                            this.state.currentItemsInfo = itemsInfo
                            const inputValuesNew = inputs.map(input => {
                                input = input.toLowerCase()
                                const inputElement = slotDiv.querySelector(`.${input.toLowerCase()}KEK`);
                                if (itemsInfo.hasOwnProperty(input)) {
                                    const itemInfo = itemsInfo[input]
                                    inputElement.value = itemInfo.id + `+${itemInfo.upgrade || 0}`
                                    const overlay = inputElement.nextElementSibling
                                    if (overlay) {
                                        overlay.className = "btn black textsecondary overlay"
                                        overlay.classList.add("text" + getTextColor(itemInfo.quality))
                                    }
                                } else {
                                    inputElement.value = ""
                                    const overlay = inputElement.nextElementSibling
                                    if (overlay) {
                                        overlay.className = "btn black textsecondary overlay"
                                    }
                                }
                            });
                        }
                        else {
                            let fetchedAuxi = ""
                            const equipSlots = document.querySelector("#equipslots")
                            const itemSlots = equipSlots.children
                            for (let itemSlot of itemSlots) {
                                itemSlot.dispatchEvent(new PointerEvent("pointerenter"))
                            }
                            setTimeout(() => {
                                const itemStats = []

                                for (let itemSlot of itemSlots) {
                                    const item = getItemUI(itemSlot.querySelector(".slotdescription"))
                                    if (item.type !== "charm") {
                                        itemStats.push(item)
                                    }
                                    itemSlot.dispatchEvent(new PointerEvent("pointerleave"))
                                }
                                // console.log(itemStats)
                                for (let item of itemStats) {
                                    fetchedAuxi += `${item.type} ${item.quality}% ${item.id} +7\n`
                                }
                                // console.log(fetchedAuxi)
                                auxiInput.value = fetchedAuxi
                                auxiInput.dispatchEvent(new InputEvent('input', { bubbles: true }))
                                // simulateButton.click()
                            }, 100)
                            dontSimulate = true
                            simulateButton.classList.remove('disabled');
                        }
                    }
                    if (dontSimulate) {
                        return
                    }
                    // console.log(newStats.ignoreCurrentGear)
                    let finalStats = {}
                    const ignoreGearEle = document.querySelector(".ignoreCurrentGearKEK")
                    if (ignoreGearEle) {
                        ignoreCurrentGear = ignoreGearEle.value || 1
                    }
                    // console.log(ignoreCurrentGear, ignoreGearEle, ignoreGearEle.value)
                    newStats["gear score"] += 60
                    if (ignoreCurrentGear == 1) {
                        finalStats = newStats
                    } else {
                        finalStats = this.addStats(originalStats, newStats)
                    }
                    // console.log(currentItemsInfo)

                    // console.log(finalStats, originalStats, newStats)
                    this.setStatsUI(charSheet, finalStats)
                    simulateButton.classList.remove('disabled');

                    const playerClass = player.pclass
                    const buildScore = finalStats["build score"]
                    const detailStatCol = charSheetContainer.querySelector(".statcol");
                    if (detailStatCol) {
                        const existingRankStats = detailStatCol.querySelectorAll(".rankStatKEK")
                        for (let e of existingRankStats) {
                            e.remove()
                        }
                        const rank = await this.fetchRank(buildScore, playerClass)
                        this.createStatElement(detailStatCol, "Rank", rank, "rankStatKEK")
                    }
                }
            });
            // Create a div for "Ignore Current Gear"
            const ignoreCurrentGearDiv = document.createElement("button");
            ignoreCurrentGearDiv.classList.add("btn", "textsecondary", "ignoreCurrentGearKEK", "black");
            ignoreCurrentGearDiv.textContent = "Ignoring Current Gear";
            ignoreCurrentGearDiv.style.padding = "5px";
            ignoreCurrentGearDiv.style.fontSize = "90%";
            ignoreCurrentGearDiv.style.flex = 2
            // Add click event listener to toggle classes and update value
            ignoreCurrentGearDiv.addEventListener('click', () => {
                const isActive = ignoreCurrentGearDiv.classList.contains("black");
                if (!isActive) {
                    ignoreCurrentGearDiv.textContent = "Ignoring Current Gear"
                } else {
                    ignoreCurrentGearDiv.textContent = "Ignore Current Gear?"
                }
                // Toggle classes
                ignoreCurrentGearDiv.classList.toggle("black", !isActive);
                ignoreCurrentGearDiv.classList.toggle("grey", isActive);

                // Update the value of ignoreCurrentGear
                ignoreCurrentGearDiv.value = isActive ? 0 : 1;
                // console.log(ignoreCurrentGearDiv.value)
            });

            const clearBtn = document.createElement("div")
            clearBtn.classList.add("btn", "black", "textsecondary")
            clearBtn.textContent = "Clear"
            clearBtn.style.marginLeft = "10px"
            clearBtn.style.marginRight = "10px"
            clearBtn.style.textAlign = "center"
            clearBtn.addEventListener("click", () => {
                this.state.currentItemsInfo = {}
                const statInputs = document.querySelectorAll(".stat-sim-input")
                for (let input of statInputs) {
                    input.value = ""
                }
                const statOverlays = document.querySelectorAll(".stat-sim-overlay")
                for (let overlay of statOverlays) {
                    overlay.className = "btn black textsecondary stat-sim-overlay"
                }
            })
            // Append the checkbox container to the button container
            buttonContainer.appendChild(simulateButton)
            buttonContainer.appendChild(ignoreCurrentGearDiv);

            windowPanel.appendChild(slotDiv);
            windowPanel.appendChild(buttonContainer);
            windowPanel.appendChild(clearBtn);

            // Append the window panel to the charSheetContainer
            charSheetContainer.appendChild(windowPanel);
        }
    },

    getStatsUI(charSheet) {
        if (charSheet) {
            // Get all statcol elements
            const statCols = charSheet.querySelectorAll('.statcol');

            const stats = {};

            // Function to parse values (handles '%' cases)
            const parseStatValue = (value) => {
                if (value.includes('%')) {
                    // If '%' is present, split and parse the first part
                    return parseFloat(value.split('%')[0].trim());
                }
                // Otherwise, parse the entire value
                return parseFloat(value.trim());
            };

            // Function to remove dot at the end of statName
            const removeDotAtEnd = (statName) => statName.replace(/\.$/, '');

            // Iterate over each statcol
            statCols.forEach(statCol => {
                // Get all span elements within the current statcol
                const statElements = statCol.querySelectorAll('span');

                // Iterate over each pair of span elements (statName and statValue)
                for (let i = 0; i < statElements.length; i += 2) {
                    // Extract statName and statValue
                    let statName = statElements[i].textContent.trim();
                    statName = removeDotAtEnd(statName); // Remove dot at the end, if present
                    const statValue = parseStatValue(statElements[i + 1].textContent);

                    // Add the key-value pair to the stats object
                    stats[statName.toLowerCase()] = statValue;
                }
            });

            // console.log(stats);
            return stats;
        }
        return {};
    },

    handleStatSimulation(charSheetContainer) {
        charSheetContainer = charSheetContainer.element
        if (charSheetContainer) {
            // Get player class and level information
            const detailStatCol = charSheetContainer.querySelector(".statcol");
            let playerClassSrc = null;
            let level = 0;

            if (detailStatCol) {
                const spans = detailStatCol.querySelectorAll("span");
                spans.forEach((span, index) => {
                    if (span.textContent.trim().toLowerCase() === "class" && index < spans.length - 1) {
                        const nextSpan = spans[index + 1];
                        const imgElement = nextSpan.querySelector("img");
                        playerClassSrc = imgElement ? imgElement.getAttribute("src") : null;
                    } else if (span.textContent.trim().toLowerCase() === "level" && index < spans.length - 1) {
                        const nextSpan = spans[index + 1];
                        level = nextSpan.textContent.trim();
                    }
                });
            }

            level = parseInt(level)
            const playerClass = profileManager.playerClass
            const player = { pclass: profileManager.playerClass, level }

            // Function to toggle stat simulator and update CSS classes
            const toggleStatSimulator = (e) => {
                e.stopPropagation()
                const btn = e.target
                this.state.statSimulatorOpened = this.state.statSimulatorOpened === '0' ? '1' : '0';

                // Get the title frame element
                const titleFrame = charSheetContainer.querySelector('.titleframe');

                // Toggle the CSS classes based on the this.state.statSimulatorOpened value
                if (this.state.statSimulatorOpened == '1') {
                    // Code to execute when stat simulator is opened
                    // console.log("Stat Simulator opened");
                    btn.classList.add('tab-selected'); // Remove grey class
                } else {
                    // Code to execute when stat simulator is closed
                    // console.log("Stat Simulator closed");
                    btn.classList.remove('tab-selected'); // Add grey class
                }
                this.handleSimulationUI(charSheetContainer, player)
            }

            const closeBtn = charSheetContainer.querySelectorAll("img")[1]
            // Create a button element
            const statSimulatorButton = document.createElement('div');
            statSimulatorButton.classList.add("btn", "textprimary", "statSimulatorStartBtnKEK")
            statSimulatorButton.style.padding = "10px"
            statSimulatorButton.style.marginRight = "10px"
            statSimulatorButton.style.textAlign = "center"
            statSimulatorButton.style.width = "200px"
            if (this.state.statSimulatorOpened == 1) {
                statSimulatorButton.classList.add("tab-selected")
            }
            statSimulatorButton.textContent = 'Stat Simulation';
            statSimulatorButton.addEventListener('click', toggleStatSimulator);
            // Create a button element for Copy
            // const copyButton = document.createElement('div');
            // copyButton.classList.add("btn", "textprimary", "copy-button-stats", "black");
            // copyButton.style.padding = "10px";
            // copyButton.style.textAlign = "center";
            // copyButton.style.width = "40%";
            // copyButton.textContent = 'Copy';
            // // Get the title frame element
            const titleFrame = charSheetContainer.querySelector('.titleframe');

            // // Append the button to the title frame
            // titleFrame.insertBefore(copyButton, closeBtn);
            titleFrame.insertBefore(statSimulatorButton, closeBtn);

            if (this.state.statSimulatorOpened == 1) {
                this.handleSimulationUI(charSheetContainer, player)
            }
            const charSheet = document.querySelector(".stats2")
            const statCols = charSheet.querySelectorAll(".statcol")

            const stats = this.getStatsUI(charSheet)
            // console.log(stats, "stats are")
            let min = stats["min dmg"]
            let max = stats["max dmg"]
            let crit = stats["critical"]
            let haste = stats["haste"]
            let hp = stats["hp"]
            let defense = stats["defense"]
            let block = stats["block"]

            let eHP = Math.round(hp / ((1 - ((1 - Math.exp(-defense * 0.0022)) * 0.87)) * (1 - (block / 100) * 0.45)));
            let eDps = Math.round(((min - Math.max(0, min - max) + max) / 2) * (1 + crit / 100) * (1 + haste / 100));
            let eBurst = Math.round(((min - Math.max(0, min - max) + max) / 2) * (1 + crit / 100));
            if (playerClass == 1) {
                eBurst = Math.round(((min - Math.max(0, min - max) + max) / 2) * (((1 + crit / 100) * 0.8) + ((1 + haste / 100) * 0.3)));
            }
            if (playerClass == 0) {
                eHP = Math.round(hp / ((1 - ((1 - Math.exp(-defense * 0.0022)) * 0.87)) * (1 - (block / 100) * 0.6)));
            }
            stats["ehp"] = eHP
            stats["edps"] = eDps
            stats["eburst"] = eBurst
            let buildScore = this.getBuildScore(stats, playerClass)
            stats["build score"] = buildScore

            this.createStatElement(statCols[1], "eHP", eHP)
            this.createStatElement(statCols[1], "eDps", eDps)
            this.createStatElement(statCols[2], "eBurst", eBurst)
            this.createStatElement(statCols[0], "Build Score", buildScore)

            // copyButton.addEventListener('click', () => {
            //     copyElementToClipboard(copyButton, charSheetContainer.querySelector(".window"));
            // });

            if (detailStatCol) {
                const existingRankStats = detailStatCol.querySelectorAll(".rankStatKEK")
                for (let e of existingRankStats) {
                    e.remove()
                }
                const rank = this.fetchRank(buildScore, playerClass)
                rank.then(rank => {
                    // console.log("rank is", rank)
                    this.createStatElement(detailStatCol, "Rank", rank, "rankStatKEK")
                })
            }

        }
    },
    // Function to set currentItemsInfo in localStorage
    setCurrentItemsInfo(itemsInfo) {
        this.state.currentItemsInfo = itemsInfo
    },

    // Function to fetch currentItemsInfo from localStorage
    getCurrentItemsInfo() {
        return this.state.currentItemsInfo;
    },

    getStatsUI(charSheet) {
        if (charSheet) {
            // Get all statcol elements
            const statCols = charSheet.querySelectorAll('.statcol');

            const stats = {};

            // Function to parse values (handles '%' cases)
            const parseStatValue = (value) => {
                if (value.includes('%')) {
                    // If '%' is present, split and parse the first part
                    return parseFloat(value.split('%')[0].trim());
                }
                // Otherwise, parse the entire value
                return parseFloat(value.trim());
            };

            // Function to remove dot at the end of statName
            const removeDotAtEnd = (statName) => statName.replace(/\.$/, '');

            // Iterate over each statcol
            statCols.forEach(statCol => {
                // Get all span elements within the current statcol
                const statElements = statCol.querySelectorAll('span');

                // Iterate over each pair of span elements (statName and statValue)
                for (let i = 0; i < statElements.length; i += 2) {
                    // Extract statName and statValue
                    let statName = statElements[i].textContent.trim();
                    statName = removeDotAtEnd(statName); // Remove dot at the end, if present
                    const statValue = parseStatValue(statElements[i + 1].textContent);

                    // Add the key-value pair to the stats object
                    stats[statName.toLowerCase()] = statValue;
                }
            });

            // console.log(stats);
            return stats;
        }
        return {};
    },

    setStatsUI(charSheet, stats) {
        // Get all statcol elements
        const statCols = charSheet.querySelectorAll('.statcol');

        // Function to format stats based on statName
        const formatStatValue = (statName, statValue) => {
            if (["critical", "haste"].includes(statName)) {
                return statValue.toFixed(1) + "%"; // Add "%" for specific stats and show one decimal place
            } else if (statName === "block") {
                return statValue.toFixed(2) + "%"; // Show two decimal places for "block"
            } else if (statName === "item find") {
                return statValue + "%"; // Add "%" for "item find" without applying toFixed
            } else if (statName === "hp reg./5s" || statName === "mp reg./5s") {
                return statValue.toFixed(1); // Show one decimal place for "hp reg./5s" and "mp reg./5s"
            } else if (statName === "mp") {
                return Math.round(statValue).toFixed(0); // Round and show zero decimal places for "mp"
            }
            return statValue; // Default formatting
        };

        // Function to remove dot at the end of statName
        const removeDotAtEnd = (statName) => statName.replace(/\.$/, '');

        // Iterate over each statcol
        statCols.forEach(statCol => {
            // Get all span elements within the current statcol
            const statElements = statCol.querySelectorAll('span');

            // Iterate over each pair of span elements (statName and statValue)
            for (let i = 0; i < statElements.length; i += 2) {
                // Extract statName
                let statName = statElements[i].textContent.trim().toLowerCase();
                statName = removeDotAtEnd(statName); // Remove dot at the end, if present

                // Check if the statName exists in the provided stats object
                if (stats.hasOwnProperty(statName)) {
                    // Update the statValue in the UI with formatted value
                    const statValue = stats[statName];
                    statElements[i + 1].textContent = formatStatValue(statName, statValue);
                }
            }
        });
    },

    addStats(stats1, stats2) {
        const addedStats = {};
        for (let statName in stats2) {

        }
        // Iterate over keys of stats1
        for (const statName in stats1) {
            if (stats1.hasOwnProperty(statName)) {
                // Check if the statName exists in stats2
                if (stats2.hasOwnProperty(statName)) {
                    // Add the corresponding stats and store in addedStats
                    addedStats[statName] = stats1[statName] + stats2[statName];
                } else {
                    // If the statName doesn't exist in stats2, just copy it to addedStats
                    addedStats[statName] = stats1[statName];
                }
            }
        }

        // Iterate over keys of stats2 to include any additional stats
        for (const statName in stats2) {
            if (stats2.hasOwnProperty(statName) && !addedStats.hasOwnProperty(statName)) {
                // If the statName exists in stats2 but not in addedStats, copy it to addedStats
                addedStats[statName] = stats2[statName];
            }
        }

        return addedStats;
    }



}

export default statsSim
