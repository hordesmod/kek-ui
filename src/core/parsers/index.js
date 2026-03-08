import bagParent from "./bagParent"
import chatArticleParser from "./chatArticle"

class Parser {
    constructor() {
        this.chatArticle = chatArticleParser
        this.bagParent = bagParent
    }
    get(name) {
        return this[name]
    }
}

const parser = new Parser()

export default parser