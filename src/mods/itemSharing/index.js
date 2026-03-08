import eventManager from "../../core/event";
import ui from "../../core/ui";
import parseAuxi from "./auxi";
import { compareItems, generateItemDescription, generateItemsDescription, getHydratedItem, getHydratedItems, getItem } from "../../core/widgets/item";

const itemSharing = {
    name: "Item Sharing",
    _generatedSlotContainer: null,
    currentArticle: null,
    start() {
        eventManager.on("ui.chatArticle", this.handleChatArticle, this)
        eventManager.on("ui.chatPanel", this.handleChat, this)
        eventManager.on("ui.itemParent", this.hideItemWindow, this)
        document.addEventListener("click", this.documentHandler.bind(this))
    },
    stop() {
        eventManager.off("ui.chatArticle", this.handleChatArticle, this)
        eventManager.off("ui.chatPanel", this.handleChat, this)
        eventManager.off("ui.itemParent", this.hideItemWindow, this)
    },
    documentHandler(event) {
        if (event.target.classList.contains("svgicon")) {
            event.stopPropagation()
            return
        }

        if (this._generatedSlotContainer) {
            this._generatedSlotContainer.remove()
            this._generatedSlotContainer = null
            this.currentArticle = null
            document.removeEventListener("click", this.documentHandler.bind(this))
        }
        if (ui.mainContainer.element.contains(ui.itemParent.element)) {
            ui.itemParent.element.children[0].children[0].lastChild.click()
        }
    },
    linkHandle(e) {
        const target = e.target
        if (target.tagName.toLowerCase() == 'span' &&
            (target.classList.contains("chatItem") ||
                target.classList.contains("textpurp-l") ||
                target.classList.contains("textprimary")
            )) {
            e.stopPropagation();
            e.preventDefault()
            if(!this.currentArticle) {
                this.currentArticle = target.closest("article")
            }

            if (this._generatedSlotContainer != null) {
                this._generatedSlotContainer.remove()
                this._generatedSlotContainer = null
                
                if(this.currentArticle == target.closest("article")) {
                    this.currentArticle = null
                    const itemParent = ui.itemParent.element
                    if(itemParent) itemParent.children[0].children[0].lastChild.click()
                    return
                } else {
                    this.currentArticle = target.closest("article")
                }
            }

            let parent = null
            if (target.classList.contains("chatItem")) parent = target.parentNode
            else parent = target.parentNode.parentNode

            const chatItemSpans = parent.children

            const rawItems = []
            for (let chatItemSpan of chatItemSpans) {
                rawItems.push(chatItemSpan.item)
            }
            const hydratedItems = getHydratedItems(rawItems)
            this._generatedSlotContainer = generateItemsDescription(hydratedItems)
            if (ui.itemParent.element && this._generatedSlotContainer) {
                const itemParent = ui.itemParent.element
                itemParent.children[0].children[0].lastChild.click()
            }
        }
    },
    handleChat(chatPanel) {
        chatPanel = chatPanel.element
        Array.from(chatPanel.children).forEach(article => {
            this.handleChatArticle({element: article})
        })
        
        chatPanel.addEventListener("click", this.linkHandle.bind(this))
    },
    handleChatArticle(newArticle) {
        newArticle = newArticle.element
        // Get the span with class "content" within the new article
        const contentSpan = newArticle.querySelector('.content');
        if (contentSpan) {
            // Get the sibling span
            const siblingSpan = contentSpan.nextElementSibling;
            if (siblingSpan) {
                const hasExclaimation = siblingSpan.textContent.includes('!');

                // Run parseAuxi function and get the result
                const parsedAuxi = parseAuxi(siblingSpan.textContent);
                // Modify the textContent of siblingSpan based on the result
                if (hasExclaimation) {
                    if (parsedAuxi.isMatch) {
                        siblingSpan.style.color = "white"
                        siblingSpan.style.pointerEvents = 'all';
                        siblingSpan.style.cursor = 'pointer'
                        let ids = parsedAuxi.ids
                        const itemUpgradeTable = parsedAuxi.itemUpgradeTable
                        // console.log(newItems)

                        siblingSpan.addEventListener('click', async () => {
                            // Run generateItemDescription function on mouseover
                            const newItems = await getItem(ids, itemUpgradeTable)

                            const slotsContainer = document.querySelector(".slotsContainerKEK")
                            if (slotsContainer) {
                                slotsContainer.remove()
                                this._generatedSlotContainer = null
                            }
                            if (newItems.length === 2) {
                                // console.log("compare is working")
                                this._generatedSlotContainer = compareItems(newItems[0], newItems[1])
                            }
                        });
                    }
                }
            }
        }
    },

    hideItemWindow(itemParent) {
    }
}

export default itemSharing