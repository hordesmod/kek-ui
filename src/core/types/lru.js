class LruCache {
    constructor(max = Infinity) {
        this.cache = []
        this.usage = []
        this.maxSize = max
    }

    cacheGet(newObj) {
        const foundIndex = this.cache.findIndex(obj => Object.entries(newObj).every(([key, value]) => obj[key] === value));
        const foundObj = foundIndex && this.cache[foundIndex]

        if (!foundIndex) {
            if (this.cache.length >= this.maxSize)
            {
                this.evict()
            }
            this.cache.push(newObj)
            this.usage.push(1)
            return null
        }
        else {
            this.usage[foundIndex] += 1
            return foundObj
        }

    }


    evict() {
        if (this.cache.length === 0) return

        const operation = cacheOperations[this.type]
        if (!operation) {
            throw new Error("Invalid cache type!")
        }
        return operation(this.cache)
    }

    getItems() {
        return [...this.cache]
    }

    getSize() {
        return this.cache.length
    }
}

const lru = max => new LruCache(max)

export default lru