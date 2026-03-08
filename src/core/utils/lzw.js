class LZW {
    constructor() {
        this.dictionary = {}
        this.code = 256
    }

    encode(s) {
        const data = (s + "").split("")
        const out = []
        let currChar
        let phrase = data[0]

        for (let i = 1; i < data.length; i++) {
            currChar = data[i]

            if (this.dictionary[phrase + currChar] != null) {
                phrase += currChar
            } else {
                out.push(phrase.length > 1 ? this.dictionary[phrase] : phrase.charCodeAt(0))
                this.dictionary[phrase + currChar] = this.code
                this.code++
                phrase = currChar
            }
        }

        out.push(phrase.length > 1 ? this.dictionary[phrase] : phrase.charCodeAt(0))

        for (let i = 0; i < out.length; i++) {
            out[i] = String.fromCharCode(out[i])
        }

        return out.join("")
    }

    decode(s) {
        const data = (s + "").split("")
        let currChar = data[0]
        let oldPhrase = currChar
        const out = [currChar]
        let code = 256
        let phrase

        for (let i = 1; i < data.length; i++) {
            const currCode = data[i].charCodeAt(0)

            if (currCode < 256) {
                phrase = data[i]
            } else {
                phrase = this.dictionary[currCode] ? this.dictionary[currCode] : oldPhrase + currChar
            }

            out.push(phrase)
            currChar = phrase.charAt(0)
            this.dictionary[code] = oldPhrase + currChar
            code++
            oldPhrase = phrase
        }

        return out.join("")
    }
}

const lzw = new LZW()

export default lzw