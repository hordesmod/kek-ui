function getClass(url) {
    let _class = null
    if(!url.includes("classes")) return 5
    _class = url.split("classes")[1][1]
    return _class
}

export {
    getClass
}