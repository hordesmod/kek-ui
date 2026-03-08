import eventManager from "../../core/event"
import log from "../../core/logger"
import ui from "../../core/ui"
import element from "../../core/widgets/element"
import frame from "../../core/widgets/frame"

const debugInfo = {
    name: "_DEBUG INFO_",
    description: "_THIS CONTENT IS NOT INTENDED FOR VIEWING_",
    style: `
        .dbg.data {
            height: 400px;
        }
        .dbg.select {
            margin-bottom: 50px;
        }
    `,
    start() {
        if (ui?.partyBtnbar?.element) {
            this.addBtn(ui.partyBtnbar.element)
        }
        eventManager.on("ui.partyBtnbar", this.addBtn, this)
        this.createFrame()
    },
    stop() {
        if (ui.partyBtnbar.element) {
            ui.partyBtnbar.element.removeChild(this.btn.element)
        }
        eventManager.off("ui.partyBtnbar", this.addBtn, this)
        this.createFrame()
    },
    addBtn(partyBtnbar) {
        partyBtnbar = partyBtnbar.element
        this.btnLabel = element("span").css("textexp").text("DISABLE devMode!")

        this.btn = element("div").css("btn border black textgrey")
            .on("click", this.toggleFrame.bind(this))
            .add(this.btnLabel)

        partyBtnbar.appendChild(this.btn.element)
    },
    toggleFrame() {
        this.frame.isOn ? this.removeFrame() : this.showFrame()
    },
    createFrame() {
        this.frame = frame({ title: "DEBUG", y: 10 })
        const frameSelect = element("div").css("dbg select")
        const select = element("select").css("btn grey").on("change", () => {
            this.updateFrame(select.element.value)
        })
        frameSelect.add(select)
        const coreModules = ["ui", "style"]
        for (const coreModule of coreModules) {
            const option = element("option").attr("value", coreModule).text(coreModule)
            select.add(option)
        }

        this.frameData = element("div").css("dbg data")
        this.frame.slot.add(frameSelect)
        this.frame.slot.add(this.frameData)
    },
    showFrame() {
        this.frame.show()
        this.updateFrame()
    },
    removeFrame() {
        this.frame.remove()
    },
    updateFrame(moduleName = "ui") {
        this.frameData.clear()
        if (moduleName == "ui") {
            for (const [objName, obj] of Object.entries(ui)) {
                // log(obj)
                const field = element("div").text(objName)
                    .on("mouseenter", () => {
                        field.toggle("textgreen")
                        if (obj.element) {
                            obj.element.style.outline = "5px solid red"
                            obj.element.style.filter = "contrast(0.5)"
                        }
                    })
                    .on("mouseleave", () => {
                        field.toggle("textgreen")
                        if (obj.element) {
                            obj.element.style.outline = ""
                            obj.element.style.filter = ""
                        }
                    })
                this.frameData.add(field)
            }
        }
        else if (moduleName == "style") {

        }
    }
}

export default debugInfo