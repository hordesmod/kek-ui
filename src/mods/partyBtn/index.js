import eventManager from "../../core/event"
import log from "../../core/logger"
import ui from "../../core/ui"
import element from "../../core/widgets/element"

const partyBtnTweaks = {
    name: "Party Button Tweaks",
    description: "Party button appearance and functionality",
    state: {
        isBlack: 1,
        isAuto: 0,
    },
    settings: {
        isBlack: { control: "checkbox", desc: "Black Color", comment: "Change the color of the party button.", onupdate: "handle" },
        isAuto: { control: "checkbox", desc: "Auto Controls", comment: "Mouse Left: Create/Leave, Right: Menu.", onupdate: "handle" },
    },
    start() {
        eventManager.on("ui.partybtn", this.handle, this)
        // eventManager.on("ui.context", this.contextMenu, this)
    },
    stop() {
        eventManager.off("ui.partybtn", this.handle, this)
        // eventManager.off("ui.context", this.contextMenu, this)
    },
    handle() {
        // log(partybtn,  ui.partybtn.element, this.state.isBlack)
        const btn = ui.partybtn.element
        btn.innerText = "Party"
        this.state.isBlack
            ? (btn.classList.add("black"), btn.classList.add("textparty"))
            : (btn.classList.remove("black"), btn.classList.remove("textparty"))

        this.state.isAuto
            ? (btn.addEventListener("mouseup", this.control.bind(this)), eventManager.on("ui.contextMenu", this.contextMenu, this))
            : (btn.removeEventListener("mouseup", this.control.bind(this), eventManager.off("ui.contextMenu", this.contextMenu, this)))

    },
    autoAction: -1,
    control(event) {
        if (event.button === 0) {
            this.autoAction = 0
        } else if (event.button === 2) {
            this.autoAction = 2
            event.target.click()
        }
    },
    contextMenu(contextMenu) {
        log(this.autoAction)
        if (this.autoAction < 0) return
        if (this.autoAction === 0) {
            for (const act of contextMenu.element.children) {
                ["Create Party", "Leave Party"].includes(act.innerText) && act.dispatchEvent(new MouseEvent("mouseup", { bubbles: true, cancelable: true, view: window }))
            }
            this.autoAction = -1
        }
        // else if (this.autoAction === 2) {
        //     for (const act of contextMenu.element.children) {
        //         if ("Leave Party" === act.innerText) {
        //             let leader = 0
        //             ui.ufplayer.element.childNodes.forEach(e => e.nodeType === 1 && e.children[1]?.attributes.src?.nodeValue.substring(15, 20) == "star." && (leader = 1))
        //             if (leader) {
        //                 let leaders = 0
        //                 ui.partyframes.element.childNodes.forEach(e => e.nodeType === 1 && e.children[1]?.children[1]?.attributes.src.nodeValue.substring(15, 20) == "star." && (leaders += 1))
        //                 if (leaders === 1) {
        //                     const option = element("div").css("choice textred").text("Disband Party!").on("pointerup", this.disbandParty.bind(this))
        //                     contextMenu.element.appendChild(option.element)
        //                 }
        //             }
        //         }
        //     }
        //     this.autoAction = -1
        // }
        this.autoAction = -1
    },
    disbandParty() {
        this.autoAction = 99
        ui.partyframes.element.childNodes.forEach(e => {
            if (e.nodeType === 1 && e.children[1]?.children[1]?.attributes.src.nodeValue.substring(15, 20) != "star.") {
                e.children[1]?.children[0]?.children[0].children[0].dispatchEvent(new MouseEvent("contextmenu", { bubbles: true, cancelable: true, view: window }))
                for (const act of ui.contextMenu.element.children) {
                    log(act.innerText)
                    act.innerText === "Party kick" && act.dispatchEvent(new MouseEvent("mouseup", { bubbles: true, cancelable: true, view: window }))
                }
            }
        })
    }
}

export default partyBtnTweaks