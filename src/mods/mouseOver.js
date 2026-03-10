// IMPORTANT: This module strictly follows 1:1 input mapping:
// Each player action (keypress) triggers exactly one click on the hovered target.
// No actions are automated; hovering only stores the target for the next keypress.
import eventManager from "../core/event";
import ui from "../core/ui";
import element from "../core/widgets/element";
import { addSysbtn } from "../core/widgets/btnbar";

const mouseOver = {
    name: "Mouse Over",
    description: "Party target selection with strict 1:1 input mapping",
    state: { enabled: false },
    btn: null,
    hovered: null,

    start() {
        eventManager.on("ui.sysbtnbar", this.addBtn, this);
        this._onMouseOver = (e) => {
            if (this.hovered === e.target) return;
            const target = e.target.closest(".bghealth, .left, .right");
            this.hovered !== target && (this.hovered = target);
        };

        this._onKeyDown = (e) => this.hovered && this.hovered.click();

        this.state.enabled && eventManager.on("ui.partyframes", this.addListeners, this);
        
    },
    stop() {
        eventManager.off("ui.sysbtnbar", this.addBtn, this);
        eventManager.off("ui.partyframes", this.addListeners, this);
        this.removeListeners();
        this.btn && (this.btn = this.btn.remove());
    },
    addListeners() {
        const container = ui.partyframes?.element;
        if (!container) return;
        this.removeListeners(); 
        container.addEventListener("pointerover", this._onMouseOver);
        document.addEventListener("keydown", this._onKeyDown);
    },
    removeListeners() {
        const container = ui.partyframes?.element;
        if (container) {
            container.removeEventListener("pointerover", this._onMouseOver);
        }
        document.removeEventListener("keydown", this._onKeyDown);
        this.hovered = null;
    },
    toggleBtn() {
        this.state.enabled = !this.state.enabled;
        this.btn.toggle("textgreen").toggle("textgrey");
        if (this.state.enabled) {
            this.addListeners();
            eventManager.on("ui.partyframes", this.addListeners, this);
        } else {
            this.removeListeners();
            eventManager.off("ui.partyframes", this.addListeners, this);
        }
    },
    addBtn(sysbtnbar) {
        this.btn = element("div")
            .css(`btn border black ${this.state.enabled ? "textgreen" : "textgrey"}`)
            .text("Mo")
            .style({ paddingLeft: "3px",paddingRight: "3px", margin: "2px" })
            .on("click", () => this.toggleBtn());
            
        this.btn.element.tooltip = "Mouse over mode";
        addSysbtn(sysbtnbar.element, this.btn.element);
    }
};

export default mouseOver;