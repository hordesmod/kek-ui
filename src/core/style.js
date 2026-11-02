import log from "./logger"
import moduleManager from "./modules"

class StyleManager {
    constructor() {
        if (window.__STYLE_MANAGER_SHEET__) {
            this.cssStyleSheet = window.__STYLE_MANAGER_SHEET__;
            return;
        }

        this.cssStyleSheet = new CSSStyleSheet();
        window.__STYLE_MANAGER_SHEET__ = this.cssStyleSheet;
        
        document.adoptedStyleSheets = [...document.adoptedStyleSheets, this.cssStyleSheet];
    }

    init() {
        const css_mods = [...moduleManager].map(mod => mod.style || "").join("");
        this.cssStyleSheet.replaceSync(css_mods);
    }

    add(cssRules) {
        cssRules.split("}").forEach((rule) => {
            const trimmedRule = rule.trim();
            if (trimmedRule !== "") {
                try {
                    this.cssStyleSheet.insertRule(trimmedRule + "}", this.cssStyleSheet.cssRules.length);
                } catch(e) {}
            }
        });
    }
}

const styleManager = new StyleManager();
export default styleManager;

// class StyleManager {
//     constructor() {
//   const existingSheet = document.adoptedStyleSheets.find(s => s._isStyleManager);
    
//     if (existingSheet) {
//         this.cssStyleSheet = existingSheet;
//     } else {
//         this.cssStyleSheet = new CSSStyleSheet();
//         this.cssStyleSheet._isStyleManager = true; // Mark it
//         document.adoptedStyleSheets = [...document.adoptedStyleSheets, this.cssStyleSheet];
//     }
//     }
//     init() {
//         this.css_mods = [...moduleManager].map(mod => mod.style || "").join("")
//         this.cssStyleSheet.replaceSync(this.css_mods)
//     }
//     add(cssRules) {
//         // Split the rules into an array and insert each rule individually
//         cssRules.split("}").forEach((rule) => {
//             const trimmedRule = rule.trim()
//             if (trimmedRule !== "") {
//                 this.cssStyleSheet.insertRule(trimmedRule, this.cssStyleSheet.cssRules.length)
//             }
//         })
//         document.adoptedStyleSheets = [...document.adoptedStyleSheets, this.cssStyleSheet]
//     }
//     show() {
//         for (const rule of this.cssStyleSheet.cssRules) {
//             console.log(rule.cssText)
//         }
//     }
// }



// const styleManager = new StyleManager()

// export default styleManager
