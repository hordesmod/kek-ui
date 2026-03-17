import eventManager from "../../core/event"
import log from "../../core/logger"
import profileManager from "../../core/profile"
import ui from "../../core/ui"
import element from "../../core/widgets/element"
import createTable from "../../core/widgets/table"

class Chart {
    constructor(options = {}) {
        this.width = options.width || 600;
        this.height = options.height || 400;
        this.padding = options.padding || 50;
        this.background = options.background || "#0c101c";
        this.primary = options.primary || "#979ca6";
        this.isSymmetric = options.isSymmetric || false;
        const canvasElement = document.createElement("canvas");
        canvasElement.width = this.width;
        canvasElement.height = this.height;
        this.element = canvasElement;
        this.ctx = this.element.getContext('2d');
        this.maxVal = options.maxVal || 1000;
        this.dataLength = options.dataLength || 1;
        this.stepSize = options.stepSize || 100;
        this.initScales();
        this.drawBackground();
        this.drawGrid();
    }
    initScales() {
        this.chartWidth = this.width - this.padding * 2;
        this.baseline = this.isSymmetric ? (this.height / 2) : (this.height - this.padding);
        const totalHeight = this.height - this.padding * 2;
        this.usableHeight = this.isSymmetric ? (totalHeight / 2) : totalHeight;
    }
    _toDays(id) {
        const s = id.toString();
        const date = new Date(`${s.slice(0,4)}-${s.slice(4,6)}-${s.slice(6,8)}`);
        return Math.floor(date.getTime() / 86400000); 
    }
    initTimeline() {
        const projectStart = new Date("2021-12-11").getTime() / 86400000;
        const today = Date.now() / 86400000;

        this.timeMin = Math.floor(projectStart);
        this.timeMax = Math.floor(today);
        this.timeRange = this.timeMax - this.timeMin || 1;
    }
    getTimelineX(dateId) {
        const current = this._toDays(dateId);
        const pct = (current - this.timeMin) / this.timeRange;
        return this.padding + (pct * this.chartWidth);
    }
    getX(i) { return this.padding + (i * (this.chartWidth / (this.dataLength - 1))); }
    getY(v) { return this.baseline - (v / this.maxVal * this.usableHeight); }
    drawBackground() {
        this.ctx.fillStyle = this.background;
        this.ctx.fillRect(0, 0, this.width, this.height);
    }
    drawYearGrid() {
        const startYear = 2022;
        const currentYear = new Date().getFullYear();
        for (let y = startYear; y <= currentYear; y++) {
            const timestamp = `${y}0101`;
            const x = this.getTimelineX(timestamp);
            this.ctx.beginPath();
            this.ctx.strokeStyle = "#ffffff10";
            this.ctx.moveTo(x, this.padding);
            this.ctx.lineTo(x, this.height - this.padding);
            this.ctx.stroke();
            this.labelAt(x, y.toString());
        }
    }
    drawGrid() {
        const { ctx, padding, width } = this;
        if (!this.maxVal || this.maxVal <= 0) return;
        ctx.font = "13px sans-serif";
        ctx.textAlign = "right";
        ctx.textBaseline = "middle";
        for (let v = 0; v <= this.maxVal; v += this.stepSize) {
            const yTop = this.getY(v);
            this._drawGridLine(v, yTop);
            if (this.isSymmetric && v !== 0) {
                const yBottom = this.baseline + (this.baseline - yTop);
                this._drawGridLine(v, yBottom); 
            }
        }
    }
    drawLegend(items) {
        const { ctx, width, padding } = this;
        const y = padding / 2;
        const gap = 20;
        const boxSize = 10;
        const textGap = 6;
        ctx.save();
        ctx.font = "12px sans-serif";
        ctx.textBaseline = "middle";
        let totalWidth = 0;
        const itemWidths = items.map(item => {
            const w = boxSize + textGap + ctx.measureText(item.text).width;
            totalWidth += w;
            return w;
        });
        totalWidth += gap * (items.length - 1);
        let currentX = (width - totalWidth) / 2;
        items.forEach((item, i) => {
            ctx.fillStyle = item.color;
            ctx.fillRect(currentX, y - (boxSize / 2), boxSize, boxSize);
            ctx.fillStyle = this.primary || "#979ca6";
            ctx.textAlign = "left";
            ctx.fillText(item.text, currentX + boxSize + textGap, y);
            currentX += itemWidths[i] + gap;
        });
        ctx.restore();
    }

    _drawGridLine(val, y) {
        const { ctx, padding, width } = this;
        ctx.fillStyle = this.primary;
        ctx.fillText(val, padding - 10, y);
        ctx.beginPath();
        ctx.strokeStyle = (val === 0) ? "#ffffff55" : "#ffffff22";
        ctx.lineWidth = 1;
        ctx.moveTo(padding, y);
        ctx.lineTo(width - padding, y);
        ctx.stroke();
    }
    barAt(x, value, color, offset = 0, width = 2, invert = false) {
        const posX = x + offset - (width / 2);
        const y = this.getY(value);
        const h = Math.abs(this.baseline - y);
        this.ctx.fillStyle = color;
        this.ctx.fillRect(posX, invert ? this.baseline : y, width, h);
    }
    labelAt(x, text) {
        this.ctx.save();
        this.ctx.textAlign = "center";
        this.ctx.fillStyle = "#666666";
        this.ctx.fillText(text, x, this.height - this.padding + 25);
        this.ctx.restore();
    }
}

const bosslog = {
    name: "BossLog",
    description: "Comprehensive Gloomfury data and kill logs.",
    style: `
        th, td {max-width: 200px;}
        td.selected {background-color: #f5c24733}
        td.selected:nth-child(odd) {background-color: #f5c24740;}
        .blt table {width: 100%;table-layout: auto;border-collapse: collapse;}
        .blt table th:not(:nth-child(4)) {width: 1%;white-space: nowrap;}
        .blt table th:nth-child(4) {width: auto;}   
        .blchoice {cursor: pointer;padding-left: 0.5em;}
        .blchoice:hover {color: #dae8ea;background-color: #f5c24733}
        .blchoice.active {color: #e7963f;background: linear-gradient(90deg, rgba(231, 150, 63, 0.15) 0%, transparent 100%);border-left: 2px solid #e7963f;font-weight: bold;pointer-events: none;}
        .bosslog-frame {z-index: 9;position: absolute;top: 50%;left: 50%;transform: translate(-50%, -50%);}
        .bosslog-panel {padding: 0 5px 5px;height: auto;display: grid;grid-template-rows: auto auto 1fr; width: max-content;}
        .bosslog-header {cursor: pointer;line-height: 1em;display: flex;align-items: center;position: relative;padding: 4px 0;}
        .bosslog-icon {display: inline-flex;align-items: center;justify-content: center;aspect-ratio: 1 / 1;height: 1em;border: 2px solid #e7963f80;border-radius: 5px;font-weight: bold;}
        .bosslog-grid {width: 777px;display: grid;grid-gap: 4px;grid-template-columns: 150px 1fr;}
        .bosslog-main-area {height: 450px;}
        .bosslog-menu {padding-left: 4px;}
        .bosslog-content {padding-left: 12px;}
        .bosslog-btn-icon {display: inline-flex;align-items: center;justify-content: center;aspect-ratio: 1 / 1;height: 1em;border: 2px solid #e7963f80;border-radius: 5px;font-weight: bold;}
        .bosslog-btn-icon + .textexp {margin-left: 0px;}
        .bosslog-filter-bar {background: rgba(0, 0, 0, 0.2);border-radius: 4px;}
        .bosslog-btn {text-align: center;min-width: 60px; }
        .bosslog-row {display: flex;align-items: center;padding: 6px 8px;border-bottom: 1px solid #ffffff05;gap: 10px;}
        .bosslog-row:hover {background: rgba(255, 255, 255, 0.03);}
        .blnum {font-family: monospace;}
        .blh {margin-top: 0.3em}
    `,
    hotkey: {
        "Open BossLog": { key: "L", callback: "toggleFrame" },
    },
    state: {
        isTitle: 1,
    },
    settings: {
        isTitle: {
            control: "checkbox",
            desc: "Show Widget Title",
            comment: "show/hide title 'BossLog:'",
            onupdate: "updateBtnTitle"
        },
    },
    start() {
        if (ui?.partyBtnbar?.element) this.addBtn(ui.partyBtnbar.element);
        eventManager.on("ui.partyBtnbar", this.addBtn, this);
        this._boundTableClick = this.handleTableClick.bind(this)
        this.activeMode = this.menuStructure[1].items[0]; 
        this.initFrame()
    },
    activeMode: null,
    menuStructure: [
        { label: "Performance", type: "header" },
        { type: "item", items: [
            { name: "Kills", id: "kills", label: "Hours"},
            { name: "DPS", id: "r_dps", label: "Kill ID" },
            { name: "HPS", id: "r_hps", label: "Kill ID" },
            { name: "MPS", id: "mps", label: "Kill ID" },
            { name: "Deaths", id: "deaths", label: "Hours" }
        ]},
        { label: "Records", type: "header" },
        { type: "item", items: [
            { name: "DPS", id: "dps", label: "Kill ID"  },
            { name: "HPS", id: "hps", label: "Kill ID" }
        ]},
        { label: "Max attributes", type: "header" },
        { type: "item", items: [
            { name: "Damage", id: "damage", label: "Kill ID" },
            { name: "Crit", id: "crit", label: "Kill ID" },
            { name: "Haste", id: "haste", label: "Kill ID" },
            { name: "HP", id: "hp", label: "Kill ID" },
            { name: "MP", id: "mp", label: "Kill ID" },
            { name: "Block", id: "block", label: "Kill ID" },
            { name: "Defense", id: "defense", label: "Kill ID" },
            { name: "GS", id: "gs", label: "Kill ID" }
        ]},
        { label: "Charts", type: "header" },
        { type: "item", items: [
            { name: "Population", id: "population" }
        ]},
        { label: "Personal", type: "header" },
        { type: "item", items: [
            { name: "Jeඞ", id: "personal" }
        ]}
    ],
    initFrame() {
        this.frame = element("div").css("window-pog bosslog-frame");
        const panel = element("div").css("window panel-black bosslog-panel");
        const titleFrame = element("div").css("titleframe bosslog-header");
        titleFrame.add(element("div").css("textexp bosslog-icon")
            .style({"position": "relative", "top": "25px", "left": "60px", "transform": "scale(2.5)"})
            .text("B"));
        titleFrame.add(element("div").css("textsecondary")
            .style({"flex-grow": "1", "text-align": "center", "font-size": "10px", "letter-spacing": "1px", "opacity": "0.6","font-style": "italic" })
            .text("The rules don't matter — only the data and the chaos do."));
        titleFrame.add(element("img").css("btn black svgicon").attr("src", "/data/ui/icons/cross.svg")
            .on("click", () => this.toggleFrame()));
        const toolbarSlot = element("div").css("slot");
        const toolbarLayout = element("div").css("bosslog-grid");
        const blank = element("div").style({ "padding-left": "4px" });
        this.toolbar = element("div").css("panel-black").style({
            "border-bottom": "4px solid #ffffff10"
        });
        toolbarSlot.add(toolbarLayout.add(blank).add(this.toolbar));
        const contentSlot = element("div").css("slot").style({ "min-height": "0" });
        const contentLayout = element("div").css("bosslog-grid bosslog-main-area");
        this.menu = element("div").style({ "padding-left": "4px" });
        this.content = element("div").css("menu panel-black scrollbar blt").style({ "padding-left": "12px" });
        contentSlot.add(contentLayout.add(this.menu).add(this.content));
        this.menuStructure.forEach(section => {
            if (section.type === "header") {
                this.menu.add(element("div").css("blh textprimary").text(section.label));
            } else {
                section.items.forEach(item => {
                    const btn = element("div")
                        .css(`blchoice ${item.id === 'kills' ? 'active' : ''}`)
                        .text(item.name)
                        .on("click", (e) => this.selectChoice(e.currentTarget, item));
                    if (item.id === "personal") {
                        this.personalBtn = btn.element;
                    }
                    this.menu.add(btn);
                });
            }
        });
        panel.add(titleFrame).add(toolbarSlot).add(contentSlot);
        this.frame.add(panel);
    },
    selectChoice(target, value) {
        const allChoices = this.menu.element.querySelectorAll('.blchoice');
        allChoices.forEach(el => el.classList.remove('active'));
        const activeBtn = target || this.personalBtn;
        if (activeBtn) activeBtn.classList.add('active');
        this.filters = {};
        this.updateFrame(value);
        this.targetPlayer = null;
    },
    stop() {
        ui.partyBtnbar.element && ui.partyBtnbar.element.removeChild(this.btn.element)        
        eventManager.off("ui.partyBtnbar", this.addBtn, this)
    },
    addBtn(partyBtnbar) {
        const parent = partyBtnbar.element || partyBtnbar;
        this.btnLabel = element("span").css("textprestige").text(this.state.isTitle ? "ossLog" : "");
        this.icon = element("div").css("textprestige bosslog-btn-icon").text("B");
        this.btn = element("div").css("btn border black").on("click", () => this.toggleFrame()).add(this.icon).add(this.btnLabel);
        parent.appendChild(this.btn.element);
    },
    updateBtnTitle() {
        this.btnLabel.text(this.state.isTitle ? "ossLog" : "");
    },
    toggleFrame() {
        const parent = ui.mainContainer.element;
        const isAttached = parent.contains(this.frame.element);

        if (isAttached) {
            parent.removeChild(this.frame.element);
            this.content.element.removeEventListener("click", this._boundTableClick);
        } else {
            parent.appendChild(this.frame.element);
            this.content.element.addEventListener("click", this._boundTableClick);
            this.updateFrame();
        }
    },
    handleTableClick(e) {
        const tr = e.target.closest("tr");
        if (!tr) return;
        const td = tr.cells[1]; 
        if (td) {
            const nameDiv = td.querySelector("div");
            const name = (nameDiv || td).innerText.trim();
            this.targetPlayer = name;
            const personalBtn = this.menu.element.querySelector('.blchoice[id="personal"]');
            this.selectChoice(personalBtn, { name: "Jeඞ", id: "personal" });
        }
    },
    async updateFrame(value) {
        this.activeMode = value || this.activeMode;
        const now = Date.now();
        if (!this.globaldata || (now - (this.last_time || 0)) > 3600000) {
            this.globaldata = await this.fetchData();
            this.last_time = now;
        }
        this.toolbar.clear();
        this.content.clear();
        const views = {
            population: () => this.renderPopulation(),
            personal: () => this.renderPersonal(),
        };
        (views[this.activeMode.id] || (() => this.renderTable()))();
    },
    renderTable() {
        const groups = [
            { items: [{ text: "VG", color: "textf0" }, { text: "BL", color: "textf1" }] },
            { items: [
                { text: "Warrior", color: "textc0" }, { text: "Mage", color: "textc1" },
                { text: "Archer", color: "textc2" }, { text: "Shaman", color: "textc3" }
            ]}
        ];
        if (['haste', 'hp', 'mp', 'block'].includes(this.activeMode.id)) {
            groups.push({ items: [{ text: "noMods", color: "textfame" }] });
        }
        this.renderToolbar({ groups });
        const data = this.globaldata?.data?.[this.activeMode.id] || [];
        const transform = this.transformArray(data);
        const table = createTable(transform);
        this.content.clear().add(table.element);
    },
    renderPopulation() {
        const data = this.globaldata?.data?.population || [];
        if (!data.length) return;

        this.renderToolbar({
            groups: [{ items: [
                { text: "Swap", id: "swap", color: "textprimary" },
                { text: "Split", id: "split", color: "textprimary" }
            ]}]
        });
        const max = Math.max(...data.flatMap(d => [d[1], d[2]])) * 1.1;
        this.content.add(element("div").css("textprimary").style({ "margin": "7px 0px", "font-size": "large" })
            .text("Unique Characters per Day - Gloomfury Kills"));
        const chart = new Chart({
            height: 400,
            maxVal: max,
            stepSize: 100,
            isSymmetric: !!this.filters.split
        });
        chart.initTimeline(); 
        chart.drawYearGrid(); 
        chart.drawLegend([
            { text: "VG", color: "#458bd9" },
            { text: "BL", color: "#c32929" }
        ]);
        const order = this.filters.swap 
            ? [{ idx: 2, col: '#c32929' }, { idx: 1, col: '#458bd9' }] 
            : [{ idx: 1, col: '#458bd9' }, { idx: 2, col: '#c32929' }];
        data.forEach((d) => {
            const x = chart.getTimelineX(d[0]); 
            order.forEach((item, idx) => {
                const invert = !!this.filters.split && idx === 1;
                chart.barAt(x, d[item.idx], item.col, 0, 1, invert);
            });
        });
        this.content.add(chart);
    },
    async renderPersonal() {
        this.content.clear();
        const name = this.targetPlayer || profileManager.playerName;
        this.renderToolbar({
            search: true,
            placeholder: "Search player name...",
        });
        const data = await this.fetchData(name);
        if (!data) return this.renderPersonalPlaceholder(name);
        const logs = data._;
        const [pFaction, pClass, pRealName] = data.p;
        const formatDate = (s) => `${s.slice(6, 8)}.${s.slice(4, 6)}.${s.slice(2, 4)}`;
        let stats = {
            kills: 0, dps: 0, hps: 0, mps: 0, gs: 0, duration: 0, deaths: 0,
            damage: 0, crit: 0, haste: 0, hp: 0, mp: 0, block: 0, defense: 0,
            firstkill: formatDate(logs[0][0].toString()),
            lastkill: formatDate(logs[logs.length - 1][0].toString())
        };
        const maxVal = Math.max(...logs.map(d => d[15] || 0)) * 1.1;
        const chart = new Chart({
            height: 250,
            maxVal: maxVal,
            stepSize: 10
        });
        chart.initTimeline();
        chart.drawYearGrid();
        chart.drawLegend([{ text: "Kills Per Day", color: "#458bd9" }]);
        logs.forEach((d) => {
            stats.kills += d[15];
            stats.deaths += d[6];
            stats.duration += d[5];
            stats.dps = Math.max(stats.dps, d[1]);
            stats.hps = Math.max(stats.hps, d[2]);
            stats.mps = Math.max(stats.mps, d[3]);
            stats.gs = Math.max(stats.gs, d[4]);
            stats.damage = Math.max(stats.damage, Math.floor((d[7] + d[8]) / 2));
            stats.crit = Math.max(stats.crit, d[9]);
            stats.haste = Math.max(stats.haste, d[10]);
            stats.hp = Math.max(stats.hp, d[11]);
            stats.mp = Math.max(stats.mp, d[12]);
            stats.block = Math.max(stats.block, d[13]);
            stats.defense = Math.max(stats.defense, d[14]);
            const x = chart.getTimelineX(d[0]);
            chart.barAt(x, d[15] || 0, '#458bd9', 0, 2);
        });
        const header = element("div").css("panel-black").style({ "display": "flex", "align-items": "center", "gap": "10px"});
        header.add(element("img").attr("src", `/data/ui/factions/${pFaction}.avif`).style({ "height": "1.5em" }));
        header.add(element("img").attr("src", `/data/ui/classes/${pClass}.avif`).style({ "height": "1.5em" }));
        header.add(element("span").css(`textf${pFaction}`).style({ "font-size": "1.5em" }).text(pRealName));
        this.content.add(header);
        this.renderPersonalStats(stats);
        this.content.add(chart);
    },
    renderPersonalPlaceholder(name) {
        this.content.clear()
            .add(element("div").css("panel-black big textcenter").style({ "padding": "40px 20px" })
                .add(element("div").css("textprimary big mb-10").text(`${name} is a Ghost 👻`))
                .add(element("div").css("textsecondary").text(`${name} has to go kill Gloomfury and wait an eternity to see the stats.`))
                .add(element("div").css("textsecondary").text(`Check back when ${name} actually exists in the logs.`))
            );
    },
    renderPersonalStats(stats) {
        const container = element("div").style({
            "display": "grid",
            "grid-template-columns": "repeat(auto-fit, minmax(100px, 1fr))",
            "gap": "10px",
            "padding": "13px 15px",
        });
        const addStat = (label, value, color) => {
            container.add(element("div").css("text-center")
                .add(element("div").css("textsecondary").style({"font-size": "smaller"}).text(label))
                .add(element("div").css(color || "textwhite").style({"font-weight":"bold"}).text(value)));
        };
        addStat("Total Kills", stats.kills.toLocaleString(), "textgreen");
        addStat("Peak DPS", stats.dps.toLocaleString(), "textc1");
        addStat("Peak HPS", stats.hps.toLocaleString(), "textc3");
        addStat("Peak MPS", stats.mps.toLocaleString(), "textc0");
        addStat("Total Deaths", stats.deaths.toLocaleString(), "textf1");
        addStat("First Kill", stats.firstkill, "textwhite");
        addStat("Last Kill", stats.lastkill, "textsecondary");
        addStat("Peak Avg. Dmg", stats.damage.toLocaleString(), "textc1");
        addStat("Max Crit", (stats.crit / 10).toFixed(1) + "%", "textc2");
        addStat("Max Haste", (stats.haste / 10).toFixed(1) + "%", "textc2");
        addStat("Max HP", stats.hp.toLocaleString(), "textc3");
        addStat("Max MP", stats.mp.toLocaleString(), "textc3"); 
        addStat("Max Block", (stats.block / 10).toFixed(1) + "%", "textc0");
        addStat("Max Defense", stats.defense.toLocaleString(),"textc0");
        addStat("Peak GS", stats.gs.toLocaleString(), "textfame");
        this.content.add(container);
    },
    transformArray(array) {
        if (!array?.length) return [];
        
        const factionMap = { 0: "vg", 1: "bl" };
        const classMap = { 0: "warrior", 1: "mage", 2: "archer", 3: "shaman" };
        const mode = this.activeMode.id;
        const hasFactionFilter = this.filters.vg || this.filters.bl;
        const hasClassFilter = this.filters.warrior || this.filters.mage || this.filters.archer || this.filters.shaman;
        const noMods = this.filters.nomods === 1;
        const filtered = array.filter(e => {
            const fKey = factionMap[e[0]];
            const cKey = classMap[e[1]];
            const val = e[3];
            if (hasFactionFilter && !this.filters[fKey]) return false;
            if (hasClassFilter && !this.filters[cKey]) return false;
            if (noMods) {
                if ((mode === "haste" && val > 600) || (mode === "hp" && val > 5000) || 
                    (mode === "mp" && val > 3000) || (mode === "block" && val > 700)) return false;
            }
            return true;
        });
        if (!filtered.length) return [];
        const maxVal = parseFloat(filtered[0][3]) || 1;
        return filtered.map((e, i) => {
            const rawVal = parseFloat(e[3]) || 0;
            const pct = (rawVal / maxVal) * 100;
            let displayVal = rawVal;
            if (["crit", "haste", "block"].includes(mode)) displayVal = (rawVal / 10).toFixed(1);
            let secVal = e[4];
            if (this.activeMode.label === "Hours") secVal = Math.floor(parseFloat(e[4]) / 3600);
            return {
                "#": element("div").css("textcenter").text(i + 1),
                "Name": element("div").css("textwhite").add(
                    element("span").css(`name textf${e[0]} svelte-erbdzy`).text(e[2])
                ),
                [this.activeMode.name]: element("div").css("textprestige textright blnum").text(displayVal),
                " ": element("div").css("bar svelte-i7i7g5").add(
                    element("div").css(`progressBar bgc${e[1]} svelte-i7i7g5`)
                        .style({ "width": `${pct}%` })
                        .add(element("span").css("left svelte-i7i7g5"))
                ),
                [this.activeMode.label]: element("div").css("textcenter blnum").text(secVal)
            };
        });
    },
    async handleSearch(name) {
        const cleanName = name.trim();
        if (cleanName.length < 3) return;
        if (this.isSearching) return;
        this.isSearching = true;
        try {
            const data = await this.fetchData(cleanName);
            if (data) {
                this.targetPlayer = cleanName;
                this.selectChoice(null, { id: "personal" }); 
            } else {
                this.renderPersonalPlaceholder(cleanName);
            }
        } finally {
            this.isSearching = false;
        }
    },
    filters: {},
    createFilterBtn(item) {
        const text = item.text;
        const color = item.color || "textwhite";
        const filterKey = text.toLowerCase();
        const isActive = this.filters[filterKey] === 1;
        const activeClass = `bosslog-btn btn grey border ${color} active`;
        const inactiveClass = `bosslog-btn btn grey ${color}`;
        const btn = element("div")
            .css(isActive ? activeClass : inactiveClass) // Set correct class on creation
            .text(text)
            .on("click", () => {
                this.filters[filterKey] = this.filters[filterKey] === 1 ? 0 : 1;
                this.updateFrame();
            });
        return btn;
    },
    renderToolbar(config) {
        this.toolbar.clear();
        const controls = element("div").style({ 
            "display": "flex", "justify-content": "end", 
            "align-items": "center", "gap": "20px", "width": "100%" 
        });
        if (config.buttons?.length) {
            const leftGroup = element("div").style({ "display": "flex", "gap": "8px" });
            config.buttons.forEach(btn => {
                leftGroup.add(element("div")
                    .css(`btn black textwhite ${btn.css || ""}`)
                    .style({ "padding": "4px 12px", "cursor": "pointer", "white-space": "nowrap" })
                    .text(btn.text)
                    .on("click", () => btn.click()));
            });
            controls.add(leftGroup);
        }
        if (config.groups?.length) {
            const middleGroup = element("div").style({ 
                "display": "flex", "gap": "24px", "justify-content": "space-between", "flex-grow": "1" 
            });
            config.groups.forEach(group => {
                const groupContainer = element("div").style({ "display": "flex", "gap": "8px" });
                group.items.forEach(item => groupContainer.add(this.createFilterBtn(item)));
                middleGroup.add(groupContainer);
            });
            controls.add(middleGroup);
        }
        if (config.search) {
            const rightGroup = element("div").style({ "display": "flex", "justify-content": "flex-end" });
            rightGroup.add(element("input")
                .css("text")
                .style({ "width": "180px", "padding": "3px 8px"})
                .attr("placeholder", config.placeholder || "Search...")
                .on("keydown", (e) => {
                    if (e.key === "Enter") {
                        this.handleSearch(e.target.value);
                    }
                }))
            controls.add(rightGroup);
        }
        this.toolbar.add(controls);
    },
    async getSHA256(message) {
        const msgBuffer = new TextEncoder().encode(message);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        return Array.from(new Uint8Array(hashBuffer))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    },
    datapath: "https://raw.githubusercontent.com/hordesmod/kek-ui-bosslog/refs/heads/main/data/",
    async fetchData(name = "global") {
        let path = "global";
        if (name !== "global") {
            const hash = await this.getSHA256(name.toLowerCase());
            path = `${ hash[0]}/${ hash[1]}/${hash}`;
        }
        const res = await fetch(`${this.datapath}${path}.json`).catch(() => ({}));
        return res.ok ? res.json() : null;
    }
}

export default bosslog