import moduleManager from "./modules"
import eventManager from "./event"
import stateManager from "./state"
import log from "./logger"

// ext usage:    
// hotkey: {
//     "hotkey description": { key: "]", callback: "showFrame" }
// },


class KeyManager {

    #registry = {}

    constructor() {
        // log("KeyManager")
        stateManager.register("keys")
        eventManager.on("state.load", this.onLoad, this)
        eventManager.on("state.save", this.onSave, this)
        eventManager.on("mod.toggle", this.onModToggle, this)

        document.addEventListener("keyup", this.handleKeyUp.bind(this))
    }

    init() {
        for (const mod of moduleManager) {
            const { name, hotkey } = mod

            if (hotkey) {
                this.#registry[name] ||= {}

                for (const [hotkeyName, { key, callback }] of Object.entries(hotkey)) {
                    const isValidCallback = typeof callback === "string" &&
                        Object.prototype.hasOwnProperty.call(mod, callback) &&
                        typeof mod[callback] === "function"

                    if (isValidCallback) {
                        const lowercaseKey = key.toLowerCase()
                        this.#registry[name][hotkeyName] = lowercaseKey
                        eventManager.on(`keyup.${lowercaseKey}`, mod[callback], mod)
                    }
                }
            }
        }
    }
    handleKeyUp(event) {
        // log(event)
        const target = event.target.tagName.toLowerCase()
        if (target === "input" || target === "textarea") return

        const { key } = event
        eventManager.trigger("keyup." + key.toLowerCase())
    }

    onLoad(globalState) {
        const { keys } = globalState
        if (keys) {
            for (const modName in keys) {
                if (Object.prototype.hasOwnProperty.call(this.#registry, modName)) {
                    for (const [keyName, newKey] of Object.entries(keys[modName])) {
                        if (keyName in this.#registry[modName]) {
                            this.updateKey(modName, keyName, newKey)
                        }
                    }
                }
            }
        }
    }

    onSave(globalState) {
        globalState.keys = this.#registry
    }

    onModToggle(mod){
        const modName = mod.name
        if (Object.prototype.hasOwnProperty.call(this.#registry, modName)) {
            for (const [keyName, newKey] of Object.entries(this.#registry[modName])) {
                this.updateKey(modName, keyName, newKey)
            }
        }
    }

    updateKey(modName, keyName, newKey) {
        let mod = moduleManager.get(modName)
        let value = newKey.toLowerCase()
        let callbackName = mod.hotkey[keyName].callback
        let registryKey = this.#registry[modName][keyName]
        this.#registry[modName][keyName] = value
        eventManager.off("keyup." + registryKey, mod[callbackName], mod)
        if(mod._enabled){
            eventManager.on("keyup." + value, mod[callbackName], mod)
        }
    }

    [Symbol.iterator]() {
        const registryEntries = Object.entries(this.#registry)
        let index = 0
        return {
            next: () => {
                if (index < registryEntries.length) {
                    const [key, obj] = registryEntries[index++]
                    return { value: [key, obj], done: false }
                } else {
                    return { done: true }
                }
            }
        }
    }
}

const keyManager = new KeyManager()

export default keyManager