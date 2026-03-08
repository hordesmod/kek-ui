import itemTypes from "../../core/data/itemTypes"
import rarityNames from "../../core/data/rarityNames"
import statNames from "../../core/data/statNames"
import eventManager from "../../core/event"
import log from "../../core/logger"
import slotDescriptionParser from "../../core/parsers/slotdescription"
import element from "../../core/widgets/element"
import frame from "../../core/widgets/frame"
import multiSelect from "../../core/widgets/multiSelect"
import createTable from "../../core/widgets/table"

const itemFilters = {
    name: "Item Filters",
    description: "Back to the Filters Part III.",
    state: {
        filters: {},
        preset: "",
    },
    style: `
        th, td {
            max-width: 200px;
        }
        td.selected {
            background-color: #f5c24733
        }
        td.selected:nth-child(odd) {
            background-color: #f5c24740;
        }
    `,
    filters: {},
    defaultFilters: {
        "BIS": [
            [1, 4, 270713, 0, "", 0, 0, 0, 0, "#ff9500"],
            [1, 8, 270709, 0, "", 0, 0, 0, 0, "#ff9500"],
            [1, 1, 262524, 0, "", 0, 0, 0, 0, "#ff9500"],
            [1, 16, 270701, 0, "", 0, 0, 0, 0, "#ff9500"],
            [210, 16, 271277, 0, "", 0, 0, 0, 0, "#ff9500"],
            [210, 4, 271289, 0, "", 0, 0, 0, 0, "#ff9500"],
            [210, 8, 271285, 0, "", 0, 0, 0, 0, "#ff9500"],
            [210, 1, 263100, 0, "", 0, 0, 0, 0, "#ff9500"],
            [4, 4, 271353, 0, "", 0, 0, 0, 0, "#ff9500"],
            [4, 8, 271349, 0, "", 0, 0, 0, 0, "#ff9500"],
            [4, 1, 263164, 0, "", 0, 0, 0, 0, "#ff9500"],
            [4, 16, 271341, 0, "", 0, 0, 0, 0, "#ff9500"],
            [32, 4, 271353, 0, "", 0, 0, 0, 0, "#ff9500"],
            [256, 16, 271341, 0, "", 0, 0, 0, 0, "#ff9500"],
            [1024, 8, 270837, 0, "", 0, 0, 0, 0, "#ff9500"],
            [2048, 4, 270841, 0, "", 0, 0, 0, 0, "#ff9500"],
            [4096, 16, 271149, 0, "", 0, 0, 0, 0, "#ff9500"],
            [16384, 1, 262652, 0, "", 0, 0, 0, 0, "#ff9500"],
            [32768, 8, 271349, 0, "", 0, 0, 0, 0, "#ff9500"],
            [65536, 1, 263164, 0, "", 0, 0, 0, 0, "#ff9500"],
            [262144, 16, 270829, 0, "", 0, 0, 0, 0, "#ff9500"]
        ]
    },
    start() {
        // log("bagFilter", this.state)
        eventManager.on("ui.bagParent", this.inject, this)
        eventManager.on("ui.characterParent", this.charHandler, this)
        eventManager.on("ui.stashParent", this.stashHandler, this)
        this.extractFilters()
    },

    stop() {
        eventManager.off("ui.bagParent", this.inject, this)
    },
    charHandler(characterParent) {
        this.slotsCharacter = characterParent.element.querySelector(".items")
        // this.enabled && (this.slotsReset(), this.slotsParser())
    },
    stashHandler(stashParent) {
        this.slotDescriptionStash = stashParent.element.querySelectorAll(".slotparent")[0]
        this.slotsStash = stashParent.element.querySelectorAll(".slotcontainer")
        // this.enabled && (this.slotsReset(), this.slotsParser())
    },
    inject(bagParent) {
        const bagElement = bagParent.element

        const slot = bagElement.children[0].children[1]
        this.slots = slot.querySelector(".slotcontainer")

        const filterContainer = element("div").style({ display: "grid", gridTemplateColumns: "1fr auto", gridGap: "4px", marginBottom: "8px", })

        this.presetSelect = element("select").css("btn grey")
            .on("input", e => {
                this.state.preset = e.target.value
            })
        this.updatePresetSelect()

        this.enabled = 0
        const btn = element("div")
            .css("btn border grey")
            .text("Filter")
            .on("pointerup", e => {
                if (e.button == 0) {
                    this.enabled ^= 1
                    btn.toggle("grey").toggle("orange")
                    this.enabled ? this.slotsParser() : this.slotsReset()

                }
                else if (e.button == 2) {
                    this.showSettings()
                }
            })
        filterContainer.add(this.presetSelect).add(btn)

        slot.insertBefore(filterContainer.element, slot.firstChild)

        slot.children[1].style.display = "none"

        // new MutationObserver((mutations, observer) => {
        //     for (const mutation of mutations) {
        //         log(mutation)
        //     }
            
        //     // if (mutations.some(mutation => mutation.type === "childList" && mutation.addedNodes.length > 0)) {
        //     //     log(mutations)
        //     // }
        // }).observe(this.slots, { childList: true, subtree: true})


    },
    updatePresetSelect() {
        this.presetSelect.clear()
        for (const presetName in this.filters) {
            const option = element("option").text(presetName)
            if (presetName === this.state.preset) {
                option.attr("selected", 1)
            }
            this.presetSelect.add(option)
        }
    },

    slotsParser() {
        const parseSlot = (slots, slotDescriptionStash) => {
            if (!slots) return
            let i = 0
            for (let slot of slots.children) {
                if (!slot.classList.contains("filled")) continue
                const observer = new MutationObserver((mutations, observer) => {
                    if (mutations.some(mutation => mutation.type === "childList")) {
                        let slotdescription
                        if (slotDescriptionStash) {
                            slotdescription = slotDescriptionStash.querySelectorAll(".slotdescription")[i++]
                        } else {
                            slotdescription = slot.querySelector(".slotdescription")
                        }
                        if (slotdescription) {
                            // log(slot, slotdescription)
                            observer.disconnect()
                            this.slotsHighlight(slot, slotdescription)
                            slot.dispatchEvent(new PointerEvent("pointerleave"))
                        }
                    }
                })

                if (slotDescriptionStash) {
                    observer.observe(slotDescriptionStash, { childList: true })
                } else {
                    observer.observe(slot, { childList: true })
                }
                slot.dispatchEvent(new PointerEvent("pointerenter"))
            }
        }
        if (this.slots) {
            parseSlot(this.slots, null)
        }
        if (this.slotsStash) {
            for (const slotsStash of this.slotsStash) {
                parseSlot(slotsStash, this.slotDescriptionStash)
            }
        }
        if (this.slotsCharacter) {
            parseSlot(this.slotsCharacter, null)
        }
    },

    meetsFilterCriteria(parsed, filter) {
        // log(parsed)
        // Check type
        if (filter[0].length && !filter[0].includes(parsed.type)) {
            return false
        }
        // Check stats
        if (filter[1].length) {
            const filterIndexes = filter[1].map(filterName => statNames.indexOf(filterName))
            if (filterIndexes.some(index => parsed.stats[index] === 0)) {
                return false
            }
        }
        // Check negative stats
        if (filter[2].length) {
            const filterIndexes = filter[2].map(filterName => statNames.indexOf(filterName))
            if (filterIndexes.some(index => parsed.stats[index] !== 0)) {
                return false
            }
        }
        // Check rarity
        if (filter[3].length && !filter[3].includes(parsed.rarity)) {
            // log("rarity")
            return false
        }
        // Check name
        if (filter[4] && !parsed.name.includes(filter[4])) {
            return false
        }
        // Check gs
        if ((filter[5] > 0 && filter[5] >= parsed.gs) || (filter[5] < 0 && Math.abs(filter[5]) <= parsed.gs)) {
            return false
        }
        // Check quality
        if ((filter[6] > 0 && filter[6] >= parsed.quality) || (filter[6] < 0 && Math.abs(filter[6]) <= parsed.quality)) {
            return false
        }
        // Check upgrade
        // log("upgrade", parsed, Math.abs(filter[6]), parsed.upgrade)
        if ((filter[7] > 0 && filter[7] >= parsed.upgrade) || (filter[7] < 0 && Math.abs(filter[7]) <= parsed.upgrade)) {
            return false
        }
        // Check gold
        // log("gold", parsed, Math.abs(filter[7]), parsed.gold)
        if ((filter[8] > 0 && filter[8] >= parsed.gold) || (filter[8] < 0 && Math.abs(filter[8]) <= parsed.gold)) {
            return false
        }

        return true
    },

    slotsHighlight(slot, slotdescription) {
        const parsed = slotDescriptionParser(slotdescription)
        const filters = this.filters[this.state.preset]
        log(parsed)
        for (const filter of filters) {
            if (this.meetsFilterCriteria(parsed, filter)) {
                slot.style.filter = ""
                slot.style.border = "3px solid " + filter[9]
                break
            }
            else {
                slot.style.filter = "grayscale(1) brightness(0.5)"
            }
        }
    },

    slotsReset() {
        if (this.slots) {
            for (let slot of this.slots.children) {
                slot.style.filter = ""
                slot.style.border = ""
            }
        }
        if (this.slotsCharacter) {
            for (let slot of this.slotsCharacter.children) {
                slot.style.filter = ""
                slot.style.border = ""
            }
        }
        if (this.slotsStash) {
            for (const slotsStash of this.slotsStash) {
                for (let slot of slotsStash.children) {
                    slot.style.filter = ""
                    slot.style.border = ""
                }
            }
        }
    },

    filtersToBitnum(selectedFilters, filterArray) {
        const filterIndices = {}
        for (let i = 0; i < filterArray.length; i++) {
            filterIndices[filterArray[i]] = i
        }

        let bitnum = 0
        for (let i = 0; i < selectedFilters.length; i++) {
            const index = filterIndices[selectedFilters[i]];
            if (index !== undefined) {
                bitnum |= 1 << index
            }
        }

        return bitnum
    },

    bitnumToFilters(bitnum, filterArray) {
        const selectedFilters = []
        for (let i = 0; i < filterArray.length; i++) {
            if ((bitnum & (1 << i)) !== 0) {
                selectedFilters.push(filterArray[i])
            }
        }
        return selectedFilters
    },

    helper(tooltipText) {
        return element("span").css("textyellow").style({ marginLeft: "0.4em" }).text("(?)").on("pointerenter", e => {
            const { top, left } = e.target.getBoundingClientRect()
            const { top: parentTop, left: parentLeft } = e.target.offsetParent.getBoundingClientRect()
            const tooltip = element("div").css("panel-black textyellow").style({
                position: "absolute",
                top: (top - parentTop + e.target.offsetHeight - 20) + "px",
                left: (left - parentLeft + 30) + "px",
                width: "250px",
                zIndex: 99,
            }).text(tooltipText)
            e.target.offsetParent.appendChild(tooltip.element)
        }).on("pointerleave", e => {
            const tooltip = e.target.offsetParent.lastChild
            if (tooltip) {
                tooltip.parentNode.removeChild(tooltip)
            }
        })
    },

    showSettings() {
        this.frame = frame({ title: "Filter Settings", y: 100 })

        // FILTERS LIST
        this.filtersTable = element("div").css("scrollbar").style({
            // padding: "12px",
            width: "900px",
            minHeight: "400px",
            maxHeight: "400px"
        }).on("pointerup", e => {
            const target = e.target
            if (target.tagName === "TD") {
                const closestTr = target.closest("tr")
                const rowIndex = closestTr ? closestTr.rowIndex : -1
                if (rowIndex !== -1) {
                    if (e.button === 0) {
                        this.newRecordContainer.element.style.display = "grid"
                        this.selectFilters(rowIndex - 1)
                    } else if (e.button === 2) {
                        this.removeFilters(rowIndex - 1)
                    }

                }
            }
        })

        // FILTER PRESETS
        const presetContainer = this.presetContainer()
        this.frame.slot.add(presetContainer)

        // NEW FILTER
        this.newRecordContainer = element("div").css("panel-bright").style({
            display: "none", //grid
            gridTemplateColumns: "auto 170px 65px 50px 110px 50px 110px 40px 70px 100px",
            gridGap: "4px",
            padding: "8px",
        })

        const spanNum = "span 9"
        const typeArray = ["sword", "staff", "bow", "hammer", "", "shield", "orb", "quiver", "totem", "", "armor",
            "armlet", "boot", "glove", "", "amulet", "bag", "ring", "", "book", "rune", "misc", "", "mount", "box", "charm", "pet"]
        const typeLabel = element("div").css("btn textright textgreen").text("Type")

        this.typeSelect = multiSelect({ options: typeArray, height: "18rem", placeholder: "ANY selected checked against item TYPE, or leave empty to ignore" })
        this.typeSelect.element.style.gridColumn = spanNum
        this.newRecordContainer.add(typeLabel).add(this.typeSelect)

        const statArray = ["", "Strength", "Intelligence", "Dexterity", "Wisdom", "", "Critical", "Haste", "",
            "Min Dmg.", "Max Dmg.", "", "Stamina", "Defense", "Block", "", "Luck",
            "Item Find", "HP", "MP", "HP Reg./5s", "MP Reg./5s", "Move Spd.", "Attack Spd."]
        const statLabel = element("div").css("btn textright textgreen").text("Stats +")
        this.statSelect = multiSelect({ options: statArray, height: "17rem", placeholder: "ALL selected checked against item STATS, or leave empty to ignore" })
        this.statSelect.element.style.gridColumn = spanNum
        this.newRecordContainer.add(statLabel).add(this.statSelect)

        const nstatLabel = element("div").css("btn textright textred").text("Stats -")
        this.nstatSelect = multiSelect({ options: statArray, height: "17rem", placeholder: "ALL selected checked to be excluded from item STATS, or leave empty to ignore" })
        this.nstatSelect.element.style.gridColumn = spanNum
        this.newRecordContainer.add(nstatLabel).add(this.nstatSelect)

        const rarityLabel = element("div").css("btn textright textgreen").text("Rarity")
        this.raritySelect = multiSelect({ options: rarityNames, height: "7rem", placeholder: "ANY selected checked against item RARITY, or leave empty to ignore" })
        this.raritySelect.element.style.gridColumn = spanNum
        this.newRecordContainer.add(rarityLabel).add(this.raritySelect)

        const nameLabel = element("div").css("btn textright textgreen").text("Name")
            .add(this.helper("Enter part of item name to include in the item name. For example, 'Lv. 5' will show all books level 5."))
        this.nameSelect = element("input").type("text").attr("placeholder", "...")
        this.newRecordContainer.add(nameLabel).add(this.nameSelect)


        const placeholder = "0"

        const gsLabel = element("div").css("btn textright textgreen").text("GS")
            .add(this.helper("Enter gear score of item. Use a negative number for less than or equal, and a positive number for more than or equal. For example, -50 will include all items with a gear score less than or equal to 50. Leave empty to ignore this filter."))
        this.gsSelect = element("input").type("number").attr("placeholder", placeholder)
        this.newRecordContainer.add(gsLabel).add(this.gsSelect)

        const qualityLabel = element("div").css("btn textright textgreen").text("Quality %")
            .add(this.helper("Enter Quality % of item. Use a negative number for less than or equal, and a positive number for more than or equal. For example, -50 will include all items with Quality % less than or equal to 50. Leave empty to ignore this filter."))
        this.qualitySelect = element("input").type("number").attr("placeholder", placeholder)
        this.newRecordContainer.add(qualityLabel).add(this.qualitySelect)

        const upgradeLabel = element("div").css("btn textright textgreen").text("Upgrade")
            .add(this.helper("Enter upgrade level of item. Use a negative number for less than or equal, and a positive number for more than or equal. For example, -3 will include all items with upgrade level less than or equal to 3. Leave empty to ignore this filter."))
        this.upgradeSelect = element("input").type("number").attr("placeholder", placeholder)
        this.newRecordContainer.add(upgradeLabel).add(this.upgradeSelect)

        const goldLabel = element("div").css("btn textright textgreen").text("Cost")
            .add(this.helper("Enter cost of item. Use a negative number for less than or equal, and a positive number for more than or equal. For example, -10000 will include all items with cost less than or equal to 1 gold coin. Leave empty to ignore this filter."))
        this.goldSelect = element("input").type("number").attr("placeholder", placeholder)

        this.newRecordContainer.add(goldLabel).add(this.goldSelect)

        const colorLabel = element("div").css("btn textright textgreen").text("Color")
            .add(this.helper("Select a color for the rule to highlight filtered items."))
        this.colorSelect = element("input").type("color").style({ height: "100%" })
        // this.colorSelect.element.style.gridColumn = "span 5"

        this.newRecordContainer.add(colorLabel).add(this.colorSelect)

        const clearBtn = element("div")
            .css("btn grey")
            .style({
                gridColumn: "span 7",
                width: "80px",
                marginLeft: "auto",
                textAlign: "center",
            })
            .text("Clear")
            .on("click", () => {
                this.addFilters([
                    this.typeSelect.clear(),
                    this.statSelect.clear(),
                    this.nstatSelect.clear(),
                    this.raritySelect.clear(),
                    this.nameSelect.element.value = "",
                    this.gsSelect.element.value = "",
                    this.qualitySelect.element.value = "",
                    this.upgradeSelect.element.value = "",
                    this.goldSelect.element.value = "",
                    this.colorSelect.element.value = "#FF9500"
                ])
                this.updateFilters()
            })
        const addBtn = element("div")
            .css("btn green")
            .style({
                // gridColumn: "span 4",
                width: "80px",
                marginLeft: "auto",
                textAlign: "center",
            })
            .text("Save")
            .on("click", () => {
                this.addFilters([
                    this.typeSelect.selected,
                    this.statSelect.selected,
                    this.nstatSelect.selected,
                    this.raritySelect.selected,
                    this.nameSelect.element.value || "",
                    parseFloat(this.gsSelect.element.value || 0),
                    parseFloat(this.qualitySelect.element.value || 0),
                    parseFloat(this.upgradeSelect.element.value || 0),
                    parseFloat(this.goldSelect.element.value || 0),
                    this.colorSelect.element.value
                ])
                this.updateFilters()
            })

        this.newRecordContainer.add(clearBtn).add(addBtn)

        // const tableLabel = element("div").css("btn textgrey").text("GS, Quality %, Upgrade, Gold - Negative number (≤), positive number (≥), or leave empty to ignore")
        // tableLabel.element.style.gridColumn = "span 8"
        // this.newRecordContainer.add(tableLabel)


        // EDIT RECORD BTN
        const editBtn = element("div")
            .css("btn grey textgreen")
            .text("Edit Filter")
            .on("click", () => {
                const displayValue = this.newRecordContainer.element.style.display === "none" ? "grid" : "none"
                this.newRecordContainer.element.style.display = displayValue
            })

        const note = element("span").css("textgrey").text(" (table left click - select record and fill the form, right - delete record)")

        const editBtnStatus = element("div").css("textgrey").style({ float: "right" }).text("▼")
        editBtn.add(note).add(editBtnStatus)
        this.frame.slot.add(editBtn)

        this.frame.slot.add(this.newRecordContainer)

        this.updateFilters()
        this.frame.slot.add(this.filtersTable)

        this.frame.show()

    },

    presetContainer() {
        const presetContainer = element("div")
            .css("panel-black")
            .style({
                display: "grid",
                gridTemplateColumns: "auto 400px 1fr auto auto auto auto auto",
                gridGap: "4px",
                marginBottom: "4px",
            })

        element("span").css("btn textprimary").text("Preset:").to(presetContainer)

        const presetActionContainer = element("div").to(presetContainer)

        const presetAction = element("div").style({
            display: "grid",
            gridTemplateColumns: "1fr auto auto",
            gridGap: "4px",
        }).to(presetActionContainer)

        const selectControl = () => {
            presetAction.clear()
            const select = element("select").css("btn grey")
                .on("input", e => {
                    this.state.preset = e.target.value
                    this.updatePresetSelect()
                    this.updateFilters()
                }).to(presetAction)

            for (const presetName in this.filters) {
                const option = element("option").text(presetName)
                if (presetName === this.state.preset) {
                    option.attr("selected", 1)
                }
                select.add(option)
            }
            this.updateFilters()
        }

        selectControl()

        const cancelBtn = () => element("div").css("btn orange").text("Cancel").to(presetAction).on("click", () => { selectControl() })

        const renameControl = () => {
            presetAction.clear()
            const input = element("input").style({ padding: "unset" }).type("text").value(this.state.preset).to(presetAction)
            element("div").css("btn green").text("Rename").to(presetAction)
                .on("click", () => {
                    this.filters[input.element.value] = this.filters[this.state.preset]
                    this.state.filters[input.element.value] = this.state.filters[this.state.preset]
                    delete this.filters[this.state.preset]
                    delete this.state.filters[this.state.preset]
                    this.state.preset = input.element.value
                    this.updatePresetSelect()
                    selectControl()
                })
            cancelBtn()
        }

        const createControl = () => {
            presetAction.clear()
            const input = element("input").style({ padding: "unset" }).type("text").to(presetAction)
            element("div").css("btn green").text("Create").to(presetAction)
                .on("click", () => {
                    this.filters[input.element.value] = []
                    this.state.filters[input.element.value] = []
                    this.state.preset = input.element.value
                    this.updatePresetSelect()
                    selectControl()
                })
            cancelBtn()
        }

        const importControl = () => {
            presetAction.clear()
            const input = element("input").style({ padding: "unset" }).type("text").to(presetAction)
            element("div").css("btn green").text("Import").to(presetAction)
                .on("click", () => {
                    if (input.element.value) {
                        const obj = JSON.parse(input.element.value)
                        const name = Object.keys(obj)[0]
                        const filters = obj[name]
                        this.state.filters[name] = filters
                        this.state.preset = name
                        this.extractFilters()
                    }
                    selectControl()
                })
            cancelBtn()
        }

        const exportControl = () => {
            const exportObj = {}
            exportObj[this.state.preset] = this.state.filters[this.state.preset]

            presetAction.clear()
            const input = element("input").style({ padding: "unset" }).type("text").value(JSON.stringify(exportObj)).to(presetAction)
            element("div").css("btn green").text("Copy").to(presetAction)
                .on("click", () => {
                    navigator.clipboard.writeText(input.element.value)
                    selectControl()
                })
            cancelBtn()
        }

        const deleteControl = () => {
            presetAction.clear()
            element("span").css("btn red textwhite").text("'" + this.state.preset + "' WILL BE DELETED!").to(presetAction)
            element("div").css("btn red").text("Delete").to(presetAction)
                .on("click", () => {
                    delete this.filters[this.state.preset]
                    delete this.state.filters[this.state.preset]
                    this.state.preset = Object.keys(this.state.filters)[0] || ""
                    if (this.state.preset === "") {
                        this.importDefault()
                    }
                    this.updatePresetSelect()
                    selectControl()
                })
            cancelBtn()
        }

        element("div").to(presetContainer)
        element("div").css("btn cyan").text("Rename").on("click", () => {
            renameControl()
        }).to(presetContainer)
        element("div").css("btn green").text("Create").on("click", () => {
            createControl()
        }).to(presetContainer)
        element("div").css("btn grey").text("Import").on("click", () => {
            importControl()
        }).to(presetContainer)
        element("div").css("btn grey").text("Export").on("click", () => {
            exportControl()
        }).to(presetContainer)
        element("div").css("btn red").text("Delete").on("click", () => {
            deleteControl()
        }).to(presetContainer)

        return presetContainer
    },

    importDefault() {
        this.state.filters = { ...this.defaultFilters }
        this.state.preset = Object.keys(this.defaultFilters)[0]
        this.extractFilters()
    },

    selectFilters(idx) {
        const filter = this.filters[this.state.preset][idx]
        this.typeSelect.set(filter[0])
        this.statSelect.set(filter[1])
        this.nstatSelect.set(filter[2])
        this.raritySelect.set(filter[3])
        this.nameSelect.element.value = filter[4] || ""
        this.gsSelect.element.value = filter[5] || ""
        this.qualitySelect.element.value = filter[6] || ""
        this.upgradeSelect.element.value = filter[7] || ""
        this.goldSelect.element.value = filter[8] || ""
        this.colorSelect.element.value = filter[9]

        log(filter)
    },

    removeFilters(idx) {
        this.filters[this.state.preset].splice(idx, 1)
        this.compactFilters()
        this.updateFilters()
    },

    addFilters(filterArray) {
        const compare = filterArray.slice(0, 9).flat().join("")
        log(compare)
        if (!compare) return
        const filters = this.filters[this.state.preset]
        const indexToUpdate = filters.findIndex(value => value.slice(0, 9).flat().join("") === compare)
        indexToUpdate !== -1 ? (filters[indexToUpdate] = filterArray) : filters.push(filterArray)

        this.compactFilters()
    },

    updateFilters() {
        const transform = this.transformFilters()
        const table = createTable(transform)
        this.filtersTable.clear().add(table.element)
    },

    transformFilters() {
        if (!Object.prototype.hasOwnProperty.call(this.filters, this.state.preset)) return
        return this.filters[this.state.preset].map(obj => {
            return {
                "T": obj[0].join(", "),
                "S+": obj[1].join(", "),
                "S-": obj[2].join(", "),
                "R": obj[3]?.join(", "),
                "N": obj[4] || "",
                "GS": obj[5] || "",
                "Q": obj[6] || "",
                "U": obj[7] || "",
                "G": obj[8] || "",
                "C": obj[9] && element("div").css("btn").style({ background: obj[9] }),
            }
        })
    },

    compactFilters() {
        log(this.state.preset, this.filters[this.state.preset])
        this.filters[this.state.preset].sort((a, b) => {
            const a1 = a[0][0]
            const b1 = b[0][0]
            if (a1 < b1) {
                return -1
            } else if (a1 > b1) {
                return 1
            } else {
                const a2 = a[1][0]
                const b2 = b[1][0]
                if (a2 < b2) {
                    return -1
                } else if (a2 > b2) {
                    return 1
                } else {
                    return 0
                }
            }
        })
        this.state.filters[this.state.preset] = []
        for (const filterBit of this.filters[this.state.preset]) {
            const filter = []
            filter.push(this.filtersToBitnum(filterBit[0], itemTypes))
            filter.push(this.filtersToBitnum(filterBit[1], statNames))
            filter.push(this.filtersToBitnum(filterBit[2], statNames))
            filter.push(this.filtersToBitnum(filterBit[3], rarityNames))
            filter.push(filterBit[4])
            filter.push(filterBit[5])
            filter.push(filterBit[6])
            filter.push(filterBit[7])
            filter.push(filterBit[8])
            filter.push(filterBit[9])
            this.state.filters[this.state.preset].push(filter)
        }



    },

    extractFilters() {
        if (!Object.keys(this.state.filters)[0]) {
            this.importDefault()
            return
        }

        for (const key in this.state.filters) {
            this.filters[key] = []
            for (const filterBit of this.state.filters[key]) {
                const filter = []
                filter.push(this.bitnumToFilters(filterBit[0], itemTypes))
                filter.push(this.bitnumToFilters(filterBit[1], statNames))
                filter.push(this.bitnumToFilters(filterBit[2], statNames))
                filter.push(this.bitnumToFilters(filterBit[3], rarityNames))
                filter.push(filterBit[4])
                filter.push(filterBit[5])
                filter.push(filterBit[6])
                filter.push(filterBit[7])
                filter.push(filterBit[8])
                filter.push(filterBit[9])
                this.filters[key].push(filter)
            }
        }
    }

}
// window.bf = itemFilters
export default itemFilters