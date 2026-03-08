import eventManager from "../../core/event"
import element from "../../core/widgets/element"
import { addSysbtn } from "../../core/widgets/btnbar"

const MinimalUI = {
    name: "Minimal UI",
    description: "UI mode that hides the beauty",
    state: {
        hideFPS: 0,
    },
    settings: {
        hideFPS: { control: "checkbox", desc: "Hide FPS panel", onupdate: "toggleSetting" },
    },
    start() {
        eventManager.on("ui.sysbtnbar", this.addBtn, this)
    },
    stop() {
        eventManager.off("ui.sysbtnbar", this.addBtn, this)
        this.btn = this.btn.remove()
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
            .text("μUI")
            .on("click", this.toggleBtn.bind(this))
        this.btn.element.tooltip = "Minimal UI"

        addSysbtn(sysbtnbar.element, this.btn.element)
        // partyBtnbar.element.appendChild(this.btn.element)
    },
    toggleBtn() {
        this.btn.toggle("textred").toggle("textgrey")
        this.change ^= 1
        this.toggleSetting()
    },
    toggleSetting() {
        const tl = document.querySelector(".l-corner-ul.uiscaled")
        const bl = document.querySelector(".l-corner-ll.container.uiscaled")
        const cl = document.querySelector(".chatlog.container.uiscaled")
        const canvas = document.querySelectorAll(".l-canvas")[1]
        const ur = document.querySelector(".l-corner-ur.uiscaled")
        const bb = ur.querySelector(".btnbar")
        const bar = ur.querySelector(".bar")
        const mm = ur.querySelector(".minimapcontainer")

        if (this.change) {
            tl.style.display = "none"
            bl.style.display = "none"
            cl.style.display = "none"
            bb.style.display = "none"
            mm.style.display = "none"
            canvas.style.display = "none"
            if(this.state.hideFPS) {
                bar.style.display = "none"
            }
            else {
                bar.style.display = "flex"
                bar.style.gap = "15px"
            }

        }
        else {
            tl.style.display = ""
            bl.style.display = ""
            cl.style.display = ""
            bb.style.display = ""
            mm.style.display = ""
            canvas.style.display = ""
            bar.style.display = ""
            bar.style.gap = ""
        }
    },
}

export default MinimalUI