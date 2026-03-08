import eventManager from "../../core/event"
import log from "../../core/logger"
import profileManager from "../../core/profile"
import ui from "../../core/ui"
import element from "../../core/widgets/element"

const timers = {
    name: "Timers",
    description: "Enhance time-related features within a game.",
    state: {
        isTitle: 0
    },
    settings: {
        isTitle: {
            control: "checkbox",
            desc: "Show Widget Title",
            comment: "show/hide title 'Time:'",
            onupdate: "updateBtnTitle"
        },
    },
    style: `
        .kektimers {
            display: grid;
            grid-template-columns: 1fr 1fr;
            grid-gap: 8px;
            padding: 8px;
        }
        .kektimers>.span{
            grid-column: span 2;
        }
        .kektimers>.period {
            margin-top: 4px;
        }
        .kektimers>.custom {
            margin-bottom: 4px;
        }
        .kektimers>.time {
            font-family: monospace;
        }
    `,
    // hotkey: {
    //     "Toggle fame info popup": { key: "]", callback: "toggleFrame" },
    // },
    start() {
        if (ui?.partyBtnbar?.element) {
            this.addBtn(ui.partyBtnbar.element)
        }
        eventManager.on("ui.partyBtnbar", this.addBtn, this)

        // this.timerInterval = setInterval(this.update.bind(this), 1000)

        this.createFrame()
    },
    stop() {
        if (ui.partyBtnbar.element) {
            ui.partyBtnbar.element.removeChild(this.btn.element)
        }
        eventManager.off("ui.partyBtnbar", this.addBtn, this)
    },
    addBtn(partyBtnbar) {
        partyBtnbar = partyBtnbar.element
        this.btnLabel = element("span").css("textexp").text(`${this.state.isTitle && "Time: " || ""}`)
        this.btnText = element("span").css("textgreen").text(".")

        this.btn = element("div").css("btn border black textgrey")
            .on("mouseenter", this.showFrame.bind(this))
            .on("mouseleave", () => this.removeFrameDelay(100))
            .add(this.btnLabel)
            .add(this.btnText)

        partyBtnbar.appendChild(this.btn.element)
        this.updateBtnTimer()

    },
    updateBtnTitle() {
        this.btnLabel.text(`${this.state.isTitle && "Time: " || ""}`)
    },
    updateBtnInfo() {
        const currentDate = new Date()
        const utcHour = currentDate.getUTCHours()
        if (utcHour % 3 === 0) {
            this.btnText.text("Obelisks")
        } else if (utcHour % 3 === 1) {
            this.btnText.text("Gloomfury")
        } else if (utcHour % 3 === 2) {
            this.btnText.text("Idle")
        }
    },
    updateBtnTimer() {
        this.updateBtnInfo()
        var now = new Date()
        var msUntilNextHour = ((59 - now.getUTCMinutes()) * 60 + (60 - now.getUTCSeconds())) * 1000
        // log("next btn update at", msUntilNextHour)
        setTimeout(()=>{
            this.updateBtnInfo()
            setInterval(this.updateBtnInfo.bind(this), 3600000)
        }, msUntilNextHour)
    },
    toggleFrame() {
        const isFrameFound = Array.from(ui.mainContainer.element.children).some(child => child === this.frame.element)
        isFrameFound ? this.removeFrame() : this.showFrame()
    },
    timers: {
        "Obelisks": 180 * 60 * 1000,
        "Last Obelisk": 125 * 60 * 1000,
        "Gloomfury": 120 * 60 * 1000,
        "Gloomfury spawn": 114 * 60 * 1000,
        "Idle time": 60 * 60 * 1000,
        "Next Obelisks": 0,
        "Next Gloomfury": -60 * 60 * 1000,
    },
    timerElements: {},
    createFrame() {
        const frame = element("div")
            .css("window panel-black kektimers")
            .on("mouseleave", () => this.removeFrameDelay(100))
            .on("mouseenter", () => clearTimeout(this.frameTimer))
            .add(element("h3").css("textprimary span period").text("Time Periods"))

        for (const label of Object.keys(this.timers)) {
            frame.add(element("span").text(label))
            this.timerElements[label] = element("span").css("textcenter time").text("--:--:--")
            frame.add(this.timerElements[label])
        }
        frame.add(element("div").css("span").text("---"))
        frame.add(element("span").css("textexp").text("Weekly restart"))
        this.timerElements["Weekly restart"] = element("span").css("textcenter time").text("--:--:--")
        frame.add(this.timerElements["Weekly restart"])

        // frame.add(element("h3").css("textprimary span custom").text("Custom Timer"))

        // DEBUG RANGE
        // const timeValue = element("div")
        // const timeRange = element("input").css("span").type("range").attr("min", "0").attr("max", "86400").attr("value", "3300").on("input", e => {
        //     const now = new Date(e.target.value * 1000) // Get current date and time 3598
        //     timeValue.text(now.toLocaleTimeString())
        //     this.update(now)
        // })
        // frame.add(timeValue).add(timeRange)
        // DEBUG RANGE

        // const btnbar = element("div").css("btnbar span")
        // const play = element("div").css("btn grey textwhite textcenter").text("⏵").style({ width: "24px" })
        // btnbar.add(play)

        // const timerCustom = [10, 15, 20, 30, 45, 60]
        // for (const custom of timerCustom) {
        //     const t = element("div").css("btn grey textwhite").text(`${custom}m`)
        //     btnbar.add(t)
        // }
        // frame.add(btnbar)

        // this.timerElements.timerCustom = element("h1").css("textprimary span textcenter").text("00:00")
        // frame.add(this.timerElements.timerCustom)

        this.frame = frame

    },
    showFrame() {
        clearTimeout(this.frameTimer)
        const rect = this.btn.element.getBoundingClientRect()

        this.frame.style({ position: "fixed", top: rect.bottom + 1 + "px", left: rect.left + "px", zIndex: 99 })

        ui.mainContainer.element.appendChild(this.frame.element)
        this.frameOn = true
        this.update()
        clearInterval(this.frameUpdateIntervalID)
        this.frameUpdateIntervalID = setInterval(this.update.bind(this), 1000)
    },
    removeFrameDelay(delay) {
        this.frameTimer = this.frameOn && setTimeout(this.removeFrame.bind(this), delay)
    },
    removeFrame() {
        clearTimeout(this.frameTimer)
        ui.mainContainer.element.removeChild(this.frame.element)
        clearInterval(this.frameUpdateIntervalID)
    },
    update() {
        log("update")
        let localTime = new Date()
        let timeUTC = new Date(localTime.getTime() + localTime.getTimezoneOffset() * 60 * 1000)
        const currentHour = timeUTC.getHours()
        const next3rdHour = Math.ceil(currentHour / 3) * 3 + (currentHour % 3 === 0 ? 3 : 0)
        const next3rdHourTime = new Date(timeUTC.getFullYear(), timeUTC.getMonth(), timeUTC.getDate(), next3rdHour, 0, 0, 0)

        for (const [timerName, count] of Object.entries(this.timers)) {
            const timeDiff = next3rdHourTime - timeUTC
            const timerDiff = timeDiff - count
            if (timerDiff < 0) {
                this.timerElements[timerName].text("↓")
            } else {
                let remainingTime = timerDiff / 1000
                const hours = Math.floor(remainingTime / 3600)
                remainingTime %= 3600
                const minutes = Math.floor(remainingTime / 60)
                const seconds = Math.floor(remainingTime % 60)
                if (hours > 0) {
                    this.timerElements[timerName].text(`${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`)
                } else {
                    this.timerElements[timerName].text(`${minutes}:${seconds.toString().padStart(2, "0")}`)
                }
            }
        }

        // const now = new Date()
        // const nextWednesday = new Date(now.getTime() + (10 - now.getUTCDay()) % 7 * 24 * 60 * 60 * 1000)
        // nextWednesday.setUTCHours(0, 0, 0, 0)


        const now = new Date();
        const currentDay = now.getUTCDay();
        const daysUntilNextWednesday = currentDay === 3 ? 7 : (3 - currentDay + 7) % 7; // If it's Wednesday today, consider next Wednesday
        const millisecondsUntilNextWednesday = daysUntilNextWednesday * 24 * 60 * 60 * 1000; // Convert days to milliseconds
        const nextWednesday = new Date(now.getTime() + millisecondsUntilNextWednesday); // Add milliseconds to current time
        nextWednesday.setUTCHours(0, 0, 0, 0); // Set time to midnight
        
        

        const timeDifference = nextWednesday.getTime() - now.getTime()

        const daysDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24))
        const hoursDifference = Math.floor((timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutesDifference = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60))
        const secondsDifference = Math.floor((timeDifference % (1000 * 60)) / 1000)

        this.timerElements["Weekly restart"].text(`${daysDifference}d ${hoursDifference}:${minutesDifference.toString().padStart(2, "0")}:${secondsDifference.toString().padStart(2, "0")}`)

    }

}
window.timer = timers
export default timers