class Queue {
    constructor(max = Infinity) {
        this.cache = []
        this.maxSize = max
        this.batch = max > 100
    }

    put(item) {
        if(this.cache.length >= this.maxSize) {
            this._clean()
        }
        this.cache.push(item)
    }
    get() {
        return this.cache[0]
    }

    _clean() {
        if(this.batch) {
            this.cache.splice(0, 10)
        }
        else {
            this.cache.shift()
        }
    }
    
    size() {
        return this.cache.length
    }
}

const queue = max => new Queue(max)

export default queue