import eventManager from "../../core/event";
import log from "../../core/logger";
import profileManager from "../../core/profile";
import ui from "../../core/ui";
import element from "../../core/widgets/element";

const presetManager = {
    name: "Preset Manager",
    description: "Skill Preset Manager.",
    state: {
        cnt: 0,
        locked: false,
        columns: 1,
        presets: []
    },
    _profiles: true,
    defaultPresets: {
        0: [
            {name: "GLOOM"},
            {name: "OBE"},
            {name: "FARM"},
        ],
        1: [
            {name: "GLOOM"},
            {name: "OBE"},
            {name: "FARM"},
        ],
        2: [
            {name: "GLOOM"},
            {name: "OBE"},
            {name: "FARM"},
        ],
        3: [
            {name: "GLOOM"},
            {name: "OBE"},
            {name: "FARM"},
        ],
    },
    style:`
        .container.panel-black.svelte-um60d1 {
            display: none;
        }
        #skilllist {
            grid-template-columns: auto auto;
        }
        .flexer.svelte-1e0alkc.kek {
            display: grid;
            grid-template-columns: auto 1fr;
            gap: 2px;
        }
        .flexer.svelte-1e0alkc.kek > :nth-child(1) {
            grid-column: 1 / span 2;
        }
        .flexer.svelte-1e0alkc.kek > :nth-child(4) {
            grid-column: 1;
        }
    `,
    start() {
        eventManager.on("ui.skillsMenuParent", this.handler, this);
    },
    stop() {
        eventManager.off("ui.skillsMenuParent", this.handler, this);
    },
    n_barTop:NaN,
    n_select:NaN,
    n_barBot:NaN,
    n_tutapplyskills:NaN,
    n_flexser:NaN,
    n_skilllist:NaN,
    // visObserver:NaN,
    handler() {
        const skillMenu = ui.skillsMenuParent?.element;
        if (!skillMenu) return;

        this.n_flexser = skillMenu.querySelector(".flexer");
        this.n_barTop = this.n_flexser?.querySelector(".bar-top-config"); 
        this.n_barBot = this.n_flexser?.querySelector(".bar-bot"); 
        this.n_barBot.style.gridTemplateColumns = "180px auto 1fr"
        this.n_tutapplyskills = this.n_barBot.querySelector("#tutapplyskills");
        this.n_skilllist = this.n_flexser.querySelector("#skilllist");

        this.visObserver?.disconnect();
        this.visObserver = new MutationObserver((mutations) => {
            mutations.forEach(m => {
                m.addedNodes.forEach(node => {
                    if (node.nodeType === 1 && node.classList.contains('bar-top-config')) {
                        console.log(this)
                        this.n_barTop = node;
                        this.uiShow()
                    }
                });
                m.removedNodes.forEach(node => {
                    if (node.nodeType === 1 && node.classList.contains('bar-top-config')) {
                        console.log(this)
                        this.uiHide()
                    }
                });
            });
        });
        this.visObserver.observe(this.n_flexser, { childList: true });
        this.uiCreate()
        this.n_barTop && this.uiShow()
    },
    grid: NaN,
    actions:NaN,
    controls:NaN,
    btnTip: NaN,
    addBtn: NaN,
    lblBtn:NaN,
    impexBtn:NaN,
    columnsBtn: NaN,
    toggleBtn: NaN,
    uiCreate(){
        this.btnTip ||= element("div").css("btn textgrey textright").text("test")
        this.addBtn ||= element("div").css("btn black textgrey textcenter").text("🞤")
            .on("click", e => this.addPreset())
            .on("pointerenter", e => this.btnTip.text("Add Preset"))
            .on("pointerleave", e => this.btnTip.text(""))
        this.lblBtn ||= element("div").css("btn black textgrey textcenter").text("🞸")
            .on("click", e => this.addLabel())
            .on("pointerenter", e => this.btnTip.text("Add Label"))
            .on("pointerleave", e => this.btnTip.text(""))

        this.impexBtn ||= element("div").css("btn black textgrey textcenter").text("🗘")
            .on("click", e => this.addLabel())
            .on("pointerenter", e => this.btnTip.text("Import | Export"))
            .on("pointerleave", e => this.btnTip.text(""))
        this.columnsBtn ||= element("select").css("btn black textgrey").style({ "width": "40px", "height": "32px" })
            .on("change", (e) => {
                this.state.columns = parseInt(e.target.value);
                this.gridUpdate(); 
            });
        [1, 2, 3, 4, 5].forEach(num => {this.columnsBtn.add(element("option").attr("value", num).text(num))});
        this.columnsBtn.value(this.state.columns || 1)
            .on("pointerenter", e => this.btnTip.text("Columns"))
            .on("pointerleave", e => this.btnTip.text(""))
            
        this.toggleBtn ||= element("div").css("btn black textgrey")
                .style({"width": "20px"})
                .text(this.state.locked ? "🞂" : "🞀")
                .on("click", () => {
                    this.state.locked ^= 1;
                    this.toggleBtn.text(this.state.locked ? "🞂" : "🞀");
                    this.uiShow()
                })
                .on("pointerenter", e => this.btnTip.text("Lock"))
                .on("pointerleave", e => this.btnTip.text(""))


        this.actions ||= element("div")
            .css("panel-black preset-manager top-bar").style({
                "display": "none",
                "grid-template-columns": "30px 80px 60px",
                "grid-gap": "4px",
                "height": "32px",
                "margin-top": "4px",
            })
        this.grid ||= element("div").css("scrollbar panel-black")
            .style({
                "display": "none",
                "grid-template-columns": `repeat(${this.state.columns || 1}, 1fr)`,
                "gap": "4px",
                "height": "460px",
                "overflow-y": "auto",
                "align-content": "start",
                "min-width": "200px",
            });

        this.n_skilllist.after(this.grid.element);
        this.n_barBot.after(this.actions.element)
    },
    selectSync(){
        this.n_select = this.n_barTop?.querySelector("select");
        if (!this.n_select || this.n_select._optionHooked) return;
        this.n_select._optionHooked = true;
        
        const self = this;
        const descriptor = Object.getOwnPropertyDescriptor(HTMLOptionElement.prototype, 'selected');
        Object.defineProperty(HTMLOptionElement.prototype, 'selected', {
            set: function(v) {
                descriptor.set.call(this, v);
                if (v && this.closest('select') === self.n_select) {
                    Promise.resolve().then(() => {self.gridUpdate()});
                }
            },
            get: function() { return descriptor.get.call(this); },
            configurable: true
        });
    },
    nameSync() {
        this.selectSync()

        const n_values = Array.from(this.n_select.options, opt => opt.value)
            .filter(val => val);
        
        this.state.presets = this.state.presets
            .filter(p => !p.pid || n_values.includes(p.pid));

        n_values.forEach(val => {
            if (!this.state.presets.some(p => p.pid === val)) {
                this.state.presets.push({
                    name: val, 
                    pid: val, 
                    s: 0 
                });
            }
        });
    },
    uiShow() {
            this.nameSync()

            this.n_barTop && (this.n_barTop.style.display = "none");
            this.n_flexser.classList.add("kek");
            this.n_skilllist.style.display = this.state.locked ? "none" : "grid";
            this.n_barBot.style.gridTemplateColumns = this.state.locked ? "auto auto 1fr" : "180px auto 1fr"
            this.n_tutapplyskills.style.display = this.state.locked ? "none" : "block";
            
            this.actions.element.style.display = "grid";
            
            if (this.state.locked) {
                this.n_barBot.children[2].remove()
                this.actions.clear().style({"grid-template-columns": "40px 30px 1fr"})
                    .add(this.columnsBtn)
                    .add(this.toggleBtn)
            } else {
                this.n_barBot.children[2]?.remove()
                this.n_barBot.append(this.btnTip.element)
                this.actions.clear().style({"grid-template-columns": "30px 30px 50px 40px 30px 1fr"})
                    .add(this.addBtn)
                    .add(this.lblBtn)
                    // .add(this.impexBtn)
                    .add(element("div"))
                    .add(this.columnsBtn)
                    .add(this.toggleBtn)
            }

            this.grid.element.style.display = "grid";
            this.grid.element.style.gridColumn = this.state.locked ? "1 / span 2" : "2"
            
            this.gridUpdate();
    },
    uiHide() {
        this.n_flexser.classList.remove("kek");
        this.n_skilllist.style.display = "grid";
        this.n_barBot.style.gridTemplateColumns = "180px auto 1fr"
        this.n_tutapplyskills.style.display = "block";

        this.actions.element.style.display = "none";
        this.grid.element.style.display = "none";
    },
    addDefault(){
        const pclass = profileManager.playerClass;
        this.state.presets = this.defaultPresets[pclass]
    },
    async addLabel() {
        this.state.presets.push({ name: "New Label" });
        this.editingIndex = this.state.presets.length - 1;
        this.gridUpdate(); 
    },
    async addPreset() {
        let pid = this.n_select.value;

        if (pid === "") {
            this.state.cnt += 1;
            pid = `preset #${this.state.cnt}`; 
            this.n_barTop.children[2].click();
            await new Promise(res => setTimeout(res, 50));
            this.n_barTop.children[1].value = pid;
            this.n_barTop.children[1].dispatchEvent(new Event('input', { bubbles: true }));
            this.n_barTop.children[2].click();
            await new Promise(res => setTimeout(res, 50));
            this.n_select = this.n_barTop.querySelector("select");
            this.n_tutapplyskills.click()
        }
        
        this.state.presets.forEach(p => p.s = 0);
        this.state.presets.push({ 
            name: `New Preset #${this.state.cnt}`, 
            pid: pid, 
            s: 1 
        });
        this.editingIndex = this.state.presets.length - 1;
        this.gridUpdate(); 
    },
    async actionDelete(targetIndex) {
        const target = this.state.presets[targetIndex];
        if (!target) return;

        const pidToDelete = target.pid;

        this.state.presets.splice(targetIndex, 1);

        const isStillUsed = this.state.presets.some(p => p.pid === pidToDelete);
        if (pidToDelete && !isStillUsed) {
            this.n_select.value = pidToDelete;
            this.n_select.dispatchEvent(new Event('input', { bubbles: true }));
            this.n_select.dispatchEvent(new Event('change', { bubbles: true })); 
            
            if (this.n_barTop.children[3]) this.n_barTop.children[3].click(); 
            
            await new Promise(res => setTimeout(res, 50));
            
            this.state.presets.forEach(p => { p.s = 0; });
        }

        this.editingIndex = null;
        this.gridUpdate();
    },
    editingIndex: null,
    gridUpdate() {
        this.grid.clear().style({"grid-template-columns": `repeat(${this.state.columns || 1}, 1fr)`});

        // if (this.state.presets.length==0) {
        //     this.addDefault()
        // }

        this.state.presets.forEach((p, i) => {
            p.s = (p.pid === this.n_select.value) ? 1 : 0;
        });

        const presets = this.state.presets || [];

        presets.forEach((item, index) => {
            const card = this.createCard(item, index);
            this.grid.add(card);
        });

        const bottomDropZone = this.createBottomDropZone(presets.length);
        this.grid.add(bottomDropZone);
    },
    createBottomDropZone(lastIndex) {
        const zone = element("div").style({
            "width": "100%",
            "height": "10px",
            "margin-top": "5px",
            "border": "1px dashed transparent",
            "transition": "all 0.1s ease"
        });

        zone.on("dragover", (e) => {
            e.preventDefault();
            zone.style({
                "border": "1px dashed orange",
                "background": "rgba(255, 165, 0, 0.1)",
                "height": "30px"
            });
        });

        zone.on("dragleave", () => {
            zone.style({ "border": "1px dashed transparent", "background": "transparent", "height": "10px" });
        });

        zone.on("drop", (e) => {
            e.preventDefault();
            const fromIndex = parseInt(e.dataTransfer.getData("text/plain"));
            const toIndex = lastIndex; 

            this.handleReorder(fromIndex, toIndex);
        });

        return zone;
    },
    createCard(item, index) {
        const isLabel = !item.pid;
        const isEditing = this.editingIndex === index;
        const isActive = item.s === 1;

        const colCount = this.state.columns || 1;
        
        let cardClass = isLabel ? "textwhite bold" : "grey";
        
        let card = element("div").css(`btn ${cardClass}`)
            .style({
                "display": "flex",          
                "align-items": "center",
                "min-height": "32px",
                "min-width": "100px",
                "gap": "4px",
                "width": "100%",            
                "box-sizing": "border-box",
                "grid-column": isLabel ? `1 / span ${colCount}` : "auto",
                "cursor": isLabel ? "default" : "pointer"
            });

        isEditing && card.css("")

        const dotControl = element("div").css(`${isEditing && "textred "}textcenter`).text(isEditing && "✎" || "⋮")
            .style({
                "width": "12px",
                "opacity": isEditing ? "1" : "0",
                "cursor": "pointer"
            })
            .on("mouseenter", () => {dotControl.style({
                "opacity": "1"
            })})
            .on("mouseleave", () => {dotControl.style({
                "opacity": isEditing ? "1" : "0.2"
            })})
            .on("click", (e) => {
                e.stopPropagation();
                this.editingIndex = index;
                this.gridUpdate();
            })
            .on("mousedown", () => card.attr("draggable", "true"));
        
        const delControl = element("div")
            .css(`${isEditing && "textred "}textcenter`)
            .text("🞮")
            .style({
                "width": "12px",
                "opacity": isEditing ? "1" : "0",
                "cursor": "pointer"
            })
            .on("mousedown", async (e) => {
                e.stopPropagation(); 
                e.preventDefault(); 

                const targetIndex = index;
                this.editingIndex = null; 
                
                await this.actionDelete(targetIndex); 
            });
            
        const label = element(isEditing ? "input" : "span")
            .css(isLabel ? "textwhite bold" : (isActive && !isEditing ? "textorange" : "textgrey"))
            .style({ 
                "flex-grow": "1", 
                "text-align": "left", 
                "padding-left": "4px" 
            });

        if (isEditing) {
            label.element.value = item.name;
            setTimeout(() => label.element.select(), 0);
            label.element.focus()

            label.on("keyup", (e) => {
                if (e.key === "Enter" || e.key === "Escape") {
                    e.stopPropagation();
                    e.preventDefault();
                    
                    if (e.key === "Enter") {
                        const newVal = label.element.value.trim();
                        if (newVal) {
                            this.state.presets[index].name = newVal;
                        }
                    }
                    this.editingIndex = null;
                    this.gridUpdate();
                }
            });
            label.on("blur", () => {
                if (this.editingIndex === index) {
                    // If we are still in editing mode (meaning we didn't click delete)
                    const newVal = label.element.value.trim();
                    if (newVal) this.state.presets[index].name = newVal;
                    this.editingIndex = null;
                    this.gridUpdate();
                }
            });
            
        } else {
            label.text(item.name); // Span uses text
        }

        if (!isLabel) card.on("click", () => {
            this.state.presets.forEach((p, i) => {
                p.s = (i === index) ? 1 : 0;
            });
            this.n_select.value = item.pid;
            this.n_select.dispatchEvent(new Event('input', { bubbles: true }));
            this.n_select.dispatchEvent(new Event('change', { bubbles: true }));
            this.gridUpdate();
          });
            
        card
            .on("mouseenter", () => {dotControl.style({
                "opacity": isEditing ? "1" : "0.2"
            })})
            .on("mouseleave", () => {dotControl.style({
                "opacity": isEditing ? "1" : "0"
            })})
            .on("dragstart", (e) => {
                this.draggedIndex = index;
                e.dataTransfer.setData("text/plain", index.toString());
                this.editingIndex = null 
            })
            .on("dragover", (e) => {
                e.preventDefault();
                if (this.draggedIndex !== index) {
                    const isSingleCol = (this.state.columns || 1) === 1;
                    if (isSingleCol) {
                        card.style({ "box-shadow": "inset 0 3px 0 0 orange" });
                    } else {
                        card.style({ "box-shadow": "inset 3px 0 0 0 orange" });
                    }
                }
            })
            .on("dragleave", () => {
                card.style({ "box-shadow": "none" });
            })
            .on("drop", (e) => {
                e.preventDefault();
                card.style({ "border-top": "", "border-left": "" });
                
                const fromIndex = parseInt(e.dataTransfer.getData("text/plain"));
                if (fromIndex !== index) {
                    this.handleReorder(fromIndex, index);
                }
                this.draggedIndex = null;
            });
        if (!this.state.locked && !isEditing) card.add(dotControl)
        
            card.add(label)
        if (isEditing) card.add(delControl)
        return card
    },
    handleReorder(fromIndex, toIndex) {
        const list = this.state.presets;
        if (!list) return;

        const [movedItem] = list.splice(fromIndex, 1);
        
        let target = toIndex;
        if (fromIndex < toIndex) {
            target = toIndex - 1; 
        }

        list.splice(target, 0, movedItem);

        this.gridUpdate(); 
    },
};
// window.pmm = presetManager
export default presetManager;
