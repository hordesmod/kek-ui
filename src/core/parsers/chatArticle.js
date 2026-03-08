const chatArticleParser = (node) => {
    
    // console.log(node)
    if(node.tagName.toLowerCase() !== "article") return
        
    const linewrap = node.firstElementChild
    const [time, info, text] = linewrap.children

    const channel = info.firstElementChild
    
    const channelType = info.classList[0].substring(4)

    const obj = {
        article: node,
        linewrap,
        time,
        info,
        text,
        channel,
        channelType
    }

    const senderContainer = info.children[1]
    if (senderContainer) {
        const [senderInfo, senderName] = senderContainer.children

        obj.sender_container = senderContainer
        obj.sender_info = senderInfo
        obj.sender_name = senderName

        const senderIcons = senderInfo.children
        if (senderIcons.length === 2) {
            [obj.sender_supporter, obj.sender_icon] = senderIcons
        } else if (senderIcons.length === 1) {
            obj.sender_icon = senderIcons[0]
        }
    }

    return obj
}

export default chatArticleParser