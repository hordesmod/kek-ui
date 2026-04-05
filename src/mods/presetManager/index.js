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
        presets: []
    },
    _profiles: 1,
    defaultPresets: {
        0: [
            "STARTER WARPACK",
            { "Gloomfury": { "Filler": 5 } },
            { "Obelisk": { "Filler": 5 } },
            { "Farming": { "Filler": 5 } },
            "Arena Builds",
            { "2vs2": { "Filler": 5 } },
        ],
        1: [
            "STARTER MAGPACK",
            { "Gloomfury": { "Filler": 5 } },
            { "Obelisk": { "Filler": 5 } },
            { "Farming": { "Filler": 5 } },
            "Arena Builds",
            { "2vs2": { "Filler": 5 } },
        ],
        2: [
            "STARTER ARCHPACK",
            { "Gloomfury": { "Filler": 5 } },
            { "Obelisk": { "Filler": 5 } },
            { "Farming": { "Filler": 5 } },
            "Arena Builds",
            { "2vs2": { "Filler": 5 } },
        ],
        3: [
            "STARTER SHAMPACK",
            { "Gloomfury": { "Filler": 5 } },
            { "Obelisk": { "Filler": 5 } },
            { "Farming": { "Filler": 5 } },
            "Arena Builds",
            { "2vs2": { "Filler": 5 } },
        ]
    },
    style: `
        .container.panel-black.svelte-um60d1 {
            display: none;
        }
        .pm-kek {
            transform: translateZ(0);
            backface-visibility: hidden;
            will-change: transform;
            contain: layout;
        }
        #skilllist {
            grid-template-columns: auto auto;
            grid-column: 1;
            grid-template-columns: 1fr 1fr !important; 
            contain: layout style; 
        }
        .flexer.svelte-1e0alkc {
            display: grid;
            gap: 2px;
        }
        .pm-tooltip {
        }
        .ghost { 
            border: 2px dashed orange !important;
            background: transparent !important;
            opacity: 0.4;
        }
        .pm-card {
            display: flex;
            align-items: center;
            height: 32px;
            width: 100%;
            box-sizing: border-box;
            padding: 3px;
            border: 3px solid rgba(0, 0, 0, 0);
            border-radius: 3px;
            font-weight: 700;
            color: #5b858e;
            contain: layout paint; 
            transform: translateZ(0); 
            will-change: transform, background-color;
        }
        .pm-label {
            grid-column: 1 / -1;
            cursor: default;
            color: #dae8ea;
        }
        .pm-preset {
            cursor: pointer;
            background-color: #19202d;
        }
        .pm-preset:hover {
            border: 3px solid #a4bfc5;
        }
        .pm-preset.active {
            color: #ff9800;
            border-color: rgba(255, 152, 0, 0.4);
        }
        .pm-card:has(input):hover {
            border-color: transparent !important;
        }
        .pm-card-edit {
            flex: 1 1 0%;
            min-width: 0;
            max-width: 100%;
            border: none;
        }
        input.pm-card-edit {
            flex: 1 1 0%; 
            width: 100%;
            min-width: 0;
            max-width: 100%;
            border: none;
        }
        .pm-card-dots { 
            width: 20px;   
            text-align: center;
            cursor: pointer;
            opacity: 0;    
            user-select: none;
        }
        .pm-card:hover .pm-card-dots {
            opacity: 0.3;
        }
        .pm-card-dots:hover {
            opacity: 1 !important;
        }
        .pm-card.is-editing {
            transition: none !important; 
            border-color: transparent !important;
        }
        .pm-card.is-editing .pm-card-dots {
            opacity: 1;
            color: green
        }
        .pm-card-delete {
            width: 20px;           
            text-align: center;
            cursor: pointer;
            color: #ff4444;        
            visibility: hidden;    
            user-select: none;
            flex-shrink: 0;        
        }
        .pm-card-action {
            display: inline-block;
            width: 20px;
            height: 20px;
            min-width: 20px;
            min-height: 20px;
            cursor: pointer;
            text-align: center;
            background-size: contain;
            background-repeat: no-repeat;
            background-position: center;
        }
        .is-exporting {
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20px' height='20px' viewBox='0 0 24 24' fill='none' %3E%3Cg id='Edit / Copy'%3E%3Cpath id='Vector' d='M9 9V6.2002C9 5.08009 9 4.51962 9.21799 4.0918C9.40973 3.71547 9.71547 3.40973 10.0918 3.21799C10.5196 3 11.0801 3 12.2002 3H17.8002C18.9203 3 19.4801 3 19.9079 3.21799C20.2842 3.40973 20.5905 3.71547 20.7822 4.0918C21.0002 4.51962 21.0002 5.07967 21.0002 6.19978V11.7998C21.0002 12.9199 21.0002 13.48 20.7822 13.9078C20.5905 14.2841 20.2839 14.5905 19.9076 14.7822C19.4802 15 18.921 15 17.8031 15H15M9 9H6.2002C5.08009 9 4.51962 9 4.0918 9.21799C3.71547 9.40973 3.40973 9.71547 3.21799 10.0918C3 10.5196 3 11.0801 3 12.2002V17.8002C3 18.9203 3 19.4801 3.21799 19.9079C3.40973 20.2842 3.71547 20.5905 4.0918 20.7822C4.5192 21 5.07899 21 6.19691 21H11.8036C12.9215 21 13.4805 21 13.9079 20.7822C14.2842 20.5905 14.5905 20.2839 14.7822 19.9076C15 19.4802 15 18.921 15 17.8031V15M9 9H11.8002C12.9203 9 13.4801 9 13.9079 9.21799C14.2842 9.40973 14.5905 9.71547 14.7822 10.0918C15 10.5192 15 11.079 15 12.1969L15 15' stroke='%235b858e' stroke-width='2'/%3E%3C/g%3E%3C/svg%3E");
            opacity: 0;
        }
        .pm-preset:hover .is-exporting {
            opacity: 0.3;
        }
        .is-exporting:hover {
            opacity: 1 !important;
        }
        .is-deleting::after {
            content: "🞮";
            color: #ff4d4d;
        }
        .is-deleting:hover::after {
            color: #ff0000;
        }
        .pm-label .is-exporting {
            display: none;
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
    handler() {
        if (!Array.isArray(this.state.presets)) {
            this.state.presets = [];
        }

        const skillMenu = ui.skillsMenuParent?.element;
        if (!skillMenu) return;

        // -----------------------------------------------
        // Promote the whole skills frame to a GPU layer
        // -----------------------------------------------
        skillMenu.classList.add("pm-kek");
        // -----------------------------------------------

        this.n_skilllist = skillMenu.querySelector('#skilllist');
        this.n_barBot = skillMenu.querySelector(".bar-bot");

        if (!this.n_skilllist || !this.n_barBot) return;

        this.n_tutapplyskills = this.n_barBot.querySelector("#tutapplyskills");

        this.toolTip = this.n_barBot.children[2];
        this.toolTip.classList.add("textgrey", "textright")

        this.n_barBot.style.gridTemplateColumns = "180px auto 1fr";

        this.updateControls();
    },

    updateControls() {
        this.addBtn ||= element("div").css("btn black textgrey textcenter").text("🞤")
            .on("click", (e) => e.shiftKey ? this.addLabel() : this.addPreset())
            .data("tip", "Preset (Shift: Label)")

        if (!this.columnsBtn) {
            this.columnsBtn = element("select").css("btn black textgrey").style({ "width": "40px", "height": "32px" })
                .on("change", (e) => {
                    this.state.columns = parseInt(e.target.value);
                    this.updateControls();
                })
                .data("tip", "Grid size");
            [1, 2, 3, 4, 5].forEach(num => {
                this.columnsBtn.add(element("option").attr("value", num).text(num));
            });
        }
        this.columnsBtn.value(this.state.columns || 1);

        this.toggleBtn ||= element("div").css("btn black textgrey textcenter")
            .style({ "width": "20px" })
            .data("tip", "Lock")
            .on("click", () => {
                this.state.locked ^= 1;
                this.updateControls();
            });
        this.toggleBtn.text(this.state.locked ? "🞂" : "🞀");

        this.actions ||= element("div").css("panel-black preset-manager top-bar")
            .style({
                "display": "grid",
                "grid-gap": "4px",
                "height": "32px",
                "margin-top": "4px",
            })
            .on("mouseover", e => {
                const tip = e.target.dataset.tip;
                if (tip && !this.state.locked) this.toolTip.innerText = tip;
            })
            .on("mouseout", e => {
                if (e.target.dataset.tip) this.toolTip.innerText = "";
            });

        this.grid ||= element("div").css("scrollbar panel-black").style({
            "display": "grid",
            "gap": "4px",
            "height": "460px",
            "overflow-y": "auto",
            "align-content": "start",
            "min-width": "235px",
        });
        if (!this.grid._initialized) {
            this.initGridEvents();
            this.grid._initialized = true;
        }

        if (this.grid.element.parentElement !== this.n_skilllist.parentElement) {
            this.n_skilllist.after(this.grid.element);
        }
        if (this.actions.element.parentElement !== this.n_barBot.parentElement) {
            this.n_barBot.after(this.actions.element);
        }

        this.n_skilllist.style.display = this.state.locked ? "none" : "grid";
        this.n_barBot.style.gridTemplateColumns = this.state.locked ? "auto auto 1fr" : "180px auto 1fr";
        this.n_tutapplyskills.style.display = this.state.locked ? "none" : "block";

        this.actions.clear();
        if (this.state.locked) {
            this.actions.style({ "grid-template-columns": "40px 100px 40px 30px 1fr" })
                .add(this.columnsBtn)
                .add(this.toggleBtn);
            this.grid.style({ "grid-column": "1 / span 2" });
        } else {
            this.actions.style({ "grid-template-columns": "40px 100px 40px 30px 1fr" })
                .add(this.addBtn)
                .add(element("div"))
                .add(this.columnsBtn)
                .add(this.toggleBtn);
            this.grid.style({ "grid-column": "2" });
        }

        this.grid.style({ "grid-template-columns": `repeat(${this.state.columns || 1}, 1fr)` });
        this.gridUpdate();
    },
    getSkills() {
        const ignored = ["Summon", "Mount Riding"];
        return Array.from(this.n_skilllist.children).reduce((acc, box) => {
            const nameEl = box.children[1]?.firstElementChild; // name div
            const levelSpan = box.children[2]?.firstElementChild?.firstElementChild; // level span
            const name = nameEl?.innerText.trim();
            const level = parseInt(levelSpan?.innerText);

            if (name && level > 0 && !ignored.includes(name)) {
                acc[name] = level;
            }
            return acc;
        }, {});
    },
    resetSkills() {
        const ignored = ["Summon", "Mount Riding"];
        Array.from(this.n_skilllist.children).forEach(box => {
            const name = box.children[1]?.firstElementChild?.innerText.trim();
            const levelSpan = box.children[2]?.firstElementChild?.firstElementChild;
            const level = parseInt(levelSpan?.innerText) || 0;
            if (!name || level === 0 || ignored.includes(name)) return;
            const minusBtn = box.children[2]?.lastElementChild?.firstElementChild;
            if (minusBtn) {
                for (let i = 0; i < level; i++) {
                    minusBtn.click();
                }
            }
        });
    },
    updateSkills(targetSkills) {
        this.resetSkills()
        // this.n_tutapplyskills.click()
        const ignored = ["Summon", "Mount Riding"];

        Array.from(this.n_skilllist.children).forEach(box => {
            const name = box.children[1]?.firstElementChild?.innerText.trim();
            if (!name || ignored.includes(name)) return;

            const levelSpan = box.children[2]?.firstElementChild?.firstElementChild;
            const minusBtn = box.children[2]?.lastElementChild?.firstElementChild;
            const plusBtn = box.children[2]?.lastElementChild?.lastElementChild;
            
            const targetLevel = targetSkills[name] || 0;
            let currentLevel = parseInt(levelSpan?.innerText) || 0;

            while (currentLevel > targetLevel && minusBtn) {
                minusBtn.click();
                currentLevel--;
            }

            while (currentLevel < targetLevel && plusBtn) {
                plusBtn.click();
                currentLevel++;
            }
        });

        this.n_tutapplyskills.click()
    },
    contextMenu() {
        let contextMenu = ui.contextMenu.element;
        if (contextMenu.children[0]?.innerText !== 'Skills') return;
        if (contextMenu.querySelector('.preset-action')) return;

        const exportBtn = element("div").css("choice preset-action").text("Export - clipboard")
            .on("click", () => {
                this.export();
                ui.contextMenu.element.remove();
            });

        const importBtn = element("div").css("choice preset-action").text("Import - clipboard")
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
    async import(isDefault = false) {
        let incoming;
        if (isDefault) {
            incoming = this.defaultPresets[profileManager.playerClass] || [];
        } else {
            try {
                const text = await navigator.clipboard.readText();
                incoming = JSON.parse(text);
            } catch (e) {
                return console.error("Clipboard / JSON error", e);
            }
        }
        if (Array.isArray(incoming)) {
            this.state.presets = incoming;
            this.toolTip.innerText = "Presets Replaced!";
        } else {
            this.state.presets.push(incoming);
            this.toolTip.innerText = "Preset Added!";
        }
        this.editingIndex = null;
        this.gridUpdate();

        setTimeout(() => this.toolTip.innerText = "", 2000);
    },
    async export(index = null) {
        const presets = this.state.presets || [];
        let output = "";

        if (index !== null) {
            output = JSON.stringify(presets[index]);
        } else {
            const rows = presets.map(item => "  " + JSON.stringify(item));
            output = "[\n" + rows.join(",\n") + "\n]";
        }
        await navigator.clipboard.writeText(output);
        try {
            await navigator.clipboard.writeText(output);
            !this.state.locked && (this.toolTip.innerText = index !== null ? "Preset Copied!" : "All Exported!");
            setTimeout(() => this.toolTip.innerText = "", 2000);
        } catch (err) {
            console.log("Export failed", err);
        }
    },
    addPreset() {
        this.state.presets.push({ "My New Preset": this.getSkills() });
        this.editingIndex = this.state.presets.length - 1;
        this.gridUpdate();
    },
    addLabel() {
        this.state.presets.push("New Label");
        this.editingIndex = this.state.presets.length - 1;
        this.gridUpdate();
    },
    editingIndex: null,
    gridUpdate() {
        const scrollContainer = this.grid.element;
        const currentScroll = scrollContainer.scrollTop;

        scrollContainer.innerHTML = "";

        this.grid.clear().style({ "grid-template-columns": `repeat(${this.state.columns || 1}, 1fr)` });

        if (this.state.presets.length == 0) {
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

        const presets = this.state.presets || [];

        presets.forEach((item, index) => {
            const card = this.createCard(item, index);
            this.grid.add(card);
        });

        const targetCard = scrollContainer.children[this.editingIndex];
        if (this.editingIndex !== undefined && targetCard) {
            targetCard.scrollIntoView({ behavior: 'auto', block: 'nearest' });
        } else {
            scrollContainer.scrollTop = currentScroll;
        }
    },
    createCard(item, index) {
        const isLabel = typeof item === 'string';
        const name = isLabel ? item : Object.keys(item)[0];
        const isEditing = this.editingIndex === index;
        const isActive = this.state.activeIndex === index;

        let card = element("div")
            .css(`pm-card ${isLabel ? "pm-label" : "pm-preset"}${isEditing ? " is-editing" : ""}`)
            .data("index", index);

        if (this.draggedIndex === index) card.toggle("ghost");

        const dotControl = element("div").css("pm-card-dots").text("⋮");
        const actionControl = element("div")
                .css(isEditing ? "pm-card-action is-deleting" : "pm-card-action is-exporting");

        const labelClass = isLabel ? "textwhite bold" : (isActive && !isEditing ? "textorange" : "textgrey");
        const label = element(isEditing ? "input" : "span").css(`pm-card-edit ${labelClass}`);

        if (isEditing) {
            label.element.value = name;
            setTimeout(() => { label.element.focus(); label.element.select(); }, 10);

            const saveRename = () => {
                const newVal = label.element.value.trim();
                if (newVal) {
                    if (isLabel) {
                        this.state.presets[index] = newVal;
                    } else {
                        const val = item[name];
                        delete item[name];
                        item[newVal] = val;
                    }
                }
                this.editingIndex = null;
                this.gridUpdate();
            };

            label.on("keyup", (e) => {
                if (e.key === "Enter") saveRename();
                if (e.key === "Escape") { this.editingIndex = null; this.gridUpdate(); }
            });
            label.on("blur", () => { if (this.editingIndex === index) saveRename(); });
        } else {
            label.text(name);
        }

        if (!this.state.locked) card.add(dotControl);
        card.add(label);
        if (!this.state.locked) card.add(actionControl)

        return card;
    },
    initGridEvents() {
        const grid = this.grid;

        this.grid.on("mousedown", (e) => {
            const dotBtn = e.target.closest(".pm-card-dots");
            if (dotBtn) {
                const card = dotBtn.closest("[data-index]");
                card.setAttribute("draggable", "true");
            }
        });

        this.grid.on("click", (e) => {
            const target = e.target;
            const card = target.closest("[data-index]");
            if (!card) return;

            const index = parseInt(card.dataset.index);
            const isLabel = card.classList.contains("pm-label");
            const actionBtn = target.closest(".pm-card-action");
            const dotBtn = target.closest(".pm-card-dots");

            if (actionBtn) {
                if (actionBtn.classList.contains("is-deleting")) {
                    this.state.presets.splice(index, 1);
                    this.editingIndex = null;
                } else if (!isLabel) {
                    this.export(index);
                }
                this.gridUpdate();
                return;
            }

            if (dotBtn) {
                this.editingIndex = index;
                this.gridUpdate();
                return;
            }

            if (!isLabel && this.editingIndex === null) {
                const item = this.state.presets[index];
                const name = Object.keys(item)[0];
                const skills = item[name];

                this.updateSkills(skills);
                this.state.activeIndex = index;
                this.gridUpdate();
            }
        });

        grid.on("dragstart", (e) => {
            const card = e.target.closest("[data-index]");
            if (!card) return;

            this.draggedIndex = parseInt(card.dataset.index);

            card.classList.add("ghost");

            e.dataTransfer.effectAllowed = "move";
            e.dataTransfer.setData("text/plain", this.draggedIndex);

            grid.element.classList.add("is-dragging");

            setTimeout(() => card.classList.add("ghost"), 0);
        });
        // let lastMove = 0;
        grid.on("dragover", (e) => {
            e.preventDefault();
            // const now = Date.now();
            // if (now - lastMove < 16) return; 
            // lastMove = now;

            const card = e.target.closest("[data-index]");
            const fromIndex = this.draggedIndex;
            if (fromIndex === null || !card) return;

            const toIndex = parseInt(card.dataset.index);
            if (toIndex === fromIndex) return;

            const rect = card.getBoundingClientRect();
            const isAfter = (this.state.columns || 1) === 1
                ? (e.clientY > rect.top + rect.height / 2)
                : (e.clientX > rect.left + rect.width / 2);

            const list = this.state.presets;

            const item = list.splice(fromIndex, 1)[0];

            let target = toIndex;
            if (isAfter) target = (fromIndex < toIndex) ? toIndex : toIndex + 1;
            else target = (fromIndex < toIndex) ? toIndex - 1 : toIndex;
            list.splice(target, 0, item);
            this.draggedIndex = target;
            const draggedCard = grid.element.querySelector(`[data-index="${fromIndex}"]`);
            if (draggedCard) {
                if (isAfter) card.after(draggedCard);
                else card.before(draggedCard);
                Array.from(this.grid.element.children).forEach((child, i) => {
                    child.dataset.index = i;
                });
            }
        });
        grid.on("dragend", () => {
            this.draggedIndex = null;
            this.gridUpdate(); 
        });
        grid.on("drop", (e) => {
            e.preventDefault()
        });
    },
};
window.pmm = presetManager
export default presetManager;
