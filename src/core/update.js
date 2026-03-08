import config from "../config"
import eventManager from "./event"
import log from "./logger"
import element from "./widgets/element"

class UpdateManager {
    constructor() {
        this.version = config.version
        this.lastVersion = undefined
        this.url = undefined
        this.body = undefined
        this.update = 0

    }

    init() {
        eventManager.on("ui.mainContainer", this.notification, this)
    }

    notification(mainContainer) {
        fetch("https://api.github.com/repos/hordesmod/kek-ui/releases/latest")
            .then(response => response.json())
            .then(data => {
                this.lastVersion = data.tag_name
                this.url = data.assets[0].browser_download_url
                this.body = data.body

                
                const now = this.version.split(".").map(Number)
                const next = this.lastVersion.split(".").map(Number)
                for (let i = 0; i < 3; i++) {
                    if (now[i] < next[i]) {
                        this.update = 1
                    } else if (now[i] > next[i]) {
                        break
                    }
                }
                if (this.update) {

                    const posWindow = element("div").css("window-pos")
                        .style({
                            zIndex: 99,
                            position: "absolute",
                            left: "50%",
                            top: "50%",
                            transform: "translate(-50%, -50%)",
                        })
                    const updWindow = element("div").css("window panel-black")
                        .style({
                            padding: "0 5px 5px",
                            height: "100%",
                            display: "grid",
                            gridTemplateRows: "auto 1fr",
                            transformOrigin: "inherit",
                            minWidth: "fit-content",
                            width: "500px",
                        })
                    posWindow.add(updWindow)
                    const titleframe = element("div").css("titleframe").style({ cursor: "pointer" })
                        .style({
                            lineHeight: "1em",
                            display: "flex",
                            alignItems: "center",
                            position: "relative",
                            paddingTop: "4px",
                            paddingBottom: "4px",
                        })
                    const title = element("div").css("textprimary title").text("KEK UI New Release")
                        .style({
                            width: "100%",
                            paddingLeft: "4px",
                            fontWeight: "700",
                            pointerEvents: "none",
                        })
                    const closeBtn = element("img").css("btn black svgicon").attr("src", "/data/ui/icons/cross.svg")
                        .on("click", () => posWindow.remove())
                    titleframe.add(title).add(closeBtn)

                    updWindow.add(titleframe)

                    const slot = element("div").css("slot")

                    const container = element("div").css("container").style({
                        minWidth: "200px",
                        padding: "12px",
                    })
                    slot.add(container)

                    const header = element("p").text("We apologize for any inconvenience, but it's essential to update your 'KEK UI' mod now. ")
                    container.add(header)

                    const description = element("p").text("")
                    container.add(description)

                    const changes = element("h3").css("textprimary").text(`New in version ${data.tag_name}:`)
                    container.add(changes)

                    data.body.split("-").forEach(str => {
                        str && container.add(element("p").text(`- ${str}`))
                    })

                    const reminder = element("div").css("textprimary").text("-----")
                    container.add(reminder)
                    const reminder1 = element("div").text("Remember to press the button in Tampermonkey.")
                    container.add(reminder1).add(reminder1)
                    const reminder2 = element("div").css("textfame").text("[Update] / [Downgrade] / [Reinstall] / [Overwrite].")
                    container.add(reminder2).add(reminder2)

                    const updateBtnContainer = element("div").css("container").style({
                        minWidth: "200px",
                        textAlign: "center",
                        padding: "12px",
                    })
                    slot.add(updateBtnContainer)

                    const updateBtn = element("div").css("btn green textblack").text("Update Now").on("click", () => { window.open(data.assets[0].browser_download_url); window.location.href = "/"})
                    updateBtnContainer.add(updateBtn)

                    updWindow.add(slot)

                    mainContainer.element.appendChild(posWindow.element)
                }


            })
            .catch(error => {
                console.error("Error fetching data:", error)
            })
    }
}



const updateManager = new UpdateManager()

export default updateManager