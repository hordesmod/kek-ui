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

export default parseAuxi