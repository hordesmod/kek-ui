import eventManager from "../../core/event"
import log from "../../core/logger"
import profileManager from "../../core/profile"
import ui from "../../core/ui"
import element from "../../core/widgets/element"
import createTable from "./table"

const friendsInfo = {
    name: "Social Tweaks",
    description: "Shows the number of friends online.",
    style: `
        th, td {
            max-width: unset;
        }
        td.selected {
            background-color: #f5c24733
        }
        td.selected:nth-child(odd) {
            background-color: #f5c24740;
        }
    `,
    start() {
        if (ui?.partyBtnbar?.element) {
            this.addBtn(ui.partyBtnbar.element)
        }

        this.interval = setInterval(this.updateFrame.bind(this), 60000)

        eventManager.on("ui.partyBtnbar", this.addBtn, this)
        eventManager.on("ui.socialParent", this.socialHandler, this)
    },
    stop() {
        if (ui.partyBtnbar.element) {
            ui.partyBtnbar.element.removeChild(this.btn.element)
        }

        clearInterval(this.intervalId)
        eventManager.off("ui.partyBtnbar", this.addBtn, this)
        eventManager.off("ui.socialParent", this.socialHandler, this)
    },
    addBtn(partyBtnbar) {
        partyBtnbar = partyBtnbar.element
        const btnName = element("span").css("textexp").text("Friends: ")
        this.btnVg = element("span").css("textf0").text("0")
        const btnImg = element("span").css("textsecondary").text(" 👤 ")
        this.btnBl = element("span").css("textf1").text("0")

        this.btn = element("div").css("btn border black")
            .on("pointerenter", this.showFrame.bind(this))
            .on("pointerleave", this.removeFrameDelay.bind(this))
            .add(btnName)
            .add(this.btnVg)
            .add(btnImg)
            .add(this.btnBl)

        partyBtnbar.appendChild(this.btn.element)
        this.updateFrame()
    },
    toggleFrame() {
        if (ui.socialParent.onScreen) {
            this.removeFrame()
        }
        else {
            this.showFrame()
        }
    },
    socialHandler(socialParent) {
        log(socialParent.element)
        if (this.inUse) {
            const pos = this.btn.getPos()

            const socialElement = socialParent.element
            socialElement.style.position = "fixed"
            socialElement.style.top = pos.bottom + 1 + "px"
            socialElement.style.left = pos.left + 1 + "px"
            socialElement.children[0].children[0].style.display = "none"
            socialElement.children[0].style.padding = "5px"

            socialElement.addEventListener("pointerenter", () => clearTimeout(this.frameTimer))
            socialElement.addEventListener("pointerleave", this.removeFrameDelay.bind(this))
            socialElement.addEventListener("contextmenu", this.showFrame.bind(this))
            
        }
    },
    showFrame() {
        clearTimeout(this.frameTimer)
        if (!ui.socialParent.onScreen) {
            ui.syssocial.element.click()
            this.inUse = 1
        }
    },
    removeFrameDelay() {
        this.frameTimer = ui.socialParent.onScreen && setTimeout(this.removeFrame.bind(this), 100)
    },
    removeFrame() {
        ui.socialParent.onScreen && ui.syssocial.element.click()
        clearTimeout(this.frameTimer)
        this.inUse = 0
    },
    async updateFrame() {
        const { friends } = await this.loadData()

        log(friends)

    },
    async loadData() {
        this.last_time = new Date()
        const data = await fetch("/api/social/getFriends", { method: "POST", body: "{}" }).then(r => r.json()).then(d => d)
        return data
    },

}

export default friendsInfo