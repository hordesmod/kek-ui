import eventManager from "../core/event"
import ui from "../core/ui"

const itemWindow = {
    name: "Item Windows Tweaks",
    description: "Changes size and behaviour",
    state: {
        height: 20,
        width: 25,
        padding: 1,
    },
    settings: {
        height: { control: "range", min: 0, max: 50, step: 1, desc: "Height", comment: "Min Height of window", onupdate: "windowResize" },
        width: { control: "range", min: 0, max: 50, step: 1, desc: "Width", comment: "Min Width of window", onupdate: "windowResize" },
        padding: { control: "range", min: 0, max: 2, step: 0.1, desc: "Padding", comment: "Space between text and border", onupdate: "windowResize" },
    },
    crossBtn: null,
    frame: null,
    start() {
        eventManager.on("ui.itemParent", this.handle, this)
    },
    stop() {
        eventManager.off("ui.itemParent", this.handle, this)
    },
    windowResize() {
        const itemParent = ui.itemParent.element
        this.handle({element: itemParent})
    },
    handle(itemParent) {
        itemParent = itemParent.element
        this.frame = itemParent
        if(!itemParent) return
        const slot = itemParent.childNodes[0].children[1]
        const titleframe = itemParent.childNodes[0].children[0]
        this.crossBtn = titleframe.childNodes[titleframe.childNodes.length - 1]
        const panel = slot.childNodes[0]
        const container = panel.childNodes[0]

        panel.style.minWidth = this.state.width + "vh"
        panel.style.minHeight = this.state.height + "vh"

        container.style.padding = this.state.padding + "vh"
    }
}

export default itemWindow