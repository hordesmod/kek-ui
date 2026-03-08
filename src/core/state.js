import config from "../config"
import eventManager from "./event"
import log from "./logger"
import storageManager from "./storage"

class StateManager {
    #globalState = {
        version: config.version,
    }

    init() {
        this.load() || (this.migrate(), this.save())
    }
    
    // add path to this.globalState
    // .register("some.path.more")
    // 
    register(statePath) {
        const pathSegments = statePath.split(".")
        pathSegments.reduce((obj, segment) => obj[segment] = obj[segment] || {}, this.#globalState)
    }
    
    load() {
        const globalState = storageManager.load()

        if (globalState) {
            this.#globalState = globalState
            eventManager.trigger("state.load", this.#globalState)
            return true
        }
    
        return false
    }

    save() {
        eventManager.trigger("state.save", this.#globalState)
        storageManager.save(this.#globalState)
    }

    // TODO: add migration method 
    migrate() {

    }

    getModState(modName) {
        return this.#globalState.modules[modName]
    }

    // getWindowSettings() {
    //     const windowString = localStorage.getItem("windowSettings")
    //     if (windowString) {
    //         return JSON.parse(windowString)
    //     }
    // }

    // setWindowSettings(windowSettings) {
    //     if (windowSettings) {
    //         localStorage.setItem("windowSettings", JSON.stringify(windowSettings))
    //     }
    // }
}

const stateManager = new StateManager()

export default stateManager