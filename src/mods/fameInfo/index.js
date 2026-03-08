import eventManager from "../../core/event"
import log from "../../core/logger"
import profileManager from "../../core/profile"
import ui from "../../core/ui"
import element from "../../core/widgets/element"
import createTable from "../../core/widgets/table"


const fameInfo = {
    name: "Fame Info",
    description: "Check your weekly fame brackets.",
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
    hotkey: {
        "Toggle fame info popup": { key: "]", callback: "toggleFrame" },
    },
    state: {
        isTitle: 0
    },
    settings: {
        isTitle: {
            control: "checkbox",
            desc: "Show Widget Title",
            comment: "show/hide title 'Fame:'",
            onupdate: "updateBtnTitle"
        },
    },
    start() {
        if (ui?.partyBtnbar?.element) {
            this.addBtn(ui.partyBtnbar.element)
        }

        eventManager.on("ui.partyBtnbar", this.addBtn, this)

        this.frame = element("div")
            .css("window panel-black")
            .on("mouseleave", this.removeFrameDelay.bind(this))
            .on("mouseover", () => clearTimeout(this.frameTimer))
    },
    stop() {
        if (ui.partyBtnbar.element) {
            ui.partyBtnbar.element.removeChild(this.btn.element)
        }

        eventManager.off("ui.partyBtnbar", this.addBtn, this)
    },
    addBtn(partyBtnbar) {
        partyBtnbar = partyBtnbar.element
        this.btnLabel = element("span").css("textexp").text(`${this.state.isTitle && "Fame: " || ""}`)
        this.btnFame = element("span").css("textfame").text("...")
        const btnFameImg = element("img").css("icon svelte-erbdzy").attr("src", "/data/ui/currency/fame.svg")

        this.btn = element("div").css("btn border black")
            .on("mouseover", this.showFrame.bind(this))
            .on("mouseleave", this.removeFrameDelay.bind(this))
            .on("click", this.execBtn)
            .add(this.btnLabel)
            .add(btnFameImg)
            .add(this.btnFame)

        partyBtnbar.appendChild(this.btn.element)
        this.updateFrame()
    },
    updateBtnTitle() {
        this.btnLabel.text(`${this.state.isTitle && "Fame: " || ""}`)
    },
    execBtn() {
        window.open("/leaderboards", "_blank")
    },
    toggleFrame(){
        const isFrameFound = Array.from(ui.mainContainer.element.children).some(child => child === this.frame.element)
        if(isFrameFound) {
            this.removeFrame()
        }
        else {
            this.showFrame()
        } 
    },
    showFrame() {
        clearTimeout(this.frameTimer)
        const rect = this.btn.element.getBoundingClientRect()
        this.frame.style({
            position: "fixed",
            top: rect.bottom + 1 + "px",
            left: rect.left + "px",
            // transform: "translate(-50%)",
            zIndex: 99,
        })
        ui.mainContainer.element.appendChild(this.frame.element)
        if (this.last_time && (new Date() - this.last_time) < 10000) return
        this.updateFrame()
    },
    removeFrameDelay() {
        const isFrameFound = Array.from(ui.mainContainer.element.children).some(child => child === this.frame.element)
        this.frameTimer = isFrameFound && setTimeout(this.removeFrame.bind(this), 100)
    },
    removeFrame() {
        clearTimeout(this.frameTimer)
        ui.mainContainer.element.removeChild(this.frame.element)
    },
    async updateFrame() {
        const [top, fameBrackets, playerinfo] = await this.loadData()

        const player = playerinfo.find(obj => obj.name === profileManager.playerName)
        const playerName = player.name.toLowerCase()
        const playerFaction = player.faction
        const playerFame = player.fame

        this.prestigeReseted = Math.floor(player.prestige * 0.8)
        this.curRank = Math.min(Math.floor(player.prestige / 4000), 12)

        const brackets = [...fameBrackets[playerFaction]].reverse()

        let hasPlayer = false
        let bracket
        let result = top
            .filter(obj => obj.faction === playerFaction)
            .map((obj, i) => {
                const isNameMatch = obj.name?.toLowerCase() === playerName
                const isFameMatch = brackets.includes(obj.fame)

                if (isFameMatch || isNameMatch) {
                    const bracketIndex = brackets.findIndex(value => value <= obj.fame)
                    bracket = bracketIndex !== -1 ? brackets.length - bracketIndex : -1
                    hasPlayer ||= isNameMatch
                    return { ...obj, top: i + 1, bracket, _selected: isNameMatch }
                }

                return null
            })
            .filter(Boolean)

        for (let i = 13 - bracket + 1; i < 13; i++) {
            const bracketFame = brackets[i]
            if (!hasPlayer && playerFame >= bracketFame) {
                hasPlayer = true
                result.push({ ...player, bracket: 13 - i, _selected: true })
            }
            result.push({
                fame: bracketFame,
                bracket: 13 - i,
                _selected: false
            })
        }

        !hasPlayer && result.push({ ...player, bracket: -1, _selected: true })


        const transform = this.transformArray(result)
        const table = createTable(transform, [7, 8])
        this.frame.clear().add(table.element)
        this.btnFame.text(playerFame.toLocaleString())

    },
    transformArray(array) {
        // const bonus = ["5 Movement Speed",
        //     "50 MP",
        //     "15% Item Find",
        //     "5 Min & Max Damage",
        //     "2 HP & MP Reg./5s",
        //     "5 Movement Speed",
        //     "30 HP",
        //     "15% Item Find",
        //     "5% Critical",
        //     "3% Haste",
        //     "30 HP",
        //     "5 Min & Max Damage"]

        return array.map(obj => {
            // log(obj)
            const nextPrestige = this.prestigeReseted + obj.bracket * 1000 + 1000
            const nextRank = Math.min(Math.floor(nextPrestige / 4000), 12)
            const nextRankColor = nextRank > this.curRank ? " textgreen" : nextRank < this.curRank ? " textred" : ""

            return {
                // "#": obj.name && i + 1 <= 10 ? i + 1 : "...",
                "#": obj.top || "...",
                "Clan": obj.clan && element("div").css("textcenter").text(obj.clan || "") || "",
                "Name": obj.name && element("div").css("textwhite")
                    .add(element("img").css("icon svelte-erbdzy").attr("src", `/data/ui/classes/${obj.pclass}.avif`))
                    .add(element("span").css("textwhite").text(obj.level + " "))
                    .add(element("span").css(`name textf${obj.faction} svelte-erbdzy`).text(obj.name)) || "",
                "GS": obj.gs && element("div").css("textcenter").text(obj.gs) || "",
                "Prestige": obj.prestige && element("div").css("textprestige textcenter")
                    .add(element("img").css("icon svelte-erbdzy").attr("src", "/data/ui/currency/prestige.svg"))
                    .add(element("span").text(obj.prestige.toLocaleString())) || "",
                "Fame": element("div").css("textfame textcenter")
                    .add(element("img").css("icon svelte-erbdzy").attr("src", "/data/ui/currency/fame.svg"))
                    .add(element("span").text(obj.fame.toLocaleString())),
                "Bracket": element("div").css("textcenter").text(obj.bracket),
                "Next P.": element("div").css("textprestige textcenter")
                    .add(element("img").css("icon svelte-erbdzy").attr("src", "/data/ui/currency/prestige.svg"))
                    .add(element("span").text(nextPrestige.toLocaleString())),
                "Next R.": element("div").css(`textcenter${nextRankColor}`).text(nextRank),
                "_selected": obj._selected
            }
        })
    },
    async loadData() {
        this.last_time = new Date()

        const req = [
            { method: "POST", url: "/api/playerinfo/search", data: { name: "", order: "fame", limit: 100, offset: 0 } },
            { method: "GET", url: "/api/pvp/getfactionpercentiles" },
            { method: "POST", url: "/api/playerinfo/search", data: { name: profileManager.playerName, order: "fame", limit: 100, offset: 0 } },
            // { method: "POST", url: "/api/playerinfo/search", data: { name: "scrizz", order: "fame", limit: 100, offset: 0 } },
        ]

        const promises = req.map(async (r) => {
            const response = await fetch(r.url, { method: r.method, body: r.data && JSON.stringify(r.data) })
            return response.json()
        })

        const results = await Promise.all(promises)

        return results
    },

}

export default fameInfo