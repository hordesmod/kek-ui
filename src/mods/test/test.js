import log from "../../core/logger"

const test = {
    name: "Test Module",
    description: "Test Module Description",
    _profiles: true,
    state: {
        testBool: false,
        testString: "String",
        testNumber: 100,
        testRange: 100,
        testSelect: "String",
        testColor: "F0F0F0",
    },
    settings: {
        testBool: {control: "checkbox", desc: "testBool", comment: "checkbox", onupdate: "testSettingsUpdate"},
        testRange: {control: "range", desc: "testRange", comment: "range", min: 0, max: 50, step: 1, onupdate: "testSettingsUpdate"},
        testNumber: {control: "number", desc: "input", comment: "comment", onupdate: "testSettingsUpdate"},
        testString: {control: "text", desc: "input", comment: "comment", onupdate: "testSettingsUpdate"},
        testSelect: {control: "select", desc: "testSelect", comment: "select", options: { 1: "test1", 2: "test2", 3: "test3", }, onupdate: "testSettingsUpdate"},
        testColor: {control: "color", desc: "testColor", comment: "color", options: { 1: "test1", 2: "test2", 3: "test3", }, onupdate: "testSettingsUpdate"},
    },
    hotkey: {
        "Hotkey Test": {key: "'", callback: "testHotkey"},
    },
    start() {
        log("TEST MODULE start")
    },
    stop() {
        log("TEST MODULE stop")
    },
    testSettingsUpdate(){
        log("TEST MODULE state:", this.state)
    },
    testHotkey(){

    },
    saveProps(newProps) {
        this.state.props = newProps
    },  

    funcOnU() {
        console.log("Pressed U from test", this.state)
    },
}
window.test = test
export default test