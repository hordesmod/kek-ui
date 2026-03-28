import eventManager from "../../core/event";
import log from "../../core/logger";
import profileManager from "../../core/profile";
import ui from "../../core/ui";
import element from "../../core/widgets/element";

const presetManager = {
    name: "Preset Manager",
    description: "Skill Preset Manager.",
    state: {
        active: false,
    },
    style:`
        .container.panel-black.svelte-um60d1 {
            display: none;
        }
        .preset-manager.btn {
            min-width: 60px; 
            text-align: center;
        }
        #skilllist {
            grid-template-columns: auto auto;
        }
        
        .flexer.svelte-1e0alkc.kek {
            display: grid;
            grid-template-columns: auto 1fr;
            gap: 2px;
        }

        .flexer.svelte-1e0alkc.kek > *:not(:nth-child(3)):not(:nth-child(4)) {
            grid-column: 1 / span 2;
        }

        .flexer.svelte-1e0alkc.kek > :nth-child(3),
        .flexer.svelte-1e0alkc.kek > :nth-child(4) {
            align-self: center;
        }

    `,
    start() {
        eventManager.on("ui.skillsMenuParent", this.handler, this);
    },
    stop() {
        eventManager.off("ui.skillsMenuParent", this.handler, this);
    },
    handler() {
        const skillMenu = ui.skillsMenuParent?.element;
        if (!skillMenu) return;

        this.flexser = skillMenu.querySelector(".flexer.svelte-1e0alkc");
        this.barTop = this.flexser?.querySelector(".bar-top-config"); 
        if (!this.barTop) return;
        //////////////////////////
        this.barTop && (this.barTop.style.display = "none");

        this.toggleBtn = this.toggleBtn || element("div").css("btn grey")
            .style({
                "margin-left": "auto",
                "width": "20px",
                "text-align": "center"
            })
            .text(this.state.active ? "▶" : "◀")
            .on("click", this.toggle.bind(this));
        this.actionBar = this.actionBar || element("div").css("panel-black preset-manager top-bar");
        this.manager = this.manager || element("div").css("scrollbar panel-black").style({
            "min-width": "200px", "padding": "8px", "display": "flex",
            "flex-direction": "column", "gap": "4px", "height": "452px",
        });

        this.barObserver?.disconnect();
        this.barObserver = new MutationObserver((mutations) => {
            for (let m of mutations) {
                if (m.target.classList.contains('bar-top-config')) {
                    this.btnObservers(); 
                    this.managerUpdate();
                } else {
                    this.selectObserver?.disconnect();
                }
            }
        });
        this.barObserver.observe(this.barTop, { attributes: true, attributeFilter: ['class'] });

        this.skilllist = this.flexser.querySelector("#skilllist");
        if (this.skilllist) {
            this.flexser.classList.add("kek");
            this.skilllist.before(this.actionBar.element);
            this.skilllist.after(this.manager.element);
            
            this.actionBar.element.style.display = "flex";
            this.manager.element.style.display = "flex";
            
            this.btnObservers(); 
            this.actionUpdate();
            this.managerUpdate();
        }
    },
    btnSync() {
        const gameBtnSave = this.barTop?.children[2];
        const isSaveDisabled = gameBtnSave?.classList.contains("disabled") || gameBtnSave?.classList.contains("black");
        if (this.btnSave) {
            this.btnSave.element.style.opacity = isSaveDisabled ? "0.5" : "1";
            this.btnSave.element.style.pointerEvents = isSaveDisabled ? "none" : "auto";
        }

        const gameBtnDelete = this.barTop?.children[3];
        const isDeleteDisabled = gameBtnDelete?.classList.contains("disabled") || gameBtnDelete?.classList.contains("black");
        if (this.btnDelete) {
            this.btnDelete.element.style.opacity = isDeleteDisabled ? "0.5" : "1";
            this.btnDelete.element.style.pointerEvents = isDeleteDisabled ? "none" : "auto";
            if (this.btnRename) {
                this.btnRename.element.style.opacity = isDeleteDisabled ? "0.5" : "1";
                this.btnRename.element.style.pointerEvents = isDeleteDisabled ? "none" : "auto";
            }
        }
    },
    btnObservers() {
        this.select = this.barTop?.querySelector("select");
        if (!this.select || this.select._optionHooked) return;
        this.select._optionHooked = true;
        
        const self = this;
        const descriptor = Object.getOwnPropertyDescriptor(HTMLOptionElement.prototype, 'selected');
        Object.defineProperty(HTMLOptionElement.prototype, 'selected', {
            set: function(v) {
                descriptor.set.call(this, v);
                if (v && this.closest('select') === self.select) {
                    Promise.resolve().then(() => self.managerUpdate());
                }
            },
            get: function() { return descriptor.get.call(this); },
            configurable: true
        });
        
        const gameBtnSave = this.barTop?.children[2];
        const gameBtnDelete = this.barTop?.children[3];
        if (!gameBtnSave || !gameBtnDelete) return;

        this.saveObserver?.disconnect();
        this.deleteObserver?.disconnect();

        this.saveObserver = new MutationObserver(() => {
            this.btnSync();
            this.managerUpdate();
        });

        this.deleteObserver = new MutationObserver(() => {
            this.btnSync();
            this.managerUpdate();
        });

        const cfg = { attributes: true, attributeFilter: ['class', 'disabled'] };
        
        this.saveObserver.observe(gameBtnSave, cfg);
        this.deleteObserver.observe(gameBtnDelete, cfg);

        this.btnSync();
    },
    actionUpdate(action = "default") {
        if (action === "default") {
            this.actionBar.clear();
            this.actionBar.style({"display": "flex", "gap": "8px", "align-items": "center"});

            this.btnSave = this.btnSave || element("div").css("btn grey textgreen").text("Create").on("click", () => this.actionUpdate("create"));
            this.btnRename = this.btnRename || element("div").css("btn grey textcyan").text("Rename").on("click", () => this.actionUpdate("rename"));
            this.btnDelete = this.btnDelete || element("div").css("btn grey textred").text("Delete").on("click", () => this.actionUpdate("delete"));

            this.btnImport = this.btnImport || element("div").css("btn grey").text("Import").on("click", () => this.actionUpdate("import"));
            this.btnExport = this.btnExport || element("div").css("btn grey").text("Export").on("click", () => this.actionUpdate("export"));

            this.actionBar.add(this.btnSave).add(this.btnRename).add(this.btnDelete).add(this.btnImport).add(this.btnExport).add(this.toggleBtn);
            this.btnSync()
        }
        else if (action === "grid") {
            this.actionBar.clear();
            this.actionBar.style({"display": "flex", "gap": "8px", "align-items": "center"});

            this.actionBar.add(this.toggleBtn);
        }
        else if (action === "import") {
            this.actionBar.clear();
            this.actionBar.style({"display": "flex", "gap": "8px", "align-items": "center"});

            const lbl = element('div').css("textorange").text('Ready to import from Clipboard? GAME WILL RELOAD!!!11');
            
            const btnPaste = element('div').css("btn green").text('Paste & Load').on("click", async () => {
                try {
                    const text = await navigator.clipboard.readText();
                    const data = JSON.parse(text);
                    
                    if (Array.isArray(data)) {
                        localStorage.setItem("skillConfigs", JSON.stringify(data));
                        this.skillConfigs = data;
                        log("Import successful!");
                        location.reload(); 
                    }
                } catch (err) {
                    lbl.text("Import Failed! Invalid config in clipboard!").css("textred");
                }
            });

            const btnCancel = element('div').css("btn orange").text('Cancel').on("click", () => {
                this.actionUpdate("default");
            });

            this.actionBar.add(lbl).add(btnPaste).add(btnCancel);
        }
        else if (action === "export") {
            this.actionBar.clear();
            const raw = localStorage.getItem("skillConfigs");
            if (raw) {
                try {
                    const data = JSON.parse(raw);
                    let formatted = JSON.stringify(data, null, 4);
                    formatted = formatted.replace(/\[[\s\d,]+\]/g, (match) => {
                        return match.replace(/\s+/g, ' ');
                    });
                    navigator.clipboard.writeText(formatted)
                } catch (e) {
                    navigator.clipboard.writeText(raw);
                }
            }

            const lbl = element('div').css("textorange").text('Configs copied to clipboard! (ctrl-v it somewhere)');
            const btnOk = element('div').css("btn green").text('OK').on("click", () => this.actionUpdate("default"));
            this.actionBar.add(lbl).add(btnOk);
        }
        else if(action=="create" || action=="rename"){
        
            this.actionBar.clear().style({
                "display": "grid",
                "grid-template-columns": "120px 120px 1fr auto auto",
                "grid-gap": "4px"
            });

            const btnStyle = { "min-width": "60px", "text-align": "center" };
            const inputStyle = { "padding": "2px 5px"};

            const iTag = element("input").attr("placeholder", "Group Name")
                .style(inputStyle)
                .on("input", (e) => {e.target.value = e.target.value.replace(/_/g, '')});

            const iOrder = element("input").attr("placeholder", "Order Number").attr("maxlength", "1")
                .style({ "text-align": "center" })
                .on("input", (e) => {e.target.value = e.target.value.replace(/\D/g, '');});

            const iName = element("input").attr("placeholder", "Preset Name")
                .style(inputStyle)
                .on("input", (e) => {e.target.value = e.target.value.replace(/_/g, '');});

            if(action=="rename") {
                const currentFullName = this.select?.value || "";
                const parts = currentFullName.split('_');
                const isFormatted = parts.length >= 3;
                iTag.attr("value", isFormatted ? parts[0] : "");
                iOrder.attr("value", isFormatted ? parts[1] : "");
                iName.attr("value", isFormatted ? parts.slice(2).join('_') : currentFullName);
            }

            const btnSave = element("div").css("btn green").text("Save").style(btnStyle).on("click", async () => {
                const fullName = `${iTag.element.value.trim()}_${iOrder.element.value.trim()}_${iName.element.value.trim()}`;
                if(action=="rename"){
                    this.select.value = this.selected;
                    this.select.dispatchEvent(new Event('input', { bubbles: true }));
                    this.barTop.children[3].click()
                    await new Promise(res => setTimeout(res, 5));
                }
                this.barTop.children[2].click()
                await new Promise(res => setTimeout(res, 5));
                this.barTop.children[1].value = fullName
                this.barTop.children[1].dispatchEvent(new Event('input', { bubbles: true }));
                this.barTop.children[2].click()

                this.actionUpdate();
                this.managerUpdate();

            });

            const btnCancel = element("div").css("btn orange").text("Cancel").style(btnStyle).on("click", () => {
                this.actionUpdate();
            });

            this.actionBar.add(iTag).add(iOrder).add(iName).add(btnSave).add(btnCancel);
                
            iName.element.focus();
        }
        else if (action === "delete") {
            if (this.select && this.barTop?.children[3]) {
                this.select.value = this.selected;
                this.select.dispatchEvent(new Event('input', { bubbles: true }));
                this.barTop.children[3].click();
                this.actionUpdate();
            }
        }
    },
    managerUpdate() {
        this.manager.clear();
        const isGridView = this.state.active;
        this.skilllist.style.display = isGridView && "none"|| "grid";

        this.manager.style({"min-width": isGridView?"688px":"200px"});

        const presets = Array.from(this.select.options).filter(opt => opt.value !== "" && !opt.disabled).map(opt => opt.value);
        const grouped = {};
        const active = this.select.value
        let activeElement = null;

        presets.forEach(fullName => {
            const selected = fullName == active
            const parts = fullName.split('_');
            const isGrouped = parts.length >= 3;
            const groupKey = isGrouped ? parts[0] : "Other";
            const order = isGrouped ? parseInt(parts[1]) : 999;
            const displayName = isGrouped ? parts.slice(2).join('_') : fullName;

            if (!grouped[groupKey]) grouped[groupKey] = [];
            grouped[groupKey].push({ selected, fullName, displayName, order });
        });

        Object.keys(grouped).forEach(groupName => {
            const list = grouped[groupName].sort((a, b) => a.order - b.order);

            if (groupName !== "Other") {
                this.manager.add(element("div").css("textprimary").text(`${groupName}`).style({"font-weight": "bold", "margin-top": "4px"}));
            }


            const groupContainer = element("div").style({
                "display": "grid",
                "grid-template-columns": isGridView ? "repeat(4, 1fr)" : "1fr", 
                "grid-gap": "4px",
                "margin-bottom": "8px"
            });

            list.forEach(item => {
                
                let btnPreset = element("div").css(`btn grey`).style({
                    "display": "flex",
                    "flex-direction": "column",
                    "align-items": "flex-start",
                    "padding": "4px 10px",
                    "width": "100%",
                    "max-width": "170px",
                    "box-sizing": "border-box",
                    "overflow": "hidden"
                });

                const title = element("span").css(`${item.selected && "textorange" || "textgrey"}`).text(item.displayName);
                btnPreset.add(title)
                .on("click", () => {
                    this.selected = item.fullName;
                    this.select.value = item.fullName;
                    this.select.dispatchEvent(new Event('input', { bubbles: true }));
                    this.select.dispatchEvent(new Event('change', { bubbles: true }));
                    this.actionUpdate()
                    this.managerUpdate()
                });

                groupContainer.add(btnPreset);

                if (item.selected) {
                    activeElement = btnPreset.element;
                }
            });

            this.manager.add(groupContainer);
        });
        
        activeElement && activeElement.scrollIntoView({alignToTop: false, behavior: 'smooth', block: 'nearest'});
    },
    toggle() {
        this.state.active ^= 1;
        this.toggleBtn.text(this.state.active ? "▶" : "◀");
        this.skilllist.style.display = this.state.active && "none"|| "grid";
        this.managerUpdate()
    },

    // icons(name, skills) {
    //     const stats = element("div").style({ "display": "flex", "gap": "1px", "margin-top": "4px" });
    //     // Grouping: [43, 43, 43] -> { "43": 3 }
    //     const counts = skills.reduce((acc, id) => {
    //         acc[id] = (acc[id] || 0) + 1;
    //         return acc;
    //     }, {});
    //     Object.entries(counts).forEach(([id, count]) => {
    //         const slot = element("div").css("slot").style({
    //             "position": "relative",
    //             "width": "25px",
    //             "height": "25px",
    //         });
    //         const img = element("img").css("icon svelte-1nn7wcb")
    //             .attr("src", `/data/ui/skills/${id}.avif`)
    //             .style({ "display": "block", "max-width": "25px" });
    //         const overlay = element("div").css("time absCentered slottext svelte-1nn7wcb").text(count).style({
    //             "color": "#e7d510",
    //             "font-size": "14px",
    //             "background-color": "#0007",
    //             "position": "absolute",
    //             "bottom": "0",
    //             "right": "0",
    //             "pointer-events": "none" 
    //         });
    //         slot.add(img).add(overlay);
    //         stats.add(slot);
    //     });
    // },
    
};

export default presetManager;
