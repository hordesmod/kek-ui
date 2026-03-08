import eventManager from "../../core/event"
import ui from "../../core/ui"

const targetTooltip = {
    name: "Target Tooltip Tweaks",
    description: "Triple-twisted tale",
    state: {
        flat: false,
        position: "default",
    },
    settings: {
        flat: {control: "checkbox", desc: "Flat", comment: "Three lines goes to one", onupdate: "update"},
        position: { control: "select", desc: "Position", comment: "Tooltip position", options: { default: "default", tc: "Top Center", rc: "Right Center"}, onupdate: "update" },
    },
    start() {
        eventManager.on("ui.targetTooltip", this.update, this)
    },
    stop() {
        eventManager.off("ui.targetTooltip", this.update, this)
    },
    update() {
        const targetTooltip = ui.targetTooltip.element
        targetTooltip.style.zIndex = 10
        // padding: 4px;
        // <div class="panel-black container svelte-1wip79f" style="display: none; z-index: 10; position: absolute; top: unset; left: unset; bottom: 4px; right: 4px;">
        //     <div class="textwhite title svelte-1wip79f">Merchant</div>
        //     <div>
        //         <span>Lv. 99 </span>
        //         <span class="textc4 svelte-1wip79f">NPC</span>
        //     </div>
        //     <span class="textf0 svelte-1wip79f">Vanguard</span>
        // </div>

        if (this.state.flat) {
            for (const child of targetTooltip.children) {
                child.style.display = "inline-block"
                // child.style.fontWeight = "700"
                child.style.marginRight = "6px"
                child.style.fontSize = "15px"
            }
        } else {
            for (const child of targetTooltip.children) {
                child.style.display = ""
                child.style.marginRight = ""
                child.style.fontSize = ""
            }
        }
        
        if(this.state.position== "rc") {
            targetTooltip.style.right = "4px"
            targetTooltip.style.bottom = "50%"
            targetTooltip.style.top = "unset"
            targetTooltip.style.left = "unset"
            targetTooltip.style.position = "fixed"
            targetTooltip.style.transform = "translate(0, -50%)"
        }
        else if (this.state.position== "tc") {
            targetTooltip.style.position = "fixed"
            targetTooltip.style.top = "4px"
            targetTooltip.style.left = "50%"
            targetTooltip.style.bottom = "unset"
            targetTooltip.style.right = "unset"
            targetTooltip.style.transform = "translate(-50%)"
        }
        else {
            targetTooltip.style.position = "absolute"
            targetTooltip.style.top = "unset"
            targetTooltip.style.left = "unset"
            targetTooltip.style.bottom = "4px"
            targetTooltip.style.right = "4px"
            targetTooltip.style.transform = "unset"
        }

        
    }


}

export default targetTooltip