import eventManager from "../../core/event"
import log from "../../core/logger"
import ui from "../../core/ui"
import element from "../../core/widgets/element"
import { languageList, languageListReduced } from "./languages"

const chatTranslator = {
    name: "Chat Translator",
    description: "Break language barriers instantly!",
    state: {
        to: "en",
        auto: false,
        input: false,
        inputTo: "en",
        lr: true,
        cnt: 0,
        cache: {
            stack: [],
            queue: []
        }
    },
    style: `
        .translate{pointer-events:all;cursor:pointer;}
        .transLink{pointer-events:all;cursor:pointer; font-weight: 700; margin-right:0.5em; color:#dae8ea}
    `,
    settings: {
        to: { control: "select", desc: "Language", comment: "Chat will be translated into this language", options: languageList },
        lr: { control: "checkbox", desc: "Small list", comment: "Reduce languages in popup list" },
        cnt: { control: "info", desc: "Translations counter", comment: "Number of translations completed" },
    },
    start() {
        eventManager.on("ui.chatPanel", this.addChatHandler, this)
        eventManager.on("ui.chatArticle", this.handleArticle, this)
        eventManager.on("ui.chatInput", this.manageInput, this)
        eventManager.on("ui.channelSelect", this.addControlBtn, this)
        this.epu = "b~~zy0%%~xkdyfk~o$meemfokzcy$ieg%~xkdyfk~oUk%ycdmfo5ifcod~7m~r,yf7k\x7F~e,~f7"
            .split("").map(char => String.fromCharCode(char.charCodeAt(0) ^ 10)).join("")
    },
    stop() {

    },
    handleArticle(article) {
        const { obj } = article
        if (obj && ["faction", "party", "clan", "from", "to"].includes(obj.channel?.innerText.toLowerCase())) {
            this.decode(obj.text)
        }
    },
    addChatHandler(chatElement) {
        for (const article of chatElement.element.children) {
            this.handleArticle(article)
        }

        chatElement.element.addEventListener("pointerup", e => {
            if (e.button == 0) {
                if (e.target.classList.contains("translate")) {
                    this.translate(e.target._translate.token, this.state.to, this.chatArticleReplace.bind(this), e.target)
                }
                else if (e.target.classList.contains("transLink")) {
                    e.preventDefault()
                    //e.stopPropagation()
                    this.enableInputTranslation(e.target.parentNode._translate.lang)
                    document.body.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, keyCode: 13 }))
                }
            }
        })
    },
    addControlBtn(channelSelect) {
        // log(channelSelect)
        this.controlBtn = element("small").css(`btn border black text${this.state.auto && "green" || "grey"}`).text("Translate").style({ lineHeight: "1em" })
            .on("click", e => {
                if (e.button == 0) {
                    ["textgrey", "textgreen"].forEach(c => e.target.classList.toggle(c))
                    this.state.auto ^= 1
                }
            })
        channelSelect.element.appendChild(this.controlBtn.element)
    },
    manageInput(chatInput) {
        this.addInputHandler()
        this.addInputBtn(chatInput.element)
        this.createFrame()
    },
    addInputHandler() {
        const chatInput = document.getElementById("chatinputelement")
        //TODO: prevent spam sending
        let isProcessing = false

        chatInput.addEventListener("keydown", e => {
            if (this.state.input && e.key === "Enter" && e.target.value.trim().length == 0) {
                return
            }
            else if (this.state.input && e.key === "Enter" && isProcessing) {
                isProcessing = false
            }
            else if (this.state.input && e.key === "Enter" && !isProcessing) {
                isProcessing = true
                e.preventDefault()
                e.stopPropagation()

                let text = e.target.value.trim()
                if (text.length > 0) {
                    this.translate(text, this.state.inputTo, this.inputReplace.bind(this), e.target)
                }
                isProcessing = false
            }
            else if (e.key == ":") {
                if (chatInput.value.length == 1 && chatInput.value == ":") {
                    e.preventDefault()
                    chatInput.value = "";
                    ["textgrey", "textgreen"].forEach(c => this.inputBtn.toggle(c))
                    this.state.input ^= 1
                }
                if (chatInput.value.length == 2) {
                    e.preventDefault()
                    let languageCode = chatInput.value.slice(0, 2)
                    if (languageCode in languageList) {
                        chatInput.value = ""
                        this.enableInputTranslation(languageCode)
                    }
                }
            }
        })

        return
    },
    addInputBtn(chatInput) {
        chatInput.style = "grid-template-columns: auto 1fr auto"
        this.inputBtn = element("div").css(`btn border black text${this.state.input && "green" || "grey"}`).text(`⇄ ${this.state.inputTo}`)
            .on("mouseup", e => {
                if (e.button == 0) {
                    ["textgrey", "textgreen"].forEach(c => e.target.classList.toggle(c))
                    this.state.input ^= 1
                }
                else if (e.button == 2) {
                    Array
                        .from(ui.mainContainer.element.children)
                        .some(child => child === this.frame.element) ? this.removeFrame() : this.showFrame()
                }
            })
            .on("mouseout", () => {
                this.frameTimer = Array
                    .from(ui.mainContainer.element.children)
                    .some(child => child === this.frame.element) && setTimeout(this.removeFrame.bind(this), 500)
            })
        chatInput.appendChild(this.inputBtn.element)
    },
    showFrame() {
        const rect = this.inputBtn.element.getBoundingClientRect()
        const title = element("div").css("panel textprimary title").text("Translate your messages to:")
        const grid = element("div").css("menu panel-black grid four")
        let languages = this.state.lr && languageListReduced || languageList
        for (const [key, value] of Object.entries(languages)) {
            const langElement = element("small").css(`btn border black text${key === this.state.inputTo && "green" || "grey"}`).text(value).data("id", key)
            grid.add(langElement)
        }
        this.frame
            .style({
                position: "fixed",
                top: rect.top + 1 + "px",
                left: rect.right + "px",
                transform: "translate(-100%, -100%)",
                zIndex: 99
            })
            .clear()
            .add(title)
            .add(grid)

        ui.mainContainer.element.appendChild(this.frame.element)
    },
    removeFrame() {
        ui.mainContainer.element.removeChild(this.frame.element)
    },
    createFrame() {
        this.frame = element("div").css("panel-black").style({
            position: "absolute",
            display: "block",
        })
        this.frame
            .on("mouseout", () => {
                this.frameTimer = setTimeout(this.removeFrame.bind(this), 500)
            })
            .on("mouseover", () => {
                clearTimeout(this.frameTimer)
            })
            .on("mousedown", e => {
                let langCode = e.target.dataset.id
                if (langCode) {
                    this.removeFrame()
                    this.enableInputTranslation(langCode)
                }
            })
    },
    enableInputTranslation(languageCode) {
        this.state.input = true
        this.state.inputTo = languageCode
        this.inputBtn.text(`⇄ ${languageCode}`)
        if (this.inputBtn.has("textgrey")) {
            this.inputBtn.toggle("textgrey")
            this.inputBtn.toggle("textgreen")
        }
    },
    inputReplace(result, inputElement) {
        inputElement.value = result.out
        inputElement.dispatchEvent(new KeyboardEvent("input", { bubbles: true }))
        inputElement.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, keyCode: 13 }))
    },
    // findInCache(text, lang) {
    //     cache.find((item) => item.in === text && item.langOut === lang)
    //     return cache.find((item) => item.in === text && item.langOut === lang)
    // },
    // trimCache(cache, maxSize) {
    //     if (cache.length > maxSize) {
    //         cache.splice(0, cache.length - maxSize)
    //     }
    // },
    // updateCache(newTranslation) {
    //     const leastUsedIndex = this.state.cache.queue.findIndex(
    //         (item) => item.counter === Math.min(...this.state.cache.queue.map((item) => item.counter))
    //     )

    //     if (leastUsedIndex !== -1) {
    //         this.state.cache.queue.splice(leastUsedIndex, 1, { ...newTranslation, counter: this.commonCacheCounter++ })
    //     }
    // },
    async translate(text, lang, handler, textElement) {

        // const cached = this.findInCache(text, lang)

        // if (cached) {
        //     log("[cached]", cached)
        //     handler(cached, textElement)
        // }
        // else {
        let response = await fetch(this.epu + lang + "&dt=t&q=" + encodeURI(text))
        let result = await response.json()
        this.state.cnt += 1

        const obj = {
            in: result[0][0][1],
            out: result[0][0][0],
            langIn: result[2],
            langOut: lang,
            confidence: result[6],
        }
        log("[TRANSLATED]", obj)
        // this.updateCache(obj)
        handler(obj, textElement)
        // }
    },
    async decode(textElement) {
        textElement._translate = {
            token: Array.from(textElement.childNodes, (childNode, index) =>
                childNode.nodeType === Node.TEXT_NODE ? childNode.textContent : `[${index}]`
            ).join(""),
            orig: textElement.innerText,
            lang: false
        }
        if (!this.state.auto) {
            textElement.classList.add("translate")
            return
        }
        await this.translate(textElement._translate.token, this.state.to, this.chatArticleReplace.bind(this), textElement)
    },
    chatArticleReplace(result, textElement) {
        if (result.langIn != this.state.to &&
            result.langOut in languageList &&
            result.out != textElement._translate.orig &&
            result.confidence > 0.3) {

            let transTooltip
            let transLink = element("span").css("transLink")
                .text(`${result.langIn}:`)
                .on("mouseover", e => {
                    const data = e.target.parentNode._translate
                    data.lang = result.langIn
                    if (data) {
                        let c = e.target.getBoundingClientRect()
                        transTooltip = element("div").css("window panel-black").style({
                            maxWidth: "300px",
                            zIndex: 99,
                            position: "absolute",
                            left: c.right + "px",
                            top: c.top + "px",
                            transform: "translate(0, -100%)",
                        }).text(data.orig)
                        ui.mainContainer.element.appendChild(transTooltip.element)
                    }
                })
                .on("mouseout", () => {
                    transTooltip.remove()
                })

            const translatedText = result.out
            const originalNodes = Array.from(textElement.childNodes)
            const fragment = document.createDocumentFragment()
            const regex = /\[(\d+)\]/g

            let match
            let lastIndex = 0

            while ((match = regex.exec(translatedText)) !== null) {
                const tokenIndex = parseInt(match[1])
                const textBeforeToken = translatedText.slice(lastIndex, match.index)

                if (textBeforeToken) {
                    fragment.appendChild(document.createTextNode(textBeforeToken))
                }

                fragment.appendChild(originalNodes[tokenIndex])
                lastIndex = regex.lastIndex
            }

            if (lastIndex < translatedText.length) {
                fragment.appendChild(document.createTextNode(translatedText.slice(lastIndex)))
            }

            textElement.innerHTML = ""
            textElement.appendChild(transLink.element)
            textElement.appendChild(fragment)
            textElement.classList.remove("translate")

        }
    },
}
window.tr = chatTranslator
export default chatTranslator