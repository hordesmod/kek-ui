import eventManager from "../../core/event"
import ui from "../../core/ui"

const interaction = {
    name: "Interaction",
    description: "Skip interaction dialogs.",
    state: {
        skip: true,
        sage: true,
        ai: true,
    },
    settings: {
        skip: {
            control: "checkbox",
            desc: "Skip interaction dialogs",
            comment: "for Traders, Stash, Merchant, Blacksmith"
        },
        sage: {
            control: "checkbox",
            desc: "Skip reset stat points dialog",
            comment: "for Sage"
        },
        ai: {
            control: "checkbox",
            desc: "Open inventory on interaction",
            comment: "Interactive inventory? Brilliant move!"
        },
    },
    start() {
        eventManager.on("ui.interactParent", this.interact, this)
    },
    stop() {
        eventManager.off("ui.interactParent", this.interact, this)
    },
    interact(target) {
        target = target.element
        const nameElement = target.querySelector(".name")
        const name = nameElement ? nameElement.textContent.trim() : ""
        const btn = target.querySelector(".btn.textgreen")
        const skipNames = ["Stash", "Merchant", "Blacksmith", "Trader"]

        if (this.state.skip && (skipNames.includes(name) || skipNames.includes(name.split(" ")[1]))) {
            btn.click()

            this.state.ai && !document.contains(ui.bagParent.element) && ui.sysbag.element.click()

        } else if (this.state.sage && name === "Sage") {
            btn.click()
        }
    }


}

export default interaction