import config from "../config"
import log from "./logger"

class StorageManager {
    constructor(storageType = "localStorage") {
        this.storage = window[storageType]
        if (!this.storage) {
            throw new Error(`Storage type '${storageType}' is not supported in this browser.`)
        }
        this.storageKey = config.localStorageKey
    }

    setItem(key, value) {
        this.storage.setItem(key, JSON.stringify(value))
    }

    getItem(key) {
        const storedValue = this.storage.getItem(key)
        return storedValue ? JSON.parse(storedValue) : null
    }

    removeItem(key) {
        if (key) {
            throw new Error("Let's not delete anything yet...")
        }
        this.storage.removeItem(key)
    }

    save(value) {
        if (!value) {
            throw new Error("Will not save empty values!")
        }
        this.setItem(this.storageKey, value)
    }

    load() {
        const ret =  this.getItem(this.storageKey)
        return ret
    }
}

const storageManager = new StorageManager()

export default storageManager