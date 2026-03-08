import eventManager from "../../core/event"
import log from "../../core/logger"
import element from "../../core/widgets/element"

const clanInfo = {
    name: "Clan Tweaks",
    description: "Extended clanmates info tab.",
    state: {
        clanmates: [],
        nextPrestigeCheck: 0,
        biggerWindow: 0,
        coloredNames: 1,
    },
    style: `
        .icon.kek {
            height: 1.1em;
            vertical-align: -0.23em;
        }
    `,
    _profiles: true,
    settings: {
        biggerWindow: { control: "checkbox", desc: "Bigger Window", comment: "Increase the size of the clan window" },
        coloredNames: { control: "checkbox", desc: "Info Tab Colored Names", onupdate: "updateTable" },
    },
    start() {
        eventManager.on("ui.clanParent", this.clanParentHandler, this)
    },
    stop() {
        eventManager.off("ui.clanParent", this.clanParentHandler, this)
    },
    clanParentHandler(clanParent) {
        const clanElement = clanParent.element
        const observer = new MutationObserver((mutations, observer) => {
            if (mutations.some(mutation => mutation.type === "childList")) {
                const childElement = clanElement.querySelector("tbody")
                if (childElement) {
                    observer.disconnect()
                    this.inject(clanParent)
                }
            }
        })
        observer.observe(clanElement, { childList: true, subtree: true })
    },
    inject(clanParent) {
        const clanElement = clanParent.element
        this.clanName = clanElement.querySelector("h1").textContent
        if (!this.clanName) return


        const container = clanElement.querySelector(".container")
        container.style.width = "800px"
        container.style.height = "800px"

        this.subnavElement = clanElement.querySelector(".subnav.marg-top")
        this.infoElement = clanElement.querySelector(".marg-top.textgrey")
        this.infoElement.classList.toggle("textcenter")
        this.infoElementText = this.infoElement.textContent
        this.tableElement = clanElement.querySelector("table")
        this.tbodyElement = this.tableElement.querySelector("tbody")

        this.clanFaction = clanElement.querySelector(".textf0") ? 0 : 1
        this.clanTotal = this.tbodyElement.children.length

        this.frame = element("table").css("marg-top panel-black").style({ padding: "8px", display: "none" })
            .on("click", e => {
                const target = e.target
                const parent = target.parentNode
                if (e.target.tagName == "TH") {
                    const targetIndex = Array.prototype.indexOf.call(parent.children, target)
                    this.updateTable(targetIndex)
                }
                if (e.target.tagName == "TD") {
                    this.loadPlayer(parent.children[2].innerText)
                }
            })
        this.infoElement.insertAdjacentElement("afterend", this.frame.element)

        this.btn = element("div")
            .css("btn navbtn grey")
            .style({ marginLeft: "auto" })
            .text("Extended Info")
            .on("click", this.toggleFrame.bind(this))
        this.subnavElement.appendChild(this.btn.element)
    },
    getNextWednesdayMidnightUTC() {
        const now = new Date()
        const nextWednesday = new Date(now.getTime() + (10 - now.getUTCDay()) % 7 * 24 * 60 * 60 * 1000)
        nextWednesday.setUTCHours(0, 0, 0, 0)
        return nextWednesday.getTime()
    },
    ranks: ["Owner", "Officer", "Assistant", "Member"],
    toggleFrame() {
        if (this.frame.element.style.display === "none") {
            
            this.infoElement.innerText = "Row Click - Updates the record. Header Click - Sorts the table."
            this.frame.element.style.display = ""
            this.tableElement.style.display = "none"

            // add new and update ranks
            for (const row of this.tbodyElement.children) {
                const name = row.children[0].children[1].textContent
                const level = row.children[0].children[0].textContent
                const pclass = row.children[0].children[0].children[0].attributes.src.nodeValue[17]
                const rank = this.ranks.indexOf(row.children[1].textContent)

                const foundIndex = this.state.clanmates.findIndex(obj => obj.name === name)
                if (foundIndex !== -1) {
                    this.state.clanmates[foundIndex] = {
                        ...this.state.clanmates[foundIndex],
                        rank: rank,
                    }
                }
                else {
                    this.state.clanmates.push({
                        name,
                        rank,
                        pclass,
                        level,
                        prestige: 0,
                        fame: 0,
                        elo: 0,
                        gs: 0,
                        upd: 0
                    })
                }

            }
            // remove kicked
            this.state.clanmates = this.state.clanmates.filter(clanmate => {
                return Array.from(this.tbodyElement.children).some(row => {
                    const name = row.children[0].children[1].textContent
                    return clanmate.name === name
                })
            })

            if (new Date().getTime() > this.state.nextPrestigeCheck) {
                // if (true) {
                this.infoElement.innerText = "Loading Prestige Data...."
                this.loadPrestige()
            }
            else {
                this.updateTable()
            }
        }
        else {
            // this.infoElement =  this.infoElementText
            this.frame.element.style.display = "none"
            this.tableElement.style.display = ""

        }
    },
    async updateInfo(clanmates) {
        for (const clanmate of clanmates) {
            const foundIndex = this.state.clanmates.findIndex(obj => obj.name === clanmate.name)
            if (foundIndex !== -1) {
                this.state.clanmates[foundIndex] = {
                    ...this.state.clanmates[foundIndex],
                    name: clanmate.name,
                    pclass: clanmate.pclass,
                    level: clanmate.level,
                    prestige: clanmate.prestige,
                    gs: clanmate.gs,
                    fame: clanmate.fame,
                    elo: clanmate.elo,
                    upd: 1
                }
            }
        }
        this.updateTable()
    },
    updateTable(sort = 5) {
        this.frame.clear()
        const thead = element("thead")
        const tr = element("tr").css("textprimary")
        this.tbody = element("tbody")
        thead.add(tr)
        this.frame.add(thead).add(this.tbody)

        const thClass = element("th").text(`${sort == 0 && "🠗 " || ""}Cl.`).attr("width", "5%")
        const thLevel = element("th").text(`${sort == 1 && "🠗 " || ""}Lvl.`).attr("width", "5%")
        const thMember = element("th").text(`${sort == 2 && "🠗 " || ""}Member`)//.attr("width", "30%")
        const thRank = element("th").css("textcenter").text(`${sort == 3 && "🠗 " || ""}Rank`)//.attr("width", "30%")
        const thGs = element("th").css("textcenter").text(`${sort == 4 && "🠗 " || ""}GS`).attr("width", "10%")
        const thPrestige = element("th").css("textcenter").text(`${sort == 5 && "🠗 " || ""}Prestige`)//.attr("width", "10%")
        const thElo = element("th").css("textcenter").text(`${sort == 6 && "🠗 " || ""}Arena`)//.attr("width", "10%")
        const thFame = element("th").css("textcenter").text(`${sort == 7 && "🠗 " || ""}Fame`)//.attr("width", "10%")
        tr.add(thClass).add(thLevel).add(thMember).add(thRank).add(thGs).add(thPrestige).add(thElo).add(thFame)

        const sortingCriteria = [
            (a, b) => a.pclass - b.pclass,
            (a, b) => b.level - a.level,
            (a, b) => a.name.localeCompare(b.name),
            (a, b) => a.rank - b.rank,
            (a, b) => b.gs - a.gs,
            (a, b) => b.prestige - a.prestige,
            (a, b) => b.elo - a.elo,
            (a, b) => b.fame - a.fame
        ]

        this.state.clanmates.sort(sortingCriteria[sort])

        for (const clanmate of this.state.clanmates) {
            const tr = element("tr").css("striped")

            // const name = element("td").css(`textc${clanmate.pclass}`).text(clanmate.name)

            const pclass = element("td").css("textcenter")
                .add(element("img").css("icon kek").attr("src", `/data/ui/classes/${clanmate.pclass}.avif`))

            const level = element("td").css("textwhite").text(clanmate.level)

            const name = element("td").css(`name ${this.state.coloredNames ? `textc${clanmate.pclass}` : `textf${this.clanFaction}`}`).text(clanmate.name)

            const rank = element("td").css("textcenter textwhite").text(this.ranks[clanmate.rank])

            const gs = element("td").css("textcenter").text(clanmate.gs.toLocaleString())

            const prestige = element("td").css("textprestige textcenter")
                .add(element("img").css("icon kek").attr("src", "/data/ui/currency/prestige.svg"))
                .add(element("span").text(clanmate.prestige.toLocaleString())) || ""

            const elo = element("td").css("textcenter").text(clanmate.elo.toLocaleString())

            const fame = element("td").css("textfame textcenter")
                .add(element("img").css("icon kek").attr("src", "/data/ui/currency/fame.svg"))
                .add(element("span").text(clanmate.fame.toLocaleString()))

            tr.add(pclass).add(level).add(name).add(rank).add(gs).add(prestige).add(elo).add(fame)
            this.tbody.add(tr)
        }
    },
    async loadPlayer(name) {
        const clanmates = await fetch("/api/playerinfo/search", { method: "POST", body: JSON.stringify({ name, order: "prestige", limit: 100, offset: 0 }) })
            .then(r => r.json())

        for (const clanmate of clanmates) {
            if (clanmate.name === name) {
                this.updateInfo([clanmate])
            }
        }
    },
    async loadPrestige() {
        const req = []
        const limit = 100
        const totalOffsets = 10
        for (let i = 0; i < totalOffsets; i++) {
            req.push({ method: "POST", url: "/api/playerinfo/search", data: { name: "", order: "prestige", limit: limit, offset: i * limit } })
        }
        const promises = req.map(async (r) => {
            const response = await fetch(r.url, { method: r.method, body: r.data && JSON.stringify(r.data) })
            return response.json()
        })
        const results = await Promise.all(promises)
        const topPage = [].concat(...results)
        const clanmates = topPage.filter(obj => obj.clan === this.clanName)

        this.state.nextPrestigeCheck = this.getNextWednesdayMidnightUTC()

        this.updateInfo(clanmates)
    },

}
window.ci = clanInfo
export default clanInfo