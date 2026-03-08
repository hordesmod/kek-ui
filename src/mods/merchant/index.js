import { CoreItem } from "../../client"
import eventManager from "../../core/event"
import log from "../../core/logger"
import element from "../../core/widgets/element"

const merchant = {
    name: "Merchant Filters",
    description: "For those who asked",
    style: `
        .kekant {
            grid-area: ff;
            padding: 8px 5px 16px;
            display: grid;
            grid-template-columns: 4fr 1fr;
        }
    `,
    start() {
        eventManager.on("ui.merchantParent", this.merchantHandler, this)
        eventManager.on("uiclose.merchantParent", this.merchantDestruct, this)
    },
    stop() {
        eventManager.off("ui.merchantParent", this.merchantHandler, this)
        eventManager.off("uiclose.merchantParent", this.merchantDestruct, this)
    },
    merchantHandler(merchantParent) {
        const originalFetch = window.fetch
        window.fetch = (input, init) =>
            originalFetch(input, init).then(response =>
                new Promise((resolve) => {
                    if (input.endsWith("getAuction")) {
                        this.list = JSON.parse(init.body).ids
                        response.clone().json().then(json => {
                            this.transform(json)
                            resolve(response)
                        })
                    } else {
                        resolve(response)
                    }
                })
            )
        this.originalFetch = originalFetch
        this.inject(merchantParent.element)
    },
    merchantDestruct() {
        this.qualityFilter = 0
        window.fetch = this.originalFetch
    },
    stats: ["Strength", "Stamina", "Dexterity", "Intelligence", "Wisdom", "Luck", "HP", "MP",
        "HP Reg./5s", "MP Reg./5s", "Min Dmg.", "Max Dmg.", "Defense", "Block", "Critical", "Move Spd.",
        "Haste", "Attack Spd.", "Item Find", "Bag Slots"],
    inject(merchant) {
        this.merchantList = merchant.querySelector(".buytable").children[1]

        const layout = merchant.querySelector(".layout")
        layout.style.gridTemplate = "'s s s' auto 'c i ff' auto 'p p p' auto/1fr 5fr 150px"
        layout.style.width = "880px"

        const filtersFrame = element("section").css("choices border grey scrollbar kekant")
        const title = element("div").css("textprimary").text("Filters:").style({ gridColumn: "span 2" })
        const space = element("div").style({ gridColumn: "span 2" })
        filtersFrame.add(title).add(space)

        this.filters = Array(this.stats.length).fill(0)
        for (const stat of ["Strength", "Intelligence", "Dexterity", "Wisdom", null, "Critical", "Haste", null, "Min Dmg.", "Max Dmg.", null, "Stamina", "Defense", "Block"]) {
            const filter = element("div").text(stat)
            const checkbox = stat && element("div").css("btn checkbox").on("click", () => {
                checkbox.toggle("active")
                const statIdx = this.stats.indexOf(stat)
                this.filters[statIdx] ^= 1
                this.filter()
            }) || element("div")
            filtersFrame.add(filter).add(checkbox)
        }
        filtersFrame.add(element("div")).add(element("div"))
        filtersFrame.add(element("div").css("textprimary").text("Quality")).add(element("div"))
        const qualities = {
            "Common": { color: "white", value: 0 },
            "Uncommon": { color: "green", value: 50 },
            "Rare": { color: "blue", value: 70 },
            "Epic": { color: "purp", value: 90 },
            "99+": { color: "orange", value: 99 },
        }
        const qualitySelect = element("select").css("btn grey").style({ gridColumn: "span 2", height: "30px" }).on("change", e => {
            this.qualityFilter = e.target.value
            this.filter()
        })
        for (const [quality, obj] of Object.entries(qualities)) {
            const qualityOption = element("option").css(`text${obj.color}`).attr("value", obj.value).text(quality)
            qualitySelect.add(qualityOption)
        }
        filtersFrame.add(qualitySelect)



        layout.appendChild(filtersFrame.element)
    },
    transform(items) {
        for (const obj of items) {
            const listIdx = this.list.indexOf(obj.id)
            if (["amulet", "armlet", "bag", "boot", "bow", "armor", "glove", "hammer", "orb", "quiver", "ring", "shield", "staff", "sword", "totem"].includes(obj.type)) {
                let coreItem = new CoreItem(obj.id)
                coreItem.hydrate(obj)
                this.list[listIdx] = coreItem
            }
            else {
                obj.auction = new Date(obj.auction)
                obj.stats = new Map
                this.list[listIdx] = obj
            }
        }
        this.waitForMerchantList().then(() => { this.filter() })
    },
    waitForMerchantList() {
        return new Promise((resolve) => {
            const intervalId = setInterval(() => {
                if (this.merchantList.children.length == this.list.length) {
                    clearInterval(intervalId)
                    resolve()
                }
            }, 100)
        })
    },
    filter() {
        for (let k = 0; k < this.merchantList.children.length; k++) {
            let show = true
            for (let index = 0; index < this.filters.length; index++) {
                if(this.list[k].quality < this.qualityFilter){
                    show = false
                    break
                }
                if ((this.filters[index] === 1 && !this.list[k].stats.has(index))) {
                    show = false
                    break
                }
                // log(this.list[k])
            }
            this.merchantList.children[k].style.display = show ? "" : "none"
        }
    }
}

window.mr = merchant

export default merchant