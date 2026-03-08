import { CoreItem, items } from "../../client";
import apiManager from "../api";
import ui from "../ui";
import { getClass } from "./player";

const getItem = async (ids, itemUpgradeTable = [], keepBaseUpgrade = false) => {
    let data = { ids: ids };
    let items = []

    items = await apiManager.request("hordes.item.get", data)
    const newItems = [];
    if (!items["fail"]) {
        for (let i = 0; i < items.length; i++) {
            let coreItem = new CoreItem(items[i]["id"]);

            if (itemUpgradeTable[items[i]["id"]] !== undefined && itemUpgradeTable[items[i]["id"]] !== "") {
                items[i].upgrade = itemUpgradeTable[items[i]["id"]];
            }

            coreItem.hydrate(items[i]);

            const { stats, quality, gs, upgrade, bound, type, tier, dbid } = coreItem;
            const level = coreItem.logic.level;

            let verbose_stats = {};
            for (let [key, val] of stats) {
                verbose_stats[statObj[key]] = val;

                if (statObj[key] === "Critical" || statObj[key] === "Haste" || statObj[key] === "Block") {
                    verbose_stats[statObj[key]]["value"] /= 10;
                    verbose_stats[statObj[key]]["value"] += "%";
                    continue;
                }

                if (statObj[key] === "MP Reg./5s" || statObj[key] === "HP Reg./5s") {
                    verbose_stats[statObj[key]]["value"] /= 10;
                    continue;
                }

                if (statObj[key] === "Item Find") {
                    verbose_stats[statObj[key]]["value"] += "%";
                    continue;
                }
            }

            let newItem = {
                stats: verbose_stats,
                quality: quality,
                gs: gs,
                upgrade: upgrade,
                bound: bound,
                type: type,
                tier: tier,
                id: dbid,
                level: level,
            };

            newItems.push(newItem);
        }
    }

    return newItems;
};
const getHydratedItems = (rawItems) => {
    const newItems = []
    for (let item of rawItems) {
        const hydratedItem = getHydratedItem(item)
        if(hydratedItem) {
            newItems.push(hydratedItem)
        }
    }
    return newItems
}
const getHydratedItem = (rawItem) => {
    try {
        let coreItem = new CoreItem(rawItem["id"]);

        coreItem.hydrate(rawItem);

        const { stats, quality, gs, upgrade, bound, type, tier, dbid } = coreItem;
        const level = coreItem.logic.level;

        let verbose_stats = {};

        for (let [key, val] of stats) {
            verbose_stats[statObj[key]] = val;

            if (statObj[key] === "Critical" || statObj[key] === "Haste" || statObj[key] === "Block") {
                verbose_stats[statObj[key]]["value"] /= 10;
                verbose_stats[statObj[key]]["value"] += "%";
                continue;
            }

            if (statObj[key] === "MP Reg./5s" || statObj[key] === "HP Reg./5s") {
                verbose_stats[statObj[key]]["value"] /= 10;
                continue;
            }

            if (statObj[key] === "Item Find") {
                verbose_stats[statObj[key]]["value"] += "%";
                continue;
            }
        }

        let newItem = {
            stats: verbose_stats,
            quality: quality,
            gs: gs,
            upgrade: upgrade,
            bound: bound,
            type: type,
            tier: tier,
            id: dbid,
            level: level,
        };

        return newItem
    } catch {
        return null
    }
}
const colorObj = {
    "common": "grey",
    "uncommon": "green",
    "rare": "blue",
    "epic": "purp",
    "legendary": "orange",
    "mythical": "red"
}

const getRarityOfItem = (percent) => {
    if (percent <= 50) return "common"
    if (percent <= 69) return "uncommon"
    if (percent <= 89) return "rare"
    if (percent <= 98) return "epic"
    if (percent <= 109) return "legendary"
    return "mythical"
}

const getTextColor = (percent) => {
    let rarity = getRarityOfItem(percent)
    return colorObj[rarity]
}

function getItemUI(itemElement) {
    try {
        const statsElements = itemElement.querySelectorAll('.pack.svelte-e3ao5j:nth-child(2) > div');
        // Extracting relevant information from the HTML element
        const titleElement = itemElement.querySelector('.slottitle');
        const title = titleElement.textContent.trim();
        const quality = itemElement.querySelector('.type').textContent.trim().split(' ')[2].toLowerCase()
        const upgradeMatch = title.match(/\+(\d+)/);
        const upgrade = upgradeMatch ? parseInt(upgradeMatch[1], 10) : 0;
        const type = itemElement.querySelector('.type').textContent.trim().split(' ')[1].toLowerCase();
        const gs = parseInt(itemElement.querySelector('.textgreen').textContent.match(/\d+/)[0], 10);
        const id = parseInt(itemElement.querySelector('.textgrey').textContent.match(/\d+/)[0], 10);
        const level = parseInt(itemElement.querySelector('.textgreen').textContent.match(/\d+/)[0], 10);

        // Parsing stats
        const stats = {};
        let bonusStatsStarted = false
        statsElements.forEach((statElement) => {
            const statText = statElement.textContent.trim();
            let value, statName
            if (statText.includes("+")) {
                bonusStatsStarted = true
            }
            const statInfo = statText.split(" ");
            // console.log(statInfo)


            if (statText.includes("-")) {

                value = statInfo[0] + " " + statInfo[2]
                statName = statInfo.splice(3).join(" ")

            } else if (statText.includes("+")) {

                value = statInfo[1]
                statName = statInfo.splice(2).join(" ")

            } else {

                value = statInfo[0]
                statName = statInfo.splice(1).join(" ")

            }

            const type = bonusStatsStarted ? 'bonus' : 'base';

            // Extracting the numeric value of the stat
            if (bonusStatsStarted) {
                value = value.replace('+', '').trim();
            }
            if (value.includes("%")) {
                value = value.split("%")[0].trim();
            }

            stats[statName] = {
                type,
                qual: 0, // You need to replace this with the actual value
                value: value
            };
        });
        if (stats["Damage"]) {
            const min = stats["Damage"].value.split(" ")[0]
            const max = stats["Damage"].value.split(" ")[1]
            stats["Min Dmg."] = { type: stats["Damage"].type, qual: 0, value: min }
            stats["Max Dmg."] = { type: stats["Damage"].type, qual: 0, value: max }
            delete stats["Damage"]
        }
        // Parsing other information
        const description = itemElement.querySelector('.pack.description.svelte-e3ao5j').textContent.trim();
        const bound = 2; // You need to replace this with the actual value
        const tier = 4; // You need to replace this with the actual value

        // Constructing the item object
        const item = {
            stats,
            quality,
            gs,
            upgrade,
            bound,
            type,
            tier,
            id,
            level,
        };

        return item;
    }
    catch (e) {
        // console.log(e)
        return {}
    }
}

function generateItemDescription(item, left, top) {
    // Create the main container
    if (item) {
        const mainContainer = ui.mainContainer.element
        let slotsContainer = document.querySelector('.slotsContainerKEK');
        if (!slotsContainer) {
            slotsContainer = document.createElement("div")
            slotsContainer.classList.add("slotsContainerKEK")
            slotsContainer.style.position = "absolute"
            slotsContainer.style.display = "grid"
            slotsContainer.style.gridTemplateColumns = "repeat(3, auto)"
            slotsContainer.style.top = "100px"
            slotsContainer.style.left = "100px"
            if (left) {
                slotsContainer.style.left = left + "px"
            }
            if (top) {
                slotsContainer.style.top = top + "px"
            }
            mainContainer.appendChild(slotsContainer)

        }
        const windowPanel = document.createElement("div")
        windowPanel.className = "window panel-black"
        windowPanel.style.padding = "1px"

        const slotContainer = document.createElement('div');
        slotContainer.className = 'slot';

        // Create the slotdescription div
        const slotDescription = document.createElement('div');
        slotDescription.style.width = "220px"
        slotDescription.style.height = "270px"
        slotDescription.className = 'border panel-black ' + getTextColor(item.quality);

        slotContainer.appendChild(slotDescription);
        windowPanel.appendChild(slotContainer)
        // Create and set the content for various elements
        const container = document.createElement('div');
        container.className = 'container';
        container.style.padding = "10px"
        slotDescription.appendChild(container);

        const pack1 = document.createElement('div');
        pack1.className = 'pack';
        container.appendChild(pack1);

        const slottitle = document.createElement('div');
        slottitle.className = 'slottitle ' + "text" + getTextColor(item.quality);
        slottitle.textContent = 'T' + (parseInt(item.tier) + parseInt(1)) + " " + items[item.type][item.tier].name;

        const upgradeText = document.createElement('span');
        upgradeText.className = 'textprimary';
        if (item.upgrade != 0 && item.upgrade) {
            upgradeText.textContent = ' +' + item.upgrade;
            slottitle.appendChild(upgradeText);
        }

        pack1.appendChild(slottitle);

        const type = document.createElement('div');
        type.className = "type textwhite capitalize";
        type.textContent = getRarityOfItem(item.quality) + ' ' + item.type;
        const baseQuality = document.createElement('span');
        baseQuality.textContent = " " + item.quality + '%';
        type.appendChild(baseQuality);

        pack1.appendChild(type);

        const gsIDText = document.createElement('small')
        const gsSpan = document.createElement("span")
        gsSpan.className = "textgreen"
        gsSpan.textContent = "GS: " + item.gs + " "
        const idSpan = document.createElement("span")
        idSpan.className = "textgrey"
        idSpan.textContent = "ID: " + item.id


        gsSpan.appendChild(idSpan)
        if (item.bound == 2) {
            const CBText = document.createElement('span');
            CBText.className = 'textgreen';
            CBText.textContent = ' CB';
            gsSpan.appendChild(CBText)
        }
        gsIDText.appendChild(gsSpan)
        pack1.appendChild(gsIDText)

        const pack2 = document.createElement('div');
        pack2.className = 'pack';
        container.appendChild(pack2);

        const statTexts = { "base": [], "bonus": [] }
        const stats = item.stats
        for (let statName in stats) {
            const stat = stats[statName]
            const statText = document.createElement('div');
            statText.className = "text" + getTextColor(stat.qual);
            statText.textContent = stat.value + " " + statName
            if (stat.type === "base") {
                statTexts["base"].push(statText)
            } else if (stat.type === "bonus") {
                statText.textContent = "+ " + statText.textContent + " " + stat.qual + "%"
                statTexts["bonus"].push(statText)
            }
        }

        for (let statType in statTexts) {
            let statTypeTexts = statTexts[statType]
            for (let statTypeText of statTypeTexts) {
                pack2.appendChild(statTypeText)
            }
        }


        const pack3 = document.createElement('div');
        pack3.className = 'pack';
        container.appendChild(pack3);

        const levelText = document.createElement('div');
        levelText.className = 'textgreen';
        levelText.textContent = 'Requires Lv. ' + item.level;
        pack3.appendChild(levelText);

        slotsContainer.appendChild(windowPanel)
        slotsContainer.style.zIndex = "10"

        // if (!document.querySelector(".copyitemBtnKEK")) {
        //     const copyBtn = document.createElement("div")
        //     copyBtn.className = "btn black textsecondary copyitemBtnKEK"
        //     copyBtn.textContent = "Copy"
        //     copyBtn.style.padding = "5px"
        //     copyBtn.style.top = "300px"
        //     copyBtn.style.position = "absolute"
        //     slotsContainer.append(copyBtn)
        //     slotsContainer.height = ""
        //     const widthToCapture = (parseInt(slotDescription.style.width.split("px")[0]) + 22) + "px"
        //     const heightToCapture = (parseInt(slotDescription.style.height.split("px")[0]) + 22) + "px"
        //     copyElementToClipboard(copyBtn, slotsContainer, heightToCapture, widthToCapture)
        // }
        return slotsContainer
    }
}

function generateCompareDescription(stat) {
    // Create the main container
    if (stat) {
        const mainUI = document.querySelector(".layout")
        let slotsContainer = document.querySelector('.slotsContainerKEK');
        if (!slotsContainer) {
            slotsContainer = document.createElement("div")
            slotsContainer.classList.add("slotsContainerKEK")
            slotsContainer.classList.add("l-ui")
            slotsContainer.style.position = "absolute"
            slotsContainer.style.display = 'flex';
            slotsContainer.style.top = "130px"
            slotsContainer.style.left = "120px"
            mainUI.appendChild(slotsContainer)
        }
        const slotContainer = document.createElement('div');
        slotContainer.className = 'slot';
        slotContainer.style.width = "230px"
        slotContainer.style.height = "290px"
        // Create the wrapper
        const wrapper = document.createElement('div');
        wrapper.className = 'wrapper';
        slotContainer.appendChild(wrapper);

        // Create the new_script_internal div
        const newScriptInternal = document.createElement('div');
        newScriptInternal.className = 'new_script_internal';
        wrapper.appendChild(newScriptInternal);

        // Create the slotdescription div
        const slotDescription = document.createElement('div');
        slotDescription.className = 'slotdescription svelte-18ojcpo border ' + getTextColor(stat.quality);
        slotDescription.style.width = "210px"
        slotDescription.style.opacity = "1"
        slotDescription.style.transition = 'opacity 1s ease-out';
        slotDescription.style.height = "270px"
        newScriptInternal.appendChild(slotDescription);

        // Create and set the content for various elements
        const container = document.createElement('div');
        container.className = 'container svelte-e3ao5j';
        container.style.padding = "1vh"
        slotDescription.appendChild(container);

        const pack1 = document.createElement('div');
        pack1.className = 'pack svelte-e3ao5j';
        container.appendChild(pack1);

        const slottitle = document.createElement('div');
        slottitle.className = 'slottitle svelte-e3ao5j ' + "text" + getTextColor(stat.quality);
        slottitle.textContent = "Stat Compare"

        pack1.appendChild(slottitle);

        const type = document.createElement('div');
        type.className = 'type svelte-e3ao5j ' + "textwhite";
        type.textContent = stat.type;

        pack1.appendChild(type);

        const pack2 = document.createElement('div');
        pack2.className = 'pack svelte-e3ao5j';
        container.appendChild(pack2);

        const statTexts = { "positive": [], "negative": [] }
        const ignoreStatList = ["quality", "type", "Strength", "Stamina", "Dexterity", "Intelligence", "Wisdom", "Luck"]
        for (let statName in stat) {
            if (ignoreStatList.includes(statName)) {
                continue;
            }
            let statVal = stat[statName]
            statVal = statVal.toFixed(2)
            const statText = document.createElement('div');
            statText.className = 'svelte-e3ao5j '

            if (statVal > 0) {
                statText.textContent = statVal + " " + statName
                statText.className += "textgreen"
                statText.textContent = "+ " + statText.textContent
                statTexts["positive"].push(statText)
            } else if (statVal < 0) {
                statVal = statVal * (-1)
                statText.textContent = statVal + " " + statName
                statText.className += "textred"
                statText.textContent = "- " + statText.textContent
                statTexts["negative"].push(statText)
            }
        }
        for (let statType in statTexts) {
            let statTypeTexts = statTexts[statType]
            for (let statTypeText of statTypeTexts) {
                pack2.appendChild(statTypeText)
            }
        }

        const pack3 = document.createElement('div');
        pack3.className = 'pack svelte-e3ao5j';
        container.appendChild(pack3);

        slotsContainer.appendChild(slotContainer)
        slotDescription.style.pointerEvents = 'auto';
        slotDescription.style.zIndex = "20"
        return slotContainer
    }
}

function generateItemsDescription(items) {
    let slotContainer = null
    for (let item of items) {
        slotContainer = generateItemDescription(item)
    }
    return slotContainer
}

function compareItems(item1, item2) {
    if (item1.type !== item2.type) {
        return -1
    }
    const stats = {
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
        "quality": 110,
        "type": item1.type
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
    const bloodlineStatTable = {
        0: { "Min Dmg": 0.3, "Max Dmg": 0.3, "HP Reg./5s": 0.3 },
        1: { "Min Dmg": 0.4, "Max Dmg": 0.4 },
        2: { "Min Dmg": 0.4, "Max Dmg": 0.4 },
        3: { "Min Dmg": 0.4, "Max Dmg": 0.4 },
    }
    const ufplayer = document.querySelector("#ufplayer")
    const imgUrl = ufplayer.querySelector("img").src
    const playerClass = getClass(imgUrl)
    const bloodlineStat = classStat[playerClass]
    let bloodlineStatBonus = bloodlineStatTable[playerClass]

    for (let stat in bloodlineStatBonus) {
        if (!statConversionTable[bloodlineStat][stat]) {
            statConversionTable[bloodlineStat][stat] = bloodlineStatBonus[stat]
        } else {
            statConversionTable[bloodlineStat][stat] += bloodlineStatBonus[stat]
        }
    }
    function makeStatsNegative(item) {
        if (item.isNegative) {
            return item
        }
        let itemStats = item["stats"]
        for (let statName in itemStats) {
            let statVal = itemStats[statName]["value"]
            if (statName === "Haste" || statName === "Critical" || statName === "Item Find" || statName === "Block") {
                statVal = Number(itemStats[statName]["value"].split("%")[0])
                itemStats[statName]["value"] = statVal * (-1) + "%"
            } else {
                itemStats[statName]["value"] = statVal * (-1)
            }
        }
        item["gs"] = item["gs"] * (-1)
        item["isNegative"] = true
        return item
    }
    item1 = makeStatsNegative(item1)
    // console.log(item1, item2)
    for (let item of [item1, item2]) {
        let itemStats = item["stats"]
        for (let statName in itemStats) {
            let statVal = itemStats[statName]["value"]
            if (statName === "Haste" || statName === "Critical" || statName === "Item Find" || statName === "Block") {
                statVal = Number(itemStats[statName]["value"].split("%")[0])
            }
            if (!stats[statName]) {
                stats[statName] = statVal
            } else {
                stats[statName] += statVal
            }
        }
        stats["Gear Score"] += item["gs"]
    }

    for (let statName in statConversionTable) {
        const bonusStats = statConversionTable[statName]
        for (let bonusStatName in bonusStats) {
            stats[bonusStatName] += bonusStats[bonusStatName] * stats[statName]
        }
    }
    // console.log(stats)
    const slotContainer = generateItemsDescription([item1, item2])
    generateCompareDescription(stats)
    return slotContainer
}

const parseAuxi = (str) => {
    let isMatch = false
    const regex = /(\d{8,})[a-zA-z' \n]*\s*(\+\d{1,2})?/g
    const ids = []
    const itemUpgradeTable = {}
    for (let match of str.matchAll(regex)) {
        isMatch = true
        const id = match[1]
        ids.push(id)

        let itemUpgradeValue
        // console.log(match[2])
        if (match[2] === undefined) {
            itemUpgradeValue = match[2]
        } else {
            itemUpgradeValue = match[2].split("+")[1]
        }
        itemUpgradeTable[id] = itemUpgradeValue
    }
    return {
        ids, itemUpgradeTable, isMatch
    }
}

const statObj = ['Strength', 'Stamina', 'Dexterity', 'Intelligence', 'Wisdom', 'Luck', 'HP', 'MP', 'HP Reg./5s', 'MP Reg./5s', 'Min Dmg', 'Max Dmg', 'Defense', 'Block', 'Critical', 'Move Spd', 'Haste', 'Atk Spd', 'Item Find', 'Bag Slots', 'Fame', 'Rating', 'Stat Points', 'Skill Points', 'Skill Points (Max)', 'Gear Score', 'PvP Level', '% Increased Dmg.', '% Increased Aggro Generation', '% Movement Spd. Reduction', 'Healing Reduction']

export {
    getItem,
    colorObj,
    getRarityOfItem,
    getTextColor,
    getItemUI,
    generateItemDescription,
    generateCompareDescription,
    generateItemsDescription,
    compareItems,
    statObj,
    parseAuxi,
    getHydratedItem,
    getHydratedItems
}