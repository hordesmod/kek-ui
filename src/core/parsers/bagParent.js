const bagParent = (node) => {
    
    // console.log(node)
    // if(node.tagName.toLowerCase() !== "article") return

    const filter = node.querySelector(".filter")
    const slotcontainer  = node.querySelector(".slotcontainer")

    const obj = {
        node,
        filter,
        slotcontainer,
    }

    return obj
}

export default bagParent