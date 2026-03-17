import chatEmoji from "./chatEmoji"
// import test from "./test/test"
import mainMenu from "./mainMenu"
// import _party from "./party"
import blockPlayers from "./blockPlayers"
import expbar from "./expBar"
import mouseOver from "./mouseOver"
import runeTracker from "./runeTracker"
// import gloom from "./gloom"
import whispers from "./whispers"
import itemSharing from "./itemSharing"
import isbis from "./isbis"
import statsSim from "./statsSim"
import gui from "./gui"
import itemLocking from "./itemLocking"
import skillPreset from "./skillPresets.js"
import speculatePrestige from "./speculatePrestige"
import fameInfo from "./fameInfo"
import chatTranslator from "./chatTranslator"
import buffOnly from "./buffOnly"
import killTracker from "./killtracker"
import interaction from "./interaction"
import itemWindow from "./itemWindow"
import closeWindow from "./closeWindow"
import chatTweaks from "./chatTweaks"
import minimap from "./minimap"
import clanInfo from "./clanInfo"
import notify from "./notify"
import merchant from "./merchant"
import timers from "./timers"
import partyBtnTweaks from "./partyBtn"
import config from "../config"
import debugInfo from "./debugInfo"
import itemFilters from "./itemFilters"
import chatLog from "./chatLog"
import skillbar from "./skillBar"
import targetTooltip from "./targetTooltip"
import MinimalUI from "./minUI"
import bosslog from "./bossLog"
// import friendsInfo from "./friendsInfo"

const mods = [
    // test,
    // friendsInfo,
    // _party,
    partyBtnTweaks,
    MinimalUI,
    buffOnly,
    chatEmoji,
    blockPlayers,
    expbar,
    mouseOver,
    runeTracker,
    // gloom,
    gui,
    timers,
    whispers,
    itemSharing,
    // isbis,
    itemLocking,
    statsSim,
    skillPreset,
    speculatePrestige,
    mainMenu,
    fameInfo, 
    killTracker,
    chatTranslator,
    interaction,
    itemWindow,
    closeWindow,
    chatTweaks,
    minimap,
    itemFilters,
    clanInfo,
    merchant,
    notify,
    chatLog,
    skillbar,
    targetTooltip,
    bosslog,
]

if(config.devMode == true) mods.push(debugInfo)

export default mods