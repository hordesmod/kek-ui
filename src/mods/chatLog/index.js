import eventManager from "../../core/event"
import log from "../../core/logger"
import chatArticleParser from "../../core/parsers/chatArticle"
import ui from "../../core/ui"
import element from "../../core/widgets/element"

const chatLog = {
    name: "Chat Log",
    description: "Move info messages out of chat",
    state: {
        log: [
            [1708901631333, 7, "To disable this mod, navigate to:"],
            [1708901631335, 2, "Settings -> [KEK] Mods -> Chat Log -> [ ]"],
            [1708901631336, 0, ""],
            [1708901631337, 0, "But we recommend giving it a try first!"],
            [1708901631338, 0, "Believe, a clean chat experience is truly enjoyable."],


        ],
        chatDark: 30,
        fontSize: 14,
        fontDark: 100,

        width: 450,
        height: 240,
        posBottom: 100,
        posLeft: 100,
        layout: "chat",

        unfoldDown: 0,
        heightUnfolded: 500,

        isColored: 1,

        isFormated: 0,
        isExpanded: 0,

        killsShow: 1,
        fameShow: 1,
        noteShow: 1,
        sysShow: 1,
        lvlShow: 1,
        expShow: 1,
        invShow: 0,
    },
    style: `
        .chatlog {
            padding: 4px;
            position: absolute;
            left: 0;
            bottom: 0;
            transform-origin: bottom left;
            height: 240px;
            width: 450px;
            max-width: 50%;
            min-width: 300px;
            display: grid;
            grid-template-rows: 1fr 44px;
            z-index: 1;
            font-size: 14px;
        }
        .chatlog .log {
            flex: 1 1 auto;
            overflow-y: scroll;
            overflow-x: hidden;
            direction: rtl;
            scrollbar-width: none;
        }
        .chatlog .log::-webkit-scrollbar {
            display: none
        }
        .chatlog .lowercontainer {
            position: relative
        }
        .chatlog .chatlogselect {
            position: absolute;
            width: 100%;
            top: 0;
            opacity: .15;
            display: flex;
            margin-top: 2px;
            pointer-events: all
        }
        .chatlog .chatlogselect>small {
            line-height: 1em;
            margin-right: 4px
        }
        .chatlog .chatlogselect:hover {
            opacity: 1
        }
        .chatlog .chatlogselect .btn:nth-child(8) {
            margin-left: auto;
        }
        .chatlog .line {
            text-shadow: 1px 1px #000;
            overflow: hidden;
            direction: ltr;
            display: block;
        }
        .chatlog .linewrap {
            display: inline;
            border-radius: 3px;
            background-color: #10131d4d;
            padding: 0 3px;
        }
        .chatlog .time {
            display: inline-block;
            font-size: 11px;
            color: #5b858e;
            width: 2.8em;
        }
        .chatlog .textGM {
            background-color: #10131dcc;
        }
    `,
    settings: {
        chatDark: { control: "range", desc: "Background", comment: "Transparency of the log window", step: 10, onupdate: "updateFrame" },
        fontSize: { control: "range", desc: "Font Size", comment: "Default: 14", step: 1, onupdate: "updateFrame" },
        fontDark: { control: "range", desc: "Font Brightness", comment: "Default: 100", min: 40, step: 1, onupdate: "updateFrame" },

        width: { control: "range", desc: "Width", comment: "Default: 450", min: 300, max: 1000, onupdate: "updateFrame" },
        height: { control: "range", desc: "Height", comment: "Default: 200", min: 70, max: 2000, onupdate: "updateFrame" },
        layout: { control: "select", desc: "Position", comment: "Log window layout", options: { chat: "Over Chat", tl: "Top Left", br: "Bottom Right", tr: "Top Right", custom: "Custom" }, onupdate: "updateFrame" },
        posLeft: { control: "range", desc: "X", comment: "For custom Position", min: -100, max: 2200, onupdate: "updateFrame" },
        posBottom: { control: "range", desc: "Y", comment: "For custom Position", min: -100, max: 2200, onupdate: "updateFrame" },

        unfoldDown: { control: "checkbox", desc: "Expand down", comment: "Expand direction", onupdate: "updateFrame" },
        heightUnfolded: { control: "range", desc: "Height Expanded", comment: "Default: 500", min: 70, max: 2000, onupdate: "updateFrame" },

    },
    logChannelType: ["GM", "pvp", "fame", "system", "notice", "lvlup", "inv", "error", "exp"],
    start() {
        eventManager.on("ui.channelSelect", this.showFrame, this)
        eventManager.on("ui.chatArticle", this.handleArticle, this)
    },
    stop() {
    },
    showFrame(channelSelect) {

        // removes articles in chat
        for (const article of ui.chatPanel.element.children) {
            const obj = chatArticleParser(article)
            if (this.logChannelType.includes(obj.channelType)) {
                article.style.display = "none"
            }
        }

        // turn pvp channel on
        const pvpBtn = channelSelect.element.children[3]
        if (pvpBtn.classList.contains("textgrey")) {
            pvpBtn.click()
        }
        pvpBtn.style.display = "none"

        // turn inv channel on
        const invBtn = channelSelect.element.children[4]
        if (invBtn.classList.contains("textgrey")) {
            invBtn.click()
        }
        invBtn.style.display = "none"


        this.frame = element("div").css("chatlog container uiscaled")

        this.content = element("div").css("log panel scrollbar")
        // .on("pointerdown", e=>{
        //     parentDiv.dispatchEvent(new PointerEvent('pointerdown', e))
        // })

        const lowercontainer = element("div").css("lowercontainer")
        const channelselect = element("div").css("chatlogselect")

        const createButton = (stateProperty, text, className, onClick) => {
            return element("small")
                .css(`btn border black text${this.state[stateProperty] ? className : "grey"}`)
                .text(text)
                .on("click", e => {
                    this.state[stateProperty] ^= 1
                    e.target.classList.toggle(`text${className}`)
                    e.target.classList.toggle("textgrey")
                    onClick.call(this)
                })
        }

        this.killBtn = createButton.call(this, "killsShow", "kills", "f1", this.updateRecords).to(channelselect)
        this.fameBtn = createButton.call(this, "fameShow", "fame", "fame", this.updateRecords).to(channelselect)
        this.lootBtn = createButton.call(this, "noteShow", "note", "notice", this.updateRecords).to(channelselect)
        this.rollBtn = createButton.call(this, "sysShow", "sys", "system", this.updateRecords).to(channelselect)
        this.levelBtn = createButton.call(this, "lvlShow", "lvl", "lvlup", this.updateRecords).to(channelselect)
        this.expBtn = createButton.call(this, "expShow", "exp", "exp", this.updateRecords).to(channelselect)
        this.invBtn = createButton.call(this, "invShow", "inv", "white", this.updateRecords).to(channelselect)
        this.formatBtn = createButton.call(this, "isFormated", "Format", "exp", this.updateRecords).to(channelselect)
        this.unfoldBtn = createButton.call(this, "isExpanded", "Expand", "exp", this.updateFrame).style({ marginRight: "0" }).to(channelselect)

        lowercontainer.add(channelselect)
        this.frame.add(this.content)
        this.frame.add(lowercontainer)

        ui.mainContainer.element.appendChild(this.frame.element)
        this.updateFrame()
        this.updateRecords()
    },
    updateFrame() {

        this.frame.style({
            transformOrigin: "bottom left",
            transform: "unset",
            top: "",
            bottom: "",
            left: "",
            right: "",
            height: (this.state.isExpanded && this.state.heightUnfolded || this.state.height) + "px",
            width: this.state.width + "px",
        })

        if (this.state.layout == "chat") {
            const { left, top } = ui.chatPanel.element.getBoundingClientRect()
            log(ui.chatPanel.element.getBoundingClientRect())
            this.frame.style({
                left: left - 4 + "px",
                top: top + "px",
                transform: "translate(0, -100%)",
            })
            this.state.unfoldDown = 1
        }
        else if (this.state.layout == "br") {
            this.frame.style({
                transformOrigin: "bottom right",
                top: "100%",
                left: "100%",
                transform: "translate(-100%, -100%)",
            })
            this.state.unfoldDown = 0
        }
        else if (this.state.layout == "tr") {
            const { bottom } = ui.urContainer.element.getBoundingClientRect()
            log(ui.urContainer.element.getBoundingClientRect())
            this.frame.style({
                transformOrigin: "top right",
                top: bottom + "px",
                left: "100%",
                transform: "translate(-100%)",

            })
            this.state.unfoldDown = 1
        }
        else if (this.state.layout == "tl") {
            const { left, bottom } = ui.partyBtnbar.element.getBoundingClientRect()
            log(ui.partyBtnbar.element.getBoundingClientRect())
            this.frame.style({
                transformOrigin: "top left",
                top: bottom + "px",
                left: left - 4 + "px",

                // transform: "translate(-100%, -100%)",
            })
            this.state.unfoldDown = 1
        }
        else if (this.state.layout == "custom") {
            if(this.state.unfoldDown) {
                this.frame.style({
                    transformOrigin: "left top",
                    left: this.state.posLeft + "px",
                    top: this.state.posBottom + "px",
                })
            }
            else {
                this.frame.style({
                    transformOrigin: "left bottom",
                    left: this.state.posLeft + "px",
                    bottom: this.state.posBottom + "px",
                })
            }
        }

        if (this.state.fontDark < 100) {
            this.content.style({
                filter: `brightness(${this.state.fontDark}%)`,
            })
        }
        else {
            this.content.style({
                filter: "unset",
            })
        }

        this.content.style({
            background: `rgb(0 0 0 / ${this.state.chatDark}%)`,
            fontSize: this.state.fontSize + "px",
        })
    },
    updateRecords() {
        this.content.clear()
        for (const record of this.state.log) {
            this.showMessage(record)
        }
    },
    formatCurrency(number) {
        const gold = Math.floor(number / 10000)
        const silver = Math.floor((number % 10000) / 100)
        const copper = number % 100

        let result = element("span")
        if (this.state.isCompact) {
            result.style({
                display: "inline-flex",
                width: "3em",
                justifyContent: "end",
            })
        }

        if (gold > 0) {
            const gElement = element("span").css("textgold").text(gold + " ")
            const gIcon = element("img").css("texticon").style({ paddingRight: "0.15em" }).attr("src", "/data/ui/currency/gold.avif")
            gElement.add(gIcon)
            result.add(gElement)
            if (this.state.isFormated) {
                return result
            }
        }
        if (silver > 0) {
            const sElement = element("span").css("textsilver").text(silver + " ")
            const sIcon = element("img").css("texticon").style({ paddingRight: "0.15em" }).attr("src", "/data/ui/currency/silver.avif")
            sElement.add(sIcon)
            result.add(sElement)
            if (this.state.isFormated) {
                return result
            }
        }
        if (copper > 0) {
            const cElement = element("span").css("textcopper").text(copper + " ")
            const cIcon = element("img").css("texticon").style({ paddingRight: "0.15em" }).attr("src", "/data/ui/currency/copper.avif")
            cElement.add(cIcon)
            result.add(cElement)
            if (this.state.isFormated) {
                return result
            }
        }

        return result
    },
    formatDate(timestamp) {
        const date = new Date(timestamp)
        const hours = date.getHours().toString().padStart(2, "0")
        const minutes = date.getMinutes().toString().padStart(2, "0")
        const seconds = date.getSeconds().toString().padStart(2, "0")
        const time = element("span").css("time").text(`${hours}:${minutes}`)

        return time
    },
    formatKill(type, obj) {
        const format = element("div")

        const pName = element("span").css(`textf${obj[2]}`).text(obj[5])

        // this.state.isCompact && pName.style({
        //     display: "inline-flex",
        //     width: "9.5em",
        // })

        const kLevel = element("span").css("textwhite").style({ marginRight: "0.3em" }).text(obj[7])
        const pLevel = element("span").css("textwhite").style({ marginRight: "0.3em" }).text(obj[4])

        const kName = element("span").css(`textf${obj[2] ^ 1}`).text(obj[8])

        const fame = element("span").css("textfame").text(obj[9].toLocaleString())

        const gold = this.formatCurrency(obj[10])

        if (this.state.isFormated) {
            fame.style({ textAlign: "end" })
            gold.style({ textAlign: "end" })
            pName.style({ textOverflow: "ellipsis", overflow: "hidden", })
            kName.style({ textOverflow: "ellipsis", overflow: "hidden", })

            pLevel.css(`textc${obj[3]}`)
            kLevel.css(`textc${obj[6]}`)

            format
                .style({
                    display: "inline-grid",
                    gridTemplateColumns: "auto 1fr auto 1fr 80px 60px",
                    width: "100%",

                    // background: this.state.isCompact ? "" : "#10131d4d",
                    // width: this.state.isCompact ? "" : "fit-content",
                    // filter: this.state.isDarken ? "brightness(0.7)" : "",
                })
                .add(pLevel)
                .add(pName)
                .add(kLevel)
                .add(kName)
                .add(fame)
                .add(gold)
        }
        else {
            const pClass = element("img").css("icon").style({ height: "1.1em", verticalAlign: "-0.23em" }).attr("src", `/data/ui/classes/${obj[3]}.avif`)
            pLevel.prepend(pClass)

            const kClass = element("img").css("icon").style({ height: "1.1em", verticalAlign: "-0.23em" }).attr("src", `/data/ui/classes/${obj[6]}.avif`)
            kLevel.prepend(kClass)



            const fameIcon = element("img").css("icon").style({ height: "1.1em", verticalAlign: "-0.23em" }).attr("src", "/data/ui/currency/fame.svg")
            fame.prepend(fameIcon)

            format
                .style({
                    display: "inline",
                })
                .add(element("span").css("textfame").text("pvp "))
                .add(pClass)
                .add(pLevel)
                .add(pName)
                .add(element("span").css("textfame").text(" killed "))
                .add(kClass)
                .add(kLevel)
                .add(kName)
                .add(element("span").css("textfame").text(" for "))
                .add(fame)
                .add(element("span").css("textfame").text(" and "))
                .add(gold)

        }

        return format
    },
    formatInv(obj) {
        const msg = element("span").css("textinv").text(obj[2])
        if (obj[3]) {
            msg.add(this.formatCurrency(obj[3]))
        }
        return msg
    },
    formatMessage(type, obj) {
        const msg = element("span")
            .css(`text${type}`)
            .text(obj[2])
            .style({
                display: "inline"
            })
        return msg
    },
    showMessage(obj) {

        const type = this.logChannelType[obj[1]]

        let msg = false
        if (type === "GM") {
            msg = this.formatMessage(type, obj)
        }
        else if (type === "error") {
            msg = this.formatMessage(type, obj)
        }
        else if (type === "pvp" && this.state.killsShow) {
            msg = this.formatKill(type, obj)
        }
        else if (type === "fame" && this.state.fameShow) {
            msg = this.formatMessage(type, obj)
        }
        else if (type === "notice" && this.state.noteShow) {
            msg = this.formatMessage(type, obj)
        }
        else if (type === "system" && this.state.sysShow) {
            msg = this.formatMessage(type, obj)
        }
        else if (type === "lvlup" && this.state.lvlShow) {
            msg = this.formatMessage(type, obj)
        }
        else if (type === "exp" && this.state.expShow) {
            msg = this.formatMessage(type, obj)
        }
        else if (type === "inv" && this.state.invShow) {
            msg = this.formatInv(obj)
        }

        if (msg) {
            const line = element("div").css("line")
            const linewrap = element("div").css("linewrap")
            line.add(linewrap)
            if (!this.state.isFormated) {
                const time = this.formatDate(obj[0])
                linewrap.add(time)
            }

            linewrap.add(msg)

            this.content.add(line)

            this.content.element.scrollTop = this.content.element.scrollHeight
        }
    },
    addRecord(obj) {
        // log(obj) 
        this.state.log.push(obj)
        if (this.state.log.length > 100) {
            this.state.log.shift()
        }
        this.showMessage(obj)
    },
    handleArticle(chatArticle) {
        const obj = chatArticle.obj

        if (!obj?.channelType) return

        const { channelType, text } = obj
        if (this.logChannelType.includes(channelType)) {
            chatArticle.element.style.display = "none"
            const type = this.logChannelType.indexOf(channelType)
            if (channelType == "pvp") {
                const pvp = text.children[0]
                const obj = [
                    Date.now(),
                    type,
                    pvp.children[2].className == "textf0" ? 0 : 1,
                    parseFloat(pvp.children[0].attributes.src.value[17]),
                    parseFloat(pvp.children[1].innerText),
                    pvp.children[2].innerText,
                    parseFloat(pvp.children[3].attributes.src.value[17]),
                    parseFloat(pvp.children[4].innerText),
                    pvp.children[5].innerText,
                    parseFloat(pvp.children[6]?.innerText.split(" ").join("")) || 0,
                    parseFloat(pvp.children[7]?.innerText.split(" ").join("")) || 0,
                ]
                this.addRecord(obj)
            }
            // else if (channelType == "fame") {
            //     // const split = text.split(" ")
            //     // if (split[0] == "Gained") {
            //     //     const gained = element("span").style({
            //     //         fontSize: "11px",
            //     //         color: "#5b858e",
            //     //         width: "2.6em",
            //     //         display: "inline-flex",
            //     //     })
            //     // }
            //     // else if (split[0] == "Lost") {

            //     // }
            //     // else {
            //     //     formated.add(element("span").css(`text${channelType}`).text(text))
            //     // }
            // }
            else if (channelType == "inv") {
                if (text.children.length > 0 && text.children[0].children.length > 0) {
                    const msg = text.children[0].childNodes[0].textContent
                    const gold = parseFloat(text.children[0].childNodes[1].textContent.split(" ").join("")) || 0
                    this.addRecord([
                        Date.now(),
                        type,
                        msg,
                        gold
                    ])
                }
                else {
                    this.addRecord([
                        Date.now(),
                        type,
                        text.innerText,
                    ])
                }

            }
            else {
                const msg = text.children.length > 0 ? text.children[0].innerText : text.innerText
                // this.addMessage(channelType, [msg])

                this.addRecord([
                    Date.now(),
                    type,
                    msg,
                ])

            }

            if (this.content.element.children.length > 100) {
                this.content.element.removeChild(this.content.element.firstElementChild)
            }

        }
    }


}
window.kl = chatLog
export default chatLog



