import moduleManager from "./modules"
import eventManager from "./event"
import stateManager from "./state"
import log from "./logger"

class CacheManager {
    #registry = {}
    constructor() {
        stateManager.register("cache")
        // eventManager.on("state.load", this.onLoad, this)
        // eventManager.on("state.save", this.onSave, this)
    }


}

const cacheManager = new CacheManager()

// window.c = new Cache("queue", 3)
export default cacheManager