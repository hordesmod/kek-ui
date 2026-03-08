import mods from "../mods"
import eventManager from "./event"
import log from "./logger"
import profileManager from "./profile"
import stateManager from "./state"


class ModuleManager {
    
    #registry = {}
    
    constructor() {
        // register all mods
        for (const mod of mods) {
            if(!Object.prototype.hasOwnProperty.call(mod, "name")) {
                throw new Error("Mod name is missing or falsy!")
            }
            // place to make mods defaults
            mod._enabled = true
            this.#registry[mod.name] = mod
        }

        stateManager.register("modules")
        eventManager.on("state.load", this.onLoad, this)
        eventManager.on("state.save", this.onSave, this)
    }

    init() {
        for (const mod of Object.values(this.#registry)) {
            if (mod._enabled && Object.prototype.hasOwnProperty.call(mod, "start")) {
                mod.start()
            }
        }
    }

    onLoad(globalState) {
        const playerName = profileManager.playerName

        for (const [name, obj] of Object.entries(globalState.modules)) {
            
            if(!Object.prototype.hasOwnProperty.call(this.#registry, name)) {
                delete globalState.modules[name]
                continue
            }
            const mod = this.#registry[name]

            mod._enabled = obj._enabled

            if (Object.prototype.hasOwnProperty.call(mod, "state")) {
                const targetState = playerName in obj ? obj[playerName] : obj._state

                if (targetState) {
                    // Remove properties from targetState that are not in module.state
                    for (const prop in targetState) {
                        if (!(prop in mod.state)) {
                            delete targetState[prop]
                        }
                    }
                    // Merge properties from module.state and targetState
                    mod.state = {
                        ...mod.state,
                        ...targetState,
                    }
                }
            }
        }
    }

    onSave(globalState) {
        const playerName = profileManager.playerName

        for (const { name, _enabled, state, _profiles } of Object.values(this.#registry)) {
            const module = globalState.modules[name] || {}

            module._enabled = _enabled !== undefined ? _enabled : true

            if (state && _profiles) {
                module[playerName] = state
            } else if (state) {
                module._state = state
            }

            globalState.modules[name] = module
        }
    }

    toggle(moduleName) {
        this.#registry[moduleName]._enabled ^= 1
        this.#registry[moduleName]._enabled ? this.start(moduleName) : this.stop(moduleName)
        eventManager.trigger("mod.toggle", this.#registry[moduleName])
    }

    start(moduleName) {
        const mod = this.#registry[moduleName]
        if (Object.prototype.hasOwnProperty.call(mod, "start")) {
            mod.start()
        }
    }

    stop(moduleName) {
        const mod = this.#registry[moduleName]
        if (Object.prototype.hasOwnProperty.call(mod, "stop")) {
            mod.stop()
        }
    }

    status(moduleName) {
        return this.#registry[moduleName]?._enabled
    }

    get(moduleName) {
        return this.#registry[moduleName]
    }
    [Symbol.iterator]() {
        const keys = Object.keys(this.#registry).sort()
        let index = 0
        return {
            next: () => index < keys.length
                ? { value: this.#registry[keys[index++]], done: false }
                : { done: true }
        }
    }
}
const moduleManager = new ModuleManager()

export default moduleManager