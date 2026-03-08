import eventManager from "../../core/event"
import log from "../../core/logger"
import profileManager from "../../core/profile"
import ui from "../../core/ui"

const expbar = {
    name: "Expbar Tweaks",
    description: "Hide experience bar",
    state: {
        lvl: false
    },
    settings: {
        lvl: { control: "checkbox", desc: "Hide for Level 45", comment: "Don't show expbar for 45 level.", onupdate: "handle"},
    },
    start() {
        eventManager.on("ui.expbar", this.handle, this)
        ui.expbar?.element && this.handle()
    },
    stop() {
        log(stop)
        eventManager.off("ui.expbar", this.handle, this)
        ui.expbar.element.style.display = "block"
    },
    handle() {
        const shouldHideExpBar = profileManager.playerLevel === 45 && this.state.lvl
        ui.expbar.element.style.display = shouldHideExpBar ? "none" : "block"
    },
}

export default expbar