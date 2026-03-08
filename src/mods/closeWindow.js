const closeWindow = {
    name: "Close Window Shortcut",
    description: "Close window with a single button!",
    start() {

    },
    stop() {
        
    },
    state: {
        closeBag: 0,
        closeDps: 0,
        closeSettings: 0,
    },
    settings: {
        closeBag: { control: "checkbox", desc: "Inventory", comment: "Close bag" },
        closeDps: { control: "checkbox", desc: "Damage Meter", comment: "Close dps meter" },
        closeSettings: { control: "checkbox", desc: "Settings", comment: "Close settings window" },
    },
    hotkey: {
        "Close All Windows": { key: "Escape", callback: "handle" }
    },
    handle() {
        const titleframes = document.querySelectorAll(".titleframe")
        
        for (let titleframe of titleframes) {
            const titleEle = titleframe.children[1]
            if(!titleEle) continue
            const title = titleEle.textContent.toLowerCase().trim()
            const closeBtn = titleframe.lastElementChild
    
            const actions = {
                "inventory": this.state.closeBag,
                "damage": this.state.closeDps,
                "healing": this.state.closeDps,
                "settings": this.state.closeSettings,
            }
    
            if (!Object.prototype.hasOwnProperty.call(actions, title)) {
                closeBtn.click()
            }
            else if (actions[title]) {
                closeBtn.click()
            }
            
        }
    }
}

export default closeWindow