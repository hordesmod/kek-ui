import eventManager from "../core/event"

const speculatePrestige = {
    name: "Speculate Prestige",
    start() {
        eventManager.on("ui.pvpParent", this.handle, this)
    },
    stop() {
        eventManager.off("ui.pvpParent", this.handle, this)
    },
    handle(pvpParent) {
        pvpParent = pvpParent.element
        setTimeout(() => {
            const allStatDivs = pvpParent.querySelectorAll(".stats.marg-top")
            const prestigeDiv = allStatDivs[0]
            if (prestigeDiv) {
                let currentPrestige = prestigeDiv.querySelector(".statnumber").textContent.split(" ")[1]
                currentPrestige = Math.round(parseInt(currentPrestige.split(",").join("")))
                const speculatedSpan = document.createElement("span")
                speculatedSpan.classList.add("textcyan")
                speculatedSpan.textContent = "Speculated Prestige"

                const valueSpan = document.createElement("span")
                valueSpan.className = "textprestige statnumber"
                const prestigeIcon = document.createElement("img")
                prestigeIcon.className = "svgicon"
                prestigeIcon.src = "/data/ui/currency/prestige.svg?v=85891049"

                prestigeDiv.insertBefore(valueSpan, prestigeDiv.firstChild)
                prestigeDiv.insertBefore(speculatedSpan, prestigeDiv.firstChild)
                // console.log(prestigeDiv)

                const thisWeekDiv = allStatDivs[2]
                const thisWeekStats = thisWeekDiv.querySelectorAll(".statnumber")
                const bracket = parseInt(thisWeekStats[thisWeekStats.length - 1].textContent.split(" ")[0])
                const speculatedPrestige = Math.round(this.getPrestige(currentPrestige, bracket)).toLocaleString()

                valueSpan.innerHTML = prestigeIcon.outerHTML + speculatedPrestige
            } else {

            }
        }, 1)
    },
    getPrestige(prestige, bracket) {
        const prestigeBracket = [
            0, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000, 11000, 12000,
            13000, 14000
        ]
        prestige = 0.8 * prestige + prestigeBracket[bracket]

        return prestige

    }
}

export default speculatePrestige