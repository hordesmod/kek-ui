import config from "../config"

function log(...args) {
 
    const trace = new Error().stack
        .split("\n")
        .map(line => line.split(" "))
        .filter(parts => parts.length > 6 && !parts[6].includes("(<anonymous>)"))
        .map(parts => parts[5])
        .reverse()
        .join("::")

    config.devMode && console.log(`%c [${config.appName}::${trace}] ${(Date.now() / 1000).toFixed(3)}:`, "color: #0f0", ...args)
}

export default log