import eventManager from "../../core/event";
import log from "../../core/logger";
import profileManager from "../../core/profile";
import ui from "../../core/ui";
import element from "../../core/widgets/element";

const presetManager = {
    name: "Preset Manager",
    description: "Skill Preset Manager.",
    state: {
        locked: false,
        columns: 1,
        presets: {
            0:[],
            1:[],
            2:[],
            3:[]
        }
    },
    defaultPresets: {
        0: [
            {"name": "STARTER WARPACK"},
            {"name": "Gloomfury", "pid": "gloom", "skills": [0,1,8,21,40]},
            {"name": "Obelisk", "pid": "obelisk", "skills": [0,1,8,21,40]},
            {"name": "Farming", "pid": "farming", "skills": [0,1,8,21,40]},
            {"name": "Arena Builds"},
            {"name": "2vs2", "pid": "obelisk", "skills": [0,1,8,21,40]},
        ],
        1: [
            {"name": "STARTER MAGPACK"},
            {"name": "Gloomfury", "pid": "gloom", "skills": [4,8,40]},
            {"name": "Obelisk", "pid": "obelisk", "skills": [4,8,40]},
            {"name": "Farming", "pid": "farming", "skills": [4,8,40]},
            {"name": "Arena Builds"},
            {"name": "2vs2", "pid": "obelisk", "skills": [4,8,40]},
        ],
        2: [
            {"name": "STARTER ARCHPACK"},
            {"name": "Gloomfury", "pid": "gloom", "skills": [5,8,9,9,9,9,9,10,10,10,10,10,11,11,11,11,11,29,29,29,29,29,31,31,31,31,38,39,40,54,54,54,54,54]},
            {"name": "Obelisk", "pid": "obelisk", "skills": [0,7,7,7,8,40]},
            {"name": "Farming", "pid": "farming", "skills": [0,7,7,7,8,40]},
            {"name": "Arena Builds"},
            {"name": "2vs2", "pid": "obelisk", "skills": [0,7,7,7,8,40]},
        ],
        3: [
            {"name": "STARTER SHAMPACK"},
            {"name": "Gloomfury", "pid": "gloom", "skills": [0,7,7,7,8,40]},
            {"name": "Obelisk", "pid": "obelisk", "skills": [0,7,7,7,7,7,8,40]},
            {"name": "Farming", "pid": "farming", "skills": [0,7,7,7,7,8,40]},
            {"name": "Arena Builds"},
            {"name": "2vs2", "pid": "obelisk", "skills": [0,7,7,7,7,7,8,40]},
        ]
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
        eventManager.on("ui.contextMenu", this.contextMenu, this);
        
    },
    stop() {
        eventManager.off("ui.skillsMenuParent", this.handler, this);
        eventManager.off("ui.contextMenu", this.contextMenu, this);
    },
    n_barTop:NaN,
    n_select:NaN,
    n_barBot:NaN,
    n_tutapplyskills:NaN,
    n_flexser:NaN,
    n_skilllist:NaN,
    // visObserver:NaN,
    pclass: NaN,
    handler() {
        const skillMenu = ui.skillsMenuParent?.element;
        if (!skillMenu) return;

        this.pclass = profileManager.playerClass

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
                        this.n_barTop = node;
                        this.uiShow()
                    }
                });
                m.removedNodes.forEach(node => {
                    if (node.nodeType === 1 && node.classList.contains('bar-top-config')) {
                        this.n_barTop = null;
                        this.uiHide()
                    }
                });
            });
        });
        this.visObserver.observe(this.n_flexser, { childList: true });
        this.uiCreate()
        this.n_barTop && this.uiShow()
    },
    contextMenu() {
        let contextMenu = ui.contextMenu.element;
        if (!this.n_barTop || contextMenu.children[0]?.innerText !== 'Skills') return;
        if (contextMenu.querySelector('.preset-action')) return; 

        const exportBtn = element("div").css("choice preset-action").text("Export (Clipboard)")
            .on("click", () => {
                this.export();
                ui.contextMenu.element.remove();
            });

        const importBtn = element("div").css("choice preset-action").text("Import (Clipboard)")
            .on("click", async () => {
                try {
                    this.import();
                    ui.contextMenu.element.remove();
                } catch (e) {
                    alert("Please allow clipboard access or click the game window first.");
                }
            });

        contextMenu.append(exportBtn.element);
        contextMenu.append(importBtn.element);
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
        this.btnTip ||= element("div").css("btn textgrey textright")
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
        
        if (!this.columnsBtn) {
            this.columnsBtn = element("select").css("btn black textgrey").style({ "width": "40px", "height": "32px" })
                .on("change", (e) => {
                    this.state.columns = parseInt(e.target.value);
                    this.gridUpdate(); 
                });
            [1, 2, 3, 4, 5].forEach(num => {this.columnsBtn.add(element("option").attr("value", num).text(num))});
        }
        
        this.columnsBtn.value(this.state.columns || 1)
            .on("pointerenter", e => this.btnTip.text("Columns"))
            .on("pointerleave", e => this.btnTip.text(""))
            
        this.toggleBtn ||= element("div").css("btn black textgrey textcenter")
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
        this.initGridEvents()
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
        this.selectSync();

        if (!Array.isArray(this.state.presets[this.pclass])) {
            this.state.presets[this.pclass] = [];
        }

        const n_values = Array.from(this.n_select.options, opt => opt.value)
            .filter(val => val);
        
        this.state.presets[this.pclass] = this.state.presets[this.pclass]
            .filter(p => p && (!p.pid || n_values.includes(p.pid)));

        n_values.forEach(val => {
            if (!this.state.presets[this.pclass].some(p => p && p.pid === val)) {
                this.state.presets[this.pclass].push({
                    name: val, 
                    pid: val, 
                    s: 0 
                });
            }
        });
        
        this.gridUpdate(); 
    },
    uiShow() {
            this.nameSync()

            // this.n_barTop && (this.n_barTop.style.display = "none");
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
    async import(isDefault = false) {
        const pclass = this.pclass;
        let presets = [];

        if (isDefault) {
            presets = this.defaultPresets[pclass] || [];
        } else {
            try {
                const text = await navigator.clipboard.readText();
                presets = JSON.parse(text);
            } catch (e) { return console.error("Clipboard error"); }
        }
        this.state.presets[pclass] = presets.map(({ s, skills, ...rest }) => rest);

        let storage = JSON.parse(localStorage.getItem("skillConfigs")) || [];
        storage = storage.filter(item => item.pclass !== pclass);

        presets.forEach(item => {
            if (item.pid && item.skills) {
                if (!storage.some(s => s.name === item.pid && s.pclass === pclass)) {
                    storage.push({ name: item.pid, skills: [...item.skills], pclass });
                }
            }
        });

        localStorage.setItem("skillConfigs", JSON.stringify(storage));
        window.location.reload();
    },
    async export() {
        const pclass = this.pclass;
        const presets = this.state.presets[pclass] || [];
        const storageData = JSON.parse(localStorage.getItem("skillConfigs")) || [];

        const fullConfig = presets.map(item => {
            let skills = [];
            if (item.pid) {
                const config = storageData.find(s => s.name === item.pid && s.pclass === pclass);
                skills = config ? [...config.skills] : [];
            }
            const { s, ...cleanItem } = item;
            return item.pid ? { ...cleanItem, skills } : cleanItem;
        });

        const compactJson = "[\n" + fullConfig.map(item => "  " + JSON.stringify(item)).join(",\n") + "\n]";

        await navigator.clipboard.writeText(compactJson);
        console.log("Export in clipboard!");
    },
    async addLabel() {
        this.state.presets[this.pclass].push({ name: "New Label" });
        this.editingIndex = this.state.presets[this.pclass].length - 1;
        this.gridUpdate(); 
    },
    getNextNum() {
        const nums = Array.from(this.n_select.options)
            .map(opt => {
                const match = opt.textContent.trim().match(/#(\d+)$/);
                return match ? parseInt(match[1]) : 0;
            });
        return Math.max(0, ...nums) + 1;
    },
    async addPreset() {
        const nextNum = this.getNextNum();
        console.log(nextNum)
        
        let pid = this.n_select.value;

        if (pid === "") {
            pid = `preset #${nextNum}`; 
            this.n_barTop.children[2].click();
            await new Promise(res => setTimeout(res, 50));
            this.n_barTop.children[1].value = pid;
            this.n_barTop.children[1].dispatchEvent(new Event('input', { bubbles: true }));
            this.n_barTop.children[2].click();
            await new Promise(res => setTimeout(res, 50));
            this.n_select = this.n_barTop.querySelector("select");
            this.n_tutapplyskills.click();
        }
        
        this.state.presets[this.pclass].forEach(p => p.s = 0);

        this.state.presets[this.pclass].push({ 
            name: `New Preset #${nextNum}`, 
            pid: pid, 
            s: 1 
        });

        this.editingIndex = this.state.presets[this.pclass].length - 1;
        this.gridUpdate(); 
    },
    async actionDelete(targetIndex) {
        const target = this.state.presets[this.pclass][targetIndex];
        if (!target) return;

        const pidToDelete = target.pid;

        this.state.presets[this.pclass].splice(targetIndex, 1);

        const isStillUsed = this.state.presets[this.pclass].some(p => p.pid === pidToDelete);
        if (pidToDelete && !isStillUsed) {
            this.n_select.value = pidToDelete;
            this.n_select.dispatchEvent(new Event('input', { bubbles: true }));
            this.n_select.dispatchEvent(new Event('change', { bubbles: true })); 
            
            if (this.n_barTop.children[3]) this.n_barTop.children[3].click(); 
            
            await new Promise(res => setTimeout(res, 50));
            
            this.state.presets[this.pclass].forEach(p => { p.s = 0; });
        }

        this.editingIndex = null;
        this.gridUpdate();
    },
    editingIndex: null,
    gridUpdate() {
        const scrollContainer = this.grid.element; 
        const currentScroll = scrollContainer.scrollTop;
        
        this.grid.clear().style({"grid-template-columns": `repeat(${this.state.columns || 1}, 1fr)`});

        if (this.state.presets[this.pclass].length==0) {
            const wrapper = element("div").style({
                "display": "flex",
                "flex-direction": "column",
                "justify-content": "center",
                "align-items": "center",
                "height": "450px",
                "gap": "12px"     
            });

            const defBtn = element("div").css("btn green textcenter").text("Load Examples")
                .on("click", () => this.import(1));
            const note = element("div").css("btn textgrey textcenter").text("or start creating...");

            wrapper.add(defBtn).add(note);
            this.grid.add(wrapper);
            return
        }

        this.state.presets[this.pclass].forEach((p, i) => {
            p.s = (p.pid === this.n_select.value) ? 1 : 0;
        });

        const presets = this.state.presets[this.pclass] || [];

        presets.forEach((item, index) => {
            const card = this.createCard(item, index);
            this.grid.add(card);
        });

        scrollContainer.scrollTop = currentScroll;
    },
    createBottomDropZone(lastIndex) {
        const zone = element("div").style({
            "width": "100%",
            "height": "30px",
            // "margin-top": "5px",
            "border": "1px dashed transparent",
            // "border": "1px dashed red",
            // "transition": "all 0.1s ease"
        });

        zone.on("dragover", (e) => {
            e.preventDefault();
            zone.style({
                "border": "1px dashed orange",
                "background": "rgba(255, 165, 0, 0.1)",
                "height": "100px"
            });
        });

        zone.on("dragleave", () => {
            zone.style({
                "border": "1px dashed transparent",
                "background": "transparent",
                "height": "30px"
            });
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
        
        const isDragging = this.draggedIndex === index;

        let card = element("div").css(`btn ${isLabel ? "textwhite bold" : "grey"}`)
        .style({
            "display": "flex",          
            "align-items": "center",
            "min-height": "32px",
            "min-width": "100px",
            // "gap": "4px",
            "width": "100%",            
            "box-sizing": "border-box",
            "grid-column": isLabel ? `1 / span ${colCount}` : "auto",
            "cursor": isLabel ? "default" : "pointer",
            "background": isLabel ? "#0000" : "#19202d",
            "opacity": isDragging ? "0.3" : "1",
            "border": isDragging ? "2px dashed orange" : (isLabel ? "none" : "none"),
            "background": isLabel ? "#0000" : (isDragging ? "transparent" : "#19202d"),
            "pointer-events": isDragging ? "none" : "auto" 
        })
        .data("index", index)
        .data("type", isLabel ? "label" : "card")

        isEditing && card.css("")

        const dotControl = element("div").css(`textcenter`).text("⋮")
            .style({
                "width": "12px",
                "opacity": "0",
                "cursor": "pointer"
            })
            .on("mouseenter", () => {dotControl.style({
                "opacity": "1"
            })})
            .on("mouseleave", () => {dotControl.style({
                "opacity": "0.2"
            })})
            .on("click", (e) => {
                e.stopPropagation();
                this.editingIndex = index;
                this.gridUpdate();
            })
            .on("mousedown", () => card.attr("draggable", "true"));
        
        const delControl = element("div")
            .css("textred textcenter")
            .text("🞮")
            .style({
                "width": "12px",
                "opacity": "1",
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
                            this.state.presets[this.pclass][index].name = newVal;
                        }
                    }
                    this.editingIndex = null;
                    this.gridUpdate();
                }
            });
            label.on("blur", () => {
                if (this.editingIndex === index) {
                    const newVal = label.element.value.trim();
                    if (newVal) this.state.presets[this.pclass][index].name = newVal;
                    this.editingIndex = null;
                    this.gridUpdate();
                }
            });
            
        } else {
            label.text(item.name);
        }

        if (!isLabel) card.on("click", () => {
            if (this.editingIndex === index) return;
            this.state.presets[this.pclass].forEach((p, i) => {
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

        if (!this.state.locked && !isEditing) card.add(dotControl)
        
            card.add(label)
        if (isEditing) card.add(delControl)
        return card
    },
    initGridEvents() {
    const grid = this.grid;

    grid.on("dragstart", (e) => {
        const card = e.target.closest("[data-index]");
        if (card) {
            this.draggedIndex = parseInt(card.dataset.index);
            e.dataTransfer.setData("text/plain", card.dataset.index);
            e.dataTransfer.effectAllowed = "move";
            setTimeout(() => this.gridUpdate(), 0);
        }
    });

    grid.on("dragover", (e) => {
        e.preventDefault();
        const card = e.target.closest("[data-index]");
        const fromIndex = this.draggedIndex;
        if (fromIndex === null) return;

        if (card) {
            const toIndex = parseInt(card.dataset.index);
            if (toIndex === fromIndex) return;

            const rect = card.getBoundingClientRect();
            const isSingleCol = (this.state.columns || 1) === 1;
            const isAfter = isSingleCol 
                ? (e.clientY - rect.top > rect.height / 2) 
                : (e.clientX - rect.left > rect.width / 2);

            this.liveReorder(fromIndex, toIndex, isAfter);
        } else {
            const list = this.state.presets[this.pclass];
            const lastIndex = list.length - 1;
            
            if (fromIndex !== lastIndex) {
                const lastCard = grid.element.querySelector(`[data-index="${lastIndex}"]`);
                if (lastCard) {
                    const rect = lastCard.getBoundingClientRect();
                    if (e.clientY > rect.bottom || (e.clientY > rect.top && e.clientX > rect.right)) {
                        this.liveReorder(fromIndex, lastIndex, true);
                    }
                }
            }
        }
    });

    grid.on("dragend", () => {
        this.draggedIndex = null;
        this.gridUpdate();
    });

    grid.on("drop", (e) => {
        e.preventDefault();
        this.draggedIndex = null;
        this.gridUpdate();
    });
},

    liveReorder(fromIndex, toIndex, isAfter) {
        const list = this.state.presets[this.pclass];
        const item = list.splice(fromIndex, 1)[0];
        
        let target = toIndex;
        if (isAfter) target = (fromIndex < toIndex) ? toIndex : toIndex + 1;
        else target = (fromIndex < toIndex) ? toIndex - 1 : toIndex;

        list.splice(target, 0, item);
        this.draggedIndex = target;
        this.gridUpdate(); 
    }

};
window.pmm = presetManager
export default presetManager;
