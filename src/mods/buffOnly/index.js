import eventManager from "../../core/event"
import element from "../../core/widgets/element"
import ui from "../../core/ui"
import { addSysbtn } from "../../core/widgets/btnbar"

const buffOnly = {
    name: "Your Buffs Only",
    description: "Button for quick toggling \"Show your buffs only\"",
    start() {
        // eventManager.on("ui.partyBtnbar", this.addBtn, this)
        // if(ui.sysbtnbar) {
        //     if(!this.btn) {
        //         this.addBtn(ui.sysbtnbar)
        //     }
        // } 
        eventManager.on("ui.sysbtnbar", this.addBtn, this)
        eventManager.on("ui.settingsParent", this.toggleSetting, this)
        ui.partyBtnbar && this.addBtn(ui.partyBtnbar)
    },
    stop() {
        eventManager.off("ui.sysbtnbar", this.addBtn, this)
        // eventManager.off("ui.partyBtnbar", this.addBtn, this)
        this.btn = this.btn.remove()
    },
    btn: 0,
    change: 0,
    addBtn(sysbtnbar) {
        const status = localStorage.getItem("buffsHideIrrelevant") === "true"
        this.btn = element("div")
            .css(`btn border black text${status ? "green" : "grey"}`)
            .style({
                paddingLeft: "3px",
                paddingRight: "3px",
                margin: "2px"
            })
            .text("Buf")
            .on("click", this.toggleBtn.bind(this))
        this.btn.element.tooltip = "Show your buffs only"

        addSysbtn(sysbtnbar.element, this.btn.element)
        // partyBtnbar.element.appendChild(this.btn.element)
    },
    toggleBtn() {
        this.btn.toggle("textgreen").toggle("textgrey")
        this.change = 1
        if (!ui.settingsParent.onScreen) {
            ui.syscog.element.click()
        }
        else {
            this.toggleSetting()
        }
    },
    toggleSetting() {
        if (this.change) {
            ui.settingsParent.element.children[0].children[1].children[0].children[0].children[0].click() //kek
            ui.settingsParent.element.children[0].children[1].children[0].children[1].children[1].children[61].click() //kek^2
            ui.syscog.element.click()
            this.change = 0
        }
    },
}

export default buffOnly