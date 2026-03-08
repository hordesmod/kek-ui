// import apiManager from "./api"

import { getClass } from "./widgets/player"

class ProfileManager {
    constructor() {
        this.playerName = null
        this.playerClass = null
        this.playerLevel = null
        this.pid = null
        this.charSheetOpened = false
        
        this.profileMapping = JSON.parse(localStorage.getItem("profileMapping") || null) || {}
        
        this.foundProfile = false
        this.wrongProfile = null
    }

    init() {
        this.fetchPlayerInfo()
        // console.log(this.playerName, this.pid, "profileMapping from init")
    }

    fetchPlayerInfo() {
        const ufplayer = document.querySelector("#ufplayer");
        const syscharElement = document.getElementById('syschar');

        if (ufplayer && syscharElement) {
            this.playerName = ufplayer.querySelector(".left").textContent;
            const classImgSrc = ufplayer.querySelector("img").src;
            const manaBar = ufplayer.querySelector(".progressBar.bgmana")
            this.playerLevel = parseFloat(this.getLevel(manaBar))
            this.playerClass = parseFloat(getClass(classImgSrc))
            this.pid = parseFloat(this.getPid())
            if(this.playerName.endsWith("...")) {
                this.wrongProfile = `${this.playerName}_${this.playerClass}`
                if(this.profileMapping[this.wrongProfile]) {
                    this.playerName = this.profileMapping[this.wrongProfile].split("_")[0]
                    return
                } else {
                    if (!this.charSheetOpened) {
                        syscharElement.click();
                        this.charSheetOpened = true
                        this.getPlayerName()
                    }
                }
            }
        } else {
            console.error("not found ufplayer or syscharElement")
            setTimeout(this.fetchPlayerInfo.bind(this), 1)
        }
    }

    getPlayerName() {
        const statcolElement = document.querySelector('.statcol');
        const syscharElement = document.getElementById('syschar');
        if (statcolElement && syscharElement) {
            const secondSpan = statcolElement.querySelector('span:nth-child(2)');

            if (secondSpan) {
                this.playerName = secondSpan.textContent.trim();
                console.log("player name from second span: ", this.playerName)
                const correctProfile = `${this.playerName}_${this.playerClass}`
                this.profileMapping[this.wrongProfile] = correctProfile
                localStorage.setItem("profileMapping", JSON.stringify(this.profileMapping))
            } else {
                console.error("not found second span")
                setTimeout(this.getPlayerName.bind(this), 1);
            }
        } else {
            console.error("not found statcol or syschar")
            setTimeout(this.getPlayerName.bind(this), 1);
        }
    }

    getLevel(manaBar) {
        return manaBar.childNodes[0].textContent.split(" ")[1]
    }

    getPid() {
        return localStorage.getItem("lastConnectedChar")
    }
}

const profileManager = new ProfileManager()

export default profileManager