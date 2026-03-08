import selectors from "./presets/selectors"
import eventManager from "./event"
import parser from "./parsers"
import log from "./logger"

class UI {

    getElement(name) {
        const {selector, bruteForce: shouldBruteForce, observe, wName, ignore} = selectors[name]
        this[name] = {selector, observe, wName}
        let element = null
        if(ignore === true) return
        if(!wName) {
            element = document.querySelector(selector)
        } else {
            element = [...document.querySelectorAll(selector)]
                .find(el => el.querySelector(".title").textContent.toLowerCase().startsWith(wName))
        }
        if(element) {
            this[name].element = element
            this[name].onScreen = true
            this.handleObservers(name)
            
        } else if(shouldBruteForce) {
            setTimeout(() => {
                this.getElement(name)
            }, 1)
        }
    }

    init() {
        for(let name in selectors) {
            // console.log(name)
            this.getElement(name)
        }
    }

    triggerEvent(eventName, element, elementName) {
        let parsedElement = null
        if(typeof parser[elementName] == "function") {
            parsedElement = parser[elementName](element)
        } else {
        }
        eventManager.trigger(eventName, {
            element: element,
            obj: parsedElement,
        })
    }

    handleObservers(key) {
        if(typeof this[key] === "object") {
            const {element, observe: observeTargets} = this[key]
            // console.log("triggering event Manager", 'ui.'+ key)

            if(!element) return

            this.triggerEvent('ui.'+ key, element, key)

            if(observeTargets && !element.classList.contains("mutationObserving")) {
                const observer = new MutationObserver((mutationsList, observer) => {
                    for (const mutation of mutationsList) {
                        if (mutation.type === 'childList') {
                            // Handle added or removed child nodes here
                            for(let node of mutation.removedNodes) {
                                for(let target of observeTargets) {
                                    const targetSelector = this[target].selector
                                    if(node instanceof HTMLElement && node.matches(targetSelector)) {
                                        if(!node.querySelector(".title")) {
                                            // console.log(node, "ui." + target)
                                            this[target].element = node
                                            this[target].onScreen = false
                                            this.triggerEvent('uiclose.'+ target, node, target)
                                            break  
                                        } else {
                                            const wName = this[target].wName
                                            const title = node.querySelector(".title")
                                            if(title && title.textContent.toLowerCase() === wName) {
                                                // console.log(node, "ui." + target)
                                                this[target].element = node
                                                this[target].onScreen = false
                                                this.triggerEvent('uiclose.'+ target, node, target)
                                                break 
                                            }
                                        }
                                    }
                                }
                            }
                            for(let node of mutation.addedNodes) {
                                for(let target of observeTargets) {
                                    const targetSelector = this[target].selector
                                    if(node instanceof HTMLElement && node.matches(targetSelector)) {
                                        if(!node.querySelector(".title")) {
                                            // console.log(node, "ui." + target)
                                            this[target].element = node
                                            this[target].onScreen = true
                                            this.triggerEvent('ui.'+ target, node, target)
                                            break  
                                        } else {
                                            const wName = this[target].wName
                                            const title = node.querySelector(".title")
                                            if(title && title.textContent.toLowerCase() === wName) {
                                                // console.log(node, "ui." + target)
                                                this[target].element = node
                                                this[target].onScreen = true
                                                this.triggerEvent('ui.'+ target, node, target)
                                                break 
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                })
                observer.observe(element, {childList: true})
                element.classList.add("mutationObserving")
                this[key].observer = observer
            }
        }
    }
}
const ui = new UI()

export default ui
