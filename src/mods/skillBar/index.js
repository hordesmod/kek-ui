import styleManager from "../../core/style"

const skillbar = {
    name: "Skillbar Tweaks",
    description: "Skillbar Tweaks",
    style: ".slot.svelte-ctcp9l img.svelte-ctcp9l {width: 100%; max-width: unset;}",
    state: {
        hideTooltips: false,
    },
    settings: {
        hideTooltips: { control: "checkbox", desc: "Hide tooltips", comment: "Don't show skills and items description.", onupdate: "update" },
    },
    start() {
        this.state.hideTooltips && styleManager.add("#skillbar .slotdescription {display: none;}")
    },
    stop() { },
    update() {
        styleManager.add(`#skillbar .slotdescription {display: ${this.state.hideTooltips && "none" || "block"};}`)
    },

}

export default skillbar