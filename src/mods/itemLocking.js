import eventManager from "../core/event"

const itemLocking = {
    name: "Item Locking",
    description: "Inventory Item Locking",
    currentItemID: null,
    state: {
        lockedItems: []
    },
    lockedItems: new Set(),
    isShiftPressed: false,
    start() {
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Shift') {
                this.isShiftPressed = true;
            }
        });
    
        document.addEventListener('keyup', (event) => {
            if (event.key === 'Shift') {
                this.isShiftPressed = false;
            }
        });
        this.lockedItems = this.getLockedItems()
        eventManager.on("ui.bagParent", this.handleBag, this)
    },
    stop() {
        eventManager.off("ui.bagParent", this.handleBag, this)

    },
    handleBag(bagParent) {
        bagParent = bagParent.element
        const slotContainer = bagParent.querySelector(".slotcontainer")
        if (slotContainer) {
            const bagSlots = slotContainer.children
            for (let bagSlot of bagSlots) {
                const observerSlot = new MutationObserver((mutationsList, observerBag) => {
                    for (const mutation of mutationsList) {
                        if (mutation.type === 'childList') {
                            // A child node has been added
                            for (const childNode of mutation.addedNodes) {
                                // console.log(childNode)
                                if (childNode instanceof HTMLElement && childNode.classList.contains('slotdescription')) {
                                    const itemEles = slotContainer.querySelectorAll(".slotdescription")
                                    const itemEle = itemEles[itemEles.length - 1]
                                    // console.log(itemEle.outerHTML)
                                    // console.log(getItemUI(itemEle))
                                    // console.log(isBis(getItemUI(itemEle)))
                                    // Use a regular expression to extract the number after "ID:"
                                    const text = itemEle.textContent
                                    const match = text.match(/ID: (\d+)/);

                                    // Check if there is a match and get the captured number
                                    this.currentItemID = match ? match[1] : null;
                                    // console.log(currentItemID)
                                    this.handleBagSlot(itemEle.closest(".slot"), this.currentItemID)
                                }
                            }
                        }
                    }
                })
                const observerConfig = { childList: true };

                // Start observing the target node for mutations
                observerSlot.observe(bagSlot, observerConfig);
            }
        }
    },
    handleBagSlot(slot, id) {
        slot.addEventListener("contextmenu", () => {
            const menu = document.querySelector(".panel.context.border.grey")
            // console.log(menu)
            if(menu && !menu.classList.contains("kek-ui-menu")) {
                menu.classList.add("kek-ui-menu")
                const choices = menu.querySelectorAll(".choice")
                const firstChoice = choices[0].textContent.toLowerCase().trim()
                if(firstChoice == "equip item") {
                    const isLocked = this.lockedItems.has(id)
                    // Add "Lock item" or "Unlock item" choice based on the item's lock status
                    const lockUnlockMenu = document.createElement("div");
                    lockUnlockMenu.classList.add("choice");
                    lockUnlockMenu.textContent = isLocked ? "Unlock Item" : "Lock Item";
                    menu.appendChild(lockUnlockMenu);

                    lockUnlockMenu.addEventListener('click', () => {
                        // Toggle lock status of the item
                        if (isLocked) {
                            this.lockedItems.delete(id);
                            console.log(this.lockedItems)
                        } else {
                            this.lockedItems.add(id);
                            console.log(this.lockedItems)

                        }

                        // Save the updated lockedItems set
                        this.setLockedItems(this.lockedItems);
                        // Close the context menu
                        menu.style.display = "none";
                    });


                }
            }
        })
        // Conditional event listener for "shift + right click"

        if(!slot.classList.contains("lockingKEK")) {
            // console.log("adding lock event listener")
            slot.classList.add("lockingKEK")

            slot.addEventListener("contextmenu", (e) => {
                this.requestFunc(e, id)
            });
        }
    },
    // Function to get the locked items set from localStorage
    getLockedItems() {
        return new Set(this.state.lockedItems);
    },
    // Function to set the locked items in localStorage
    setLockedItems(lockedItemsSet) {
        const lockedItemsArray = Array.from(lockedItemsSet);
        this.state.lockedItems = lockedItemsArray
    },
    requestFunc(event, id) {
        const isLocked = this.lockedItems.has(id)
        // console.log("running request func", isShiftPressed, lockedItems, isLocked)

        // console.log(isLocked, "locked")
        if (this.isShiftPressed && isLocked) {
            // Find and remove the "Request" element
            const requestElement = [...document.querySelectorAll(".window-pos")].find(window => {
                return window.textContent.startsWith("Request")
            })
            // console.log(requestElement)

            if (requestElement) {
                const declineBtn = requestElement.querySelectorAll(".choice")[1]
                declineBtn.click()
            }
        }
    }
}

export default itemLocking