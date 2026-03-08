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
    toggle() {
        this.state.enabled = !this.state.enabled
    },
    start() {
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
    stop() {
        eventManager.off("click.mouseOver", this.toggle, this)
    },
}

export default mouseOver