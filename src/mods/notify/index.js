import eventManager from "../../core/event"
import log from "../../core/logger"
import profileManager from "../../core/profile"
import soundManager from "../../core/sound"
import ui from "../../core/ui"

const notify = {
    name: "Notify",
    description: "Instant visual and auditory notifications.",
    state: {
        volume: 50,
        itemEquip: 0,
        chatGM: 0,
        chatParty: 0,
        chatClan: 0,
        chatPvP: 0,
    },
    settings: {
        volume: { control: "range", desc: "Notify Volume", comment: "Control notification sound intensity.", min: 0, max: 100, after: "playExample" },
        itemEquip: { control: "sound", desc: "Item Equip", comment: "For gear swapping", options: soundManager.getMelodies() },
        chatGM: { control: "sound", desc: "GM Talk", comment: "For GMs messages", options: soundManager.getMelodies() },
        chatParty: { control: "sound", desc: "Party Message", comment: "For new party messages", options: soundManager.getMelodies() },
        chatClan: { control: "sound", desc: "Clan Message", comment: "For new clan messages", options: soundManager.getMelodies() },
        chatPvP: { control: "sound", desc: "Killing Blow", comment: "For your kills", options: soundManager.getMelodies() },
    },
    start() {
        eventManager.on("ui.contextMenu", this.contextMenuHandler, this)
        eventManager.on("ui.chatArticle", this.chatArticleHandler, this)
        soundManager.setVolume(this.state.volume)
        this.playerName = profileManager.playerName
    },
    stop() {
        eventManager.off("ui.chatArticle", this.contextMenuHandler, this)
        eventManager.off("ui.chatArticle", this.chatArticleHandler, this)
    },
    playExample() {
        soundManager.setVolume(this.state.volume)
        soundManager.play()
    },
    chatArticleHandler(chatArticle) {
        const {channelType, text} = chatArticle.obj
        const {chatParty, chatPvP, chatClan, chatGM} = this.state
        
        chatParty && channelType == "party" && soundManager.play(chatParty)
        chatClan && channelType == "clan" && soundManager.play(chatClan)
        chatGM && channelType == "GM" && soundManager.play(chatGM)
        chatPvP && channelType == "pvp" && text.children[0].children[2].innerText === this.playerName && soundManager.play(chatParty)
    },

    contextMenuHandler(contextMenu) {
        for (const choice of contextMenu.element.children) {
            if (choice.innerText === "Equip item") {
                log(choice, choice.innerText)

                choice.addEventListener("pointerup", () => {
                    soundManager.play(this.state.itemEquip)
                })
            }
        }
    }


}

export default notify