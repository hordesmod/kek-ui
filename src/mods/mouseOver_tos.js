import eventManager from "../core/event";

const mouseOver = {
    name: "Mouse Over",
    description: "Mouseover target selection",
    state: {
        enabled: false
    },
    toggle() {
        this.state.enabled = !this.state.enabled
    },
    start() {
        document.addEventListener("mouseover", (event) => {
            const target = event.target
            if (this.state.enabled
                && (target.classList.contains("bghealth") || target.classList.contains("left") || target.classList.contains("right"))
            ) {
                event.target.click()
            }
        })
        eventManager.on("click.mouseOver", this.toggle, this)
    },
    stop() {
        eventManager.off("click.mouseOver", this.toggle, this)
    },
}

export default mouseOver