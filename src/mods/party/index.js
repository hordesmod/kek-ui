import eventManager from "../../core/event"
import chatArticleParser from "../../core/parsers/chatArticle"
import ui from "../../core/ui"

const _party = {
    name: "AParty",
    description: "Party frame enhancements",
    state: {
        fontSize: 14,
        isShortChannel: 1,
    },
    // style: `
    //     .channelselect .btn:nth-child(7) {
    //         margin-left: auto;
    //     }
    // `,
    settings: {
        fontSize: { control: "range", desc: "Font Size", comment: "Default: 14", min: 12, max: 24, onupdate: "updateFrame" },
        isShortChannel: { control: "checkbox", desc: "Shorten channel names", comment: "Condense channel names to single letter", onupdate: "updateFrame" },
    },
    start() {
        eventManager.on("ui.partyframes", this.uiHook, this)
    },
    stop() {
    },
    uiHook() {
        this.updateFrame()
    },
    updateFrame() {
        const frame = ui.partyframes.element
        // console.log(ui)
        // frame.style.background = `rgb(0 0 0 / ${this.state.chatDark}%)`
        frame.style.fontSize = `${this.state.fontSize}px`
        // chat.parentNode.style.maxHeight = "100%"
        // chat.parentNode.style.width = `${this.state.chatWidth}px`
        // chat.parentNode.style.height = `${this.state.chatHeight}px`
    },
}

export default _party



