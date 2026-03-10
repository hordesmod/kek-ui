// IMPORTANT: This module strictly follows 1:1 input mapping:
// Each player action (keypress) triggers exactly one click on the hovered target.
// No actions are automated; hovering only stores the target for the next keypress.
import eventManager from "../core/event";

const mouseOver = {
    name: "Mouse Over",
    description: "Party target selection with strict 1:1 input mapping",
    state: {
        enabled: false
    },
    hovered: null,
    start() {
        eventManager.on("ui.sysbtnbar", this.addBtn, this)
    },
    stop() {
        eventManager.off("ui.sysbtnbar", this.addBtn, this)
        this.btn = this.btn.remove()
    },
    toggle() {
        this.state.enabled = !this.state.enabled
    },
    btn: 0,
    change: 0,
    addBtn(sysbtnbar) {
        this.btn = element("div")
            .css("btn border black textgrey")
            .style({
                paddingLeft: "3px",
                paddingRight: "3px",
                margin: "2px"
            })
            .text("Mo")
            .on("click", this.toggleBtn.bind(this))
        this.btn.element.tooltip = "Mouse over mode"

        addSysbtn(sysbtnbar.element, this.btn.element)
        // partyBtnbar.element.appendChild(this.btn.element)
    },
    toggleBtn() {
        this.btn.toggle("textred").toggle("textgrey")
        this.change ^= 1
        this.toggleMode()
    },

    toggleMode2(){
        document.addEventListener("mouseover", (e) => {
            if (!this.state.enabled) return
            const t = e.target.closest(".bghealth, .left, .right")
            if (t) this.hovered = t
        })
        document.addEventListener("keydown", (e) => {
            if (!this.state.enabled || !this.hovered) return
            e.preventDefault()
            this.hovered.click()
        })
        eventManager.on("click.mouseOver", this.toggle, this)
    },
}

export default mouseOver