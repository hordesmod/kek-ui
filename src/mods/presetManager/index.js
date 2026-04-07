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
            {"Gloom":{"Bulwark":5,"Unholy Warcry":4,"Crusader's Courage":4,"Armor Reinforcement":5,"Taunt":5,"Mount Riding":1,"Relentless Cry":2}},
            {"Farming":{"Bulwark":5,"Crescent Swipe":1,"Centrifugal Laceration":1,"Unholy Warcry":4,"Crusader's Courage":4,"Armor Reinforcement":5,"Taunt":5,"Mount Riding":1}},
            {"Obelisk":{"Bulwark":5,"Crescent Swipe":1,"Centrifugal Laceration":1,"Unholy Warcry":4,"Crusader's Courage":4,"Armor Reinforcement":5,"Taunt":5,"Mount Riding":1}},
             "Example Arena Builds",
            { "3vs3": { "Filler": 1 } },
        ],
        1: [
            "STARTER MAGPACK",
            {"Gloom":{"Ice Bolt":5,"Chilling Radiance":5,"Icicle Orb":5,"Hypothermic Frenzy":5,"Mount Riding":1,"Shatterfrost":5,}},
            {"Farming":{"Chilling Radiance":5,"Icicle Orb":5,"Hypothermic Frenzy":5,"Arctic Aura":4,"Teleport":1,"Mount Riding":1,"Frostcall":5}},
            {"Obelisk":{"Ice Bolt":1,"Chilling Radiance":1,"Icicle Orb":5,"Hypothermic Frenzy":5,"Ice Shield":1,"Teleport":1,"Mount Riding":1,"Shatterfrost":5,"Frostcall":5,"Ice Block":1}},
            "Example Arena Builds",
            { "3vs3": { "Filler": 1 } },
        ],
        2: [
            "STARTER ARCHPACK",
            {"archer gloom":{"Precise Shot":5,"Serpent Arrows":5,"Invigorate":5,"Poison Arrows":5,"Swift Shot":4,"Dash":1,"Mount Riding":1,"Bone Shot":5}},
            {"archer farming":{"Precise Shot":5,"Serpent Arrows":5,"Invigorate":5,"Cranial Punctures":4,"Poison Arrows":5,"Dash":1,"Mount Riding":1,"Volley":5}},
            {"archer obelisk":{"Precise Shot":1,"Serpent Arrows":5,"Invigorate":5,"Pathfinding":5,"Poison Arrows":1,"Dash":1,"Mount Riding":1,"Volley":5,"Vampiric Arrow":1,"Blinding Shot":1,"Bone Shot":5}} ,
            "Example Arena Builds",
            { "3vs3": { "Filler": 1 } },
        ],
        3: [
            "STARTER SHAMPACK",
            {"Gloom":{"Revitalize":5,"Decay":1,"Mimir's Well":4,"Canine Howl":5,"Healing Totem":4,"Summon":1,"Spirit Animal":1,"Mount Riding":1,"Plaguespreader":5}},
            {"Farming":{"Revitalize":5,"Decay":5,"Canine Howl":5,"Summon":1,"Mount Riding":1,"Soul Harvest":5,"Plaguespreader":5}},
            {"Obelisk":{"Mend":4,"Revitalize":5,"Decay":1,"Mimir's Well":2,"Healing Totem":4,"Summon":1,"Spirit Animal":1,"Agonize":1,"Mount Riding":1,"Plaguespreader":5,"Mimir's Cleanse":2}},
            "Example Arena Builds",
            { "3vs3": { "Filler": 1 } },
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
        .pm-actionbar {
            display: grid;
            grid-gap: 4px;
            height: 32px;
            margin-top: 4px;
            grid-template-columns: 30px 40px 17px 30px 30px 30px 30px 1fr;
        }
        .pm-grid {
            display: grid;
            gap: 4px;
            height: 460px;
            overflow-y: auto;
            align-content: start;
            min-width: 235px;
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
            background-image: url("data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMjQgMjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZmlsbD0iIzViODU4ZSIgZD0ibTIwIDEyLTYuNC03djMuNUMxMC40IDguNSA0IDEwLjYgNCAxOWMwLTEuMTY3IDEuOTItMy41IDkuNi0zLjVWMTl6Ii8+PC9zdmc+");
            opacity: 0;
        }
        .pm-icon {
            background-repeat: no-repeat;
            background-position: center;
            background-size: 16px;
        }
        .pm-preset-icon {
            background-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0OTAgNDkwIj48cGF0aCBmaWxsPSIjNWI4NThlIiBkPSJNMTcuMSA0OTBoMzQ5LjRjOS41IDAgMTcuMi03LjcgMTcuMi0xNy4ydi04OS4yaDg5LjJjOS41IDAgMTcuMS03LjcgMTcuMS0xNy4xVjE3LjFDNDkwIDcuNiA0ODIuMyAwIDQ3Mi45IDBIMTIzLjVjLTkuNSAwLTE3LjIgNy43LTE3LjIgMTcuMXY4OS4ySDE3LjFDNy42IDEwNi4zIDAgMTE0IDAgMTIzLjV2MzQ5LjRjMCA5LjQgNy43IDE3LjEgMTcuMSAxNy4xTTE0MC42IDM0LjNoMzE1LjF2MzE1LjFIMTQwLjZ6TTM0LjMgMTQwLjZoNzJ2MjI1LjljMCA5LjUgNy43IDE3LjEgMTcuMiAxNy4xaDIyNS45djcySDM0LjN6TTIxOS41IDIwOUgyODF2NjEuNWMwIDkuNSA3LjcgMTcuMiAxNy4yIDE3LjJzMTcuMS03LjcgMTcuMS0xNy4yVjIwOWg2MS41YzkuNSAwIDE3LjEtNy43IDE3LjEtMTcuMnMtNy43LTE3LjItMTcuMS0xNy4yaC02MS41di02MS41YzAtOS41LTcuNy0xNy4yLTE3LjEtMTcuMi05LjUgMC0xNy4yIDcuNy0xNy4yIDE3LjJ2NjEuNWgtNjEuNWMtOS41IDAtMTcuMSA3LjctMTcuMSAxNy4yLS4xIDkuNSA3LjYgMTcuMiAxNy4xIDE3LjIiLz48L3N2Zz4=");
        }
        .pm-import-icon {
            background-image: url("data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMjQgMjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggc3R5bGU9ImZpbGw6bm9uZTtzdHJva2U6IzViODU4ZTtzdHJva2UtbGluZWNhcDpyb3VuZDtzdHJva2UtbGluZWpvaW46cm91bmQ7c3Ryb2tlLXdpZHRoOjIiIGQ9Ik0xMyA3djZINyIvPjxwYXRoIGRhdGEtbmFtZT0icHJpbWFyeSIgc3R5bGU9ImZpbGw6bm9uZTtzdHJva2U6IzViODU4ZTtzdHJva2UtbGluZWNhcDpyb3VuZDtzdHJva2UtbGluZWpvaW46cm91bmQ7c3Ryb2tlLXdpZHRoOjIiIGQ9Ik0xMyAxMyAzIDNtMTAgMGg3YTEgMSAwIDAgMSAxIDF2MTZhMSAxIDAgMCAxLTEgMUg0YTEgMSAwIDAgMS0xLTF2LTciLz48L3N2Zz4=");
        }
        .pm-export-icon {
            background-image: url("data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMjQgMjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggc3R5bGU9ImZpbGw6bm9uZTtzdHJva2U6IzViODU4ZTtzdHJva2UtbGluZWNhcDpyb3VuZDtzdHJva2UtbGluZWpvaW46cm91bmQ7c3Ryb2tlLXdpZHRoOjIiIGQ9Ik0xNSAzaDZ2NiIvPjxwYXRoIGRhdGEtbmFtZT0icHJpbWFyeSIgc3R5bGU9ImZpbGw6bm9uZTtzdHJva2U6IzViODU4ZTtzdHJva2UtbGluZWNhcDpyb3VuZDtzdHJva2UtbGluZWpvaW46cm91bmQ7c3Ryb2tlLXdpZHRoOjIiIGQ9Ik0xMSAxMyAyMSAzbTAgMTB2N2ExIDEgMCAwIDEtMSAxSDRhMSAxIDAgMCAxLTEtMVY0YTEgMSAwIDAgMSAxLTFoNyIvPjwvc3ZnPg==");
        }
        .pm-label-icon {
            background-image: url("data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMTYgMTYiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjNWI4NThlIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIHN0cm9rZS13aWR0aD0iMS41Ij48cGF0aCBkPSJtNy4yNSAxNC4yNS01LjUtNS41IDctN2g1LjV2NS41eiIvPjxjaXJjbGUgY3g9IjExIiBjeT0iNSIgcj0iLjUiIGZpbGw9IiM1Yjg1OGUiLz48L3N2Zz4=");
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
    },
    stop() {
        eventManager.off("ui.skillsMenuParent", this.handler, this);
    },
    handler() {
        if (!Array.isArray(this.state.presets)) {
            this.state.presets = [];
        }

        const skillMenu = ui.skillsMenuParent?.element;
        if (!skillMenu) return;

        // Promote the whole skills frame to a GPU layer
        skillMenu.classList.add("pm-kek");
        // -----------------------------------------------

        this.n_skilllist = skillMenu.querySelector('#skilllist');
        this.n_barBot = skillMenu.querySelector(".bar-bot");

        if (!this.n_skilllist || !this.n_barBot) return;

        this.n_tutapplyskills = this.n_barBot.querySelector("#tutapplyskills");

        this.toolTip = this.n_barBot.children[2];
        this.toolTip.classList.add("textgrey", "textright")

        this.n_barBot.style.gridTemplateColumns = "180px auto 1fr";
        this.initListeners();
        this.updateControls();

    },
    ////////////////////////////////////////////////////////////////////////////////////////////////////
    doggy: null,
    piggy: null,
    initListeners() {
        this.doggy = new MutationObserver((m) => {
            m[0].removedNodes[0]?.className === "panel-bright skillbox svelte-1e0alkc" && this.destroyListeners();
        });
        this.doggy.observe(this.n_skilllist, { childList: true});
        this.piggy = (e) => {
            const c = e.target.className;
            if (c === 'btn incbtn green svelte-1e0alkc' || c === 'btn incbtn grey svelte-1e0alkc') {
                setTimeout(() => this.gridUpdate(), 0);
            }
        };
        this.n_skilllist.addEventListener("pointerup", this.piggy);
    },
    destroyListeners() {
        this.doggy.disconnect();
        this.n_skilllist.removeEventListener("pointerup", this.piggy);
    },
    ////////////////////////////////////////////////////////////////////////////////////////////////////
    updateControls() {
        this.n_skilllist.style.display = this.state.locked ? "none" : "grid";
        this.n_barBot.style.gridTemplateColumns = this.state.locked ? "auto auto 1fr" : "180px auto 1fr";
        this.n_tutapplyskills.style.display = this.state.locked ? "none" : "block";

        this.presetBtn ||= element("div").css("btn black pm-icon pm-preset-icon").data("tip", "Add Preset")
            .on("click", (e) => this.addPreset())
        this.presetBtn.element.style.display = this.state.locked ? "none" : "block"

            
        this.labelBtn ||= element("div").css("btn black pm-icon pm-label-icon").data("tip", "Add Label")
            .on("click", (e) => this.addLabel())
        this.labelBtn.element.style.display = this.state.locked ? "none" : "block"

        if (!this.colBtn) {
            this.colBtn = element("select").css("btn black textgrey textcenter").data("tip", "Columns")
                .on("change", (e) => {this.state.columns = parseInt(e.target.value);this.updateControls();});
            [1, 2, 3, 4, 5].forEach(num => {this.colBtn.add(element("option").attr("value", num).text(num))});
        }

        this.toggleBtn ||= element("div").css("btn black textgrey textcenter").data("tip", "Lock")
            .on("click", () => {
                this.state.locked ^= 1;
                this.updateControls();
            });

        this.importBtn ||= element("div").css("btn black pm-icon pm-import-icon").data("tip", "Import")
            .on("click", () => {
                this.import();
            });
        this.importBtn.element.style.display = this.state.locked ? "none" : "block"

        this.exportBtn ||= element("div").css("btn black pm-icon pm-export-icon").data("tip", "Export All")
            .on("click", () => {
                this.export();
            });
        this.exportBtn.element.style.display = this.state.locked ? "none" : "block"

        this.actionBar ||= element("div").css("pm-actionbar panel-black")
            .on("mouseover", e => {
                const tip = e.target.closest("[data-tip]")?.dataset.tip;
                if (tip && !this.state.locked) this.toolTip.textContent = tip;
            })
            .on("mouseout", () => this.toolTip.textContent = "")
            .add(this.toggleBtn)
            .add(this.colBtn)
            .add(element("div"))
            .add(this.presetBtn)
            .add(this.labelBtn)
            .add(this.importBtn)
            .add(this.exportBtn)
        
        this.grid ||= element("div").css("pm-grid scrollbar panel-black")
        this.grid._initialized ||= (this.initGridEvents(), true);

        this.grid.element.parentElement !== this.n_skilllist.parentElement && this.n_skilllist.after(this.grid.element);
        this.actionBar.element.parentElement !== this.n_barBot.parentElement && this.n_barBot.after(this.actionBar.element);

        this.colBtn.value(this.state.columns || 1);
        this.toggleBtn.text(this.state.locked ? "🞂" : "🞀");

        this.toggleBtn.text(this.state.locked ? "🞂" : "🞀");

        this.grid.style({
            "grid-column": this.state.locked ? "1 / span 2" : "2",
            "grid-template-columns": `repeat(${this.state.columns || 1}, 1fr)`
        });

        this.gridUpdate();
    },
    curSkills: null,
    getSkills() {
        const ignored = ["Summon", "Mount Riding"];
        this.curSkills = Array.from(this.n_skilllist.children).reduce((acc, box) => {
            const nameEl = box.children[1]?.firstElementChild; 
            const levelSpan = box.children[2]?.firstElementChild?.firstElementChild; 
            const name = nameEl?.innerText.trim();
            const level = parseInt(levelSpan?.innerText);

            if (name && level > 0 && !ignored.includes(name)) {
                acc[name] = level;
            }
            return acc;
        }, {});
    },
    async updateSkills(targetSkills) {
        const ignored = ["Summon", "Mount Riding"];
        const boxes = Array.from(this.n_skilllist.children);
        
        const blockUntilReady = () => new Promise(res => {
            if (this.n_skilllist.querySelector("#tutsetskillpoint")) return res();
            const obs = new MutationObserver(() => {
                if (this.n_skilllist.querySelector("#tutsetskillpoint")) {
                    obs.disconnect();
                    res();
                }
            });
            obs.observe(this.n_skilllist, {childList: true, subtree: true});
            setTimeout(() => { obs.disconnect(); res(); }, 2000);
        });

        // PHASE 1: Reset / Lower skills (-)
        for (const box of boxes) {
            const name = box.children[1]?.firstElementChild?.innerText.trim();
            if (!name || ignored.includes(name)) continue;

            const targetLevel = targetSkills[name] || 0;
            const minusBtn = box.children[2]?.lastElementChild?.firstElementChild;
            let currentLevel = parseInt(box.children[2]?.firstElementChild?.firstElementChild?.innerText) || 0;

            while (currentLevel > targetLevel && minusBtn) {
                minusBtn.click();
                currentLevel--;
            }
        }
        await blockUntilReady()

        // PHASE 2: Add skills (+)
        for (const box of boxes) {
            const name = box.children[1]?.firstElementChild?.innerText.trim();
            if (!name || ignored.includes(name)) continue;

            const greyCount = box.querySelectorAll(".border.grey").length;
            const unlockedLevel = 5 - greyCount;
            const targetLevel = Math.min(targetSkills[name] || 0, unlockedLevel);

            const plusBtn = box.children[2]?.lastElementChild?.lastElementChild;
            let currentLevel = parseInt(box.children[2]?.firstElementChild?.firstElementChild?.innerText) || 0;

            while (currentLevel < targetLevel && plusBtn) {
                plusBtn.click();
                currentLevel++;
            }
        }

        if (this.n_tutapplyskills) this.n_tutapplyskills.click();
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
               this.toolTip.innerText = "Clipboard / JSON error" + e
            }
        }
        if (Array.isArray(incoming)) {
            this.state.presets = incoming;
            this.toolTip.innerText = "Presets Replaced!";
        } else if (incoming && typeof incoming === 'object') {
            this.state.presets.push(incoming);
            this.toolTip.innerText = "Preset Added!";
        } else {
            this.toolTip.innerText = ("Invalid Data Format!");
            return 
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
            !this.state.locked && (this.toolTip.innerText = index !== null ? "Preset Copied to Clipboard!" : "Exported to Clipboard!");
            setTimeout(() => this.toolTip.innerText = "", 2000);
        } catch (err) {
            this.toolTip.innerText = "Export failed" + err
        }
    },
    addPreset() {
        this.state.presets.push({ "My New Preset": this.curSkills});
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


        this.getSkills()

        const scrollContainer = this.grid.element;
        const currentScroll = scrollContainer.scrollTop;

        scrollContainer.innerHTML = "";

        this.grid.clear().style({ "grid-template-columns": `repeat(${this.state.columns || 1}, 1fr)` });
        ////////////////
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
        ////////////////

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
    isSamePreset(obj1, obj2 = this.curSkills) {
        const keys1 = Object.keys(obj1);
        const keys2 = Object.keys(obj2);
        
        // 1. Check if they have the same number of skills
        if (keys1.length !== keys2.length) return false;
        
        // 2. Check if every skill in obj1 exists in obj2 with the same level
        return keys1.every(key => obj1[key] === obj2[key]);
    },
    createCard(item, index) {
        const isLabel = typeof item === 'string';
        const name = isLabel ? item : Object.keys(item)[0];
        const isEditing = this.editingIndex === index;
        // const isActive = this.state.activeIndex === index;

        // this.isSamePreset()
        const isActive = this.isSamePreset(Object.values(item)[0])


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
            label.on("blur", () => { setTimeout(() => {if (this.editingIndex === index) saveRename(); }, 150)});
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

        this.grid.on("click", async (e) => {
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
                await this.updateSkills(skills);
                this.getSkills()
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
// window.pmm = presetManager
export default presetManager;
