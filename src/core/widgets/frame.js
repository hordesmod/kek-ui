import log from "../logger";
import ui from "../ui";
import element from "./element";

const frame = (options) => new Frame(options)

class Frame {
    constructor(options) {
        // title, x = "50%", y = "50%", width = undefined, height = undefined, draggable = false

        this.x = options?.x || "50%"
        this.y = options?.y || "50%"
        this.draggable = options?.draggable

        const xn = typeof this.x === "number"
        const yn = typeof this.y === "number"
        
        const translate = `translate(${xn ? "0" : "-50%"}${yn ? "" : ",-50%"})`
        // log(this.y, yn, translate)


        // Window Position
        this.pos = element("div").css("window-pos kek").style({
            position: "absolute",
            transformOrigin: `${xn ? "left" : "center"} ${yn ? "top" : "center"}`,
            transform: translate,
            left: this.x,
            top: this.y,
            zIndex: 10,
        })

        // Window Screen
        this.container = element("div").css("window panel-black").style({
            padding: "5px",
            // height: "100%",
            // width: "100%",
            transformOrigin: "inherit",
            minWidth: "fit-content",
            maxWidth: "1000px",
            maxHeight: "850px",
        }).to(this.pos)

        // Window TitleBar
        if (options?.title) {
            this.container.style({
                display: "grid",
                gridTemplateRows: "30px 1fr",
                gridGap: "4px",
            })
            this.titlebar(options.title)
        }

        // Window Slot
        this.slot = element("div").css("slot").style({
            height: "100%",
            // display: "flex",
            minWidth: "fit-content",
            // maxWidth: "100px"
        }).to(this.container)

        // // Window Content
        // this.content = element("div").css("panel-black scrollbar").style({
        //     padding: "12px",
        //     minWidth: "500px",
        //     maxHeight: "500px",
        // }).to(this.slot)

    }
    // add(element) {
    //     this.content.add(element)
    // }
    // clear() {
    //     this.content.clear()
    // }

    titlebar(titleName) {
        this.titlebar = element("div").css("titleframe")
            .style({
                display: "flex",
                alignItems: "center",
                letterSpacing: "0.5px",
                cursor: "pointer",
            })
            .to(this.container)

        const titleText = element("div").css("textprimary title").text(titleName)
            .style({
                width: "100%",
                paddingLeft: "4px",
                fontWeight: "bold",
            })
            .to(this.titlebar)

        this.closeBtn = element("img").css("btn black svgicon").attr("src", "/data/ui/icons/cross.svg")
            .on("click", this.remove.bind(this))
            .to(this.titlebar)
    }

    show() {
        this.pos.style({ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", zIndex: 99 })
        ui.mainContainer.element.appendChild(this.pos.element)
        this.isOn = true
    }

    remove() {
        ui.mainContainer.element.removeChild(this.pos.element)
        this.isOn = false
    }

}

export default frame
