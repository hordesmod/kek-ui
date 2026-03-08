import statNames from "../data/statNames"
import log from "../logger"

const slotDescriptionParser = (slot) => {
    const container = slot.children[0]
    const packTitle = container.children[0]
    const slottitle = packTitle.children[0]
    const name = slottitle.childNodes[1].textContent
    const upgradeText = slottitle.childNodes[2].textContent
    let upgrade = 0
    if (upgradeText && upgradeText.length > 2) {
        upgrade = parseFloat(upgradeText.slice(2))
    }
    const slotType = packTitle.children[1]
    const rarity = slotType.childNodes[0].textContent
    const type = slotType.childNodes[2].textContent
    const qualityText = slotType.childNodes[4].textContent
    let quality = 0
    if (qualityText && qualityText.length > 1) {
        quality = parseFloat(qualityText.slice(0, -1))
    }
    const slotGsId = packTitle.children[2]
    let gs, id
    if (slotGsId.childNodes.length === 2) {
        gs = 0
        id = parseFloat(slotGsId.children[0].childNodes[1].textContent)
    } else {
        gs = parseFloat(slotGsId.children[0].childNodes[1].textContent)
        id = parseFloat(slotGsId.children[1].childNodes[1].textContent)
    }
    const stats = Array(statNames.length).fill(0)
    if (type !== "misc" && type !== "charm") {
        const packStats = container.children[1]
        for (let i = 0; i < packStats.children.length; i++) {
            const statElement = packStats.children[i]
            let statType = statElement.children.length === 3 && statElement.childNodes[4].textContent || statElement.childNodes[3].textContent

            if (statType === "Damage") { // min-max damage
                const statIndex = statNames.indexOf("Min Dmg.")
                stats[statIndex] = parseFloat(statElement.childNodes[0].textContent)
                stats[statIndex + 1] = parseFloat(statElement.childNodes[2].textContent)
            } else {
                const statIndex = statNames.indexOf(statType)
                if (statIndex !== -1) {
                    let statValue = statElement.childNodes[1].textContent
                    if (statValue.endsWith("%")) {
                        statValue = statValue.slice(0, -1)
                    }
                    stats[statIndex] = parseFloat(statValue)
                }
            }

        }
    }
    const packGold = container.children[3]
    const goldText = packGold.textContent.replace(/\s+/g, "")
    const gold = parseFloat(goldText)
    return {
        name,
        upgrade,
        quality,
        rarity,
        type,
        gs,
        id,
        stats,
        gold,
    }
}

export default slotDescriptionParser

