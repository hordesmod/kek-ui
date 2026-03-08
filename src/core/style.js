import log from "./logger"
import moduleManager from "./modules"

class StyleManager {
    constructor() {
        this.cssStyleSheet = new CSSStyleSheet()
        document.adoptedStyleSheets = [...document.adoptedStyleSheets, this.cssStyleSheet]

    }
    init() {
        this.css_mods = [...moduleManager].map(mod => mod.style || "").join("")
        this.cssStyleSheet.replaceSync(this.css_mods)
    }
    add(cssRules) {
        // Split the rules into an array and insert each rule individually
        cssRules.split("}").forEach((rule) => {
            const trimmedRule = rule.trim()
            if (trimmedRule !== "") {
                this.cssStyleSheet.insertRule(trimmedRule, this.cssStyleSheet.cssRules.length)
            }
        })
        document.adoptedStyleSheets = [...document.adoptedStyleSheets, this.cssStyleSheet]
    }
    show() {
        for (const rule of this.cssStyleSheet.cssRules) {
            console.log(rule.cssText)
        }
    }
}



const styleManager = new StyleManager()

export default styleManager
