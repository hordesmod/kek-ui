// ==UserScript==
// @name        KEK UI
// @description Hordes UI Script
// @namespace   https://hordes.io/
// @match       https://hordes.io/play
// @run-at      document-start
// @icon        https://www.google.com/s2/favicons?sz=64&domain=hordes.io
// @license     KEK
// @author      Scrizz and Grigory
// @version     0.50.57
// @grant       none
// ==/UserScript==
/* Version: 0.50.57 - February 6, 2024 18:29:38 */
'use strict';

const config = {
    appName: "KEK",
    devMode: true,
    version: "0.50.57",
    localStorageKey: "kekStorage"
};

const ApiUrls = {
    "hordes": {
        'default': {
            baseUrl: '',
            endpoints: {
                'account': {
                    method: 'GET',
                    endpoint: 'account/info',
                    // bodyParams: ['ttl'], // Include TTL as a body parameter
                }
            }
        },
        "item": {
            baseUrl: "https://hordes.io/api",
            endpoints: {
                "get": {
                    method: "POST",
                    endpoint: "item/get",
                    bodyParams: ["ids"],
                    ttl: 3600000,
                },
                "getnew": {
                    method: "POST",
                    endpoint: "item/getPlayerEquipped",
                    bodyParams: ["ids", "pid"],
                    ttl: 3600000
                }
            },
        },
        "player": {
            baseUrl: "https://hordes.io/api",
            endpoints: {
                "get": {
                    method: "POST",
                    endpoint: "playerinfo/search",
                    bodyParams: ["name", "order", "limit", "offset"]
                }
            }
        }
    },
    "kek": {
        "friend": {
            baseUrl: 'https://hordes-friends-api.vercel.app',
            endpoints: {
                "status": {
                    method: "POST",
                    endpoint: "status",
                    bodyParams: ["player_name", "status_flag"]
                },
                "get": {
                    method: "POST",
                    endpoint: "friends",
                    bodyParams: ["player_name"]
                },
                "add": {
                    method: "POST",
                    endpoint: "add_friend",
                    bodyParams: ["player_name", "friend_name"]
                },
                "remove": {
                    method: "POST",
                    endpoint: "remove_friend",
                    bodyParams: ["player_name", "friend_name"]
                }
            }
        },
        "gloom": {
            baseUrl: "https://fasthordesapimongo.onrender.com",
            endpoints: {
                "personal": {
                    method: "POST",
                    endpoint: "info",
                    bodyParams: ["player_name"]
                },
                "ranking": {
                    method: "POST",
                    endpoint: "rankings",
                    bodyParams: ["player_name", "required_arg", "optional_args"]
                }
            }
        },
        "tierlist": {
            baseUrl: "https://hordes-tierlist-api.vercel.app",
            endpoints: {
                "rank": {
                    method: "POST",
                    endpoint: "rank",
                    bodyParams: ["classid", "build_score"],
                    ttl: 3600000
                }
            }
        }
    }
};

class ApiManager {
    constructor() {
        this.cache = new Map();
    }
    init() {
        
    }
    async request(objConfig = "hordes.default.account", data) {
        objConfig = objConfig.split(".");
        const scopeKey = objConfig[0];
        const baseUrlKey = objConfig[1];
        const endpoint = objConfig[2];

        const baseConfig = ApiUrls[scopeKey][baseUrlKey];

        if (!baseConfig) {
            throw new Error(`Base URL key '${baseUrlKey}' not found in ApiUrls`);
        }

        const apiConfig = baseConfig.endpoints[endpoint];

        if (!apiConfig) {
            throw new Error(`Endpoint '${endpoint}' not found in ApiUrls[${scopeKey}][${baseUrlKey}]`);
        }

        const cacheKey = this.generateCacheKey(endpoint, data, baseUrlKey);

        // Check if the response is already in the cache and not expired
        const cachedEntry = this.cache.get(cacheKey);
        if (cachedEntry && Date.now() - cachedEntry.timestamp < cachedEntry.ttl) {
            // console.log(`Cache hit for ${cacheKey}`);
            return cachedEntry.data;
        }

        const baseUrl = baseConfig.baseUrl;
        const url = `${baseUrl}/${apiConfig.endpoint}`;
        const requestOptions = {
            method: apiConfig.method,
            headers: {
                'Content-Type': 'application/json',
            },
        };
        if (apiConfig.method === 'GET') {
            // If it's a GET request, append data as query parameters
            const queryString = Object.entries(data)
                .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
                .join('&');

            if (queryString) {
                requestOptions.url += `?${queryString}`;
            }
        } else {
            // For other methods, check if there are body parameters to be included
            const bodyParams = {};

            if (apiConfig.bodyParams) {
                apiConfig.bodyParams.forEach(param => {
                    if (data[param] !== undefined) {
                        bodyParams[param] = data[param];
                    }
                });
            }

            if (apiConfig.sendTtl) {
                // Include TTL in the request payload
                bodyParams.ttl = apiConfig.ttl || 0; // Set a default TTL if not provided
            }

            if (Object.keys(bodyParams).length > 0) {
                requestOptions.body = JSON.stringify(bodyParams);
            }
        }

        // console.log(url, "from apiManager")
        const response = await fetch(url, requestOptions);

        if (!response.ok) {
            throw new Error(`Failed to fetch data from ${url}. Status: ${response.status}`);
        }

        const responseData = await response.json();

        // Store the response in the cache with a timestamp and TTL
        this.cache.set(cacheKey, { data: responseData, timestamp: Date.now(), ttl: apiConfig.ttl });

        return responseData;
    }

    generateCacheKey(endpoint, data, baseUrlKey) {
        return `${baseUrlKey}:${endpoint}:${JSON.stringify(data)}`;
    }
}

// Example usage:
const apiManager = new ApiManager();

class BootManager {
    init() {

    }
}

const bootManager = new BootManager();

function log(...args) {
 
    const trace = new Error().stack
        .split("\n")
        .map(line => line.split(" "))
        .filter(parts => parts.length > 6 && !parts[6].includes("(<anonymous>)"))
        .map(parts => parts[5])
        .reverse()
        .join("::");

    console.log(`%c [${config.appName}::${trace}] ${(Date.now() / 1000).toFixed(3)}:`, "color: #0f0", ...args);
}

/**
 * EventManager - A utility class for managing and triggering events.
 *
 * @class
 * @description
 * The `EventManager` class provides a simple interface for registering,
 * unregistering, and triggering custom events within your application.
 * It allows you to organize and handle callbacks efficiently.
 *
 * @constructor
 * @property {Object} registry - An object to store registered event callbacks.
 *
 * @method on(eventName, callback, context)
 * Registers a callback function for a specific event.
 *
 * @method off(eventName, callback, context)
 * Unregisters a callback function for a specific event.
 *
 * @method trigger(eventName, ...args)
 * Triggers an event, executing all registered callback functions.
 *
 * @example
 * // Create an instance of EventManager
 * const eventManager = new EventManager();
 *
 * // Define a sample callback function
 * function sampleCallback(message) {
 *     console.log(`Sample callback executed: ${message}`);
 * }
 *
 * // Register the callback for the 'sampleEvent' with a specific context
 * eventManager.on('sampleEvent', sampleCallback, { contextData: 'example' });
 *
 * // Trigger the 'sampleEvent', executing the registered callback
 * eventManager.trigger('sampleEvent', 'Hello, EventManager!');
 *
 * // Unregister the callback for the 'sampleEvent'
 * eventManager.off('sampleEvent', sampleCallback, { contextData: 'example' });
 */

class EventManager {

    #registry = {}

    /**
     * Register a callback function for a specific event.
     * @param {string} eventName - The name of the event.
     * @param {function} callback - The callback function to be executed when the event occurs.
     * @param {Object} context - The context in which the callback should be executed (optional).
     */

    on(eventName, callback, context) {
        // Create an array for the event if it doesn't exist
        if (!this.#registry[eventName]) {
            this.#registry[eventName] = [];
        }

        // Check if the same callback and context combination is already registered
        const existingRegistration = this.#registry[eventName].find(entry => {
            return entry.originalCallback === callback && entry.context === context
        });

        if (!existingRegistration) {
            const wrappedCallback = function (...args) {
                callback.call(context, ...args);
            };

            this.#registry[eventName].push({
                originalCallback: callback,
                context,
                wrappedCallback,
            });

        } else {
            log(`Callback for event '${eventName}' is already registered with the same context.`);
        }
    }

    /**
     * Unregister a callback function for a specific event.
     * @param {string} eventName - The name of the event.
     * @param {function} callback - The original callback function to be removed.
     * @param {Object} context - The context associated with the callback (optional).
     */

    off(eventName, callback, context) {
        const callbackToRemove = this.#registry[eventName]?.find(entry => {
            return entry.originalCallback === callback && entry.context === context
        });
        
        if (callbackToRemove) {
            this.#registry[eventName] = this.#registry[eventName].filter(entry => entry !== callbackToRemove);
        } else {
            log(`Callback for event '${eventName}' with the specified context was not found.`);
        }
    }

    /**
     * Trigger an event, executing all registered callback functions.
     * @param {string} eventName - The name of the event to trigger.
     * @param {...any} args - Additional arguments to be passed to the callback functions.
     */

    trigger(eventName, ...args) {
        if (this.#registry[eventName]) {
            this.#registry[eventName].forEach(entry => entry.wrappedCallback(...args));
        }
    }
}

const eventManager = new EventManager();

class StorageManager {
    constructor(storageType = "localStorage") {
        this.storage = window[storageType];
        if (!this.storage) {
            throw new Error(`Storage type '${storageType}' is not supported in this browser.`)
        }
        this.storageKey = config.localStorageKey;
    }

    setItem(key, value) {
        this.storage.setItem(key, JSON.stringify(value));
    }

    getItem(key) {
        const storedValue = this.storage.getItem(key);
        return storedValue ? JSON.parse(storedValue) : null
    }

    removeItem(key) {
        if (key) {
            throw new Error("Let's not delete anything yet...")
        }
        this.storage.removeItem(key);
    }

    save(value) {
        if (!value) {
            throw new Error("Will not save empty values!")
        }
        this.setItem(this.storageKey, value);
    }

    load() {
        const ret =  this.getItem(this.storageKey);
        return ret
    }
}

const storageManager = new StorageManager();

class StateManager {
    #globalState = {
        version: config.version,
    }

    init() {
        this.load() || (this.migrate(), this.save());
    }
    
    // add path to this.globalState
    // .register("some.path.more")
    // 
    register(statePath) {
        const pathSegments = statePath.split(".");
        pathSegments.reduce((obj, segment) => obj[segment] = obj[segment] || {}, this.#globalState);
    }
    
    load() {
        const globalState = storageManager.load();

        if (globalState) {
            this.#globalState = globalState;
            eventManager.trigger("state.load", this.#globalState);
            return true
        }
    
        return false
    }

    save() {
        eventManager.trigger("state.save", this.#globalState);
        storageManager.save(this.#globalState);
    }

    // TODO: add migration method 
    migrate() {

    }

    getModState(modName) {
        return this.#globalState.modules[modName]
    }

    // getWindowSettings() {
    //     const windowString = localStorage.getItem("windowSettings")
    //     if (windowString) {
    //         return JSON.parse(windowString)
    //     }
    // }

    // setWindowSettings(windowSettings) {
    //     if (windowSettings) {
    //         localStorage.setItem("windowSettings", JSON.stringify(windowSettings))
    //     }
    // }
}

const stateManager = new StateManager();

const selectors = {
    "body": { selector: "body", bruteForce: true },
    "layout": {
        selector: ".layout", bruteForce: true,
    },
    "mainContainer": {
        selector: ".layout .container", bruteForce: true,
        observe:
            [
                "skillsMenuParent",
                "statsMenuParent",
                "settingsParent",
                "bagParent",
                "pvpParent",
                "interactParent",
                "requestParent",
                "itemParent"
            ]
    },
    "skillbar": { selector: "#skillbar", bruteForce: true },
    "expbar": { selector: "#expbar", bruteForce: true },
    "sysbtnbar": { selector: ".btnbar.svelte-133q4bd", bruteForce: true },
    "sysbag": { selector: "#sysbag", bruteforce: true },
    "syscog": { selector: "#syscog", bruteforce: true },
    "partyBtnbar": { selector: ".btnbar", bruteForce: true },
    "minimap": { selector: "#minimapcontainer", bruteForce: true },
    "chatPanel":
    {
        selector: "#chat", bruteForce: true,
        observe: [
            "chatArticle"
        ]
    },
    "chatArticle": { selector: "article", bruteForce: false, ignore: true },
    "chatInput": { selector: "#chatinput", bruteForce: true },
    "channelSelect": {selector: ".channelselect", bruteForce: true},
    "partyframes":
    {
        selector: ".partyframes", bruteForce: true,
        observe:
            [
                "partyGrid"
            ]
    },
    "targetframes":
    {
        selector: ".targetframes", bruteForce: true,
        observe:
            [
                "uftarget"
            ]
    },

    "requestParent": { selector: ".window-pos", bruteForce: false, wName: "request" },
    "interactParent": { selector: ".window-pos", bruteForce: false, wName: "interaction" },
    "itemParent": { selector: ".window-pos", bruteForce: false, wName: "item" },
    "bagParent": { selector: ".window-pos", bruteForce: false, wName: "inventory" },
    "skillsMenuParent": { selector: ".window-pos", bruteForce: false, wName: "skills" },
    "statsMenuParent": { selector: ".window-pos", bruteForce: false, wName: "character" },
    "settingsParent": { selector: ".window-pos", bruteForce: false, wName: "settings" },
    "pvpParent": { selector: ".window-pos", bruteForce: false, wName: "pvp" },
    "ufplayer": { selector: "#ufplayer", bruteForce: true },
    "uftarget": { selector: "#uftarget", bruteForce: false },
    "partyGrid": { selector: ".partyframes .grid", bruteForce: false, ignore: true }

};

const chatArticleParser = (node) => {
    
    // console.log(node)
    if(node.tagName.toLowerCase() !== "article") return
        
    const linewrap = node.firstElementChild;
    const [time, info, text] = linewrap.children;
    const channel = info.firstElementChild;

    const obj = {
        article: node,
        linewrap,
        time,
        info,
        text,
        channel
    };

    const senderContainer = info.children[1];
    if (senderContainer) {
        const [senderInfo, senderName] = senderContainer.children;

        obj.sender_container = senderContainer;
        obj.sender_info = senderInfo;
        obj.sender_name = senderName;

        const senderIcons = senderInfo.children;
        if (senderIcons.length === 2) {
            [obj.sender_supporter, obj.sender_icon] = senderIcons;
        } else if (senderIcons.length === 1) {
            obj.sender_icon = senderIcons[0];
        }
    }

    return obj
};

class Parser {
    constructor() {
        this.chatArticle = chatArticleParser;
    }
    get(name) {
        return this[name]
    }
}

const parser = new Parser();

class UI {

    getElement(name) {
        const {selector, bruteForce: shouldBruteForce, observe, wName, ignore} = selectors[name];
        this[name] = {selector, observe, wName};
        let element = null;
        if(ignore === true) return
        if(!wName) {
            element = document.querySelector(selector);
        } else {
            element = [...document.querySelectorAll(selector)]
                .find(el => el.querySelector(".title").textContent.toLowerCase().startsWith(wName));
        }
        if(element) {
            this[name].element = element;
            this[name].onScreen = true;
            this.handleObservers(name);
            
        } else if(shouldBruteForce) {
            setTimeout(() => {
                this.getElement(name);
            }, 1);
        }
    }

    init() {
        for(let name in selectors) {
            // console.log(name)
            this.getElement(name);
        }
    }

    triggerEvent(eventName, element, elementName) {
        let parsedElement = null;
        if(typeof parser[elementName] == "function") {
            parsedElement = parser[elementName](element);
        }
        eventManager.trigger(eventName, {
            element: element,
            obj: parsedElement,
        });
    }

    handleObservers(key) {
        if(typeof this[key] === "object") {
            const {element, observe: observeTargets} = this[key];
            // console.log("triggering event Manager", 'ui.'+ key)

            if(!element) return

            this.triggerEvent('ui.'+ key, element, key);

            if(observeTargets && !element.classList.contains("mutationObserving")) {
                const observer = new MutationObserver((mutationsList, observer) => {
                    for (const mutation of mutationsList) {
                        if (mutation.type === 'childList') {
                            // Handle added or removed child nodes here
                            for(let node of mutation.removedNodes) {
                                for(let target of observeTargets) {
                                    const targetSelector = this[target].selector;
                                    if(node instanceof HTMLElement && node.matches(targetSelector)) {
                                        if(!node.querySelector(".title")) {
                                            // console.log(node, "ui." + target)
                                            this[target].element = node;
                                            this[target].onScreen = false;
                                            break  
                                        } else {
                                            const wName = this[target].wName;
                                            const title = node.querySelector(".title");
                                            if(title && title.textContent.toLowerCase() === wName) {
                                                // console.log(node, "ui." + target)
                                                this[target].element = node;
                                                this[target].onScreen = false;
                                                break 
                                            }
                                        }
                                    }
                                }
                            }
                            for(let node of mutation.addedNodes) {
                                for(let target of observeTargets) {
                                    const targetSelector = this[target].selector;
                                    if(node instanceof HTMLElement && node.matches(targetSelector)) {
                                        if(!node.querySelector(".title")) {
                                            // console.log(node, "ui." + target)
                                            this[target].element = node;
                                            this[target].onScreen = true;
                                            this.triggerEvent('ui.'+ target, node, target);
                                            break  
                                        } else {
                                            const wName = this[target].wName;
                                            const title = node.querySelector(".title");
                                            if(title && title.textContent.toLowerCase() === wName) {
                                                // console.log(node, "ui." + target)
                                                this[target].element = node;
                                                this[target].onScreen = true;
                                                this.triggerEvent('ui.'+ target, node, target);
                                                break 
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                });
                observer.observe(element, {childList: true});
                element.classList.add("mutationObserving");
                this[key].observer = observer;
            }
        }
    }
}
const ui = new UI();

class HtmlElement {
    constructor(tagName, options, data) {
        this.element = document.createElement(tagName);
        Object.assign(this.element, options);
        Object.assign(this.element.dataset, data);
    }

    // Adds a child element to the specified position of the parent element
    add(child, last = true) {
        if (last) {
            this.element.appendChild(child.element);
        } else {
            this.element.insertBefore(child.element, this.element.firstChild);
        }
        return this;
    }

    remove() {
        return this.element.remove();
    }

    // Adds a child element to the beginning of the parent element
    prepend(childElement) {
        return this.add(childElement, false);
    }

    // Adds a child element to the end of the parent element
    append(childElement) {
        return this.add(childElement);
    }

    // Returns the first child element of the parent element
    first() {
        return this.element.firstElementChild;
    }

    // Returns the last child element of the parent element
    last() {
        return this.element.lastElementChild;
    }

    // Adds a child element to the beginning of the parent element (alias for prepend)
    addFirst(childElement) {
        return this.prepend(childElement);
    }

    // Adds a child element to the end of the parent element (alias for append)
    addLast(childElement) {
        return this.append(childElement);
    }
    // Sets a data attribute on the element
    data(key, value) {
        this.element.dataset[key] = value;
        return this;
    }

    // Adds an event listener to the element
    on(eventType, listener) {
        this.element.addEventListener(eventType, listener);
        return this;
    }

    // Sets an attribute of the element
    attr(attrName, attrValue) {
        this.element.setAttribute(attrName, attrValue);
        return this;
    }

    hidden() {
        this.element.hidden = true;
        return this;
    }

    selected(is = false) {
        this.element.selected = is;
        return this;
    }

    // Gets or sets the text content of the element
    text(textContent) {
        if (textContent === undefined) {
            return this.element.textContent;
        } else {
            this.element.textContent = textContent;
            return this;
        }
    }

    // Adds CSS styles to the element
    style(styles) {
        Object.assign(this.element.style, styles);
        return this;
    }

    // Sets the CSS class of the element
    css(className) {
        this.element.className = className;
        return this;
    }

    has(className) {
        return Array.from(this.element.classList ?? []).includes(className)
    }
    addClass(className) {
        this.element.classList.add(className);
        return this;
    }
    removeClass(className) {
        this.element.classList.remove(className);
        return this
    }

    toggle(className) {
        this.element.classList.toggle(className);
        return this
    }
    type(type) {
        this.element.type = type;
        return this
    }
    value(value) {
        this.element.value = value;
        return this
    }
    // Removes all child elements from the element
    clear() {
        while (this.element.firstChild) {
            this.element.removeChild(this.element.firstChild);
        }
        return this
    }
}

const element = (tagName, options = {}, dataset = {}) => new HtmlElement(tagName, options, dataset);

function addSysbtn(sysbtnbar, btn) {
    let customBtnbar = document.querySelector(".sysbtnbarKEK");
    if(!customBtnbar) {
        customBtnbar = element("div", {
            className: "sysbtnbarKEK",
            style: `display: flex; float: right; clear: right; margin: 5px`
        }).element;
        sysbtnbar.parentNode.appendChild(customBtnbar);
    }
    btn.addEventListener("mouseenter", () => {
        if (customBtnbar) {
            const displayBtn = element("div", {
                className: "btn black displayBtnKEK border textsecondary",
                textContent: btn.tooltip,
                style: "padding-left: 3px; padding-right: 3px; margin: 2px;"
            }).element;
            customBtnbar.insertBefore(displayBtn, customBtnbar.firstChild);
        }
    });

    btn.addEventListener("mouseleave", () => {
        if (customBtnbar) {
            const displayBtn = customBtnbar.querySelector(".displayBtnKEK");
            if (displayBtn) {
                displayBtn.remove();
            }
        }
    });
    customBtnbar.appendChild(btn);
}

function addPartybtn(partyBtnbar, btn) {
    // console.log(partyBtnbar, btn)
    partyBtnbar.appendChild(btn);
}

function getClass(url) {
    let _class = null;
    if(!url.includes("classes")) return 5
    _class = url.split("classes")[1][1];
    return _class
}

// Function to make an element scalable from a central point
function makeScaleable(element, scaleBtn, transform,
    excludeSelectors =
        [".ignoreScale"]
) {
    // console.log("making", element, "scaleable with ", transform, element.children)
    if(!transform._scale) return
    let originalWidth, originalHeight;
    element.style.width = transform.width + "px";
    element.style.height = transform.height + "px";
    for (const child of element.children) {
        const shouldExclude = excludeSelectors.some(selector => {
            if (selector.startsWith('.')) {
                // Check for class
                return child.classList.contains(selector.slice(1));
            } else {
                // Check for tag
                return child.tagName.toLowerCase() === selector.toLowerCase();
            }
        });
        if (!shouldExclude) {
            child.style.width = transform.width + 'px';
            child.style.height = transform.height + 'px';

            let bar = child.querySelector(".bar");
            if (bar) {
                bar.style.width = transform.width + 'px';
                bar.style.height = transform.height + 'px';
            }
        }
    }
    let initialX, initialY;
    // Function to handle mouse down event on the scale button
    function handleScaleBtnMouseDown(event) {
        element.classList.add("is-scaling");
        originalWidth = element.offsetWidth;
        originalHeight = element.offsetHeight;
        initialX = event.clientX;
        initialY = event.clientY;
        // Add event listeners for mouse move and mouse up events
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        // Prevent default to avoid text selection during dragging
        event.preventDefault();
    }

    // Function to handle mouse move event
    function handleMouseMove(event) {
        if (element.classList.contains("is-scaling")) {
            const deltaX = event.clientX - initialX;
            const deltaY = event.clientY - initialY;

            // Calculate the scaling factors for width and height
            const widthScaleFactor = (originalWidth + deltaX) / originalWidth;
            const heightScaleFactor = (originalHeight + deltaY) / originalHeight;

            // Apply the scaling factors to the element
            const newWidth = originalWidth * widthScaleFactor;
            const newHeight = originalHeight * heightScaleFactor;
            element.style.width = newWidth + 'px';
            element.style.height = newHeight + 'px';

            transform.width = newWidth;
            transform.height = newHeight;
            // Iterate over child elements and exclude those with specified selectors
            for (const child of element.children) {
                const shouldExclude = excludeSelectors.some(selector => {
                    if (selector.startsWith('.')) {
                        // Check for class
                        return child.classList.contains(selector.slice(1));
                    } else {
                        // Check for tag
                        return child.tagName.toLowerCase() === selector.toLowerCase();
                    }
                });
                if (!shouldExclude) {
                    child.style.width = newWidth + 'px';
                    child.style.height = newHeight + 'px';

                    let bar = child.querySelector(".bar");
                    if (bar) {
                        bar.style.width = newWidth + 'px';
                        bar.style.height = newHeight + 'px';
                    }
                }
            }
        }
    }

    // Function to handle mouse up event
    function handleMouseUp() {
        element.classList.remove("is-scaling");

        // Remove event listeners for mouse move and mouse up events
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
    }

    // Add event listener for mouse down event on the scale button
    if (scaleBtn) {
        scaleBtn.addEventListener('mousedown', handleScaleBtnMouseDown);
    }
}

const gui = {
    name: "GUI",
    description: "Partyframes/Targetframes/chat customizations",
    state: {
        "_transform": {
            "partyframes": {
                "height": 60,
                "width": 120,
                "_drag": true,
                "_scale": true,
                "left": 591,
                "top": 675
            },
            "ufplayer": {
                "_drag": true,
                "top": -476,
                "left": -339
            },
            "uftarget": {
                "top": -482,
                "left": 340,
                "_drag": true
            },
            "targetframes": {
                "height": 30,
                "width": 195,
                "_scale": true
            },
            "chatPanel": {
                "_drag": true,
                "left": 0,
                "top": 0
            },
            "skillbar": {
                "_drag": true,
                "left": -279,
                "top": -74
            }
        },
        "_configs": {
            "partyframes": {
                "colors": {
                    "kek-bgc0": {
                        "top": [
                            "#5a3816",
                            0
                        ],
                        "middle": [
                            "#70563c",
                            50
                        ],
                        "bottom": [
                            "#8B6D4D",
                            100
                        ]
                    },
                    "kek-bgc1": {
                        "top": [
                            "#11698d",
                            0
                        ],
                        "middle": [
                            "#0992cc",
                            49
                        ],
                        "bottom": [
                            "#159cd4",
                            100
                        ]
                    },
                    "kek-bgc2": {
                        "top": [
                            "#76b935",
                            0
                        ],
                        "middle": [
                            "#76c134",
                            50
                        ],
                        "bottom": [
                            "#79c232",
                            100
                        ]
                    },
                    "kek-bgc3": {
                        "top": [
                            "#20367f",
                            0
                        ],
                        "middle": [
                            "#2644a7",
                            50
                        ],
                        "bottom": [
                            "#3859c7",
                            100
                        ]
                    },
                    "kek-bgc4": {
                        "top": [
                            "#2ba71e",
                            0
                        ],
                        "middle": [
                            "#0fce00",
                            49
                        ],
                        "bottom": [
                            "#20b611",
                            100
                        ]
                    },
                    "kek-bgc5": {
                        "top": [
                            "#9f0707",
                            0
                        ],
                        "middle": [
                            "#c62527",
                            49
                        ],
                        "bottom": [
                            "#F42929",
                            100
                        ]
                    }
                },
                "playerPerRow": 5,
                "buffSize": 17,
                "buffTextSize": 10,
                "buffPosition": 0,
                "gridGap": 10
            },
            "targetframes": {
                "buffSize": 25,
                "buffTextSize": 15
            },
            "skillbar": {
                "skillsPerRow": 20,
                "slotSize": 35
            },
            "chatPanel": {
                "colors": {
                    "textglobal": "#ffcb9d",
                    "textnotice": "#9de74d",
                    "textparty": "#2ed3f6",
                    "textfaction": "#f68e7a",
                    "textclan": "#de8b09",
                    "textsystem": "#4de751",
                    "textto": "#ef3eff",
                    "textfrom": "#ef3eff"
                },
                "fontSize": 15,
                "blackChat": 1,
                "height": 250,
                "width": 470
            }
        },
        "_color": true,
        "_lock": false
    },
    defaultState: {
        "_transform": {
            "partyframes": {
                "height": 60,
                "width": 120,
                "_drag": true,
                "_scale": true,
                "left": 591,
                "top": 675
            },
            "ufplayer": {
                "_drag": true,
                "top": -476,
                "left": -339
            },
            "uftarget": {
                "top": -482,
                "left": 340,
                "_drag": true
            },
            "targetframes": {
                "height": 30,
                "width": 195,
                "_scale": true
            },
            "chatPanel": {
                "_drag": true,
                "left": 44,
                "top": 644
            },
            "skillbar": {
                "_drag": true,
                "left": -279,
                "top": -74
            }
        },
        "_configs": {
            "partyframes": {
                "colors": {
                    "kek-bgc0": {
                        "top": [
                            "#5a3816",
                            0
                        ],
                        "middle": [
                            "#70563c",
                            50
                        ],
                        "bottom": [
                            "#8B6D4D",
                            100
                        ]
                    },
                    "kek-bgc1": {
                        "top": [
                            "#11698d",
                            0
                        ],
                        "middle": [
                            "#0992cc",
                            49
                        ],
                        "bottom": [
                            "#159cd4",
                            100
                        ]
                    },
                    "kek-bgc2": {
                        "top": [
                            "#76b935",
                            0
                        ],
                        "middle": [
                            "#76c134",
                            50
                        ],
                        "bottom": [
                            "#79c232",
                            100
                        ]
                    },
                    "kek-bgc3": {
                        "top": [
                            "#20367f",
                            0
                        ],
                        "middle": [
                            "#2644a7",
                            50
                        ],
                        "bottom": [
                            "#3859c7",
                            100
                        ]
                    },
                    "kek-bgc4": {
                        "top": [
                            "#2ba71e",
                            0
                        ],
                        "middle": [
                            "#0fce00",
                            49
                        ],
                        "bottom": [
                            "#20b611",
                            100
                        ]
                    },
                    "kek-bgc5": {
                        "top": [
                            "#9f0707",
                            0
                        ],
                        "middle": [
                            "#c62527",
                            49
                        ],
                        "bottom": [
                            "#F42929",
                            100
                        ]
                    }
                },
                "playerPerRow": 5,
                "buffSize": 17,
                "buffTextSize": 10,
                "buffPosition": 0,
                "gridGap": 10
            },
            "targetframes": {
                "buffSize": 25,
                "buffTextSize": 15
            },
            "skillbar": {
                "skillsPerRow": 20,
                "slotSize": 35
            },
            "chatPanel": {
                "colors": {
                    "textglobal": "#ffcb9d",
                    "textnotice": "#9de74d",
                    "textparty": "#2ed3f6",
                    "textfaction": "#f68e7a",
                    "textclan": "#de8b09",
                    "textsystem": "#4de751",
                    "textto": "#ef3eff",
                    "textfrom": "#ef3eff"
                },
                "fontSize": 15,
                "blackChat": 1,
                "height": 250,
                "width": 470
            }
        },
        "_color": true,
        "_lock": false
    },
    _profiles: true,
    style: ".svelte-svpjti {display: none;}",
    gradientNames: [
        "kek-bgc0",
        "kek-bgc1",
        "kek-bgc2",
        "kek-bgc3",
        "kek-bgc5",
        "kek-bgc4",
    ],
    start() {
        this.makeElementsDraggable();
        eventManager.on("ui.partyframes", this.handlePartyframes, this);
        eventManager.on("ui.chatPanel", this.handleChatPanel, this);
        eventManager.on("ui.targetframes", this.handleTargetframes, this);
        eventManager.on("ui.partyGrid", this.handlePartyGrid, this);
        eventManager.on("ui.uftarget", this.handleTargetGrid, this);
        eventManager.on("ui.ufplayer", this.handleTargetGrid, this);
        eventManager.on("ui.skillbar", this.handleSkillbar, this);
        eventManager.on("ui.uftarget", this.handleUftargetMutations, this);
        eventManager.on("click.lockUI", this.toggleLockUI, this);
        eventManager.on("click.toggleColors", this.toggleColorize, this);
        eventManager.on("click.importGUI", this.handleImportUI, this);
        eventManager.on("click.exportGUI", this.handleExportUI, this);
        eventManager.on("click.resetGUI", this.handleResetUI, this);
        eventManager.on("ui.sysbtnbar", this.addBtn, this);
        if(ui.sysbtnbar) {
            if(!this.lockBtn) {
                console.log("adding button manually!");
                this.addBtn(ui.sysbtnbar);
            }
        } 
    },
    stop() {
        eventManager.off("ui.partyframes", this.handlePartyframes, this);
        eventManager.off("ui.chatPanel", this.handleChatPanel, this);
        eventManager.off("ui.targetframes", this.handleTargetframes, this);
        eventManager.off("ui.partyGrid", this.handlePartyGrid, this);
        eventManager.off("ui.uftarget", this.handleTargetGrid, this);
        eventManager.off("ui.ufplayer", this.handleTargetGrid, this);
        eventManager.off("ui.skillbar", this.handleSkillbar, this);
        eventManager.off("ui.uftarget", this.handleUftargetMutations, this);
        eventManager.off("click.lockUI", this.toggleLockUI, this);
        eventManager.off("click.toggleColors", this.toggleColorize, this);
        eventManager.off("click.importGUI", this.handleImportUI, this);
        eventManager.off("click.exportGUI", this.handleExportUI, this);
        eventManager.off("click.resetGUI", this.handleResetUI, this);
        eventManager.off("ui.sysbtnbar", this.addBtn, this);
        if(this.lockBtn) {
            this.lockBtn.remove();
            this.lockBtn = null;
        }
    },
    lockBtn: null,
    addBtn(sysbtnbar) {
        sysbtnbar = sysbtnbar.element;
        const lockBtn = this.createBtn("Lock🔒", "Lock UI", this.handleLockBtn.bind(this));

        this.lockBtn = lockBtn;

        addSysbtn(sysbtnbar, lockBtn);
    },
    handleLockBtn(button) {
        if(this.state._lock) {
            button.classList.add("textgreen");
            button.classList.remove("textsecondary");
        } else {
            button.classList.remove("textgreen");
            button.classList.add("textsecondary");
        }
        button.addEventListener("click", () => {
            this.toggleLockUI();
            if(this.state._lock) {
                button.classList.add("textgreen");
                button.classList.remove("textsecondary");
            } else {
                button.classList.remove("textgreen");
                button.classList.add("textsecondary");
            }
        });
    },
    createBtn(text, title, handleFunc) {
        const button = element("div", {
            className: "btn border black textsecondary",
            textContent: text,
            tooltip: title,
            style: "padding-left: 3px; padding-right: 3px; margin: 2px;"
        }).element;

        handleFunc(button);

        return button
    },
    toggleLockUI() {
        this.state._lock ^= 1;
        // const windowSettings = localState.getWindowSettings()
        // if(windowSettings) {
        //     console.log(windowSettings)
        //     for(let setting of windowSettings) {
        //         setting.locked = this.state._lock
        //     }
        //     localState.setWindowSettings(windowSettings)
        // }
        // location.reload()
    },
    toggleColorize() {
        this.state._color = !this.state._color;
    },
    partyColors: {
        "kek-bgc0": {
            top: ["#5a3816", 0],
            middle: ["#70563c", 50],
            bottom: ["#8B6D4D", 100],
        },
        "kek-bgc1": {
            top: ["#11698d", 0],
            middle: ["#0992cc", 49],
            bottom: ["#159cd4", 100],
        },
        "kek-bgc2": {
            top: ["#76b935", 0],
            middle: ["#76c134", 50],
            bottom: ["#79c232", 100],
        },
        "kek-bgc3": {
            top: ["#20367f", 0],
            middle: ["#2644a7", 50],
            bottom: ["#3859c7", 100],
        },
        "kek-bgc4": {
            top: ["#2ba71e", 0],
            middle: ["#0fce00", 49],
            bottom: ["#20b611", 100],
        },
        "kek-bgc5": {
            top: ["#9f0707", 0],
            middle: ["#c62527", 49],
            bottom: ["#F42929", 100],
        },
    },
    chatColors: {
        textglobal: "#ffcb9d",
        textnotice: "#9de74d",
        textparty: "#2ed3f6",
        textfaction: "#f68e7a",
        textclan: "#de8b09",
        textsystem: "#4de751",
        textto: "#ef3eff",
        textfrom: "#ef3eff",
    },
    makeElementsDraggable() {
        for (let name in this.state._transform) {
            const transform = this.state._transform[name];

            if (name == "chatPanel") {
                eventManager.on(`ui.${name}`, (element) => {
                    makeDraggable(element.element.parentNode, transform);
                });
            } else {
                eventManager.on(`ui.${name}`, (element) => {
                    makeDraggable(element.element, transform);
                });
            }
        }
    },

    // Add the party color button to your HTML
    // Adjust class names and styling according to your UI
    createInputParty(placeholder, prop) {
        const handleInputField = () => {
            let inputValue = parseInt(inputField.value);
            if (inputValue > 50) {
                inputField.value = 50;
            }

            if (inputValue < 1) {
                inputField.value = 1;
            }

            inputValue = parseInt(inputField.value);

            // Use prop as the key for the property in this.state._configs.partyframes
            this.state._configs.partyframes[prop] = inputValue;
            this.updatePartyStyle();
        };
        const inputField = document.createElement("input");
        inputField.placeholder = placeholder;
        inputField.title = `${placeholder}`;
        inputField.style.width = "70px";
        inputField.style.height = "40px";
        inputField.type = "number";
        inputField.value = this.state._configs.partyframes[prop];
        inputField.classList.add("kek-ui-input");

        inputField.style.display = "none";

        // Add an event listener for the input event
        inputField.addEventListener("input", handleInputField);
        return inputField;
    },

    handlePartyframes(partyframes) {
        partyframes = partyframes.element;
        this.updatePartyStyle();
        // Create Horizontal Stack Button
        const buffPositionBtn = document.createElement("div");
        buffPositionBtn.textContent = "Change Buff Position";
        buffPositionBtn.addEventListener("click", () => {
            this.toggleBuffPosition();
        });
        buffPositionBtn.title = "Click to change buff orientation";
        buffPositionBtn.style.zIndex = "1";
        buffPositionBtn.classList.add(
            "horizontal-btn",
            "kek-ui-btn",
            "btn",
            "black",
            "textsecondary"
        );
        buffPositionBtn.style.marginRight = "10px";

        // Function to check if the partyframes element is available

        const scaleBtn = document.createElement("div");
        scaleBtn.title = "Hold and Drag to change size";
        scaleBtn.textContent = "Change Size";
        scaleBtn.classList.add(
            "scale-btn-party",
            "btn",
            "black",
            "textsecondary",
            "kek-ui-btn"
        );
        scaleBtn.style.zIndex = "1";
        // scaleBtn.style.height = btnSize + "px"
        // scaleBtn.style.width = btnSize + "px"
        scaleBtn.style.marginRight = "10px";

        makeScaleable(partyframes, scaleBtn, this.state._transform.partyframes);

        // Create the party color button element
        const partyColorButton = document.createElement("div");
        partyColorButton.textContent = "Colors";
        partyColorButton.style.marginRight = "10px";
        partyColorButton.style.zIndex = "1";
        partyColorButton.title = "Click to change party colors";
        partyColorButton.addEventListener("click", (e) => {
            if (e.target === partyColorButton) {
                this.openPartyColorCustomization(e);
            }
        });
        partyColorButton.classList.add(
            "partyColorButton",
            "kek-ui-btn",
            "btn",
            "black",
            "textsecondary"
        );

        scaleBtn.style.display = "none";
        buffPositionBtn.style.display = "none";
        partyColorButton.style.display = "none";

        if (!partyframes.querySelector(".kek-ui-input")) {
            const playerPerRowInput = this.createInputParty(
                "Player Per Row",
                "playerPerRow"
            );
            const buffSizeInput = this.createInputParty("Party Buff Size", "buffSize");
            const buffTextSizeInput = this.createInputParty(
                "Party Buff Stack Text Size",
                "buffTextSize"
            );
            const gridGapInput = this.createInputParty("Grid Space", "gridGap");

            // Create a flex container for the inputs
            const inputContainer = document.createElement("div");
            inputContainer.style.display = "flex";
            inputContainer.style.left = "10px";
            inputContainer.style.top = "-50px";
            inputContainer.style.position = "absolute";
            inputContainer.classList.add("ignoreScale");
            inputContainer.classList.add("inputContainerKEK");
            inputContainer.appendChild(partyColorButton);
            inputContainer.appendChild(buffPositionBtn);
            inputContainer.appendChild(scaleBtn);
            inputContainer.appendChild(playerPerRowInput);
            inputContainer.appendChild(buffSizeInput);
            inputContainer.appendChild(buffTextSizeInput);
            inputContainer.appendChild(gridGapInput);

            partyframes.insertBefore(inputContainer, partyframes.firstChild);
        }

        const grids = partyframes.children;
        for (let grid of grids) {
            if(!grid.classList.contains("grid")) continue
            this.handlePartyGrid({element: grid});
        }
    },

    handleRightSpanMutations(node) {
        const rightSpan = node.querySelector("span.right");
        // Check if right span is found
        if (rightSpan && !rightSpan.classList.contains("mutationObserving")) {
            // console.log("Observing", rightSpan.closest(".left").textContent)
            // Create a MutationObserver to watch for changes in the right span's character data
            let prevText = rightSpan.textContent;
            const rightSpanObserver = new MutationObserver(() => {
                if (
                    prevText.trim().toLowerCase() == "offline" ||
                    prevText.trim().toLowerCase() == "dead"
                ) {
                    // console.log(
                    //     "Character data of right span changed:",
                    //     rightSpan.textContent
                    // );
                    const grid = rightSpan.closest(".grid");
                    this.colorizeGrid(grid);
                }
                prevText = rightSpan.textContent;
                // Perform your actions when character data changes
            });

            rightSpanObserver.observe(rightSpan, {
                characterData: true,
                attributes: false,
                childList: false,
                subtree: true,
            });
            rightSpan.classList.add("mutationObserving");
        }
    },

    handleUftargetMutations(uftarget) {
        uftarget = uftarget.element;
        if (uftarget && !uftarget.classList.contains("mutationObserving")) {
            const classIcon = uftarget.querySelector(".icon");
            const handleMutation = (mutationsList, observer) => {
                for (const mutation of mutationsList) {
                    if (mutation.type === "attributes") {
                        const target = mutation.target;
                        if (target.classList.contains("pclass")) {
                            this.colorizeGrid(uftarget);
                        }
                    }
                }
            };
            const uftargetObserver = new MutationObserver(handleMutation);

            uftargetObserver.observe(classIcon, { attributes: true });
            uftarget.classList.add("mutationObserving");
        }
    },

    copyArticleSender(article) {
        const senderElement = article.querySelector(".name");
        const copySender = senderElement.textContent;

        // Perform copy to clipboard logic (use a temporary textarea, document.execCommand, or Clipboard API)
        // Example using Clipboard API:
        if (copySender) {
            navigator.clipboard
                .writeText(copySender)
                .then(() =>
                    console.log("Article sender copied to clipboard:", copySender)
                )
                .catch((error) => console.error("Copy failed:", error));
        }
    },

    // Function to copy content of an article
    copyArticleContent(article) {
        const contentSpan = article.querySelector(".content");
        const copyContent = contentSpan.nextElementSibling.textContent;
        // Perform copy to clipboard logic (use a temporary textarea, document.execCommand, or Clipboard API)
        // Example using Clipboard API:
        if (copyContent) {
            navigator.clipboard
                .writeText(copyContent)
                // .then(() => console.log("Article content copied to clipboard"), copyContent)
                .catch((error) => console.error("Copy failed:", error));
        }
    },
    // Function to get party colors from localStorage
    getPartyColors() {
        return this.state._configs.partyframes.colors;
    },
    // Function to set party colors to localStorage
    setPartyColors(colors) {
        this.state._configs.partyframes.colors = colors;
    },

    updatePartyStyle() {
        const partyColors = this.getPartyColors();

        const partyframes = document.querySelector(".partyframes");

        partyframes.style.gridTemplateColumns = `repeat(${this.state._configs.partyframes.playerPerRow}, auto)`;
        partyframes.style.gap = `${this.state._configs.partyframes.gridGap}px`;

        const grids = partyframes.children;
        for (let grid of grids) {
            if(!grid.classList.contains("grid")) continue
            this.handleBuffarray(grid);
        }
        // Create a style string based on partyColors
        const styleString = Object.entries(partyColors)
            .map(([key, values]) => {
                const [topColor, topPercentage] = values.top;
                const [middleColor, middlePercentage] = values.middle;
                const [bottomColor, bottomPercentage] = values.bottom;

                return `
        .${key} {
        background: linear-gradient(0deg, ${topColor} ${topPercentage}%, ${middleColor} ${middlePercentage}%, ${bottomColor} ${bottomPercentage}%);
        }
        `;
            })
            .join("\n");

        // Remove existing style tag with ID 'partyStyleKEK'
        const existingStyleTag = document.getElementById("partyStyleKEK");
        if (existingStyleTag) {
            existingStyleTag.remove();
        }

        // Create a new style tag
        const styleTag = document.createElement("style");
        styleTag.id = "partyStyleKEK";
        styleTag.classList.add("ignoreScale");
        styleTag.textContent = styleString;
        // console.log(styleTag)
        // Append the style tag to the partyframes
        document.body.insertBefore(styleTag, document.body.firstChild);
    },

    updateTargetStyle() {
        const targetframes = document.querySelector(".targetframes");
        const grids = targetframes.children;
        for (let grid of grids) {
            if(!grid.classList.contains("grid")) continue
            this.handleBuffarray(grid);
        }
    },

    toggleBuffPosition() {
        this.state._configs.partyframes.buffPosition = this.state._configs.partyframes.buffPosition == 0 ? 1 : 0;
        const partyframes = document.querySelector(".partyframes");
        const grids = partyframes.children;
        for (let grid of grids) {
            if(!grid.classList.contains("grid")) continue
            this.handleBuffarray(grid);
        }
    },

    getClassName(idx) {
        return {
            0: "Warrior",
            1: "Mage",
            2: "Archer",
            3: "Shaman",
            4: "Wardens/Conjurer",
            5: "Enemy/Monster",
        }[idx];
    },
    // Function to open party color customization
    openPartyColorCustomization(e) {
        const existingUI = document.querySelector(".party-color-customizationKEK");
        if (existingUI) {
            existingUI.parentNode.remove();
            return;
        }

        const partyColors = this.getPartyColors(); // Fetch partyColors from localStorage

        // Create color customization UI
        const partyColorButton = document.querySelector(".partyColorButton");
        const mainContainer = document.createElement("div");
        mainContainer.className = "widow panel-black border black";
        const colorCustomizationUI = document.createElement("div");
        colorCustomizationUI.className =
            "party-color-customizationKEK panel-black bar";
        colorCustomizationUI.style.position = "absolute";
        colorCustomizationUI.style.display = "grid";
        colorCustomizationUI.style.gridTemplateColumns = "repeat(1, auto)";
        colorCustomizationUI.style.top = partyColorButton.offsetTop - 300 + "px";
        colorCustomizationUI.style.left =
            partyColorButton.offsetLeft + partyColorButton.offsetWidth + 10 + "px";

        for (const key in partyColors) {
            const flexContainer = document.createElement("div");
            flexContainer.style.display = "flex";
            flexContainer.style.alignItems = "center";
            const colorItem = document.createElement("div");
            colorItem.className = "color-item-party btn black textsecondary";
            const classIdx = key.split("bgc")[1];
            colorItem.textContent = this.getClassName(classIdx);

            // Create color picker for the top color
            const topColorPicker = this.createColorPicker(
                "Top Color",
                "top",
                partyColors[key].top[0],
                (value) => {
                    this.handlePartyColorChange(key, "top", value);
                }
            );

            // Create color picker for the middle color
            const middleColorPicker = this.createColorPicker(
                "Middle Color",
                "middle",
                partyColors[key].middle[0],
                (value) => {
                    this.handlePartyColorChange(key, "middle", value);
                }
            );

            // Create color picker for the bottom color
            const bottomColorPicker = this.createColorPicker(
                "Bottom Color",
                "bottom",
                partyColors[key].bottom[0],
                (value) => {
                    this.handlePartyColorChange(key, "bottom", value);
                }
            );

            // Create percentage inputs for the top, middle, and bottom colors
            const topPercentageInput = this.createPercentageInput(
                key,
                "top",
                partyColors[key].top[1]
            );
            const middlePercentageInput = this.createPercentageInput(
                key,
                "middle",
                partyColors[key].middle[1]
            );
            const bottomPercentageInput = this.createPercentageInput(
                key,
                "bottom",
                partyColors[key].bottom[1]
            );
            const dummyDiv = document.createElement("div");
            const dummyContainer = document.createElement("div");
            dummyContainer.className = "bar  svelte-i7i7g5";
            dummyDiv.classList.add("progressBar", `kek-bgc${classIdx}`);
            dummyDiv.style.height = "50px";
            dummyDiv.style.width = "120px";
            dummyContainer.style.marginLeft = "20px";
            const dummyLeft = document.createElement("span");
            dummyLeft.classList.add("left");
            dummyLeft.textContent = "Dummy";
            dummyLeft.style.marginLeft = "5px";
            const dummyRight = document.createElement("span");
            dummyRight.classList.add("right", "svelte-i7i7g5");
            dummyRight.textContent = "0/0";

            dummyDiv.appendChild(dummyLeft);
            dummyDiv.appendChild(dummyRight);

            colorItem.style.width = "150px";
            colorItem.style.padding = "10px";

            dummyContainer.appendChild(dummyDiv);

            flexContainer.appendChild(colorItem);
            flexContainer.appendChild(topColorPicker);
            topColorPicker.style.margingLeft = "5px";
            flexContainer.appendChild(topPercentageInput);
            flexContainer.appendChild(middleColorPicker);
            flexContainer.appendChild(middlePercentageInput);
            flexContainer.appendChild(bottomColorPicker);
            flexContainer.appendChild(bottomPercentageInput);
            flexContainer.appendChild(dummyContainer);
            flexContainer.style.padding = "5px";
            colorCustomizationUI.appendChild(flexContainer);
        }
        const resetBtn = document.createElement("button");
        resetBtn.classList.add("btn", "black", "textsecondary");
        resetBtn.textContent = "Reset";
        resetBtn.addEventListener("click", () => {
            this.setPartyColors(this.partyColors);
            this.openPartyColorCustomization();
            this.updatePartyStyle();
        });
        colorCustomizationUI.appendChild(resetBtn);
        mainContainer.appendChild(colorCustomizationUI);
        colorCustomizationUI.style.zIndex = 20;
        // console.log(e.target)
        e.target.parentNode.appendChild(mainContainer);
    },

    // Function to handle party color change
    handlePartyColorChange(key, section, value) {
        const partyColors = this.getPartyColors();
        partyColors[key][section][0] = value;
        this.setPartyColors(partyColors);
    },

    createColorPicker(title, type, initialValue, eventHandler) {
        const colorPicker = document.createElement("input");
        colorPicker.type = "color";
        colorPicker.title = title;
        colorPicker.style.height = "35px";
        colorPicker.style.width = "35px";
        colorPicker.value = initialValue;
        colorPicker.style.flex = 1;
        colorPicker.addEventListener("input", (event) => {
            event.stopPropagation();
            eventHandler(event.target.value);
            this.updatePartyStyle();
        });

        return colorPicker;
    },
    // Helper function to create a percentage input
    createPercentageInput(key, section, value) {
        const percentageInput = document.createElement("input");
        percentageInput.type = "number";
        percentageInput.placeholder = "Percentage";
        percentageInput.value = value;
        percentageInput.title = "Percentage value";
        percentageInput.style.width = "45px";
        percentageInput.style.flex = 1;
        percentageInput.style.height = "35px";
        percentageInput.addEventListener("input", (event) => {
            event.stopPropagation();
            let inputValue = parseInt(event.target.value);

            // Ensure the input value is within the range of 0 to 100
            if (inputValue < 0) {
                inputValue = 0;
            } else if (inputValue > 100) {
                inputValue = 100;
            }

            // Update the input value
            percentageInput.value = inputValue;

            // Call the handler function
            this.handlePartyPercentageChange(key, section, inputValue);
        });
        return percentageInput;
    },

    // Function to handle party percentage change
    handlePartyPercentageChange(key, section, value) {
        const partyColors = this.getPartyColors();
        partyColors[key][section][1] = parseInt(value);
        this.setPartyColors(partyColors);
    },
    // Function to open chat color customization
    openChatColorCustomization(e) {
        const existingCustomizationPanel = document.querySelector(
            ".chat-color-customizationKEK"
        );

        if (existingCustomizationPanel) {
            existingCustomizationPanel.remove();
            return;
        }
        const chatColors = this.getChatColors(); // Fetch chatColors from localStorage

        // Create color customization UI
        const colorCustomizationUI = document.createElement("div");
        colorCustomizationUI.className = "chat-color-customizationKEK panel-black";
        colorCustomizationUI.style.position = "absolute";
        colorCustomizationUI.style.display = "grid";
        colorCustomizationUI.style.gridTemplateColumns = "repeat(2, auto)";
        colorCustomizationUI.style.top = chat.offsetTop - 400 + "px";
        colorCustomizationUI.style.left = chat.offsetLeft + "px";

        const resetBtn = document.createElement("button");
        const resetDiv = document.createElement("div");
        resetBtn.className = "btn black textsecondary";
        resetBtn.textContent = "Reset";
        resetBtn.addEventListener("click", () => {
            this.setChatColors(this.chatColors);
            this.openChatColorCustomization();
            this.updateChatStyle();
        });
        colorCustomizationUI.appendChild(resetBtn);
        colorCustomizationUI.appendChild(resetDiv);
        for (const key in chatColors) {
            const colorItem = document.createElement("div");
            colorItem.className = "color-item";
            colorItem.textContent = key.split("text")[1].toUpperCase();

            const colorPicker = document.createElement("input");
            colorPicker.type = "color";
            colorPicker.value = chatColors[key];
            colorPicker.addEventListener("input", (event) => {
                event.stopPropagation();
                this.handleChatColorChange(key, event.target.value);
            });

            colorItem.style.width = "100px";
            colorItem.style.padding = "10px";
            colorPicker.style.width = "30px";
            colorPicker.style.height = "30px";
            colorCustomizationUI.appendChild(colorItem);
            colorCustomizationUI.appendChild(colorPicker);
        }
        colorCustomizationUI.style.zIndex = 2;
        e.target.appendChild(colorCustomizationUI);
    },

    // Function to handle color changes and update localStorage
    handleChatColorChange(key, color) {
        const chatColors = this.getChatColors();
        chatColors[key] = color;
        this.setChatColors(chatColors); // Store updated chatColors in localStorage
        this.updateChatStyle(); // Update chat style with new colors
    },

    // Function to fetch chatColors from localStorage
    getChatColors() {
        return this.state._configs.chatPanel.colors;
    },

    // Function to store chatColors in localStorage
    setChatColors(chatColors) {
        this.state._configs.chatPanel.colors = chatColors;
    },

    // Function to create input elements
    createInputChat(placeholder, value, type = "number") {
        const input = document.createElement("input");
        input.type = type;
        input.className = "kek-ui-input";
        input.placeholder = placeholder;
        input.title = `${placeholder}`;
        input.value = value || "";
        return input;
    },

    // Function to handle input changes
    handleInputChangeChat(prop) {
        return (event) => {
            // Initialize this.state._configs.chatPanel if it doesn't exist
            this.state._configs.chatPanel = this.state._configs.chatPanel || {};

            const inputValue = event.target.value;
            this.state._configs.chatPanel[prop] = inputValue;
            // console.log(inputValue)
            this.updateChatStyle(); // Update chat style after props change
        };
    },

    // Function to update chat style based on props
    updateChatStyle() {
        // const chat = document.querySelector("#chat");
        // if (!chat) return;
        // const existingChatStyles = chat.querySelector(".chat-styles-kek");
        // if (existingChatStyles) {
        //     existingChatStyles.remove();
        // }

        // const chatStyles = document.createElement("style");
        // chatStyles.className = "chat-styles-kek";

        // const chatColors = this.getChatColors();

        // for (const className in chatColors) {
        //     const color = chatColors[className];
        //     // Append CSS rule for each class
        //     chatStyles.appendChild(
        //         document.createTextNode(`.${className} { color: ${color}; }`)
        //     );
        // }

        // chat.appendChild(chatStyles);

        // chat.style.fontSize = this.state._configs.chatPanel.fontSize + "px";
        // if (this.state._configs.chatPanel.blackChat == 0) {
        //     chat.classList.remove("panel-black");
        // } else {
        //     chat.classList.add("panel-black");
        // }
        // chat.style.height = this.state._configs.chatPanel.height + "px";
        // chat.style.width = this.state._configs.chatPanel.width + "px";
    },
    // Function to position input over chat
    positionOverChat(input) {
        const chatParentRect = chat.parentNode.getBoundingClientRect();
        const chatRect = chat.getBoundingClientRect();
        const offsetTop = 40;
        input.style.position = "absolute";
        input.style.left = chatRect.left - chatParentRect.left + "px";
        input.style.top = chatRect.top - chatParentRect.top - offsetTop + "px";
    },

    handleChatPanel(chatPanel) {
        chatPanel = chatPanel.element;
        chatPanel.scrollTop = chatPanel.scrollHeight + 10;

        chatPanel.addEventListener("contextmenu", (event) => {
            const targetArticle = event.target.closest("article");
            if (targetArticle) {
                // Right-clicked on an article, handle copy logic here
                event.preventDefault();
                const menu = document.querySelector(".context");
                // console.log(menu)
                const copyChoice = document.createElement("div");
                copyChoice.classList.add("choice");
                copyChoice.textContent = "Copy";
                copyChoice.addEventListener("click", () => {
                    this.copyArticleContent(targetArticle);
                    menu.remove();
                });
                menu.appendChild(copyChoice);

                // console.log(menu)
                const copyName = document.createElement("div");
                copyName.classList.add("choice");
                copyName.textContent = "Copy Name";
                copyName.addEventListener("click", () => {
                    this.copyArticleSender(targetArticle);
                    menu.remove();
                });
                menu.appendChild(copyName);
            }
        });


        this.updateChatStyle();
        // Create input elements for font-size, height, and width
        // const fontSizeInput = this.createInputChat(
        //     "Font Size",
        //     this.state._configs.chatPanel.fontSize
        // );
        // const heightInput = this.createInputChat(
        //     "Chat Height",
        //     this.state._configs.chatPanel.height
        // );
        // const widthInput = this.createInputChat(
        //     "Chat Width",
        //     this.state._configs.chatPanel.width
        // );
        // const blackChatCheckInput = this.createInputChat(
        //     "Black Chat?",
        //     this.state._configs.chatPanel.blackChat
        // );
        // Add a button for chat color customization
        // const chatColorButton = document.createElement("div");
        // chatColorButton.className = "kek-ui-btn btn black textsecondary";
        // chatColorButton.textContent = "Colors";
        // chatColorButton.title = "Click to change chat colors";
        // chatColorButton.style.width = "300px";
        // chatColorButton.addEventListener("click", (e) => {
        //     if (e.target === chatColorButton) {
        //         this.openChatColorCustomization(e);
        //     }
        // });

        // Create a flex container for input elements
        // const inputContainer = document.createElement("div");
        // inputContainer.style.display = "flex";
        // inputContainer.style.position = "absolute";
        // inputContainer.style.top = chat.offsetTop + "px";
        // inputContainer.style.left = chat.offsetLeft + chat.offsetWidth + 10 + "px"; // Adjust the offset as needed

        // Append input elements to the flex container
        // inputContainer.appendChild(chatColorButton);
        // inputContainer.appendChild(fontSizeInput);
        // inputContainer.appendChild(heightInput);
        // inputContainer.appendChild(widthInput);
        // inputContainer.appendChild(blackChatCheckInput);

        // chat.parentNode.insertBefore(inputContainer, chat.parentNode.firstChild);
        // chat.parentNode.appendChild(blackChatCheckbox)
        // this.positionOverChat(inputContainer);
        // Event listeners for input elements
        // fontSizeInput.addEventListener(
        //     "input",
        //     this.handleInputChangeChat("fontSize")
        // );
        // heightInput.addEventListener("input", this.handleInputChangeChat("height"));
        // widthInput.addEventListener("input", this.handleInputChangeChat("width"));
        // blackChatCheckInput.addEventListener(
        //     "input",
        //     this.handleInputChangeChat("blackChat")
        // );

        // fontSizeInput.style.display = "none";
        // heightInput.style.display = "none";
        // widthInput.style.display = "none";
        // blackChatCheckInput.style.display = "none";
        // chatColorButton.style.display = "none";
    },

    handleTargetframes(targetframes) {
        targetframes = targetframes.element;
        const scaleBtnPlayer = document.createElement("div");
        scaleBtnPlayer.textContent = "Change Size";
        scaleBtnPlayer.title = "Hold and Drag to change Size";
        scaleBtnPlayer.classList.add("scale-btn-player");
        scaleBtnPlayer.classList.add("kek-ui-btn", "btn", "black", "textsecondary");
        scaleBtnPlayer.style.display = "none";

        makeScaleable(
            targetframes,
            scaleBtnPlayer,
            this.state._transform.targetframes
        );

        // buffArrayResizing(ufplayer.querySelector(".buffarray"), targetBuffSize)
        // colorizeGrid(ufplayer)

        const buffSizeInput = this.createInputTarget("Buff Size", "buffSize");
        const buffTextSizeInput = this.createInputTarget(
            "Buff Text Size",
            "buffTextSize"
        );

        // Create a flex container for the inputs
        const inputContainer = document.createElement("div");
        inputContainer.style.display = "flex";
        inputContainer.style.left = "10px";
        inputContainer.style.top = "-50px";
        inputContainer.style.position = "absolute";
        inputContainer.style.zIndex = 1;
        inputContainer.classList.add("ignoreScale");
        inputContainer.classList.add("inputContainerKEK");
        scaleBtnPlayer.style.flex = 1;
        buffSizeInput.style.flex = 1;
        buffTextSizeInput.style.flex = 1;
        inputContainer.appendChild(scaleBtnPlayer);
        inputContainer.appendChild(buffSizeInput);
        inputContainer.appendChild(buffTextSizeInput);

        setTimeout(() => {
            const ufplayer = document.querySelector("#ufplayer");
            ufplayer.insertBefore(inputContainer, ufplayer.firstChild);
        }, 300);
    },

    createInputTarget(placeholder, prop) {
        const inputField = document.createElement("input");
        inputField.placeholder = placeholder;
        inputField.style.width = "120px";
        inputField.style.height = "40px";
        inputField.title = `${placeholder}`;
        inputField.type = "number";
        inputField.value = this.state._configs.targetframes[prop];
        inputField.classList.add("kek-ui-input");

        inputField.style.display = "none";

        const handleInputField = () => {
            let inputValue = parseInt(inputField.value);

            if (inputValue > 50) {
                inputField.value = 50;
            }

            if (inputValue < 1) {
                inputField.value = 1;
            }

            inputValue = parseInt(inputField.value);
            this.state._configs.targetframes[prop] = inputValue;
            this.updateTargetStyle();
        };

        // Add an event listener for the input event
        inputField.addEventListener("input", handleInputField);
        return inputField;
    },

    updateSkillbarStyle(skillbar) {
        const slots = skillbar.querySelectorAll(".slot");

        for (let slot of slots) {
            slot.style.height = this.state._configs.skillbar.slotSize + "px";
            slot.style.width = this.state._configs.skillbar.slotSize + "px";
        }

        skillbar.style.gridAutoRows = "initial";
        skillbar.style.gridAutoColumns = "unset";
        skillbar.style.gridAutoFlow = "dense";
        skillbar.style.gridTemplateColumns = `repeat(${this.state._configs.skillbar.skillsPerRow}, auto)`;

        const existingStyle = document.querySelector("#skillbarStyle");
        if(existingStyle) {
            existingStyle.remove();
        }
        const skillbarStyle = element("style", {
            textContent: `#skillbar img {
                height: ${this.state._configs.skillbar.slotSize}px;
                width: ${this.state._configs.skillbar.slotSize}px; 
            }`,
            id: "skillbarStyle"
        }).element;

        skillbar.insertBefore(skillbarStyle, skillbar.firstChild);
    },

    createInputSkillbar(placeholder, prop, skillbar) {
        const inputField = document.createElement("input");
        inputField.placeholder = placeholder;
        inputField.style.width = "120px";
        inputField.style.height = "40px";
        inputField.title = `${placeholder}`;
        inputField.type = "number";
        inputField.value = this.state._configs.skillbar[prop];
        inputField.classList.add("kek-ui-input");

        inputField.style.display = "none";

        const handleInputField = () => {
            let inputValue = parseInt(inputField.value);

            if (inputValue > 50) {
                inputField.value = 50;
            }

            if (inputValue < 1) {
                inputField.value = 1;
            }

            inputValue = parseInt(inputField.value);
            this.state._configs.skillbar[prop] = inputValue;
            this.updateSkillbarStyle(skillbar);
        };

        // Add an event listener for the input event
        inputField.addEventListener("input", handleInputField);
        return inputField;
    },

    handleTargetGrid(grid) {
        grid = grid.element;
        let bar = grid.querySelector(".bar");
        if (bar) {
            bar.style.width = this.state._transform.targetframes.width + "px";
            bar.style.height = this.state._transform.targetframes.height + "px";
        }
        this.colorizeGrid(grid);
        this.handleBuffarray(grid);
    },

    handlePartyGrid(grid) {
        console.log(grid);
        grid = grid.element;
        grid.style.width = this.state._transform.partyframes.width + "px";
        grid.style.height = this.state._transform.partyframes.height + "px";
        if(this.state._color) grid.style.gridTemplate = 'none';
        let bar = grid.querySelector(".bar");
        if (bar) {
            bar.style.width = this.state._transform.partyframes.width + "px";
            bar.style.height = this.state._transform.partyframes.height + "px";
        }

        this.colorizeGrid(grid);
        this.handleRightSpanMutations(grid);
        this.handleBuffarray(grid);
        // Remove specific styles
    },

    colorizeGrid(grid) {
        if (this.state._color == false) {
            return
        }        const iconContainer = grid.querySelector(".iconcontainer");
        if (iconContainer) {
            const img = iconContainer.querySelector("img");
            if (img) {
                let classIdx = getClass(img.src);
                if(!classIdx) classIdx = 5;
                // console.log(classIdx, grid.querySelector(".left").textContent, img.src)
                const hpBar = grid.querySelector(".progressBar");
                if (hpBar) {
                    this.gradientNames.forEach((className) => {
                        hpBar.classList.remove(className);
                    });
                    hpBar.classList.add(`kek-bgc${classIdx}`);
                    iconContainer.style.display = "none";
                }
            }
        }
    },

    handleSkillbar(skillbar) {
        skillbar = skillbar.element;
        this.updateSkillbarStyle(skillbar);
        const container = document.createElement("div");
        container.style.display = "flex";
        container.style.position = "absolute";
        container.style.left = "10px";
        container.style.top = "-50px";
        // console.log("creating new slider for skill bar")
        const perRowInput = this.createInputSkillbar(
            "Skills Per Row",
            "skillsPerRow",
            skillbar
        );
        const sizeInput = this.createInputSkillbar("Skill Icon Size", "slotSize", skillbar);

        container.appendChild(sizeInput);
        container.appendChild(perRowInput);

        skillbar.appendChild(container);
    },

    handleBuffarray(grid) {
        if (grid.id == "ufplayer" || grid.id == "uftarget") {
            this.buffArrayResizing(grid);
        } else {
            this.buffArrayResizing(grid);
            this.repositionBuffarray(grid);
        }
    },

    repositionBuffarray(grid) {
        let offset;
        let state = this.state._configs.partyframes.buffPosition;
        const buffarray = grid.querySelector('.buffarray');
        if (buffarray) {
            let buffSize;
            // Reposition buffarray on top of grid element
            if (buffarray && state == 0) {
                // console.log("buff array with state 0 so row")
                buffarray.style.position = 'absolute';
                buffSize = this.state._configs.partyframes.buffSize;
                const parent = grid.parentNode;
                if (parent.style.height) {
                    offset = 1 * parseInt(parent.style.height.split("px")[0]) - buffSize;
                } else {
                    offset = -1 * buffSize;
                }

                buffarray.style.top = offset + "px";
                buffarray.style.left = '0';
            } else if (buffarray && state == 1) {
                // console.log("buff array with state 1 so column")
                buffarray.style.position = '';
                buffarray.style.top = '';
                buffarray.style.left = '';
            }
        }
    },

    buffArrayResizing(grid) {
        const buffarray = grid.querySelector('.buffarray');

        if (buffarray && buffarray instanceof HTMLElement) {
            let iconSize;
            let isUfplayer = false;
            iconSize = this.state._configs.partyframes.buffSize;

            if (buffarray.parentNode.parentNode.id == "ufplayer" || buffarray.parentNode.parentNode.id == "uftarget") {
                iconSize = this.state._configs.targetframes.buffSize || iconSize;
                isUfplayer = true;
            } else {
                buffarray.style.pointerEvents = "none";
            }
            buffarray.style.margin = "0px";

            const icons = buffarray.querySelectorAll(".icon");
            if (icons) {
                for (let icon of icons) {
                    icon.style.maxWidth = iconSize + "px";
                }
            }
            let style = buffarray.querySelector('style.buffTextSize');
            // If the style tag doesn't exist, create and append it
            if (!style) {
                style = document.createElement('style');
                style.classList.add('buffTextSize');
                buffarray.insertBefore(style, buffarray.firstChild);
            }

            // Change the contents of the style tag
            let fontSize = 15;
            if (!isUfplayer) {
                fontSize = this.state._configs.partyframes.buffTextSize;
                style.textContent = `.partyframes .stacks.svelte-1nn7wcb {
                    font-size: ${fontSize}px;
                    }
                    .partyframes .buffarray .overlay img {
                        height: ${iconSize}px;
                        width: ${iconSize}px;
                    }
                    `;
            } else {
                fontSize = this.state._configs.targetframes.buffTextSize;
                style.textContent = `.stacks.svelte-1nn7wcb {
                    font-size: ${fontSize}px;
                    }
                    .buffarray .overlay img {
                        height: ${iconSize}px;
                        width: ${iconSize}px;
                    }
                    `;
            }

            // Function to handle mutations in the .buffarray.default element
            if (!buffarray.classList.contains("mutationObserving")) {
                function handleBuffArrayChanges(mutationsList, observer) {
                    for (const mutation of mutationsList) {
                        if (mutation.type === 'childList') {
                            const addedNodes = mutation.addedNodes;
                            addedNodes.forEach(node => {
                                if (node instanceof HTMLElement) {
                                    const icon = node.querySelector(".icon");
                                    if (icon) {
                                        icon.style.maxWidth = iconSize + "px";
                                    }
                                }
                            });

                        }
                    }
                }

                // Create a MutationObserver to watch for changes in the .buffarray.default element
                const buffArrayObserver = new MutationObserver(handleBuffArrayChanges);
                buffArrayObserver.observe(buffarray, { childList: true, subtree: false });
                buffarray.classList.add("mutationObserving");
            }
        }

    },

    handleExportUI(event) {
        console.log("Exporting GUI...");
        try {
            const target = event.target;
            if (target.classList.contains("choice-item") && !target.classList.contains("exportActive")) {
                target.classList.add("exportActive");
                // Retrieve saved props for all players from the new structure
                const guiState = stateManager.getModState(this.name);

                // Create buttons for each player
                const playerButtons = Object.keys(guiState).map(player => {
                    if (player.startsWith("_")) return
                    const button = document.createElement('button');
                    button.className = 'btn black textsecondary';
                    button.style.padding = "1px";
                    button.style.marginLeft = "2px";
                    button.style.fontSize = "15px";
                    button.textContent = player;
                    button.addEventListener('click', function () {
                        // Copy the corresponding player's props to the clipboard using Clipboard API
                        const propsString = JSON.stringify(guiState[player]);
                        // console.log(propsString)
                        navigator.clipboard.writeText(propsString).then(() => {
                            // Change the button text to "Copied!" for a brief moment
                            const oldText = button.textContent;
                            button.textContent = "Copied!";
                            setTimeout(() => {
                                button.textContent = oldText;
                            }, 1000);
                        }).catch((error) => {
                            console.error('Error copying to clipboard:', error);
                        });
                    });
                    return button;
                });

                // Append the buttons to the document body
                playerButtons.forEach(button => {
                    if (button instanceof HTMLElement) event.target.appendChild(button);
                });
            }
        } catch (error) {
            console.error('Error exporting props:', error);
        }
    },

    handleImportUI(event) {
        const target = event.target;
        if (target.classList.contains("choice-item") && !target.classList.contains("inputActiveKEK")) {
            target.classList.add("inputActiveKEK");
            // console.log(event.target)
            // Create a container for the textarea and the "Import" button
            document.createElement('div');

            // Create a text area for user input
            const textarea = document.createElement('textarea');
            textarea.placeholder = 'Paste your configuration here...';
            textarea.style.width = '300px';
            textarea.style.height = '150px';

            // Create an "Import" button
            const importButton = document.createElement('button');
            importButton.className = "btn black";
            const importSpan = document.createElement("span");
            importSpan.classList.add("textsecondary");
            importSpan.textContent = "Import";

            const importFailSpan = document.createElement("span");
            importFailSpan.classList.add("textsecondary");
            importFailSpan.textContent = "Import Failed!";

            const importSuccessSpan = document.createElement("span");
            importSuccessSpan.classList.add("textsecondary");
            importSuccessSpan.textContent = "Import Success!";

            importButton.appendChild(importSpan);
            importButton.style.padding = "10px";
            importButton.style.height = "";

            event.target.appendChild(textarea);
            event.target.appendChild(importButton);

            const removeDelay = 1000;
            // Add event listener to handle the "Import" button
            importButton.addEventListener('click', () => {
                const importData = textarea.value.trim();
                if (!importData) {
                    textarea.remove();
                    importButton.innerHTML = importFailSpan.outerHTML;

                    setTimeout(() => {
                        importButton.remove();
                        target.classList.remove("inputActiveKEK");
                    }, removeDelay);
                    return; // Exit if no data is provided
                }

                try {
                    // Parse the import data into an object
                    const importedState = JSON.parse(importData);
                    console.log(importedState);
                    if (importedState && typeof importedState === 'object') {
                        // Update the props variable
                        this.state = importedState;

                        // Log or notify about the successful import
                        console.log('Configuration imported successfully.');

                        // Change the button text to "Imported!" for a brief moment
                        importButton.innerHTML = importSuccessSpan.outerHTML;
                        textarea.remove();
                        setTimeout(() => {
                            importButton.remove();
                            target.classList.remove("inputActiveKEK");
                        }, removeDelay);

                    } else {
                        textarea.remove();
                        importButton.innerHTML = importFailSpan.outerHTML;


                        setTimeout(() => {
                            importButton.remove();
                            target.classList.remove("inputActiveKEK");
                        }, removeDelay);

                        console.log("NOT AN OBJECT");
                    }
                } catch (error) {
                    textarea.remove();
                    importButton.innerHTML = importFailSpan.outerHTML;


                    setTimeout(() => {
                        importButton.remove();
                        target.classList.remove("inputActiveKEK");
                    }, removeDelay);

                    console.error('Error parsing or importing configuration:', error);
                    // Handle error, e.g., notify the user about the incorrect format
                }
            });
        }
    },

    handleResetUI(event) {
        this.state = this.defaultState;
        event.target.textContent = "Success!";
        setTimeout(() => {
            if (event.target) {
                event.target.textContent = "ResetUI";
            }
        }, 500);
    }
};

// Function to make an element draggable
function hasChildWithClass(parentElement, className) {
    // Use querySelector to check if any child has the specified class
    return parentElement.querySelector('.' + className) !== null;
}

function makeDraggable(element, transform) {
    // console.log("making ", element, "draggable with", transform)
    if (!transform._drag) return

    const isChat = element.classList.contains("l-corner-ll");
    element.style.position = 'absolute';
    if(!isChat) element.style.top = transform.top + "px";
    else element.style.bottom = transform.top + "px";

    element.style.left = transform.left + "px";
    // Set initial position
    let startX, startY;
    let initialLeft = parseInt(element.style.left.split("px")[0]);
    let initialTop;
    if(!isChat) initialTop = parseInt(element.style.top.split("px")[0]);
    else initialTop = parseInt(element.style.bottom.split("px")[0]);

    // Function to handle mouse down event
    function handleMouseDown(event) {
        element.classList.add("is-dragging");
        // Set the initial position to the cursor's position
        startX = event.clientX;
        startY = event.clientY;

        // Add event listeners for mouse move and mouse up events
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    }

    // Function to handle mouse move event
    function handleMouseMove(event) {
        if (!gui.state._lock 
            && element.classList.contains("is-dragging") 
            && !element.parentNode.classList.contains("is-scaling")
            && !element.classList.contains("is-scaling")
            && !hasChildWithClass(element, "is-scaling")) {
            const deltaX = event.clientX - startX;
            const deltaY = event.clientY - startY;

            // Set the new position of the element
            // console.log(initialLeft, deltaX, initialTop, deltaY, (initialLeft + deltaX) + 'px', (initialTop + deltaY) + 'px')
            const newLeft = (initialLeft + deltaX);
            let newTop = (initialTop + deltaY);
            if(isChat) newTop = initialTop - deltaY;
            element.style.left = newLeft + 'px';
            if(!isChat) element.style.top = newTop + 'px';
            else element.style.bottom = newTop + "px";


            transform.left = newLeft;
            transform.top = newTop;
        }
    }

    // Function to handle mouse up event
    function handleMouseUp() {
        element.classList.remove("is-dragging");
        // Update initial position for the next drag
        initialLeft = element.offsetLeft;
        if(!isChat) initialTop = element.offsetTop;
        else initialTop = element.style.bottom.split("px")[0];

        // console.log(element.style.bottom.split("px")[0])
        // Remove event listeners for mouse move and mouse up events
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
    }

    // Add event listener for mouse down event
    element.addEventListener('mousedown', handleMouseDown);
}

function createWindow(titleName, left = '200px', top = '50px', transform, onClose) {
    // Create the main container using the element function
    const windowClassName = titleName.split(" ").join("").toLowerCase() + "KEK";
    const mainContainer = element('div', {
        className: `window panel-black ${windowClassName}`,
        style: `position: absolute; left: ${left}; top: ${top}; z-index: 10`
    });

    // Create the title frame using the element function
    const titleFrame = element('div', {
        className: 'titleframe',
        style: 'display: flex; justify-content: space-between;'
    });

    // Create the title using the element function
    const title = element('div', {
        className: 'textprimary title',
        style: 'width: 200px; padding: 10px;',
        textContent: titleName
    });

    // Create the close button using the element function
    const closeBtn = element('img', {
        className: 'btn black svgicon',
        src: '/data/ui/icons/cross.svg?v=8498194',
        style: "margin-top: 6px;"
    });

    // Append elements to the title frame
    titleFrame.append(title);
    titleFrame.append(closeBtn);

    // Append the title frame to the main container
    mainContainer.append(titleFrame);

    // Add event handler to the close button
    closeBtn.on('click', function () {
        // Remove the main container when the close button is clicked
        mainContainer.remove();
        if(typeof onClose == "function") onClose();
    });

    // Set the z-index
    mainContainer.style.zIndex = 10;

    // Return the main container
    if(transform) {
        makeDraggable(mainContainer.element, transform);
    }
    return mainContainer;
}

function createGrid(columnNames, className, marginVal = "3px", paddingVal = "5px") {
    // Create the grid container using the element function
    const gridContainer = element('div', {
        className: `panel-black ${className || ""}`,
        style: `display: grid; grid-template-columns: repeat(${columnNames.length}, auto)`
    });
    // Create header row using the element function
    columnNames.forEach(columnName => {
        const headerCell = element('div', {
            className: 'btn black textprimary grid-header',
            textContent: columnName,
            style: `margin: ${marginVal}; padding: ${paddingVal};`
        });
        gridContainer.append(headerCell);
    });

    return gridContainer;
}

const chatEmoji = {
    name: "Emojis",
    state: {
        emojiList: {
            ":cake": "🎂",
            ":fire": "🔥",
            ":bow": "🏹",
            ":biceps": "💪💪💪",
            ":flushed": "😳",
            ":yum": "😋",
            ":joy": "😂",
            ":katana": "▬▬ι═══════ﺤ",
            ":sad": "( •̯́ ^ •̯̀)",
            ":izi": "ᶻ 𝗓 𐰁",
            ":boo": "👻",
            ":skull": "💀",
            ":nerd": "🤓☝️"
        },
        _transform: {
            top: 100,
            left: 100,
            _drag: true
        }
    },
    hotkey: {
        "Open Emojis": { key: ".", callback: "generateUI" }
    },
    start() {
        eventManager.on("click.emojis", this.generateUI, this);
        eventManager.on("ui.chatInput", this.handleChatInput, this);
        eventManager.on("ui.channelSelect", this.addControlBtn, this);
    },
    stop() {
        eventManager.off("click.emojis", this.generateUI, this);
        eventManager.off("ui.chatInput", this.handleChatInput, this);
    },
    addControlBtn(channelSelect) {
        this.controlBtn = element("small")
            .css("btn border black textgrey")
            .text(this.name)
            .style({ lineHeight: "1em", marginRight: "4px" })
            .on("click", () => {this.generateUI();});
        channelSelect.element.appendChild(this.controlBtn.element);
    },
    toggleControlBtn() {
        ["textgrey", "textprimary"].forEach(c => this.controlBtn.toggle(c));
    },
    generateUI() {
        this.toggleControlBtn();
        const existing = document.querySelector(".emojisKEK");
        if (existing) {
            existing.remove();
            return
        }
        // Function to update the emoji list
        const updateEmojiList = () => {
            const emojiList = document.querySelector(".emoji-list");
            if (!emojiList) return
            emojiList.innerHTML = ''; // Clear the list

            for (let emojiName in this.state.emojiList) {
                const emoji = this.state.emojiList[emojiName];

                const emojiItem = document.createElement('div');
                emojiItem.className = 'emoji-item btn black textsecondary';
                const emojiNameSpan = document.createElement("span");
                emojiNameSpan.classList.add("textsecondary");
                emojiNameSpan.textContent = emojiName;

                const emojiSpan = document.createElement("span");
                emojiSpan.classList.add("textsecondary");
                emojiSpan.textContent = emoji;

                emojiItem.appendChild(emojiNameSpan);
                emojiItem.appendChild(emojiSpan);
                emojiItem.style.display = "flex";
                emojiItem.style.justifyContent = "space-between";

                emojiItem.addEventListener('contextmenu', function (e) {
                    e.preventDefault();
                    // console.log("deleting item ", emojiName)
                    deleteEmoji(emojiName);
                    updateEmojiList(); // Update the list after deletion
                });
                emojiItem.addEventListener('click', function (e) {
                    // Copy to clipboard
                    navigator.clipboard.writeText(emoji)
                        .then(function () {
                            console.log("Copying item ", emoji);

                            const oldContent = emojiItem.innerHTML;
                            // Change text content to "Copied"
                            emojiItem.textContent = "Copied!";
                            emojiItem.classList.add("textgreen");
                            // Revert back to original content after 500ms
                            setTimeout(function () {
                                emojiItem.innerHTML = oldContent;
                                emojiItem.classList.remove("textgreen");
                            }, 500);
                        })
                        .catch(function (err) {
                            console.error('Unable to copy text to clipboard', err);
                        });
                });

                emojiList.appendChild(emojiItem);
            }
        };

        const saveEmoji = (emoji, emojiName) => {
            this.state.emojiList[emojiName] = emoji;
        };

        const deleteEmoji = (emojiName) => {
            delete this.state.emojiList[emojiName];
        };

        const handleExportEmojis = (event) => {
            try {
                const emojisString = JSON.stringify(this.state.emojiList);
                navigator.clipboard.writeText(emojisString).then(() => {
                    console.log('Emojis copied to clipboard successfully.');
                    const oldText = event.target.textContent;
                    event.target.textContent = 'Copied!';
                    event.target.classList.add('textgreen');
                    setTimeout(() => {
                        event.target.textContent = oldText;
                        event.target.classList.remove('textgreen');
                    }, 1000);
                }).catch((error) => {
                    console.error('Error copying emojis to clipboard:', error);
                });
            } catch (error) {
                console.error('Error exporting emojis:', error);
            }
        };

        const handleImportEmojis = (event) => {
            try {
                // Open a text area for user input
                const textarea = document.createElement('textarea');
                textarea.placeholder = 'Paste your emojis here...';

                // Create an "Import" button
                const importButton = document.createElement('button');
                importButton.className = 'btn black textsecondary';
                importButton.textContent = 'Import';

                const container = document.createElement('div');
                container.style.display = 'flex'; // Set display to flex
                container.style.marginBottom = "10px";

                textarea.style.flex = "1";
                importButton.style.flex = "1";
                importButton.style.fontSize = "16px";
                container.appendChild(textarea);
                container.appendChild(importButton);

                // Append the text area and button to the menu item (event.target)
                const emojiList = document.querySelector(".emoji-list");
                event.target.parentNode.parentNode.insertBefore(container, emojiList);

                // Add event listener to handle the "Import" button
                importButton.addEventListener('click', () => {
                    event.stopPropagation();
                    const importButtonMain = document.querySelector('.import-emoji-btn');
                    importButtonMain.classList.remove("importActive");
                    const importData = textarea.value.trim();

                    if (!importData) {
                        importButton.textContent = 'Failed!';

                        // Remove the text area and import button
                        textarea.remove();
                        setTimeout(() => {
                            // Reset the button text to "Import Emojis"
                            importButton.remove();
                            container.remove();
                        }, 1000);
                        return; // Exit if no data is provided
                    }

                    try {
                        // Parse the import data into an object
                        const importedEmojis = JSON.parse(importData);

                        if (importedEmojis && typeof importedEmojis === 'object') {
                            // Merge imported emojis with existing emojis
                            this.state.emojiList = { ...this.state.emojiList, ...importedEmojis };

                            // Log or notify about the successful import
                            console.log('Emojis imported successfully.');

                            // Change the button text to "Successful!" for a brief moment
                            importButton.textContent = 'Successful!';
                            importButton.classList.add("textgreen");
                            // Remove the text area and import button
                            textarea.remove();
                            setTimeout(() => {
                                // Reset the button text to "Import Emojis"

                                importButton.remove();
                                container.remove();

                            }, 1000);
                            updateEmojiList();
                        } else {
                            console.error('Invalid emojis data format.');
                            // Change the button text to "Failed!" for a brief moment
                            importButton.textContent = 'Failed!';
                            // Remove the text area and import button
                            textarea.remove();
                            setTimeout(() => {
                                // Reset the button text to "Import Emojis"
                                importButton.remove();
                                container.remove();

                            }, 1000);
                        }
                    } catch (error) {
                        importSpan.textContent = 'Failed!';

                        // Remove the text area and import button
                        textarea.remove();
                        setTimeout(() => {
                            // Reset the button text to "Import Emojis"
                            importSpan.textContent = 'Import Emojis';

                            importButton.remove();
                            container.remove();

                        }, 1000);
                        // console.error('Error parsing or importing emojis:', error);
                        // Handle error, e.g., notify the user about the incorrect format
                    }
                });
            } catch (error) {
                console.error('Error setting up emojis import:', error);
            }
        };
        // Check if the emoji UI already exists
        const windowPanel = createWindow("Emojis", "100px", "100px", this.state._transform, this.toggleControlBtn.bind(this)).element;
        const emojiList = document.createElement('div');
        emojiList.className = 'emoji-list panel-black bar slot';
        emojiList.style.display = "grid";
        emojiList.style.gridTemplateColumns = "repeat(10, auto)";

        const inputField = document.createElement('input');
        inputField.type = 'text';
        inputField.placeholder = 'Paste emoji';
        // Style the input fields for side-by-side placement
        inputField.style.marginRight = '10px';

        const emojiNameField = document.createElement('input');
        emojiNameField.type = 'text';
        emojiNameField.placeholder = 'Enter emoji name';

        const saveButton = document.createElement('div');
        saveButton.className = 'btn black textsecondary';
        saveButton.textContent = 'Save Emoji';
        saveButton.addEventListener('click', function () {
            const emoji = inputField.value.trim();
            const emojiName = emojiNameField.value.trim();

            if (emoji && emojiName) {
                saveEmoji(emoji, emojiName);
                inputField.value = ''; // Clear the input fields
                emojiNameField.value = '';
                updateEmojiList();
            }
        });

        // Add "Export" button
        const exportButton = document.createElement('div');
        exportButton.className = 'btn black textsecondary';
        exportButton.textContent = 'Export Emojis';
        exportButton.addEventListener('click', function (event) {
            handleExportEmojis(event);
        });

        // Add "Import" button
        const importButtonMain = document.createElement('div');
        importButtonMain.className = 'btn black textsecondary import-emoji-btn';
        importButtonMain.textContent = 'Import Emojis';

        importButtonMain.addEventListener('click', function importEmojiBtn(event) {
            if (importButtonMain.classList.contains("importActive")) {
                return;
            }
            importButtonMain.classList.add("importActive");
            handleImportEmojis(event);
            updateEmojiList();
        });

        const inputContainer = document.createElement('div');
        inputContainer.style.display = 'flex'; // Set display to flex
        inputContainer.appendChild(inputField);
        inputContainer.appendChild(emojiNameField);

        const btnContainer = document.createElement('div');
        btnContainer.style.display = 'flex'; // Set display to flex

        btnContainer.appendChild(saveButton);
        btnContainer.appendChild(exportButton);
        btnContainer.appendChild(importButtonMain);

        saveButton.style.flex = '1';
        exportButton.style.flex = '1';
        importButtonMain.style.flex = '1';

        exportButton.style.textAlign = 'center';
        importButtonMain.style.textAlign = 'center';
        saveButton.style.textAlign = 'center';

        inputContainer.style.marginBottom = "10px";
        btnContainer.style.marginBottom = "10px";

        windowPanel.appendChild(inputContainer);
        windowPanel.appendChild(btnContainer);
        windowPanel.appendChild(emojiList);

        // Append the window panel to the body
        document.body.appendChild(windowPanel);

        // Update emoji list
        updateEmojiList();


    },
    handleChatInput(chatInputSection) {
        chatInputSection = chatInputSection.element;
        const chatInput = chatInputSection.querySelector("input");
        chatInput.addEventListener('input', this.chatInputListener.bind(this));
    },
    chatInputListener(event) {
        const emojis = this.state.emojiList;
        const chatInput = event.target;
        const inputValue = chatInput.value;
    
        let replacedValue = inputValue;
        let emojiFound = false;
    
        for (const [emote, emoji] of Object.entries(emojis)) {
            if (replacedValue.includes(emote)) {
                replacedValue = replacedValue.replace(new RegExp(emote, 'g'), emoji);
                emojiFound = true;
            }
        }
    
        // Update the input value with replaced emotes if any were found
        if (emojiFound) {
            chatInput.value = replacedValue;
    
            // Dispatch a new InputEvent only if an emoji was found
            const inputEvent = new InputEvent('input', { bubbles: true });
            chatInput.dispatchEvent(inputEvent);
        }
    }
};

const mouseOver = {
    name : "Mouse Over",
    state: {
        enabled: false
    },
    toggle() {
        this.state.enabled = !this.state.enabled;
    },
    start() {
        document.addEventListener("mouseover", (event) => {
            const target = event.target;
            if (this.state.enabled 
                && (target.classList.contains("bghealth") || target.classList.contains("left") || target.classList.contains("right"))
               ) {
                event.target.click();
            }
        }); 
        eventManager.on("click.mouseOver", this.toggle, this);
    },
    stop() {
        eventManager.off("click.mouseOver", this.toggle, this);
    },
};

const menuFunctions = {
    "UIMode": uiModeToggle,
    "Mouse Over": () => { eventManager.trigger("click.mouseOver"); },
    "Hide EXP": () => { eventManager.trigger("click.expbar"); },
    "Picture Mode": togglePictureMode,
    "Blocked Players": () => { eventManager.trigger("click.blockPlayers"); },
    "Emoji": () => { eventManager.trigger("click.emojis"); },
    "Disable Class Colors": () => { eventManager.trigger("click.toggleColors"); },
    "Rune Tracker": () => { eventManager.trigger("click.runeTracker"); },
    "Kill Tracker": () => { eventManager.trigger("click.killtracker"); },
    "ExportUI": (event) => { eventManager.trigger("click.exportGUI", event); },
    "ImportUI": (event) => { eventManager.trigger("click.importGUI", event); },
    "ResetUI": (event) => { eventManager.trigger("click.resetGUI", event); },
};
let inputDisplayEle = null;
function inputMouseEnter(e) {
    const displayEle = element("div", {
        className: "btn black textprimary",
        textContent: e.target.placeholder,
        style: `
        position: absolute;
        top: ${e.target.offsetTop - 40}px;
        left: ${e.target.offsetLeft}px;
        padding: 5px`
    }).element;
    inputDisplayEle = displayEle;
    e.target.parentNode.appendChild(displayEle);
}
function inputMouseLeave(e) {
    if (inputDisplayEle) {
        inputDisplayEle.remove();
        inputDisplayEle = null;
    }
}
function uiModeToggle() {

    // Select all buttons with class 'kek-ui-btn'
    const buttons = document.querySelectorAll('.kek-ui-btn');
    const inputs = document.querySelectorAll(".kek-ui-input");
    // Iterate through the selected buttons
    buttons.forEach(button => {
        // Toggle visibility by setting the 'display' style property
        if (button.style.display == "none") {
            button.style.display = 'inline-block'; // Change to your desired display property
        } else {
            button.style.display = 'none';
        }
    });
    inputs.forEach(input => {
        // Toggle visibility by setting the 'display' style property
        if (input.style.display == "none") {
            input.style.display = 'inline-block'; // Change to your desired display property
        } else {
            input.style.display = 'none';
        }
        input.title = "";

        input.addEventListener("mouseenter", inputMouseEnter);
        input.addEventListener("mouseleave", inputMouseLeave);

    });
}
function togglePictureMode() {
    const layout = document.querySelector(".l-ui.layout");
    if (layout) {
        if (layout.style.display !== "none") {
            layout.style.display = "none";
        } else {
            layout.style.display = "grid";
        }
    }
}

const mainMenu = {
    name: "KEK UI Main Menu",
    menuStatus: {
        "Hide EXP": () => {
            return (ui.expbar.element.style.display == "none") ? true : false
        },
        "Mouse Over": () => {
            return mouseOver.state.enabled ? true : false
        },
        "UIMode": () => {
            const kekInput = document.querySelector(".kek-ui-input");
            if (kekInput)
                return kekInput.style.display == "none" ? false : true
            return false
        },
        "Disable Class Colors": () => {
            return gui.state._color ? false : true
        }
    },
    hotkey: {
        "Open Menu": { key: "u", callback: "generate" }
    },
    start() {

    },
    stop() {

    },
    generate(event) {
        let contextMenu = document.querySelector(".kek-ui-mainmenu");

        if (contextMenu) {
            contextMenu.remove();
            return
        }

        contextMenu = document.createElement('div');
        contextMenu.className = 'widow panel-black border black kek-ui-mainmenu absCentered';

        // Title frame
        const titleFrame = document.createElement('div');
        titleFrame.className = 'titleframe svelte-yjs4p5';
        titleFrame.style.display = 'flex';
        titleFrame.style.justifyContent = 'space-between';

        const title = document.createElement('div');
        title.className = 'textprimary title svelte-yjs4p5';
        title.textContent = 'UI Menu'; // Replace with your title text
        title.style.width = '200px';
        title.style.padding = '10px';
        title.style.fontSize = "20px";

        const closeButton = document.createElement('img');
        closeButton.src = '/data/ui/icons/cross.svg?v=8498194';
        closeButton.className = 'btn black svgicon';
        closeButton.style.padding = "5px";
        closeButton.addEventListener('click', function () {
            contextMenu.remove();
        });

        titleFrame.appendChild(title);
        titleFrame.appendChild(closeButton);
        contextMenu.appendChild(titleFrame);

        const panelBlackBar = document.createElement("div");
        panelBlackBar.className = "panel-black bar";
        // Hardcoded choices
        const choices = [
            'UIMode', "Mouse Over", "Blocked Players",
            "Emoji", "Picture Mode", "Rune Tracker", "Kill Tracker",
            "Disable Class Colors", "ExportUI", "ImportUI", "ResetUI"
        ];

        // Add choices to the context menu
        choices.forEach(choiceText => {
            const choiceElement = document.createElement('div');
            choiceElement.className = 'choice-item btn black textsecondary'; // Updated class to "choice-item"
            choiceElement.textContent = choiceText;
            choiceElement.style.padding = "5px";
            choiceElement.style.fontSize = "15px";
            if (this.menuStatus[choiceText] && typeof this.menuStatus[choiceText] == "function" && this.menuStatus[choiceText]()) {
                choiceElement.classList.add("textgreen");
                choiceElement.classList.remove("textsecondary");
            }
            // Add event listener to each choice (modify as needed)
            choiceElement.addEventListener('click', (event) => {
                if (menuFunctions[choiceText]) {
                    menuFunctions[choiceText](event);
                }
                if (this.menuStatus[choiceText] && typeof this.menuStatus[choiceText] == "function" && this.menuStatus[choiceText]()) {
                    choiceElement.classList.add("textgreen");
                    choiceElement.classList.remove("textsecondary");
                } else {
                    choiceElement.classList.remove("textgreen");
                    choiceElement.classList.add("textsecondary");
                }
            });

            panelBlackBar.appendChild(choiceElement);
        });

        contextMenu.appendChild(panelBlackBar);
        contextMenu.style.zIndex = 9999;
        // Append the context menu to the specified element
        const targetElement = document.querySelector('body');

        if (targetElement) {
            targetElement.appendChild(contextMenu);
        }

    },
};

const blockPlayers = {
    name: "Block players",
    state: {
        blockedPlayersList: [],
        _transform: { left: 100, top: 100, _drag: true }
    },
    hotkey: {
        "Open Blocked Players": { key: ",", callback: "generateUI" }
    },
    start() {
        eventManager.on("ui.chatArticle", this.handleChatArticle, this);
        eventManager.on("click.blockPlayers", this.generateUI, this);
        eventManager.on("ui.chatPanel", this.handleChatPanel, this);
    },
    stop() {
        eventManager.off("ui.chatArticle", this.handleChatArticle, this);
        eventManager.off("click.blockPlayers", this.generateUI, this);
        eventManager.off("ui.chatPanel", this.handleChatPanel, this);
    },
    handleChatArticle(chatArticle) {
        chatArticle = chatArticle.element;
        const sender = chatArticle.querySelector(".sender .name");
        if (sender) {
            const senderName = sender.textContent.toLowerCase().trim();
            if (this.state.blockedPlayersList.includes(senderName)) {
                chatArticle.style.display = "none";
            }
        }
    },
    unblockPlayer(playerName) {
        playerName = playerName.toLowerCase();
        // Access or initialize blockedPlayers as a Set in props
        let blockedPlayers = new Set(this.state.blockedPlayersList) || new Set();

        // Check if playerName is in blockedPlayers
        if (blockedPlayers.has(playerName)) {
            // Remove playerName from blockedPlayers
            blockedPlayers.delete(playerName);
            blockedPlayers = Array.from(blockedPlayers);
            this.state.blockedPlayersList = [...blockedPlayers];
        }
    },
    blockPlayer(playerName) {
        playerName = playerName.toLowerCase();
        // Access or initialize blockedPlayers as a Set in props
        const blockedPlayers = new Set(this.state.blockedPlayersList) || new Set();
        // Check if playerName is not already in blockedPlayers
        if (!blockedPlayers.has(playerName)) {
            // Add playerName to blockedPlayers
            blockedPlayers.add(playerName);
            this.state.blockedPlayersList = Array.from(blockedPlayers);
        }
    },
    generateUI(event) {
        const updateBlockedPlayersList = () => {
            const listContainer = document.querySelector(".blocked-players-list");
            if (!listContainer) return
            listContainer.innerHTML = ''; // Clear the list
            const blockedPlayers = this.state.blockedPlayersList;

            if (blockedPlayers) {
                const maxItemsPerRow = 7;

                // Set the styles for the blockedPlayersList
                listContainer.style.display = "grid";
                listContainer.style.gridTemplateColumns = `repeat(${maxItemsPerRow}, auto)`;

                // console.log(blockedPlayers)
                for (let playerName of blockedPlayers) {
                    const blockedPlayerItem = document.createElement('div');
                    blockedPlayerItem.className = 'blocked-player-item btn black textsecondary';
                    // blockedPlayerItem.style.padding = "15px"
                    blockedPlayerItem.style.margin = "1px";
                    blockedPlayerItem.style.display = "flex";
                    blockedPlayerItem.style.justifyContent = "space-between";
                    blockedPlayerItem.textContent = playerName;

                    blockedPlayerItem.addEventListener('click', () => {
                        this.unblockPlayer(playerName);
                        updateBlockedPlayersList(); // Update the list after unblocking
                    });


                    listContainer.appendChild(blockedPlayerItem);
                }
            }
        };
        const existing = document.querySelector(".blockedplayersKEK");
        if(existing) {
            existing.remove();
            return
        }
        const windowPanel = createWindow("Blocked Players", "100px", "100px", this.state._transform).element;

        const blockPlayerFrame = document.createElement("div");
        blockPlayerFrame.className = "panel-black bar slot";

        const blockedPlayersList = document.createElement('div');
        blockedPlayersList.className = 'blocked-players-list panel-black bar slot';

        const inputField = document.createElement('input');
        inputField.type = 'text';
        inputField.placeholder = 'Enter player name';

        const blockButton = document.createElement('div');
        blockButton.className = 'btn black textsecondary';
        blockButton.textContent = 'Block Player';
        blockButton.style.marginTop = "5px";
        blockButton.addEventListener('click', () => {
            const playerName = inputField.value.trim();
            if (playerName) {
                this.blockPlayer(playerName);
                inputField.value = ''; // Clear the input field
                updateBlockedPlayersList();
            }
        });

        blockPlayerFrame.appendChild(inputField);
        blockPlayerFrame.appendChild(blockButton);

        // Add elements to the window panel
        windowPanel.appendChild(blockPlayerFrame);
        windowPanel.appendChild(blockedPlayersList);

        document.body.appendChild(windowPanel);

        // Update blocked players list
        updateBlockedPlayersList();

        // Function to update the blocked players list
    },
    handleChatPanel(chatPanel) {
        chatPanel = chatPanel.element;
        chatPanel.addEventListener("contextmenu", (event) => {
            const menu = document.querySelector(".panel.context");
            if (menu && !menu.classList.contains("kek-ui-menu")) {
                menu.classList.add("kek-ui-menu");
                const playerNameEle = menu.querySelector(".choice.disabled");
                if (playerNameEle) {
                    const playerName = playerNameEle.textContent.trim();
                    // console.log("right clicked on " + playerName)

                    const blockDiv = document.createElement("div");
                    blockDiv.classList.add("choice");
                    blockDiv.textContent = "Block";
                    menu.appendChild(blockDiv);
                    blockDiv.addEventListener("click", () => {
                        console.log("blocking " + playerName);
                        this.blockPlayer(playerName);
                        menu.remove();
                    });
                }
            }
        });
    },
};

// import apiManager from "./api"


class ProfileManager {
    constructor() {
        this.playerName = null;
        this.playerClass = null;
        this.playerLevel = null;
        this.pid = null;
        this.charSheetOpened = false;
        
        this.profileMapping = JSON.parse(localStorage.getItem("profileMapping") || null) || {};
        
        this.foundProfile = false;
        this.wrongProfile = null;
    }

    init() {
        this.fetchPlayerInfo();
        // console.log(this.playerName, this.pid, "profileMapping from init")
    }

    fetchPlayerInfo() {
        const ufplayer = document.querySelector("#ufplayer");
        const syscharElement = document.getElementById('syschar');

        if (ufplayer && syscharElement) {
            this.playerName = ufplayer.querySelector(".left").textContent;
            const classImgSrc = ufplayer.querySelector("img").src;
            const manaBar = ufplayer.querySelector(".progressBar.bgmana");
            this.playerLevel = this.getLevel(manaBar);
            this.playerClass = getClass(classImgSrc);
            this.pid = this.getPid();
            if(this.playerName.endsWith("...")) {
                this.wrongProfile = `${this.playerName}_${this.playerClass}`;
                if(this.profileMapping[this.wrongProfile]) {
                    this.playerName = this.profileMapping[this.wrongProfile].split("_")[0];
                    return
                } else {
                    if (!this.charSheetOpened) {
                        syscharElement.click();
                        this.charSheetOpened = true;
                        this.getPlayerName();
                    }
                }
            }
        } else {
            console.error("not found ufplayer or syscharElement");
            setTimeout(this.fetchPlayerInfo.bind(this), 1);
        }
    }

    getPlayerName() {
        const statcolElement = document.querySelector('.statcol');
        const syscharElement = document.getElementById('syschar');
        if (statcolElement && syscharElement) {
            const secondSpan = statcolElement.querySelector('span:nth-child(2)');

            if (secondSpan) {
                this.playerName = secondSpan.textContent.trim();
                console.log("player name from second span: ", this.playerName);
                const correctProfile = `${this.playerName}_${this.playerClass}`;
                this.profileMapping[this.wrongProfile] = correctProfile;
                localStorage.setItem("profileMapping", JSON.stringify(this.profileMapping));
            } else {
                console.error("not found second span");
                setTimeout(this.getPlayerName.bind(this), 1);
            }
        } else {
            console.error("not found statcol or syschar");
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

const profileManager = new ProfileManager();

const expbar = {
    name: "Expbar Tweaks",
    description: "Hide experience bar",
    state: {
        lvl: false
    },
    settings: {
        lvl: { control: "checkbox", desc: "Level 45 only", comment: "Show expbar for low levels.", onupdate: "handle"},
    },
    start() {
        eventManager.on("ui.expbar", this.handle, this);
        ui.expbar?.element && this.handle();
    },
    stop() {
        log(stop);
        eventManager.off("ui.expbar", this.handle, this);
        ui.expbar.element.style.display = "block";
    },
    handle(expbar) {
        expbar = expbar.element;
        const shouldHideExpBar = profileManager.playerLevel !== 45 && !this.state.lvl;
        expbar.style.display = shouldHideExpBar ? "none" : "block";
    },
};

const runeTracker = {
    name: "Rune Tracker",
    description: "Monitor and manage runes for your party",
    state: {
        activeTab: "rawCount",
        allRuneData: [],
        isActive: false,
        _transform: {left: 100, top: 100, _drag: true}
    },
    hotkey: {
        "Open Rune Tracker": {key: "h", callback: "generateUI"}
    },
    runeTrackerOpen: false,
    runeData: [],
    paddingValue: "5px",
    marginValue: "3px", 
    idx: 0,
    start() {
        this.idx = this.state.allRuneData.length - 1;
        this.runeData = this.state.allRuneData[this.idx];
        eventManager.on("click.runeTracker", this.generateUI, this);
        eventManager.on("ui.chatArticle", this.handleChatArticle, this);
    },
    stop() {
        eventManager.off("click.runeTracker", this.generateUI, this);
        eventManager.off("ui.chatArticle", this.handleChatArticle, this);
    },
    runeNames: ["Lucid", "Melant", "Turim", "Fundo", "Amari"],
    handleChatArticle(chatArticle) {
        chatArticle = chatArticle.element;
        const noticeSpan = chatArticle.querySelectorAll(".textnotice")[1];
        if(noticeSpan) {
            const textContent = noticeSpan.textContent.trim();
            // console.log('Original Text:', textContent);

            const matchResult = textContent.match(/^(.*?)\s+received\s+(.*?)\s*x(\d+)\s*\.?$/);
            const leavePartyMatch = textContent.match(/^(.*?)\s+has left your party\.$/);

            if (leavePartyMatch) {
                const playerNameLeft = leavePartyMatch[1];
                // console.log('Player has left the party:', playerNameLeft);
                this.changePlayerState(playerNameLeft, 0);
            }
            if (matchResult) {
                const name = matchResult[1];
                const itemDescription = matchResult[2];
                const numberOfItems = parseInt(matchResult[3]);

                // console.log('Name:', name);
                // console.log('Item Description:', itemDescription)
                // console.log('Number of Items:', numberOfItems);
                const itemName = itemDescription.split(" ")[1];
                const tierInfo = itemDescription.split(" ")[0];
                const tier = parseInt(tierInfo.split("T")[1]);
                // console.log('Item Name:', itemName);
                // console.log('Item Tier:', tier);
                if(itemName.trim().toLowerCase() == "rune") {
                    this.addRuneData(name, tier - 1, numberOfItems);
                }
            }
        }
    },
    getActiveTab() {
        return this.state.activeTab
    },
    // Function to set the active rune tab in localStorage
    setActiveTab(value) {
        this.state.activeTab = value;
    },

    getRuneName(tier) {
        const tierToName = {
            0: "Lucid",
            1: "Melant",
            2: "Turim",
            3: "Fundo",
            4: "Amari"
        };

        return tierToName[tier - 1]
    },
    // Function to save rune tracker data in local storage
    saveRuneData(data) {
        let storedRuneData = data || {};
        this.state.allRuneData = storedRuneData;
    },
    // Function to get rune tracker data from local storage or use default testData
    getRuneData() {
        return this.state.allRuneData
    },

    // Function to get the length of saved rune tracker data
    getRuneTrackerDataLength() {
        return this.state.allRuneData.length
    },

    // Function to add quantity to both tabs' rune data and update UI
    addRuneData(playerName, runeIdx, qty) {
        let currentRuneData;
        if (this.state.allRuneData) {
            currentRuneData = this.state.allRuneData[this.state.allRuneData.length - 1];
        }
        if (!currentRuneData) return;
        // Iterate over each tab and add quantity to the tab's rune data or set base value if not found

        if (this.getRuneTrackerState()) {
            for (const tab in currentRuneData) {
                // Skip properties that are not tabs
                if (tab == "activeTab") {
                    continue;
                }

                // Check if the player exists in the tab's data
                if (!currentRuneData[tab][playerName]) {
                    // Initialize the data structure for the player if not found
                    currentRuneData[tab][playerName] = {};
                    this.runeNames.forEach((runeName, runeIdx) => {
                        currentRuneData[tab][playerName][runeIdx] = 0;
                    });
                    if (!currentRuneData[tab].by) {
                        currentRuneData[tab].by = "Amari";
                    }
                }

                // Add quantity to the tab's rune data or set base value if not found
                currentRuneData[tab][playerName][runeIdx] = (currentRuneData[tab][playerName][runeIdx] || 0) + qty;
                currentRuneData[tab][playerName].state = 1;

            }


            // Save the updated data
        }
        this.saveRuneData(this.state.allRuneData);
        this.updateRuneTracker();
    },

    //state = 1 for in party, 0 for not in party
    changePlayerState (name, state) {
        if(!this.runeData || !this.runeData.rawCount || !this.runeData.manualCount) return
        if (this.runeData.rawCount[name]) {
            this.runeData.rawCount[name].state = state;
        }
        if (this.runeData.manualCount[name]) {
            this.runeData.manualCount[name].state = state;
        }
        this.saveRuneData(this.state.allRuneData);
        this.updateRuneTracker();

    },

    getRuneTrackerState() {
        return this.state.isActive
    },
    
    // Function to update the Rune Tracker UI
    updateRuneTracker() {
        // console.log(this.runeTrackerOpen)
        const existingRuneTracker = document.querySelector(".runeTrackerKEK");
        if (this.runeTrackerOpen == false) return;
        if (existingRuneTracker) {
            existingRuneTracker.remove();
        }

        const runeTrackerContainer = document.createElement('div');
        makeDraggable(runeTrackerContainer, this.state._transform);
        runeTrackerContainer.className = 'window panel-black runeTrackerKEK';

        const runeGridContainer = document.createElement('div');
        runeGridContainer.className = 'panel-black';
        runeGridContainer.style.display = 'grid';
        runeGridContainer.style.gridTemplateColumns = `auto repeat(${this.runeNames.length}, auto)`;

        const titleFrame = document.createElement('div');
        titleFrame.className = 'titleframe svelte-yjs4p5';
        titleFrame.style.display = "flex";
        titleFrame.style.justifyContent = "space-between";

        const startBtn = document.createElement('button');
        startBtn.style.padding = "10px";
        startBtn.style.flex = 1;
        startBtn.style.width = "100px";
        const runeTrackerState = this.getRuneTrackerState();
        if (runeTrackerState) {
            startBtn.textContent = "Stop";
            startBtn.className = `btn textprimary rune-tracker-startbtn red`;
        } else {
            startBtn.textContent = "Start";
            startBtn.className = `btn textprimary rune-tracker-startbtn grey`;
        }

        startBtn.addEventListener('click', () => {
            if (startBtn.textContent == "Start") {
                // Start functionality
                startBtn.textContent = "Stop";
                startBtn.className = "btn textprimary rune-tracker-startbtn red"; // Change class as needed

                // Set isRuneTrackerActive to true in local storage
                this.state.isActive = true;
            } else {
                // Stop functionality
                // Add any additional logic needed when stopping

                // Change button text and style back to start functionality
                startBtn.textContent = "Start";
                startBtn.className = "btn textsecondary rune-tracker-startbtn grey"; // Change class as needed

                // Set isRuneTrackerActive to false in local storage
                this.state.isActive = false;
            }
        });
        const newBtn = document.createElement('button');
        newBtn.style.padding = "10px";
        newBtn.style.flex = 1;
        newBtn.textContent = "New";
        newBtn.style.width = "100px";
        newBtn.className = `btn textprimary rune-tracker-btn grey`;

        // Add event listener to the start button
        newBtn.addEventListener('click', () => {
            // Start functionality
            if (this.state.allRuneData) {
                this.idx = this.state.allRuneData.length;
            } else {
                this.idx = 0;
            }
            const newState = { "manualCount": {}, "rawCount": {} };

            this.runeData = newState;

            // Push the new state to the array
            this.state.allRuneData.push(newState);

            // Limit the array length to 10
            const maxLength = 10;
            if (this.state.allRuneData.length > maxLength) {
                // If the array exceeds the limit, remove the first element
                this.state.allRuneData.shift();

                // Decrement this.idx by 1
                this.idx = Math.max(0, this.idx - 1);
            }

            // Save the updated array to localStorage
            this.saveRuneData(this.state.allRuneData);

            this.updateRuneTracker();
        });

        // console.log(dataToShow, "from handleUI", activeTab)
        // Add elements to the title frame
        const title = document.createElement('div');
        title.className = 'textprimary title svelte-yjs4p5';
        title.style.width = "200px";
        title.style.padding = "10px";
        title.textContent = "Rune Tracker";

        titleFrame.appendChild(title);
        titleFrame.appendChild(startBtn);
        titleFrame.appendChild(newBtn);

        // Add elements to the window panel
        runeTrackerContainer.appendChild(titleFrame);

        // Create header row for player names
        const playerHeader = document.createElement('div');
        playerHeader.className = 'btn black textprimary rune-tracker-item';
        playerHeader.textContent = 'Players';
        playerHeader.style.width = '100px'; // Width of player names
        playerHeader.style.padding = this.paddingValue;
        playerHeader.style.margin = this.marginValue;
        runeGridContainer.appendChild(playerHeader);


        // Append the rune grid container to the main container
        runeTrackerContainer.appendChild(runeGridContainer);
        runeTrackerContainer.style.zIndex = 10;
        // Set a fixed height and enable vertical scrolling for the rune grid container
        runeTrackerContainer.style.height = 'calc(100vh - 500px)'; // Adjust the height as needed
        // Set overflow to hidden for both x and y
        runeTrackerContainer.style.overflow = 'hidden';

        // Add event listeners to handle scrolling
        runeTrackerContainer.addEventListener('wheel', (event) => {
            // Adjust the scrollTop property based on your scrolling logic
            runeTrackerContainer.scrollTop += event.deltaY;
        });
        // Append the main container to the .layout element in the document
        document.body.appendChild(runeTrackerContainer);
        let dataToShow;
        //prev next btns
        if (this.runeData) {
            // Create elements for navigation buttons and input field
            const navigateContainer = document.createElement('div');
            navigateContainer.style.display = 'flex';
            navigateContainer.style.marginTop = '10px';

            const indexInput = document.createElement('input');

            const prevButton = document.createElement('button');
            prevButton.className = "btn grey textsecondary";
            prevButton.textContent = '<';
            prevButton.style.padding = "10px";
            prevButton.style.marginLeft = "5px";
            prevButton.addEventListener('click', () => {
                if (this.idx > 0) {
                    this.idx--;
                    indexInput.value = this.idx;
                    this.runeData = this.state.allRuneData[this.idx];
                    // console.log(this.idx, runeData)
                    this.updateRuneTracker();
                }
            });

            const nextButton = document.createElement('button');
            nextButton.textContent = '>';
            nextButton.style.padding = "10px";
            nextButton.className = "btn grey textsecondary";
            nextButton.addEventListener('click', () => {
                const dataLength = this.getRuneTrackerDataLength();
                if (this.idx < dataLength - 1) {
                    this.idx++;
                    indexInput.value = this.idx;
                    this.runeData = this.state.allRuneData[this.idx];
                    // console.log(this.idx, runeData)
                    this.updateRuneTracker();
                }
            });

            indexInput.type = 'number';
            indexInput.className = 'input';
            indexInput.style.width = '50px';
            indexInput.value = this.idx;
            indexInput.style.padding = "7px";

            // Add an input event listener to handle real-time updates
            indexInput.addEventListener('input', () => {
                // Ensure the input value is a positive integer
                const targetIndex = parseInt(indexInput.value, 10);
                if (!isNaN(targetIndex) && targetIndex >= 0) {
                    this.idx = targetIndex;
                    indexInput.value = this.idx;
                    this.runeData = this.state.allRuneData[this.idx];
                    // console.log(this.idx, runeData)
                    this.updateRuneTracker();
                }
            });


            // Add the navigation container to the main container

            let activeTab = this.getActiveTab() || 'rawCount';
            dataToShow = this.runeData[activeTab];
            // Create tab buttons
            const rawCountTabButton = this.createTabButton('Raw Count', 'rawCount');
            const manualCountTabButton = this.createTabButton('Manual Count', 'manualCount');

            titleFrame.appendChild(rawCountTabButton);
            titleFrame.appendChild(manualCountTabButton);
            // Add navigation elements to the container
            titleFrame.appendChild(prevButton);
            titleFrame.appendChild(indexInput);
            titleFrame.appendChild(nextButton);
        }
        // Create close button element
        const closeBtn = document.createElement('img');
        closeBtn.src = '/data/ui/icons/cross.svg?v=8498194';
        closeBtn.className = 'btn black svgicon';

        // Append close button to titleFrame
        titleFrame.appendChild(closeBtn);

        // Add event handler to the close button
        closeBtn.addEventListener('click', () => {
            // Remove the runeTrackerContainer when the close button is clicked
            runeTrackerContainer.remove();
            this.runeTrackerOpen = false;
        });

        //cells
        if (dataToShow) {
            // Create header row for rune names
            this.runeNames.forEach(runeName => {
                const runeHeader = document.createElement('div');
                runeHeader.className = 'btn black textprimary rune-tracker-item';
                runeHeader.textContent = runeName;
                runeHeader.style.padding = this.paddingValue;
                runeHeader.style.margin = this.marginValue;
                runeHeader.addEventListener('click', () => {
                    this.runeData[this.getActiveTab()].by = runeName;
                    this.saveRuneData(this.state.allRuneData);
                    this.sortAndUpdateRuneTracker(dataToShow, runeName);
                });
                runeGridContainer.appendChild(runeHeader);
            });

            // Create rows for player names and rune counts
            for (const playerName in dataToShow) {
                if (playerName === "by") { continue; }
                const playerRow = document.createElement('div');
                playerRow.className = 'btn black textsecondary rune-tracker-item';
                playerRow.textContent = playerName;
                const isMe = playerName == profileManager.playerName;
                const state = this.runeData.rawCount[playerName].state;
                if (isMe) {
                    playerRow.classList.add("textgreen");
                }
                if (state === 0) {
                    playerRow.classList.add("textgrey");
                }
                playerRow.style.width = '100px'; // Width of player names
                playerRow.style.padding = this.paddingValue;
                playerRow.style.margin = this.marginValue;
                runeGridContainer.appendChild(playerRow);

                for (let tier = 0; tier < this.runeNames.length; tier++) {
                    const runeCell = document.createElement('div');
                    runeCell.className = 'btn black textsecondary rune-tracker-item';
                    if (isMe) {
                        runeCell.classList.add("textgreen");
                    }
                    if (state === 0) {
                        runeCell.classList.add("textgrey");
                    }
                    runeCell.textContent = dataToShow[playerName][tier] !== null ? dataToShow[playerName][tier] : 'N/A';
                    runeCell.style.padding = this.paddingValue;
                    runeCell.style.margin = this.marginValue;

                    // Add event listeners to the cell for incrementing and decrementing values
                    if (this.getActiveTab() == "manualCount") {
                        runeCell.addEventListener('click', () => {
                            // Increment the value on click
                            dataToShow[playerName][tier]++;
                            // console.log(dataToShow, "from update rune cell")
                            this.saveRuneData(this.state.allRuneData);
                            this.updateRuneTracker();
                        });

                        runeCell.addEventListener('contextmenu', (event) => {
                            event.preventDefault();
                            // Decrement the value on right-click
                            console.log("from context menu in cell");
                            dataToShow[playerName][tier] = Math.max(0, dataToShow[playerName][tier] - 1);
                            this.saveRuneData(this.state.allRuneData);
                            this.updateRuneTracker();
                        });
                    }

                    runeGridContainer.appendChild(runeCell);
                }
            }

        }

    },
    // Function to handle the creation and removal of the Rune Tracker UI
    generateUI() {
        if (this.runeTrackerOpen) {
            // Close the existing Rune Tracker if open
            const existingRuneTracker = document.querySelector('.runeTrackerKEK');
            if (existingRuneTracker) {
                existingRuneTracker.remove();
            }
            this.runeTrackerOpen = false;
            return;
        }
        this.runeTrackerOpen = true;
        this.updateRuneTracker();
    },
    // Function to update the class of a tab button based on the active tab
    updateTabButtonClass(button, tab) {
        const isActive = this.getActiveTab() == tab;
        button.className = `btn textprimary rune-tracker-btn ${isActive ? 'disabled black' : 'grey'}`;
    },
    // Function to create a tab button
    createTabButton(text, tab) {
        const tabButton = document.createElement('button');
        this.updateTabButtonClass(tabButton, tab);
        tabButton.style.padding = "10px";
        tabButton.style.flex = 1;
        tabButton.style.width = "130px";
        tabButton.textContent = text;
        tabButton.value = tab;
        tabButton.addEventListener('click', () => {
            this.setActiveTab(tabButton.value);
            this.saveRuneData(this.state.allRuneData);
            this.updateRuneTracker();
            // Update classes for all tab buttons
            const tabButtons = document.querySelectorAll('.rune-tracker-btn');
            // console.log(tabButtons)
            tabButtons.forEach(button => this.updateTabButtonClass(button, button.value));
        });
        return tabButton;
    },
    // Function to get sorted data based on the selected rune and tab
    getSortedData(data, runeName) {
        const sortedData = {};

        const sortedPlayerNames = Object.keys(data).filter(playerName => playerName !== "by").sort((a, b) => {
            const aValue = data[a][this.runeNames.indexOf(runeName)];
            const bValue = data[b][this.runeNames.indexOf(runeName)];
            return bValue - aValue;
        });
        // console.log(data)
        sortedPlayerNames.forEach((playerName) => {
            sortedData[playerName] = data[playerName];
        });
        sortedData.by = data.by;
        return sortedData;
    },
    // Function to sort the rune data and update the UI
    sortAndUpdateRuneTracker(data, runeName) {
        const sortedData = this.getSortedData(data, runeName);
        // const deepCopySortedData = JSON.parse(JSON.stringify(sortedData)); // Deep copy
        // console.log(deepCopySortedData)
        this.runeData[this.getActiveTab()] = sortedData;
        // Update the Rune Tracker UI with the sorted data
        // this.saveRuneData(runeData, this.idx);
        this.updateRuneTracker();
    }

};

const gloom = {
    name: "Gloom Timer/Data",
    state: {
        _transform: {
            "timer": {left: 100, top: 100, _drag: true},
            "personal": {left: 100, top: 100, _drag: true},
            "ranking": {left: 100, top: 100, _drag: true}
        },
    },
    hotkey: {
        "Open Gloom Timer": {callback: "createGloomTimer", key: "n"}
    },
    start() {
        if (profileManager.playerClass == 3) {
            this.defaultRequiredArg = "hps";
        }
        this.oldOptions = [this.defaultRequiredArg];
        eventManager.on("click.gloomPersonal", this.handlePersonalGloom, this);
        eventManager.on("click.gloomRanking", this.handleGloomRankings, this);
        eventManager.on("ui.sysbtnbar", this.addBtn, this);
        if(ui.sysbtnbar) {
            if(!this.personalGloomBtn && !this.rankingBtn) {
                this.addBtn(ui.sysbtnbar);
            }
        } 
    },
    stop() {
        eventManager.off("click.gloomPersonal", this.handlePersonalGloom, this);
        eventManager.off("click.gloomRanking", this.handleGloomRankings, this);
        eventManager.off("ui.sysbtnbar", this.addBtn, this);
        if(this.personalGloomBtn) {
            this.personalGloomBtn.remove();
            this.personalGloomBtn = null;
        }
        if(this.rankingBtn) {
            this.rankingBtn.remove();
            this.rankingBtn = null;
        }
    },
    isFetchingPersonal: false,
    gloomRankingData: {},
    gloomPersonalData: {},
    defaultRequiredArg: "dps",
    rankingOpened: false,
    oldOptions: [],
    isFetchingRanking: false,
    requiredButtonGroup: ["dps", "hps", "mps", "kills", "deaths"],
    optionalButtonGroups: {
        faction: ["vg", "bl"],
        class: ["warrior", "mage", "shaman", "archer"],
        duration: ["true"],
    },

    gloomTimerVisible : false,
    gloomTimerInterval: null,
    rankingBtn: null,
    personalGloomBtn: null,
    rankingSvg: `<svg fill="#a6dcd5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" stroke="#ffffff"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M6.5,12h-4a.5.5,0,0,0-.5.5V20H7V12.5A.5.5,0,0,0,6.5,12Z"></path><path d="M14,4H10a.5.5,0,0,0-.5.5V20h5V4.5A.5.5,0,0,0,14,4Z"></path><path d="M21.5,8h-4a.5.5,0,0,0-.5.5V20h5V8.5A.5.5,0,0,0,21.5,8Z"></path></g></svg>`,
    personalGloomSvg: `<svg fill="#a6dcd5" viewBox="0 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg" stroke="#ffffff"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <title>archery-target</title> <path d="M9.791 15.798c0 3.429 2.78 6.209 6.209 6.209s6.209-2.78 6.209-6.209-2.78-6.209-6.209-6.209-6.209 2.78-6.209 6.209zM16.003 12.066c2.062 0 3.734 1.672 3.734 3.734s-1.672 3.734-3.734 3.734c-2.062 0-3.734-1.672-3.734-3.734s1.672-3.734 3.734-3.734zM17.81 15.8c0 0.998-0.809 1.807-1.807 1.807s-1.807-0.809-1.807-1.807c0-0.998 0.809-1.807 1.807-1.807s1.807 0.809 1.807 1.807zM23.148 20.662c0-0 0-0 0-0l1.113 3.669c2.229-2.159 3.615-5.182 3.615-8.53 0-5.832-4.204-10.682-9.748-11.684l-0.79-2.606-3.232-0-0.818 2.727c-5.25 1.227-9.16 5.938-9.16 11.562 0 3.16 1.235 6.032 3.248 8.159l-1.944 6.482h2.926l1.466-4.5c1.304 0.796 2.773 1.348 4.345 1.592v2.909h3.251v-6.116c-0.461 0.076-0.934 0.116-1.416 0.116-0.629 0-1.243-0.068-1.834-0.196-1.236-0.267-2.374-0.799-3.351-1.533-0.927-0.696-1.71-1.575-2.294-2.582 0.004 0.008 0.009 0.015 0.014 0.023-0.747-1.278-1.175-2.765-1.175-4.353 0-3.384 1.946-6.314 4.78-7.732-0.001 0-0.001 0.001-0.002 0.001v0c1.163-0.582 2.475-0.91 3.863-0.91 1.146 0 2.239 0.223 3.239 0.628 3.167 1.282 5.402 4.386 5.402 8.013 0 1.803-0.553 3.478-1.498 4.863-0.636 0.932-1.449 1.733-2.392 2.355 0-0 0-0 0.001-0-0.989 0.652-2.12 1.107-3.336 1.308v3.264c1.571-0.187 3.048-0.681 4.369-1.42l1.401 4.271h2.926l-2.967-9.78c-0 0-0 0-0 0z"></path> </g></svg>`,
    addBtn(sysbtnbar) {
        sysbtnbar = sysbtnbar.element;
        const personalGloomBtn = this.createBtn("👹", "Gloom Personal");
        const rankingBtn = this.createBtn("📊", "Gloom Rankings");

        this.rankingBtn = rankingBtn;
        this.personalGloomBtn = personalGloomBtn;
        
        addSysbtn(sysbtnbar, personalGloomBtn);
        addSysbtn(sysbtnbar, rankingBtn);
    },
    createBtn(text, title) {
        const button = element("div", {
            className: "btn border black textsecondary",
            tooltip: title,
            style: "padding-left: 3px; padding-right: 3px; margin: 2px;"
        }).element;

        const icon = element("img").css("svgicon").element;
        let encodedURI = "";
        if (title == "Gloom Rankings") {
            encodedURI = encodeURIComponent(this.rankingSvg);
            button.addEventListener("click", this.handleGloomRankings.bind(this));
        }
        if (title == "Gloom Personal") {
            encodedURI = encodeURIComponent(this.personalGloomSvg);
            button.addEventListener("click", this.handlePersonalGloom.bind(this));
        }

        icon.src = `data:image/svg+xml,${encodedURI}`;
        button.appendChild(icon);
        return button
    },
    calculateTimeUntilNextGloom(currentTimeUTC, gloomSchedule) {
        const currentHour = currentTimeUTC.getUTCHours();
        const currentMinutes = currentTimeUTC.getUTCMinutes();

        let nextGloomIndex = 0;
        for (let i = 0; i < gloomSchedule.length; i++) {
            if (currentHour < gloomSchedule[i] || (currentHour === gloomSchedule[i] && currentMinutes < 60)) {
                nextGloomIndex = i;
                break;
            }
        }

        let hoursUntilNextGloom = gloomSchedule[nextGloomIndex] - currentHour;
        let minutesUntilNextGloom = 60 - currentMinutes;

        if (minutesUntilNextGloom > 0) {
            hoursUntilNextGloom -= 1;
        }

        const secondsUntilNextGloom = 60 - currentTimeUTC.getUTCSeconds();

        return {
            hours: hoursUntilNextGloom,
            minutes: minutesUntilNextGloom,
            seconds: secondsUntilNextGloom,
        };
    },

    updateGloomTime() {
        const currentTimeUTC = new Date();
        const gloomSchedule = [1, 4, 7, 10, 13, 16, 19, 22]; // Replace with your gloom schedule in UTC
        const timeUntilNextGloom = this.calculateTimeUntilNextGloom(currentTimeUTC, gloomSchedule);
        if(timeUntilNextGloom.hours < 0) {
            timeUntilNextGloom.hours  += 3;
        }
        return `${timeUntilNextGloom.hours}h ${timeUntilNextGloom.minutes}m ${timeUntilNextGloom.seconds}s`;
    },

    updateObeliskTime() {
        const currentTime = new Date();
        const gloomSchedule = [1, 4, 7, 10, 13, 16, 19, 22]; // Replace with your gloom schedule in local time
        const timeUntilNextGloom = this.calculateTimeUntilNextGloom(currentTime, gloomSchedule);

        // Adjusting obelisk time by subtracting one hour from gloom time
        let hoursUntilNextObelisk = timeUntilNextGloom.hours - 1;
        const minutesUntilNextObelisk = timeUntilNextGloom.minutes;
        const secondsUntilNextObelisk = timeUntilNextGloom.seconds;

        if (hoursUntilNextObelisk < 0) {
            hoursUntilNextObelisk = 3 - Math.abs(hoursUntilNextObelisk);
        }

        return `${hoursUntilNextObelisk}h ${minutesUntilNextObelisk}m ${secondsUntilNextObelisk}s`;
    },

    createGloomTimer() {
        const focusedElement = document.activeElement;

        // Check if the focused element is an input field
        if (focusedElement.tagName === 'INPUT' || focusedElement.tagName === 'TEXTAREA') {
            return;
        }

        if (this.gloomTimerVisible) {
            const gloomDiv = document.querySelector('.gloomtimerKEK');
            if (gloomDiv) {
                gloomDiv.remove();
            }
            this.gloomTimerVisible = false;
            clearInterval(this.gloomTimerInterval);
        } else {
            
            const gloomDiv = createWindow("Gloom Timer", "100px", "100px", this.state._transform.timer).element;

            const gloomGrid = createGrid(["Event", "Time"], "gloomGridKEK").element;

            const gloomTimeDiv = document.createElement('div');
            gloomTimeDiv.className = 'textsecondary btn black';
            gloomTimeDiv.textContent = `${this.updateGloomTime()}`;

            const obeliskTimeDiv = document.createElement('div');
            obeliskTimeDiv.className = 'textsecondary btn black';
            obeliskTimeDiv.textContent = `${this.updateObeliskTime()}`;

            gloomGrid.appendChild(element("div", {textContent: "Gloom", className: "btn black textsecondary"}).element);
            gloomGrid.appendChild(gloomTimeDiv);
            gloomGrid.appendChild(element("div", {textContent: "Obelisk", className: "btn black textsecondary"}).element);
            gloomGrid.appendChild(obeliskTimeDiv);

            gloomDiv.appendChild(gloomGrid);
            document.body.appendChild(gloomDiv);
            gloomDiv.style.zIndex = 20;
            this.gloomTimerInterval = setInterval(() => {
                if (this.gloomTimerVisible) {
                    gloomTimeDiv.textContent = `${this.updateGloomTime()}`;
                    obeliskTimeDiv.textContent = `${this.updateObeliskTime()}`;
                }
            }, 1000);

            this.gloomTimerVisible = true;
        }
    },

    async handlePersonalGloom() {
        const existing = document.querySelector(".gloomdataKEK");
        if (existing) {
            existing.remove();
            return;
        }
        const gloomDataContainer = createWindow(
            "Gloom Data",
            "100px",
            "100px",
            this.state._transform.personal
        ).element;

        const refreshBtn = document.createElement("div");
        refreshBtn.classList.add(
            "btn",
            "black",
            "textprimary",
            "refreshBtnPersonalGloom"
        );
        refreshBtn.textContent = "Refresh";
        refreshBtn.style.padding = "7px";
        refreshBtn.style.margin = "5px";
        if (this.isFetchingPersonal) {
            refreshBtn.classList.remove("black");
            refreshBtn.classList.add("disabled", "grey");
            refreshBtn.textContent = "Refreshing...";
        }
        refreshBtn.addEventListener("click", () => {
            refreshBtn.classList.remove("black");
            refreshBtn.classList.add("disabled", "grey");
            this.isFetchingPersonal = true;
            refreshBtn.textContent = "Refreshing...";
            apiManager
                .request("kek.gloom.personal", {
                    player_name: profileManager.playerName,
                })
                .then((data) => {
                    this.gloomPersonalData = data;
                    this.updateGloomDataGrid(this.gloomPersonalData);
                    const btn = document.querySelector(".refreshBtnPersonalGloom");
                    if (btn) {
                        btn.classList.remove("disabled", "grey");
                        btn.classList.add("black");
                        btn.textContent = "Refresh";
                    }
                    this.isFetchingPersonal = false;
                })
                .catch((err) => {
                    console.log(err);
                    const btn = document.querySelector(".refreshBtnPersonalGloom");
                    if (btn) {
                        btn.classList.remove("disabled", "grey");
                        btn.classList.add("black");
                        btn.textContent = "Refresh";
                    }
                    this.isFetchingPersonal = false;
                });
        });
        refreshBtn.click();
        gloomDataContainer.appendChild(refreshBtn);

        document.body.appendChild(gloomDataContainer);

        this.updateGloomDataGrid(this.gloomPersonalData);
    },
    handleGloomRankings() {
        const existing = document.querySelector(".gloomrankingKEK");
        if (existing) {
            existing.remove();
            return;
        }
        const gloomRankingContainer = createWindow("Gloom Ranking", "100px", "100px", this.state._transform.ranking).element;
        // Function to handle clicks on required buttons
        const handleRequiredButtonClick = (e) => {
            e.stopPropagation();
            e.preventDefault();

            const currentBtn = e.target;
            const requiredBtns = document.querySelectorAll(".required-btn-kek");
            if (currentBtn.classList.contains("selected")) {
                currentBtn.classList.remove("grey", "selected");
                currentBtn.classList.add("black");
            } else {
                requiredBtns.forEach((btn) => {
                    if (btn === currentBtn) {
                        btn.classList.add("grey", "selected");
                        btn.classList.remove("black");
                    } else {
                        btn.classList.remove("grey", "selected");
                        btn.classList.add("black");
                    }
                });
            }
        };
        // Function to handle clicks on optional buttons
        const handleOptionalButtonClick = (e, group) => {
            e.stopPropagation();
            e.preventDefault();
            // console.log("clicking")
            const btns = document.querySelectorAll(`.optional-btn-${group}`);
            // console.log(btns, `.optional-button-${group}`)
            const currentBtn = e.target;
            if (group) {
                if (currentBtn.classList.contains("selected")) {
                    currentBtn.classList.remove("grey", "selected");
                    currentBtn.classList.add("black");
                } else {
                    btns.forEach((btn) => {
                        if (btn === currentBtn) {
                            btn.classList.add("grey", "selected");
                            btn.classList.remove("black");
                        } else {
                            btn.classList.remove("grey", "selected");
                            btn.classList.add("black");
                        }
                    });
                }
            }
        };
        // Helper function to create buttons for a group
        const createOptionalButtonsForGroup = (group) => {
            const buttonsContainer = document.createElement("div");
            buttonsContainer.className = "optional-buttons-row";

            this.optionalButtonGroups[group].forEach((buttonName) => {
                const button = createButton(buttonName, (e) => handleOptionalButtonClick(e, group), "optional", group);
                if (this.oldOptions.includes(button.value)) {
                    button.classList.remove("black");
                    button.classList.add("grey", "selected");
                }
                buttonsContainer.appendChild(button);
            });

            return buttonsContainer;
        };
        
        // Helper function to create a button
        const createButton = (value, onClick, type, group = "") => {

            const button = document.createElement("div");
            button.value = value;
            button.textContent = value.charAt(0).toUpperCase() + value.slice(1);
            if (value.toLowerCase() == "bl" || value.toLowerCase() == "vg") {
                button.textContent = value.toUpperCase();
            }

            button.addEventListener("click", onClick);

            // Add specific classes for styling and identification
            if (type === "submit") {
                button.className = `btn black textprimary submit-btn-kek`;
            }
            if (type === "optional") {
                button.className = `btn black textsecondary optional-btn-${group}`;
            }
            if (type === "required") {
                button.className = `btn black textsecondary required-btn-kek`;
            }

            return button;
        };

        // Function to handle the submit button click
        const handleSubmitClick = (e) => {
            // Gather selected optional button values
            const optionalArgsSelected = [];

            this.rankingOpened = true;

            for (const group in this.optionalButtonGroups) {
                const btns = document.querySelectorAll(`.optional-btn-${group}`);
                btns.forEach(btn => {
                    if (btn.classList.contains("selected")) {
                        optionalArgsSelected.push(btn.value);
                    }
                });
            }
            let requiredArgSelected = "";
            const reqBtns = document.querySelectorAll(".required-btn-kek");
            for (let btn of reqBtns) {
                if (btn.classList.contains("selected")) {
                    requiredArgSelected = btn.value;
                    break
                }
            }
            this.oldOptions = [...optionalArgsSelected, requiredArgSelected];
            // Update the optionalArgs value based on selected buttons
            const optionalArgs = optionalArgsSelected.length > 0 ? optionalArgsSelected.join(" ") : "none";
            console.log("Optional Args:", optionalArgs);
            console.log("Required Arg:", requiredArgSelected);
            e.target.classList.add("disabled", "grey");
            e.target.classList.remove("black");
            e.target.textContent = "Fetching...";
            this.isFetchingRanking = true;
            // Perform the API call or other actions as needed
            apiManager.request("kek.gloom.ranking", 
            { "player_name": profileManager.playerName, "required_arg": requiredArgSelected, "optional_args": optionalArgs })
                .then((data) => {
                    // Handle the API response data
                    // console.log(data);
                    this.updateGloomRankingGrid(data);
                    this.gloomRankingData = data;
                    const btn = document.querySelector(".submitBtnGloomRanking");
                    if (btn) {
                        btn.classList.remove("disabled", "grey");
                        btn.classList.add("black");
                        btn.textContent = "Submit";
                    }
                    this.isFetchingRanking = false;
                })
                .catch((error) => {
                    console.error(error);
                    const btn = document.querySelector(".submitBtnGloomRanking");
                    if (btn) {
                        btn.classList.remove("disabled", "grey");
                        btn.classList.add("black");
                        btn.textContent = "Submit";
                    }
                    this.isFetchingRanking = false;
                });
        };

        const flexContainer = document.createElement("div");
        flexContainer.style.display = "flex";
        flexContainer.classList.add("flex-container-kek");
        flexContainer.style.flexDirection = "row";

        const btnRowContainer = document.createElement("div");
        btnRowContainer.className = "panel-black";

        // Create label for required buttons
        const requiredLabel = document.createElement("div");
        requiredLabel.textContent = "Required";
        requiredLabel.className = "btn black textprimary";


        // Create row for required buttons
        const requiredButtonsRow = document.createElement("div");
        requiredButtonsRow.className = "required-buttons-row";
        requiredButtonsRow.style.padding = "5px";
        requiredButtonsRow.appendChild(requiredLabel);
        this.requiredButtonGroup.forEach((buttonName) => {
            const button = createButton(buttonName, (e) => handleRequiredButtonClick(e), "required");
            if (this.oldOptions.includes(button.value)) {
                button.classList.remove("black");
                button.classList.add("grey", "selected");
            }
            requiredButtonsRow.appendChild(button);
        });
        btnRowContainer.appendChild(requiredButtonsRow);

        const optionalContainer = document.createElement("div");
        optionalContainer.className = "optional-container";
        optionalContainer.style.display = "flex";
        optionalContainer.style.margin = "0";
        optionalContainer.style.padding = "5px";
        // Create labels and rows for optional button groups
        for (const group in this.optionalButtonGroups) {
            const label = document.createElement("div");
            label.textContent = group.charAt(0).toUpperCase() + group.slice(1);
            label.className = "btn black textprimary";

            const buttonsRow = createOptionalButtonsForGroup(group);
            buttonsRow.insertBefore(label, buttonsRow.firstChild);
            optionalContainer.appendChild(buttonsRow);
        }

        const submitBtnContainer = document.createElement("div");
        submitBtnContainer.classList.add("submitBtnContainer");
        // Submit button
        const submitButton = createButton("Submit", (e) => handleSubmitClick(e), "submit");
        submitButton.classList.add("submitBtnGloomRanking");
        if (this.isFetchingRanking == true) {
            submitButton.classList.add("disabled", "grey");
            submitButton.classList.remove("black");
            submitButton.textContent = "Fetching...";
        }

        submitBtnContainer.appendChild(submitButton);

        optionalContainer.appendChild(submitBtnContainer);

        btnRowContainer.appendChild(optionalContainer);

        flexContainer.appendChild(btnRowContainer);

        gloomRankingContainer.appendChild(flexContainer);

        document.body.appendChild(gloomRankingContainer);

        this.updateGloomRankingGrid(this.gloomRankingData);
    },
    updateGloomRankingGrid(data) {
        if (!data) return;
        const existingDataGrid = document.querySelector(".gloomrankingGridKEK");
        if (existingDataGrid) {
            existingDataGrid.remove();
        }
        data = data.data;
        if (!data) return;
        const marginVal = "2px";
        const paddingVal = "4px";
        delete data[0].id;
        const keys = Object.keys(data[0]);

        // Create column names by capitalizing each key
        const columnNames = keys.map(key => key.charAt(0).toUpperCase() + key.slice(1));


        const grid = createGrid(columnNames, "gloomrankingGridKEK").element;

        for (let log of data) {

            for (let col of columnNames) {
                col = col.toLowerCase();
                let cellValue = log[col];

                const cell = document.createElement("div");
                cell.className = "btn black textsecondary personal-gloom-item";
                if (col.toLowerCase() == "faction") {
                    cell.classList.remove("textsecondary");
                    cell.classList.add(`textf${cellValue}`);
                    if (cellValue == 0) {
                        cellValue = "VG";
                    } else {
                        cellValue = "BL";
                    }
                }
                if (col.toLowerCase() == "name" && profileManager.playerName == cellValue) {
                    cell.classList.remove("textsecondary");
                    cell.classList.add("textgreen");
                }
                if (col.toLowerCase() == "class") {
                    const classCode = { 0: 'Warrior', 1: 'Mage', 2: 'Arch', 3: 'Sham' };
                    cellValue = classCode[cellValue];
                }
                cell.textContent = cellValue;
                cell.style.margin = marginVal;
                cell.style.padding = paddingVal;
                grid.appendChild(cell);
            }

        }
        const mainContainer = document.querySelector(".gloomrankingKEK");
        if (mainContainer) {
            const subContainer = mainContainer.querySelector(".flex-container-kek");
            subContainer.appendChild(grid);
        }
    },
    updateGloomDataGrid(data) {
        // console.log("from update gloom grid", data)
        const existingGrid = document.querySelector(".gloomdataGridKEK");
        if (existingGrid) {
            existingGrid.remove();
        }
        const marginVal = "3px";
        const paddingVal = "5px";
        // Extract keys from the data object
        if (!data) return;
        const keys = Object.keys(data);

        // Create column names by capitalizing each key
        const columnNames = keys.map(
            (key) => key.charAt(0).toUpperCase() + key.slice(1)
        );
        columnNames.push("K/D");
        const grid = createGrid(columnNames, "gloomrankingGridKEK").element;
        grid.classList.add("gloomdataGridKEK");
        for (let key in data) {
            let cellValue = data[key];
            const cell = document.createElement("div");
            cell.className = "btn black textsecondary personal-gloom-item";
            cell.textContent = cellValue;
            cell.style.margin = marginVal;
            cell.style.padding = paddingVal;
            grid.appendChild(cell);
        }
        let cellValue = (data.kills / data.deaths).toFixed(2);
        const cellkd = document.createElement("div");
        cellkd.className = "btn black textsecondary personal-gloom-item";
        cellkd.textContent = cellValue;
        cellkd.style.margin = marginVal;
        cellkd.style.padding = paddingVal;
        grid.appendChild(cellkd);

        const mainContainer = document.querySelector(".gloomdataKEK");
        if (mainContainer) {
            mainContainer.appendChild(grid);
        }
    },
};

const whispers = {
    name: "Whispers",
    whisperBtn: null,
    state: {
        whisperLogs: {},
        _transform: { top: 100, left: 100, _drag: true }
    },
    hotkey: {
        "Open Whispers": { key: "/", callback: "generateUI" }
    },
    currentSenderName: "",
    currentMessage: "",
    sendInput: null,
    start() {
        eventManager.on("click.whispers", this.generateUI, this);
        eventManager.on("ui.chatArticle", this.handleChatArticle, this);
        // eventManager.on("ui.partyBtnbar", this.handlePartyBtn, this)
        eventManager.on("ui.channelSelect", this.addControlBtn, this);
    },
    stop() {
        eventManager.off("click.whispers", this.generateUI, this);
        eventManager.off("ui.chatArticle", this.handleChatArticle, this);
        // eventManager.off("ui.partyBtnbar", this.handlePartyBtn, this)
        if (document.contains(this.whisperBtn)) this.whisperBtn.remove();
    },
    addControlBtn(channelSelect) {
        this.controlBtn = element("small")
            .css("btn border black textgrey")
            .text("Whispers")
            .style({ lineHeight: "1em", marginRight: "4px" })
            .on("click", () => {this.generateUI();});
        channelSelect.element.appendChild(this.controlBtn.element);
    },
    toggleControlBtn() {
        ["textgrey", "textprimary"].forEach(c => this.controlBtn.toggle(c));
    },
    handleChatArticle(chatArticle) {
        const { sender_name, text, channel } = chatArticle.obj;
        chatArticle = chatArticle.element;
        if (channel.textContent == "to" || channel.textContent == "from") {
            const senderName = sender_name.textContent;
            const type = channel.textContent, message = text.textContent;
            // console.log(type, senderName, message)
            this.addWhisperLog(type, senderName, message, profileManager.playerName);
            if (this.currentSenderName == senderName) {
                this.displayWhisperLogs(senderName);
            }
            this.updateSenderNameList();
        }
    },
    calculateTotalNotSeen(logs) {
        // Calculate the total number of not seen (where log.seen is equal to 0)
        const totalNotSeen = logs.reduce((totalNotSeen, log) => totalNotSeen + (log.seen === 0 ? 1 : 0), 0);
        // console.log(totalNotSeen, logs);
        return totalNotSeen;
    },
    // Function to fetch all sender names from whisper logs sorted by total number of seen
    fetchAllSenderNames() {
        // Get an array of sender names
        const senderNames = Object.keys(this.state.whisperLogs);

        // Sort sender names based on the total number of seen
        senderNames.sort((a, b) => {
            const totalSeenA = this.state.whisperLogs[a] ? this.calculateTotalNotSeen(this.state.whisperLogs[a]) : 0;
            const totalSeenB = this.state.whisperLogs[b] ? this.calculateTotalNotSeen(this.state.whisperLogs[b]) : 0;

            return totalSeenB - totalSeenA;
        });

        const senderObj = {};
        const newWhisperLogs = {};
        for (let name of senderNames) {
            newWhisperLogs[name] = this.state.whisperLogs[name];
        }
        this.state.whisperLogs = newWhisperLogs;
        for (let name of senderNames) {
            senderObj[name] = this.state.whisperLogs[name][this.state.whisperLogs[name].length - 1].seen;
        }
        // Return the sorted array of sender names
        // console.log(senderNames)
        return senderObj;
    },
    // addWhisperLog("from", "testingthing", "hey there new here", playerNameKEK)
    // Function to update the logs for a given sender
    updateWhisperLogs(senderName, logs) {
        this.state.whisperLogs[senderName] = logs;
    },

    addWhisperLog(type, senderName, content, receiverName) {
        // Create a new log entry
        const logEntry = { content, type, receiver: receiverName, seen: 0 };

        // Check if the sender already has logs
        if (this.state.whisperLogs[senderName]) {
            // Append the new log entry to the existing logs
            this.state.whisperLogs[senderName].push(logEntry);

            // Check if the array length exceeds the maximum allowed
            const maxLogsAllowed = 20; // Adjust this value as needed
            if (this.state.whisperLogs[senderName].length > maxLogsAllowed) {
                // Remove the oldest log (first in the array)
                this.state.whisperLogs[senderName].shift();
            }
        } else {
            // Create a new array for the sender and add the log entry
            this.state.whisperLogs[senderName] = [logEntry];
        }
    },
    // Function to fetch all logs for a given sender
    fetchWhisperLogs(senderName) {
        // Check if logs exist for the specified sender
        if (this.state.whisperLogs[senderName]) {
            // Return the logs for the sender
            return this.state.whisperLogs[senderName];
        } else {
            // Return an empty array if no logs found for the sender
            return [];
        }
    },
    chatInputListener(event) {
        const emojis = chatEmoji.state.emojiList;
        const chatInput = event.target;
        // console.log(chatInput.value)
        const inputValue = chatInput.value;

        let replacedValue = inputValue;

        for (const [emote, emoji] of Object.entries(emojis)) {
            replacedValue = replacedValue.replace(new RegExp(emote, 'g'), emoji);
        }

        // Update the input value with replaced emotes
        chatInput.value = replacedValue;
    },
    // Function to handle whisper logs

    generateUI() {
        // Fetch all sender names from whisper logs
        const existing = document.querySelector(".whispersKEK");
        this.toggleControlBtn();
        if (existing) {
            existing.remove();
            return
        }
        let senderObj = this.fetchAllSenderNames();
        let senderNames = Object.keys(senderObj);
        // Create a new window
        const window = createWindow('Whispers', "100px", "0px", this.state._transform, this.toggleControlBtn.bind(this)).element;
        const titleFrame = window.querySelector(".titleframe");
        titleFrame.style.borderBottom = "2px solid #393636";

        const senderContainer = document.createElement("div");
        senderContainer.classList.add("senderContainerKEK");
        senderContainer.style.display = "flex";
        senderContainer.style.flexDirection = "column";

        const whisperContainer = document.createElement("div");
        whisperContainer.style.display = "flex";
        whisperContainer.style.flexDirection = "column";

        whisperContainer.classList.add("whisperContainerKEK");

        let senderMaxHeight = 400;
        // Create a div for sender names list
        const senderNamesDiv = document.createElement('div');
        senderNamesDiv.classList.add("senderNamesListContainerKEK");
        senderNamesDiv.style.overflow = 'hidden';
        senderNamesDiv.style.height = senderMaxHeight + "px";
        // Add event listeners to handle scrolling
        senderNamesDiv.addEventListener('wheel', (event) => {
            // Adjust the scrollTop property based on your scrolling logic
            senderNamesDiv.scrollTop += event.deltaY;
        });
        // Create an unordered list for sender names
        const senderNamesList = document.createElement('div');
        senderNamesList.classList.add("senderNamesListKEK");
        senderNamesList.style.display = "flex";
        senderNamesList.style.flexDirection = "column";

        // Add sender names to the list
        senderNames.forEach(senderName => {
            const listItem = document.createElement('div');
            const hasSeen = senderObj[senderName];
            if (hasSeen == 0) {
                listItem.textContent = senderName + " (new)";
            } else {
                listItem.textContent = senderName;
            }
            listItem.classList.add("btn", "black", "textsecondary", "border");
            listItem.addEventListener('click', (e) => {
                this.handleSenderNameClick(e, senderName);
            });
            listItem.style.padding = "10px";
            senderNamesList.appendChild(listItem);
        });
        // Create an input for sorting sender names
        const sortInput = document.createElement('input');
        sortInput.setAttribute('placeholder', 'Search Names...');
        sortInput.addEventListener('input', this.handleSortInput.bind(this));
        sortInput.style.padding = "10px";
        // Append sender names list to the div
        senderNamesDiv.appendChild(senderNamesList);

        // Create a div for whisper logs
        const whisperLogsDiv = document.createElement('div');
        let whisperWidth = 600;
        let whisperMaxHeight = 400;
        whisperLogsDiv.classList.add("whisperLogsListContainerKEK");
        whisperLogsDiv.style.height = whisperMaxHeight + "px";
        whisperLogsDiv.style.overflow = 'hidden';

        // Add event listeners to handle scrolling
        whisperLogsDiv.addEventListener('wheel', (event) => {
            // Adjust the scrollTop property based on your scrolling logic
            whisperLogsDiv.scrollTop += event.deltaY;
        });
        // Create an unordered list for whisper logs

        const whisperLogsList = document.createElement('div');
        whisperLogsList.style.width = whisperWidth + "px";
        whisperLogsList.id = "whisperLogsList";

        // Create an input for sending whispers
        const sendInput = document.createElement('input');
        sendInput.setAttribute('placeholder', 'Type your message...');
        sendInput.addEventListener('keypress', this.handleSendWhisperInput.bind(this));
        sendInput.style.padding = "10px";
        sendInput.style.width = whisperWidth + "px";
        sendInput.addEventListener('input', this.chatInputListener.bind(this));
        this.sendInput = sendInput;

        sortInput.classList.add("btn", "black", "textsecondary");
        sendInput.classList.add("btn", "black", "textsecondary");
        // Append whisper logs list to the div
        whisperLogsDiv.appendChild(whisperLogsList);

        const flexContainer = document.createElement("div");
        flexContainer.style.display = "flex";
        // Append whisper logs div to the window
        senderContainer.appendChild(sortInput);
        senderContainer.appendChild(senderNamesDiv);

        whisperContainer.appendChild(whisperLogsDiv);
        whisperContainer.appendChild(sendInput);

        flexContainer.appendChild(senderContainer);
        flexContainer.appendChild(whisperContainer);

        window.appendChild(flexContainer);

        document.body.appendChild(window);
    },

    handleSenderNameClick(e, senderName) {
        // console.log(e.target, senderName)
        const titleEle = document.querySelector(".whispersKEK .title");
        e.stopPropagation();
        e.target;
        this.currentSenderName = senderName;
        this.displayWhisperLogs(senderName);
        if (titleEle) {
            titleEle.style.width = "300px";
            titleEle.textContent = "Whispering " + this.currentSenderName;
        }
        // Remove gray class and add black class for all sender name items
        const senderNamesList = document.querySelectorAll('.senderNamesListKEK .btn');
        senderNamesList.forEach(item => {
            item.classList.remove('grey');
            item.classList.add('black');
        });
        this.updateSenderNameList();
    },
    // Function to display whisper logs for a selected sender
    displayWhisperLogs(senderName) {
        // Fetch whisper logs for the selected sender
        let logs = this.fetchWhisperLogs(senderName);

        // Get the whisper logs list element
        const whisperLogsList = document.querySelector('#whisperLogsList');
        if (!whisperLogsList) return
        // Clear existing logs
        whisperLogsList.innerHTML = '';

        // Add logs to the list
        logs.forEach(log => {
            const listItem = document.createElement('div');
            listItem.classList.add("btn", "black", "textsecondary");

            // Set text alignment based on the log type
            listItem.style.margin = "5px";
            if (log.content.trim().length > 40) {
                listItem.style.width = `300px`;
            } else {
                listItem.style.width = `fit-content`;
            }
            // Calculate dynamic width based on the content length and max letters per line

            listItem.style.whiteSpace = 'normal';
            listItem.style.padding = "7px";
            listItem.textContent = `${log.content}`;

            // Set flex alignment based on the log type
            listItem.style.marginLeft = log.type === 'from' ? '10' : 'auto';
            listItem.style.marginRight = log.type === 'to' ? '10' : 'auto';
            whisperLogsList.appendChild(listItem);
            log.seen = 1;
        });
        whisperLogsList.parentNode.scrollTop = whisperLogsList.parentNode.scrollHeight;
        // Save the updated logs back to localStorage
        this.updateWhisperLogs(senderName, logs);
    },
    // Function to update the sender name list
    updateSenderNameList(updatedSenderObj) {
        let senderObj, senderNames;
        const senderNamesListContainer = document.querySelector('.senderNamesListKEK');
        if (!senderNamesListContainer) return;
        if (!updatedSenderObj) {
            senderObj = this.fetchAllSenderNames();
        } else {
            senderObj = updatedSenderObj;
        }

        senderNames = Object.keys(senderObj);

        // Get the sender names list container
        // Remove the existing sender name items
        senderNamesListContainer.innerHTML = '';

        // Add sender names to the list
        senderNames.forEach(senderName => {
            const listItem = document.createElement('div');
            const hasSeen = senderObj[senderName];
            if (hasSeen == 0) {
                listItem.textContent = senderName + " (new)";
            } else {
                listItem.textContent = senderName;
            }
            listItem.classList.add('btn', 'black', 'textsecondary', 'border');
            // console.log(senderName, this.currentSenderName)
            if (senderName == this.currentSenderName) {
                listItem.classList.remove("black");
                listItem.classList.add("grey");
            }
            listItem.addEventListener('click', (e) => {
                this.handleSenderNameClick(e, senderName);
            });
            listItem.style.padding = '10px';
            senderNamesListContainer.appendChild(listItem);
        });
    },
    // Function to handle input for sorting sender names
    handleSortInput(event) {
        let senderObj = this.fetchAllSenderNames();
        let senderNames = Object.keys(senderObj);
        const searchTerm = event.target.value.toLowerCase();
        const filteredSenderNames = senderNames.filter(senderName => senderName.toLowerCase().includes(searchTerm));
        const newSenderObj = {};
        for (let name of filteredSenderNames) {
            newSenderObj[name] = senderObj[name];
        }
        this.updateSenderNameList(newSenderObj);
    },
    // Function to handle input for sending whispers
    handleSendWhisperInput(event) {
        if (event.key === 'Enter') {
            // Call your this.sendWhisper function here
            this.sendWhisper(event.target.value);
            // Clear the input after pressing Enter
            event.target.value = '';
        }
    },

    sendWhisper(content) {
        if (this.currentSenderName == "") {
            return
        }
        this.currentMessage = content;

        const chatInput = document.querySelector(".chatsection input");
        document.body.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, keyCode: 13 }));
        if (chatInput) {
            chatInput.value = `/${this.currentSenderName} `;
            chatInput.dispatchEvent(new InputEvent('input', { bubbles: true }));
            setTimeout(() => {
                chatInput.value = `${this.currentMessage}`;
                chatInput.dispatchEvent(new KeyboardEvent("input", { bubbles: true }));
                setTimeout(() => {
                    chatInput.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, keyCode: 13 }));
                    this.sendInput.focus();
                }, 0);
            }, 0);
        }
    },

    handlePartyBtn(partyBtnbar) {
        partyBtnbar = partyBtnbar.element;
        const btn = element("div", {
            className: "btn border black textsecondary",
            textContent: "Whispers"
        }).element;
        btn.addEventListener("click", this.generateUI.bind(this));
        this.whisperBtn = btn;
        addPartybtn(partyBtnbar, btn);
    },
};

const parseAuxi$1 = (str) => {
    let isMatch = false;
    const regex = /(\d{8,})[a-zA-z' \n]*\s*(\+\d{1,2})?/g;
    const ids = [];
    const itemUpgradeTable = {};
    for (let match of str.matchAll(regex)) {
        isMatch = true;
        const id = match[1];
        ids.push(id);

        let itemUpgradeValue;
        // console.log(match[2])
        if (match[2] === undefined) {
            itemUpgradeValue = match[2];
        } else {
            itemUpgradeValue = match[2].split("+")[1];
        }
        itemUpgradeTable[id] = itemUpgradeValue;
    }
    return {
        ids, itemUpgradeTable, isMatch
    }
};

const items = { "amulet": [{ "name": "Rotten Talisman", "description": "Burned ingredients have been twisted and tied together to form an amulet of meager protection. Creating simple amulets like this has been a common survival tactic since ancient times." }, { "name": "Wolf's Collar", "description": "Collars to keep wolves in servitude are made from a thick leather. Some of them still have chain links connected, but all wolf collars are sturdy. Some collars are imbued with spiritual protection." }, { "name": "Bone Necklace", "description": "This necklace consists of bone fragments from a variety of strong creatures. Each bone necklace varies in protection based on the origin of the bones." }, { "name": "Werewolf's Claw", "description": "Fearsome werewolf claws that were left behind on the bodies of victims were anointed with mystic oils and instilled with spiritual fortitude through meditation. The creators of these amulets hoped that these spiritual protections would one day be used for revenge." }, { "name": "Eagle's Talon", "description": "When a talon was found, it was considered a gift from the sacred birds in the mountains. The monks in the mountains used the talons to produce spiritual amulets to protect themselves from invaders during battle." }, { "name": "Shadow Scarab", "description": "Ancient desert people collected special stones and shaped them into scarabs with strange, dark magic. Many important people in that ancient civilization wore these amulets for stature and protection." }, { "name": "Mystic Shard", "description": "Strange shards mined from the mountains were enhanced by mystics and formed into amulets in order to provide protection and cause fear." }, { "name": "Omega Medallion", "description": "Warring theocracies created divine omega symbols as a means for protection. These symbols were used to deter attacks, given as protective gifts, and presented to potential religious followers." }, { "name": "Verstärker", "description": "This amulet has a strange set of overlapping discs that taps into natural energies and amplifies the natural protection of the wearer. Many magic users strive to learn the secrets of these amulets so that they can be reproduced." }, { "name": "Tempest Carcanet", "description": "Metal strands weave in and out of each other, producing electric arcs and giving the appearance of a living amulet. Scholars speculate that these amulets came from a realm that disappeared, but no one seems sure." }, { "name": "Ankh", "description": "Ancient kings had powerful ankh symbols made to protect them in the afterlife. Grave robbers have stolen many of these amulets and sold them to both people and monsters. Each ankh has an eerie glow that belies its true power." }, { "name": "Yggdrasil Pendant", "description": "Twisted pieces of the enormous World Tree, Yggdrasil, were made into amulets of the most sacred kind. Sap seeps out of the amulet and is absorbed by the body for extra protection." }, { "name": "Dragon's Periapt", "description": "This amulet contains elder dragon magic that was bestowed upon young dragons; these amulets gave young dragons a better chance of survival into adolescence. Once the young dragons became old and large enough to survive on their own, the chain broke and the amulet was lost." }, { "name": "Lionheart", "description": "This amulet contains a gem from the crown worn by a famous king. The edges of this amulet are ruthlessly sharp and partially smeared with a mysterious substance." }, { "name": "Phoenix", "description": "The center of this amulet of phoenix feathers contains a small amount of ashes from all of the fallen adventurers that have ever owned it. Without exception, every adventurer to use such an amulet has transcended into legend." }], "armlet": [{ "name": "Simple Wristbands", "description": "These wristbands are leather strips that are wrapped in a simple formation." }, { "name": "Makeshift Armbands", "description": "These armbands were created hastily. The rough battle markings on the sides of the leather do not inspire confidence of the previous owner's survival." }, { "name": "Leather Armlets", "description": "Tough leather has been painstakingly crafted into fine armlets. On the side of the leather is the craftsman's signature: \"Markay'ak\"." }, { "name": "Bone Bracelets", "description": "This type of bracelet is ornately crafted with thick monster bones. Many superstitious traditions claim that the wearer of such bracelets become permeated with the deceased monster's power; however, others claim that the reuse of bones prevents monsters from resurrecting." }, { "name": "Iron Vambraces", "description": "This type of iron armor has been heavily used in war and remains dirty. The claw marks on the metal seem to be mostly superficial." }, { "name": "Imbued Bracers", "description": "These steel bracers are marked with small runes that imbue extra protection. Imbued bracers are somewhat rare since the creation method of the runes is a secret." }, { "name": "Ember Cuffs", "description": "These cuffs were forged with a special fire that can only be created through magic. In the past, fire elementals taught only a few special blacksmiths the secret to forging ember cuffs." }, { "name": "Mirror Armlets", "description": "Mirrored armlets are made by exceptional blacksmiths with the skills necessary to make reflective armor for damage reduction. This protective quality inspired many Elvish wizards to often experiment on mirrored armlets." }, { "name": "Golem Fragments", "description": "Golem fragments are painstakingly assembled by a small team of magic-using blacksmiths. Every pair of golem fragments is crafted over several hundred days using the husks of rock golems." }, { "name": "Coldforged Bracers", "description": "Bracers such as this are comprised of a rare metal found in the mountains. Blacksmiths use enchanted hammers to forge the bracers without heat in order to retain the magic-enhancing properties of the metal." }, { "name": "Blackstars", "description": "These bracers were created by blacksmiths that hammered metal found within black meteorites. So far, the greatest concentration of black meteorites was found after a cataclysm that followed the Second Great War." }, { "name": "Mobiuses", "description": "Ambitious wizards on the edge of madness discovered secrets to dimensional magic and formed bracers that transcend normal magical protection. These abnormal bracers required a special shape to maintain their properties." }, { "name": "Guardians", "description": "Some legends say that these bracers only appear when the realms need a guardian. History shows that terrible tragedies occur shortly thereafter whenever these bracers are found; as such, their appearances are often seen as bad omens." }], "bag": [{ "name": "Linen Pouch", "description": "This pouch is made from a delicate fabric. Pouches such as this are often owned by common people for carrying their belongings." }, { "name": "Adventurer's Rucksack", "description": "This rugged sack is crafted from sturdy fabrics to hold more equipment than a linen pouch." }, { "name": "Purpur Duffel", "description": "This robust sack is made from monster hides and permits a respectable inventory." }, { "name": "Elven Saddlebag", "description": "This fine bag was crafted from expensive Elvish fabrics and contains more pockets than most other bags." }, { "name": "Moss Enigma", "description": "Bags such as this are a gift from nature to secret druid societies. Unfortunately, monsters have disposed of many druids over time and have stolen these sacred bags." }], "book": [{ "name": "Auto attack", "description": "Perform automatic melee attacks with your weapon." }, { "name": "Slash", "description": "Slash your enemy, striking with extra force. Heals you for 5% of the damage done." }, { "name": "Bulwark", "description": "Temporarily increases your block chance, while also healing you when you block." }, { "name": "Crescent Swipe", "description": "Swiftly swing your sword around you, damaging enemies within a radius." }, { "name": "Ice Bolt", "description": "Fires a missile of frost towards your enemy. Reduces the cooldown of Icicle Orb by 0.5 seconds. Freezes targets for up to 5 stacks, at which they will be stunned and take 50% increased damage. Gains one instant cast every 7 seconds." }, { "name": "Auto attack", "description": "Automatically attack your enemy at a distance." }, { "name": "Mend", "description": "Heal a friendly target. Amount is increased for each stack of Revitalize." }, { "name": "Revitalize", "description": "Heal a friendly target over a short duration, stacking up to 3 times while also increasing the power of your Mend." }, { "name": "Bloodline", "description": "You inherited special abilities through your ancestry and family traditions, granting you extra benefits from certain stats." }, { "name": "Precise Shot", "description": "A carefully aimed, high damage shot. Increases the damage of your next Swift Shots and allows them to be cast instantly." }, { "name": "Serpent Arrows", "description": "Your Precise Shots will jump to additional targets while active." }, { "name": "Invigorate", "description": "Instantly recovers MP and increases your damage temporarily." }, { "name": "Decay", "description": "Curse your enemy with a spell of decay, dealing initial damage and additional damage over time." }, { "name": "Mimir's Well", "description": "You and your party members quickly regenerate mana over a short period of time." }, { "name": "Chilling Radiance", "description": "Emit a chilling shockwave of ice around you, damaging and freezing enemies. Increases the critical hit chance of some of your spells." }, { "name": "Icicle Orb", "description": "Summon a large orb, ejecting icicles hitting all enemies in its path." }, { "name": "Hypothermic Frenzy", "description": "You gain Haste and all your damage output is increased." }, { "name": "Enrage", "description": "Temporarily increases your damage output." }, { "name": "Centrifugal Laceration", "description": "Your Crescent Swipe lacerates enemies, causing them to bleed for additional Damage. Stacks up to 3 times." }, { "name": "Unholy Warcry", "description": "You and your party members deal additional Damage." }, { "name": "Crusader's Courage", "description": "You and your party members gain additional Defense and Mana Regeneration." }, { "name": "Armor Reinforcement", "description": "Passively increase your Defense." }, { "name": "Arctic Aura", "description": "You and your party members gain additional Crit %." }, { "name": "Ice Shield", "description": "Protects you against the next incoming attacks." }, { "name": "Enchantment", "description": "Increase your target's Damage." }, { "name": "Temporal Dilation", "description": "You and your party members gain additional Haste." }, { "name": "Cranial Punctures", "description": "Passively increase your Crit %." }, { "name": "Pathfinding", "description": "You and your party members gain additional Movement Speed." }, { "name": "Canine Howl", "description": "You and your party members become enraged with Haste, enabling you to attack faster." }, { "name": "Poison Arrows", "description": "Your Precise Shot applies a poisonous Debuff on hit, damaging and slowing your enemies." }, { "name": "Healing Totem", "description": "Place a totem on the ground, healing your entire party." }, { "name": "Swift Shot", "description": "Fire a Swift Shot which can be enhanced by casting a Precise Shot prior to it." }, { "name": "Teleport", "description": "Instantly teleport into the direction you are facing." }, { "name": "Charge", "description": "Charge towards any target while also stunning it (if hostile). Stun duration increases with charge distance." }, { "name": "Taunt", "description": "Taunt surrounding enemies, slowing their movement speed for a short duration. Forces monsters to attack you." }, { "name": "Summon", "description": "Summon your party members, allowing them to instantly teleport towards you." }, { "name": "Spirit Animal", "description": "Turn into your spirit animal for additional movement speed, removing all movement impairing effects active at the point of the transformation. All spellcasting will cancel this effect." }, { "name": "Agonize", "description": "Turns your target into a zombie, interrupting all actions, slowing it down, and reducing received healing for the duration." }, { "name": "Dash", "description": "You dash into your current direction, instantly resetting the cooldown of Precise Shot. Your next Precise Shot is an instant cast." }, { "name": "Mount Riding", "description": "Allows you to ride ground mounts. Mounts are bound to your account." }, { "name": "Conjurer's Recall", "description": "Teleport to the nearest Conjurer." }, { "name": "Tempering", "description": "Two seconds after casting all active stun and root effects on you will be removed. If any effect is removed then your Charge cooldown is reset and you gain 20 Movement Speed for 3 seconds." }, { "name": "Soul Harvest", "description": "Reap the souls of nearby enemies affected by Decay, dealing damage and granting you mana for each harvested soul." }, { "name": "Plaguespreader", "description": "Decay deals damage and jumps to a nearby enemy if the current target is already affected by Decay. Additionally, casting Decay grants you Haste for a short duration." }, { "name": "Flamepits", "description": "Lights the ground below enemies on fire" }, { "name": "Volley", "description": "Rapidly shoots arrows at all targets in front of you, dealing damage over a short period of time." }, { "name": "Whirlwind", "description": "Spins your sword for a short period of time, dealing damage to all targets around you while slowing you down. Removes all root effects when used. You can't block attacks while active." }, { "name": "Mimir's Cleanse", "description": "Removes negative effects from a friendly target, prioritizing movement impairing effects. Heals the target for each removed effect." }, { "name": "Vampiric Arrow", "description": "A cursed arrow which bites your enemy, healing you as it returns. If your target is casting, the cast will be interrupted and the healing is increased." }, { "name": "Blinding Shot", "description": "Blinds the target, impairing its movement and casting for a short duration." }, { "name": "Relentless Cry", "description": "Intimidate your enemies, confusing them for a short duration and recovering a percentage of your missing health." }, { "name": "Shatterfrost", "description": "Hurls a heavy fragment of frost at your target for massive amounts of damage. Deals extra damage to targets deep frozen by Ice Bolt." }, { "name": "Frostcall", "description": "Channel a freezing storm over a targeted area, dealing damage to all targets in a radius." }, { "name": "Ice Block", "description": "Summons a protective ice block, preventing all damage to you and recovering a percentage of your health over a short duration. You cannot move or cast any spells during this time." }, { "name": "Bone Shot", "description": "Fire a heavy femur bone at your target for massive damage. Deals 50% extra damage to targets below 50% health." }, { "name": "Summon Runedisks", "description": "-" }, { "name": "Runefire Blast", "description": "-" }, { "name": "Obelisk Conjuration", "description": "-" }], "boot": [{ "name": "Sandals", "description": "This footwear is primarily made for comfort rather than running." }, { "name": "Cloth Footpads", "description": "These footpads are wrapped in a makeshift material to increase running stability." }, { "name": "Leather Shoes", "description": "Leather shoes are created with fine craftsmanship for moderate battle durability." }, { "name": "Bone Brogans", "description": "The monster bones used in the creation of footwear such as this seem to enhance movement speed, but whether the enhancement is through magic or the lightness of the material is not known." }, { "name": "Scaled Treads", "description": "This footwear is carefully crafted with monster scales that are both light and robust for battle." }, { "name": "Shadow Shoes", "description": "Enchanted shoes such as this push the wearer's feet with shadow magic to augment speed." }, { "name": "Wartorn Boots", "description": "These boots are crafted from sturdy iron and have been used in many wars." }, { "name": "Imbued Treads", "description": "Footwear such as this is etched with runes that increase the wearer's speed. However, scholars are hesitant about the use of these runes since their true purpose and nature is unclear." }, { "name": "Skyswift Boots", "description": "Elvish magic is assisted by wind spirits to create Skyswift Boots. Although Elves are very close to nature, even they know little about the reclusive wind spirits." }, { "name": "Coldforged Greaves", "description": "These boots are forged without heat and with enchanted hammers to keep the innate properties of the special metal. This rare metal is most often found in the mountains." }, { "name": "Cloudrunners", "description": "These boots are created by monster craftsmen with the help of sky spirits. Some monster factions have a close connection with sky spirits and nature; however, monsters do not frequently talk about this relationship." }, { "name": "Talaria", "description": "These boots are named after a famous relic legend. The namesake of these boots were supposedly the fast footwear of a famous deity, but no one seems to know where the story originates." }, { "name": "Starshards", "description": "This footwear is composed of meteorite pieces. Black meteorites were found during a terrible catastrophe where fire rained down from the sky and destroyed much of the landscape." }], "bow": [{ "name": "Driftwood Shortbow", "description": "This bow is a makeshift creation. Wood is not a plentiful resource in some regions, so denizens sometimes use the materials on hand to create weapons such as this." }, { "name": "Novice Shortbow", "description": "Bows such as these are crafted for beginning archers to hone their skills." }, { "name": "Curved Shortbow", "description": "Curved shortbows are mostly produced for hunting local wildlife." }, { "name": "Adventurer's Shortbow", "description": "This type of bow is a standard weapon of choice for adventurers." }, { "name": "Longbow", "description": "Longbows are designed to be weapons of war." }, { "name": "Bone Bow", "description": "This bow is crafted from monster bones to produce extra resilience and power." }, { "name": "Elven Bow", "description": "Elvish craftsmen put exquisite care in their bows during the crafting process, and Elvish archers have a proud reputation during times of war for a reason." }, { "name": "Ancient Bow", "description": "Ancient bows are exceptional weapons that were designed by forgotten master craftsmen. These bows are often passed from one generation to another." }, { "name": "Iron Piercer", "description": "These bows were developed in response to armor-wearing monsters." }, { "name": "Silver Recurve", "description": "This bow design is more mechanically efficient than the longbow. The unique pattern of decorative silver is a testament to the craftsmanship required to make such a fine bow." }, { "name": "Assassin's Bow", "description": "Bows such as this were previously owned by assassins that made modifications to drastically increase efficiency. Assassins regularly modify their weapons to reach optimal performance." }, { "name": "Hellfire Warbow", "description": "Bows such as this were made from hellfires that are provided by devilish creatures. These kinds of bows are rare because of the ultimate price required for such wicked transactions and acquisitions." }, { "name": "Skyfire Warbow", "description": "This bow was bathed in the flames of a phoenix and cooled in the night sky. Bows created in this way are sometimes imbued with extra magical characteristics from phoenix fire." }, { "name": "Widowmaker", "description": "Widowmakers are living bows that bond with the user. Powerful monsters use a mystic process to create widowmakers; the resulting weapon can be remarkably jealous and entice the user not to use any other weapon by destroying foes with vast depths of battle experience." }, { "name": "Stormsong", "description": "These bows are rare due to the length and method of the forging process; bows must be greatly elevated to ensure that every lightning strike can be used to gradually forge this bow into a Stormsong. The creation process can take ages." }, { "name": "Scarebow", "description": "This malevolent bow eats the dreams and nightmares of the wielder. This living bow offers no loyalty and demands sacrifices in the form of battle victims." }, { "name": "Fury", "description": "When a great tragedy befalls an entire civilization, the spirits of enraged victims pour their anger into a weapon to wreak vengeance upon the world. This weapon is only known as \"Fury.\"" }], "armor": [{ "name": "Potato Sack", "description": "This is a surprisingly sturdy material that can be used as a protective clothing. The makeshift nature of this material is obvious, so many adventurers choose to replace the potato sack as quickly as possible." }, { "name": "Faded Garment", "description": "This garment is a family heirloom that has been passed down from one adventuring generation to another." }, { "name": "Adventurer's Tunic", "description": "This tunic is crafted from robust fabrics that are designed to withstand wilderness survival. Some traditions involve giving tunics as gifts to adventurers that are deemed worthy by an organization." }, { "name": "Leather Jerkin", "description": "This leather armor is a common choice for traveling adventurers. The trend of wearing leather jerkins originated around Yggdrasil when dangerous creatures began to lurk in the nearby jungles." }, { "name": "Scaled Chestguard", "description": "This armor is made of monster scales that were found on the ground. Monster scales are often crafted into respectable armor whenever metal is in short supply." }, { "name": "Sky Mail", "description": "Light Elvish metals are used to create divine chainmails. Old legends say that the first sky mails were originally created from discarded armor pieces once worn by divine creatures." }, { "name": "Shadow Cloak", "description": "This cloak summons small shadows that envelop the wearer during battle to enhance protection. Cloaks such as these are crafted with strange shadow magic and then alchemically enhanced in secret ways." }, { "name": "Runic Halfplate", "description": "Magic runes were etched into this armor to provide additional protection. Some scholars believe the runes on all runic halfplate armors are meant to interact together in some larger, undiscovered ritual." }, { "name": "Hellfire Fullplate", "description": "Supernatural infernos were used in the making of this armor. Great sacrifices were made to appease the demands of devilish creatures so that a few blacksmiths could forge with the strange flames." }, { "name": "Soulkeeper", "description": "Ancient legends say that each Soulkeeper armor harbors a soul that willingly sacrificed itself to enhance the armor’s protective power. In harder times, individuals made great sacrifices to ensure the survival of their clans and families." }, { "name": "Deathless", "description": "Deathless armors were created by the first kings and leaders as a means to prevent mortal wounds during the First Great War. True to the legend, those kings and leaders did not perish in battle; instead, they were each assassinated in their sleep and their armors were stolen. The forging techniques were lost to time, but massive fortunes were clearly necessary for the process." }], "glove": [{ "name": "Hand Wraps", "description": "This cloth is commonly used to lightly protect the hands and reduce vibration." }, { "name": "Cloth Mitts", "description": "Cloth mitts are made from the finest Elvish cloth." }, { "name": "Leather Gloves", "description": "These gloves are crafted with tough and hardened leather." }, { "name": "Bone Grips", "description": "Gloves such as this are made from monster bones. Monster bones provide extra resilience and, occasionally, residual magic." }, { "name": "Iron Gauntlets", "description": "Iron gauntlets are made by master craftsmen that have spent decades working with metal." }, { "name": "Imbued Battlefists", "description": "Mage guilds often create experimental gloves such as this to increase magic power against monster factions. Some experimental gloves are adorned with runes that were copied from ancient sources." }, { "name": "Wartorn Mitts", "description": "This armor was battle-tested during the Third Great War. Although these mitts are old, armor of this quality was once necessary for survival." }, { "name": "Fiery Handguards", "description": "These are experimental gloves created by fire mages that used techniques and methods taught by fire elementals." }, { "name": "Empowerment Gloves", "description": "Monster kings paid for expensive enhancements to these gloves. These enhancements were meant to gain an advantage against certain monster factions in battles for territory." }, { "name": "Coldforged Fists", "description": "This armor is forged without fire or heat in the hopes of retaining the magical properties of the special metal found in the mountains. Blacksmiths require enchanted hammers to forge gloves such as this." }, { "name": "Eternals", "description": "An elder race of immortals wore this armor and established great empires. The race disappeared suddenly and mysteriously, but some of their armor was left behind." }, { "name": "Phrygians", "description": "Phrygians were developed by a long-lost civilization destroyed by war. Most of the ruins of these lost cities contained fantastic treasures that have long since been plundered." }, { "name": "Titans", "description": "Powerful armor such as this was necessary to slay titanic monster overlords that tried to take control of the realms after the initial formation of the Great Barrier. The Great Barrier was created to protect the realms from dark and forgotten enemies that rivaled the power of deities." }], "hammer": [{ "name": "Splintered Club", "description": "This is a makeshift weapon that is often created by farmers." }, { "name": "Wooden Mallet", "description": "This is a mallet normally used for carpentry; however, wooden mallets are often used for combat out of necessity when resources and materials are scarce." }, { "name": "Primal Mace", "description": "Primal maces are battle-tested and have legends heaped upon them; however, their effectiveness has diminished over time." }, { "name": "Orcish Bludgeon", "description": "This is an orc's preferred tool for interrogations and battle." }, { "name": "Heavy Mace", "description": "Heavy maces are made for war, infiltration, and charisma." }, { "name": "Iron Basher", "description": "Iron bashers are typically made by expert craftsmen such as the monster Markay'ak. Craftsmen almost always leave their mark on the iron as a symbol of pride." }, { "name": "Darkmetal Maul", "description": "These mauls are made with a special metal that has distinct colors and properties. The secrets of this darkmetal were stolen from monster craftsmen and popularized." }, { "name": "Divine Gavel", "description": "These gavels are blessed by a church. Divine gavels sometimes acquire power through the devotion, achievement, and sacrifice of previous owners." }, { "name": "Hallowed Hammer", "description": "Hammers such as this are often created by famous blacksmiths like Markay'ak with the help of religious monster priests. Hallowed hammers are sometimes endowed with sacred powers." }, { "name": "Dwarven Maul", "description": "Dwarven mauls are robust and powerful enough to withstand Dwarven life in the mines and ground. Dwarven blacksmiths have vast experience in making hammers." }, { "name": "Coldforged Gavel", "description": "These gavels are made from a special metal and forged without heat. The process of forging without heat allows innate properties of the special metal to remain." }, { "name": "Skullshatterer", "description": "Skullshatterer hammers were originally created to combat the undead. The hammers that remain are often considered prized possessions by many clerics and sacred beings." }, { "name": "Amboss", "description": "These hammers are known for breaking anvil heads during the process of forging. They are rarely created and typically fetch a substantial price." }, { "name": "Benevolence", "description": "Spiritual masters often spread the message of their spirituality in a variety of ways. This hammer has the power to give the gift of peace to enemies — one way or another." }, { "name": "Hammer of Gaia", "description": "These hammers were owned and used by titanic monster overlords after the initial formation of the Great Barrier. These titans wrecked the land and ruled the realms for a time." }, { "name": "Worldender", "description": "According to historians, this hammer is said to have once caused an earthquake massive enough to topple a city." }, { "name": "Nightmare", "description": "An ancient legend claims that a strange hammer fell through a Great Barrier fissure into the realms; hammers such as this are simply not of this world." }], "misc": [{ "name": "Small HP Potion", "description": "A potion flask containing a red liquid, healing you as you drink it." }, { "name": "Small MP Potion", "description": "A potion flask containing a blue liquid, recovering mana as you drink it." }, { "name": "Medium HP Potion", "description": "A potion flask containing a red liquid, healing you as you drink it." }, { "name": "Medium MP Potion", "description": "A potion flask containing a blue liquid, recovering mana as you drink it." }, { "name": "Large HP Potion", "description": "A potion flask containing a red liquid, healing you as you drink it." }, { "name": "Large MP Potion", "description": "A potion flask containing a blue liquid, recovering mana as you drink it." }], "orb": [{ "name": "Rat Skull", "description": "This rat skull is a useful tool for beginning mages. Mages sometimes experiment on the bones of long-dead creatures to produce a focusing vessel." }, { "name": "Crystal Globe", "description": "These globes are used for a variety of magical tasks. This is a classic device for magic users." }, { "name": "Seer's Stone", "description": "The internal magic of these stones allow wise men to protect themselves during scrying and other seer activities." }, { "name": "Philosopher's Stone", "description": "Rumors about immortality and transmutation inspired magic users to experiment and create stones such as this. These orbs became useful in augmenting magical power despite the experimental results falling short of the original intentions." }, { "name": "Cyclops's Eye", "description": "This is a fantastic magical component that is easily enchanted. Handy items such as this often come with innate powers and can frequently be found in trade shipments between merchants." }, { "name": "Nüwa's Rondure", "description": "This powerful magical object is often used to control the elements and inspire fear in the hearts of enemies. Nüwa, a legendary magic user from a monster faction, made many objects such as this." }, { "name": "Baetylus's Eye", "description": "Objects like this were created from meteorites and misused as holy symbols. Although they are no longer used as holy symbols, Baetylus’s Eyes radiate substantial magical power." }, { "name": "Benben Stone", "description": "Benben Stones were placed on top of the pyramids of an ancient, dead race. The stones absorbed thousands of years of solar energy, which was said to be a gift from a sun deity." }, { "name": "Silthrim", "description": "Ancient snake stones such as this were found on forgotten altars inside ancient ruins. Scholars say that the stones were probably used in worshipping a snake deity, but the texts found in the ruins have not been successfully translated yet." }, { "name": "Lich's Phylactery", "description": "A lich’s phylactery contains the soul of a powerful undead creature. Older phylacteries come with powerful enchantments to protect the wearer — and the soul contained within." }], "quiver": [{ "name": "Linen Quiver", "description": "This mass-produced quiver is made with Elvish linen for extra comfort." }, { "name": "Rustic Quiver", "description": "Rustic Quivers are reliable and battle-tested. These quivers are often passed on to apprentice archers as they progress." }, { "name": "Snakeskin Quiver", "description": "These quivers are made from snake scales from special monsters. Typically, snake skins are found after the giant snakes have shed their skin; to attempt a snakeskin collection otherwise would be a high risk." }, { "name": "Reinforced Exemplar", "description": "The exquisite craftsmanship of Markay'ak resulted in the creation of Reinforced Exemplars. Quivers such as this are often a testament to the pride of any professional archer." }, { "name": "Lazarus's Revenge", "description": "An immortal from an elder race created quivers with an inhuman power in order to manifest his revenge upon the world." }, { "name": "Dragonhide Cynosure", "description": "This quiver is made of dragon scales found on the ground. Dragon scales are a very difficult crafting material, so only the best craftsmen can use them." }, { "name": "Lotharien", "description": "Lothariens are quivers that are named after a people warred out of existence. The Lotharien people battled surrounding territories for power acquisition while using these quivers." }, { "name": "Treant's Gift", "description": "This quiver is a gift from the forest as a means for nature spirits to reclaim their stolen power, territory, and respect." }, { "name": "Vodhrai", "description": "The Vodhrai are the embodiment of vengeance, anger, wrath, and determination. The unusually strong emotions from this living quiver might serve to corrupt the user." }, { "name": "Pompeii", "description": "This quiver was once found near the ruins of an entire civilization. There are no surviving records about the quiver in the region from this time period." }], "ring": [{ "name": "Woven Band", "description": "This strange band allows a small part of the wearer’s life essence to be stored." }, { "name": "Ironbark Loop", "description": "This ring is made from a special wood that is as tough as iron. Ironbark is often used as an alternative to metal." }, { "name": "Brass Unity", "description": "Two kingdoms that were joined by royal marriage had their armies wear these rings as a symbol of the newly allied nations." }, { "name": "Hollowed Bone", "description": "This ring is made from the bones of a monster husk. Monster bone can be used as a sturdy material when no other resources are available." }, { "name": "Elven Heirloom", "description": "Rings are often handed down from generation to generation in the Elvish tradition." }, { "name": "Imbued Union", "description": "This ring has tiny runes carved into the inner band. Some historians believe these rings were the last effort of a lost kingdom to fortify its population from disease." }, { "name": "Arcane Ring", "description": "Arcane rings are the magical experiments of intermediate mages. Some rings are crafted and enchanted to substantially enhance magic-casting abilities." }, { "name": "Emerald Band", "description": "These rings once belonged to the “Cult of the Emerald Spiders,” a gang of bandits that were among the first to ride spiders." }, { "name": "Infernal Ring", "description": "Infernal rings are gifts from devilish creatures. They entice the wearer to desire more power. This desire is often followed by ill-advised offers by more devils." }, { "name": "Ancient Signet", "description": "Nature spirits originally gave these rings as gifts of appreciation to primal monsters. Many of these rings have been stolen or lost over thousands of years." }, { "name": "Reverence", "description": "Many religious factions claim that individuals wearing this ring have the favor of a deity; however, the specific deity is not known. Many religious figureheads believe that the divine anonymity is intentional." }, { "name": "Gyges", "description": "Ancient scrolls claim that these legendary rings make the wearer nearly invincible. The scrolls also mention stories of wearers becoming corrupt and profoundly unhappy." }, { "name": "Peacekeeper", "description": "Once every age, a Peacekeeper is found and marks the wearer as a special protector of the realms. In a past age, the bearer of the Peacekeeper failed and the Third Great War began." }], "rune": [{ "name": "Lucid", "description": "This flat material is commonly found in mines; monsters often mine for Lucid to support their economies." }, { "name": "Melant", "description": "The curves of Melant give the appearance of writing or symbols, but blacksmiths believe these natural formations reveal a powerful internal structure." }, { "name": "Turim", "description": "This useful material originates from a great volcano and the surrounding region. Turim were once frequently traded between caravans." }, { "name": "Fundo", "description": "This robust material was recently found to be useful for upgrades when blacksmiths began experimenting with \"worthless Fundo.\" Since that time, Fundo have been considered a valuable resource." }, { "name": "Amari", "description": "Amari are often given as gifts from overseas kingdoms. Scholars say that Amari were first discovered when a race of sea creatures made first contact with several land kingdoms and brought Amari from the sea floor." }, { "name": "Purum", "description": "Often mistaken for gold, this material was once thought to be the same material as dragon scales. Many ancient decorations and weapons are adorned with Purum." }, { "name": "Royal", "description": "Royals are often owned and collected by kings and queens to be used as ceremonial gifts during arranged marriages." }, { "name": "Tara", "description": "These formations naturally occur most often near Yggdrasil, the World Tree. The beauty and power rarity of Tara make them equally suited for either jewelry heirlooms or item upgrades." }, { "name": "Gloom", "description": "Once the secret methods of enhancing equipment using the power of Gloom were discovered, those methods were shortly sold to an opposing kingdom as one of the biggest betrayals in the history of the realms." }, { "name": "Plurae", "description": "Unusual crystalline properties in Plurae make it an exceptional material. Although Plurae were only recently rediscovered in the forgotten depths of the world, the applications of Plurae have already been substantial in turning the tides of war." }, { "name": "Aeter", "description": "Although Aeter were once considered gifts from the gods by queens and kings of the past, written histories claim that Aeter were found inside black meteorites." }], "shield": [{ "name": "Wooden Shield", "description": "This is a makeshift shield that seems to have been produced out of necessity." }, { "name": "Buckler", "description": "Bucklers can be useful protection against small and light weapons. Pirates often use bucklers for maneuverability." }, { "name": "Old Bulwark", "description": "This is a shield type that is often made during war times. Although cheap, the shield is made of sturdy ironbark." }, { "name": "Metal Guard", "description": "Kingdom sentries often use shields such as this to reduce received damage as well as protect citizens." }, { "name": "Darkmetal Shield", "description": "This shield is made of darkmetal and anointed with a black oil. Adventurers with this kind of shield are certain to stand out from the rest." }, { "name": "Spiked Warshield", "description": "Spiked Warshields are robust in battle and fitting for orcish culture. Veteran orc warriors display their victory notches on the sides of their shields." }, { "name": "Protecteron", "description": "Paladins acquire this shield when they attain a certain level of spiritual devotion. However, these paladin shields are sometimes seen without their owners..." }, { "name": "Svalinn", "description": "This type of shield is made by mortals with ice that is found only in the Underworld. Although the shield is powerful, the unusual properties and rarity of the Underworld Ice make mortal attempts at reconstructing these shields inadequate at best." }, { "name": "Ancile", "description": "This sacred shield is wrapped in legend and rumors. One ancient scroll tells how the shield created false copies of the user to confuse opponents. Another scroll alternatively explains that the shield was modeled after the very shield wielded by a deity." }, { "name": "Aegis", "description": "The divine paint on this shield is animated and can imbue a worthy user with fantastic powers. Some observers believe that the blinking eye allows the mysterious and divine painter to see the world." }], "staff": [{ "name": "Broken Twig", "description": "Sticks and broken twigs are used by apprentice mages for educational purposes." }, { "name": "Cracked Stick", "description": "This is a damaged battlestaff that still has some use for beginning magic users." }, { "name": "Gnarled Broomstick", "description": "Some of the oldest trees are used to create Gnarled Broomsticks. These weapons produce spells to sweep enemies off the battlefield." }, { "name": "Oak Staff", "description": "This is a sturdy oak weapon for casting intermediate magic." }, { "name": "Mystic Wand", "description": "This wand is a gift from the mystics that is embedded with strange shards that enhance magical power." }, { "name": "Bone Staff", "description": "This is made from the bones of monster mages to augment magical power." }, { "name": "Encrusted Rod", "description": "This rod is encrusted with gems that store magical power." }, { "name": "Imbued Staff", "description": "The etched runes on this staff faintly glow when spells are cast. Although several mage guilds clearly believe that the runes augment spell casting, the true nature of the runes is unknown." }, { "name": "Emerald Staff", "description": "This staff uses an enchanted stone to channel and focus magical energies. The process of finding such a special emerald, along with the expensive enchanting process, makes this staff somewhat difficult to craft." }, { "name": "Sapphire Staff", "description": "This staff is made of Dragonwood and uses stones that were originally dragon gifts. The residual traces of draconic power contained in the stones compound magic's potency." }, { "name": "Frozen Greatstaff", "description": "The Frozen Greatstaff is made by mortals with ice found only in the Underworld. Although the construction methods are flawed, the results can still be quite powerful." }, { "name": "Infernal Staff", "description": "This staff is made of Underwood that underwent a magical tempering process using Underworld Flames. Although the staffs were undoubtedly crafted by mortal hands, the method to obtain Underworld Flames seems to be a secret lost to time." }, { "name": "Hellfire Greatstaff", "description": "Hellfire Greatstaffs are constructed with hellfires provided by mischievous devils. Although the process to create a staff such as this is mysterious, the price exacted by the devils involved is not." }, { "name": "Divine Staff", "description": "This kind of staff is modeled from ancient texts. Part of the crafting process requires hundreds of devout beings to request blessings upon the staff by specific deities." }, { "name": "Crystal Core", "description": "This strange staff utilizes crystals from the Realm of Madness in order to enhance wild magics in nature. The crystals are the central component of this staff." }, { "name": "Witch's Heart", "description": "The heart of an elder witch powers this staff's magic. Forbidden powers reanimated the beating heart, which causes the staff to symbolically embody a representation of the undead." }, { "name": "Deathweaver", "description": "Deathweavers are relics that have survived the creation of the Great Barrier. These strange staffs are not of this world." }], "sword": [{ "name": "Wooden Sword", "description": "These swords are often made of ironbark to last longer than regular wood." }, { "name": "Rusty Ironsword", "description": "Swords such as this have seen many battles and are typically handed down from a warrior to an apprentice." }, { "name": "Troll Blade", "description": "This is a worthy weapon wielded by trolls and their tribes. Trolls often attack neighboring territories to either expand their own or force back invaders." }, { "name": "Broadsword", "description": "The broadsword is a standard weapon among soldiers and warriors on the battlefield." }, { "name": "Longsword", "description": "Longswords are primarily identified by their longer grip rather than the longer blade. Bladesmiths have used a variety of materials and levels of skill, producing a wide variety of results." }, { "name": "Gladius", "description": "Designed for combat, this weapon performs to expectations inside the Colosseum." }, { "name": "Greatsword", "description": "This massive sword is designed to increase damage potential specifically for war. An adventurer that wears or uses a weapon such as this leaves no doubt about their goals and profession." }, { "name": "Templar Greatsword", "description": "These are weapons that once belonged to the knights of fallen kingdoms. Powerful kingdoms once existed before massive wars obliterated them from the landscape; the knights wielding these greatswords maintained their chivalrous duties long after their kingdoms turned to dust." }, { "name": "Ghastly Scimitar", "description": "These swords are crafted by undead monsters. The unnatural crafting technique to produce weapons such as this remains unknown." }, { "name": "Nullfire Sword", "description": "Nullfire Swords are made by mortals from ice that is only found in the Underworld. Originally, this kind of sword was made to combat devils and demons during the first Great War; however, Nullfire Swords were crafted by flawed processes and were therefore unable to repel the devils and demons completely." }, { "name": "King's Rapier", "description": "In realms where warfare is constant, royalty often spend massive quantities of gold to create one of the best blades that money can buy for their personal use. Unfortunately, these pristine blades alone cannot stop invading armies from taking over a kingdom." }, { "name": "Void Blade", "description": "These weapons were given to mortals by a secretive group of wraith monsters. These \"gifts\" were later discovered to be a means of manipulating mortal endeavors through magical corruption. Despite the apparent failure of this master plan, the powerful swords can still be found." }, { "name": "Zerstörer", "description": "Many scholars say these weapons were created to destroy an ancient and powerful race, but neither the creators nor their opponents remain." }, { "name": "Hearteater", "description": "This weapon is literally a monster. These creatures bond with the user to increase combat exposure, which provides greater opportunities for the creatures to feed and sustain themselves." }, { "name": "Demonedge", "description": "Demonedges were brought into the realms by the demons and devils that began the First Great War. These weapons are forged with hellfire and are not crafted by mortal hands." }, { "name": "Excalibur", "description": "Some of the most divine warriors and dedicated paladins in history used a weapon such as this. Legends that are heaped upon the names of the wielders have historically inspired and motivated generations of fighters and kings." }, { "name": "Harbinger", "description": "This weapon is almost always considered a bad omen and bringer of doom when it is found. Some scholars believe this weapon falls through barrier fissures and could only be made outside of the realms." }], "mount": [{ "name": "Grubling", "description": " " }, { "name": "Spider", "description": " " }, { "name": "Leafspider", "description": " " }, { "name": "Ruby Crawler", "description": " " }, { "name": "Tick", "description": " " }, { "name": "Shadowstrider", "description": " " }, { "name": "Pebbles", "description": " " }, { "name": "Ember Pebbles", "description": " " }, { "name": "Ether Wyrm", "description": " " }, { "name": "Shadow Wyrm", "description": " " }, { "name": "Sand Scarab", "description": " " }, { "name": "Golden Scarab", "description": " " }, { "name": "Flaming Skullspider", "description": " " }, { "name": "Blacksmith's Grub", "description": " " }, { "name": "Snowball", "description": " " }], "totem": [{ "name": "Dream Feathers", "description": "These feathers absorb the dreams and nightmares of those that sleep near it. The dreams and nightmares are stored and reused in the form of magic." }, { "name": "Voodoo Doll", "description": "A supernatural creature bound to this doll fuels magical power available to the user." }, { "name": "Glowing Chicken", "description": "This is a vessel that emanates magic originating from nature." }, { "name": "Divine Beads", "description": "These beads were carried by holy priests as a means to store divine power and count their blessings. Some of the divine power still resides within each bead." }, { "name": "Templar's Resolve", "description": "When defeated templars fail a divine task, they pour spiritual devotion into a personal totem such as this to aid the side of good." }, { "name": "Holy Cricket", "description": "This is one of the many magical crickets that were once owned by the emperors and empresses of Tiger's Teeth. To ward against assassinations, magical crickets enhanced the supernatural power of the royalty that carried them." }, { "name": "Laughing Skulls", "description": "This is a prison with supernatural creatures that are unwillingly bound together. They generate substantial magical power with their unnatural laughter." }, { "name": "Hive Mind", "description": "A collective of supernatural minds that focus their magical power and bestow it upon the user of their totem. The Hive Mind believes that all creatures must submit to their power and tries to convince the user to join them." }, { "name": "Nganga's Serpent", "description": "This is an avatar of a supernatural creature. Some scholars say that Nganga's Serpent is given to those that are chosen and deemed worthy for greatness; however, other scholars suggest that this is another means by which deities try to control and manipulate mortals." }, { "name": "Sangoma's Bones", "description": "These ancient bones are said to be small fragments of a forgotten monster deity. The bones radiate power beyond imagination." }], "box": [{ "name": "Mysterious Saddle Chest", "description": "Shipped from the unexplored regions of Faivel. The contents of this cage cannot be inspected until opened." }, { "name": "Elixir", "description": "A magical blue elixir potion which grants your account useful extra features." }], "charm": [{ "name": "Little Bell", "description": "Bells are often used as a symbol of devotion toward a chosen deity. The interior of this bell has an inlaid silver inscription, but the translation of the inscription has been lost to time." }, { "name": "Hardened Egg", "description": "Fossilized monster eggs are often interpreted as symbols of longevity. However, no written records of these creatures exist beyond recent times." }, { "name": "Tattooed Skull", "description": "Orc tribes often keep the skulls of worthy foes as a sign of respect. This skull is adorned with tattoos that symbolize the power the foe had during life." }, { "name": "Ship Pennant", "description": "Flags flown from the tops of warships were called pennants. This ship pennant was among the wrecked warships that first traveled to Headless Landing." }, { "name": "Blue Marble", "description": "Mages created alternative methods of mana acquisition during times of scarcity. This marble was created during the Arcane Crisis, a time when mana networks were under extreme stress." }], "pet": [{ "name": "Greedy Grub", "description": "A tiny grub that will loot items for you." }, { "name": "Greedy Goblin", "description": "A tiny goblin that will loot items for you." }] };
const types = {
    hammer: {
        baselvl: 0,
        slot: [101],
        tiers: 17,
        drop: .4,
        weight: 1,
        class: 3,
        stats: {
            10: {
                base: 1,
                min: .6,
                max: 1
            },
            11: {
                base: 3,
                min: .8,
                max: 1.7
            },
            17: {
                base: 15,
                min: .05,
                max: .1
            }
        }
    },
    bow: {
        baselvl: 0,
        slot: [101],
        tiers: 17,
        drop: .4,
        weight: 1,
        class: 2,
        stats: {
            10: {
                base: 1,
                min: .6,
                max: 1
            },
            11: {
                base: 3,
                min: .8,
                max: 1.7
            },
            17: {
                base: 10,
                min: .05,
                max: .1
            }
        }
    },
    staff: {
        baselvl: 0,
        slot: [101],
        tiers: 17,
        drop: .4,
        weight: 1,
        class: 1,
        stats: {
            10: {
                base: 1,
                min: .6,
                max: 1
            },
            11: {
                base: 3,
                min: .8,
                max: 1.7
            },
            17: {
                base: 10,
                min: .05,
                max: .1
            }
        }
    },
    sword: {
        baselvl: 0,
        slot: [101],
        tiers: 17,
        drop: .4,
        weight: 1,
        class: 0,
        stats: {
            10: {
                base: 1,
                min: .6,
                max: 1
            },
            11: {
                base: 3,
                min: .8,
                max: 1.7
            },
            17: {
                base: 20,
                min: .05,
                max: .1
            }
        }
    },
    armlet: {
        baselvl: 1,
        slot: [102],
        tiers: 13,
        drop: 1,
        weight: .3,
        stats: {
            6: {
                base: 10,
                min: .5,
                max: .9
            },
            12: {
                base: 7,
                min: .5,
                max: .8
            }
        }
    },
    armor: {
        baselvl: 2,
        slot: [103],
        tiers: 11,
        drop: 1,
        weight: 1,
        stats: {
            12: {
                base: 10,
                min: 1.4,
                max: 2.8
            },
            6: {
                base: 20,
                min: 1,
                max: 2
            }
        }
    },
    bag: {
        baselvl: 5,
        slot: [104],
        tiers: 5,
        drop: 1,
        weight: .1,
        stats: {
            19: {
                base: 1,
                min: .1,
                max: .3
            }
        }
    },
    boot: {
        baselvl: 2,
        slot: [105],
        tiers: 13,
        drop: 1,
        weight: .4,
        stats: {
            6: {
                base: 10,
                min: .6,
                max: 1
            },
            12: {
                base: 8,
                min: .6,
                max: 1.1
            },
            15: {
                base: 3,
                min: .03,
                max: .1
            }
        }
    },
    glove: {
        baselvl: 2,
        slot: [106],
        tiers: 13,
        drop: 1,
        weight: .4,
        stats: {
            6: {
                base: 10,
                min: .6,
                max: 1
            },
            12: {
                base: 8,
                min: .7,
                max: 1.1
            },
            14: {
                base: 1,
                min: .1,
                max: 1.5
            }
        }
    },
    ring: {
        baselvl: 5,
        slot: [107],
        tiers: 12,
        drop: .8,
        weight: .2,
        stats: {
            6: {
                base: 10,
                min: .5,
                max: .9
            },
            7: {
                base: 5,
                min: .6,
                max: 1
            }
        }
    },
    amulet: {
        baselvl: 7,
        slot: [108],
        tiers: 12,
        drop: .8,
        weight: .3,
        stats: {
            7: {
                base: 10,
                min: 1,
                max: 1.8
            },
            9: {
                base: 1,
                min: .2,
                max: .3
            }
        }
    },
    quiver: {
        baselvl: 2,
        slot: [109],
        tiers: 10,
        drop: .7,
        weight: .5,
        class: 2,
        stats: {
            14: {
                base: 5,
                min: .1,
                max: .9
            },
            9: {
                base: 1,
                min: .1,
                max: .3
            }
        }
    },
    shield: {
        baselvl: 2,
        slot: [109],
        tiers: 10,
        drop: .7,
        weight: .5,
        class: 0,
        stats: {
            12: {
                base: 20,
                min: .8,
                max: 1.4
            },
            13: {
                base: 4,
                min: 1,
                max: 2.8
            }
        }
    },
    totem: {
        baselvl: 2,
        slot: [109],
        tiers: 10,
        drop: .7,
        weight: .5,
        class: 3,
        stats: {
            12: {
                base: 10,
                min: .4,
                max: .9
            },
            9: {
                base: 1,
                min: .1,
                max: .4
            }
        }
    },
    orb: {
        baselvl: 2,
        slot: [109],
        tiers: 10,
        drop: .7,
        weight: .5,
        class: 1,
        stats: {
            3: {
                base: 10,
                min: .3,
                max: .7
            },
            9: {
                base: 1,
                min: .1,
                max: .3
            }
        }
    },
    rune: {
        baselvl: 1,
        tiers: 11,
        drop: .8,
        quality: 70
    },
    misc: {
        drop: 8,
        weight: .1
    },
    book: {
        drop: .9,
        weight: .5
    },
    charm: {
        slot: [110, 111],
        noupgrade: !0,
        undroppable: !0,
        drop: 0,
        stackable: !1
    },
    mount: {
        noupgrade: !0,
        undroppable: !0,
        drop: 0,
        stackable: !1
    },
    box: {
        noupgrade: !0,
        undroppable: !0,
        drop: 0,
        stackable: !1
    },
    pet: {
        noupgrade: !0,
        undroppable: !0,
        drop: 0,
        stackable: !1
    },
    gold: {
        drop: 20
    }
};
const rndArrayFixed = (t, e) => t[Math.floor(e * t.length)];
const upgradeGains = {
    6: 4,
    7: 3,
    8: 5,
    9: 4,
    10: 1,
    11: 1,
    12: 5,
    13: 5,
    14: 5,
    15: .3,
    16: 5,
    17: 0,
    2: 2,
    0: 2,
    3: 2,
    4: 2,
    1: 2,
    5: 2,
    19: 1,
    18: 3
};
const randomStats = {
    6: {
        min: .2,
        max: .8,
        round: !0
    },
    7: {
        min: .2,
        max: .5,
        round: !0
    },
    8: {
        min: .1,
        max: 1
    },
    9: {
        min: .1,
        max: .5
    },
    10: {
        min: .03,
        max: .13,
        round: !0
    },
    11: {
        min: .1,
        max: .2,
        round: !0
    },
    12: {
        min: .1,
        max: .8,
        round: !0
    },
    13: {
        min: .1,
        max: .4
    },
    14: {
        min: .1,
        max: .5
    },
    16: {
        min: .1,
        max: .4
    },
    2: {
        min: .08,
        max: .45,
        round: !0
    },
    0: {
        min: .08,
        max: .45,
        round: !0
    },
    3: {
        min: .08,
        max: .45,
        round: !0
    },
    4: {
        min: .08,
        max: .45,
        round: !0
    },
    1: {
        min: .08,
        max: .45,
        round: !0
    },
    5: {
        min: .08,
        max: .45,
        round: !0
    },
    18: {
        min: .01,
        max: .15,
        round: !0
    }
}
    , randomStatKeys = Object.keys(randomStats);
const pvpCharm = {
    medalValue: 1e3,
    goldValue: 5e4,
    buyElo: 1600,
    quality: 90,
    level: 45,
    gs: 30,
    uniqueEquipped: !0
};
const charms$1 = [{
    id: 0,
    custom: ["Use: Removes all movement limiting effects."],
    useCd: 60,
    incap: !0,
    animCast: 45,
    use: (t, e, n, a) => { }
}, {
    id: 1,
    custom: ["Use: Protects you against 30% of incoming damage for 10 seconds."],
    useCd: 60,
    animCast: 6,
    incap: !1,
    use: (t, e, n, a) => { }
}, {
    id: 2,
    custom: ["Use: Increases your damage by 20% for 10 seconds."],
    useCd: 80,
    incap: !1,
    animCast: 6,
    use: (t, e, n, a) => { }
}, {
    id: 3,
    custom: ["Use: Speeds up your movement by 45 for 8 seconds."],
    useCd: 50,
    incap: !1,
    animCast: 6,
    use: (t, e, n, a) => { }
}, {
    id: 4,
    custom: ["Use: Attacks made against you grant 20 MP (up to 200) for 20 seconds."],
    useCd: 60,
    incap: !1,
    animCast: 6,
    use: (t, e, n, a) => { }
}];
const generate$5 = t => {
    charms$1.forEach((e, n) => {
        t["charm" + e.id] = {
            ...pvpCharm,
            ...e,
            type: "charm",
            tier: e.id,
            useSkill: 107 + n
        };
    }
    );
};
const generate$2 = t => {
    for (const e in types)
        if (types[e].tiers) {
            const n = types[e];
            for (let a = 0; a < n.tiers; ++a)
                generateEquipment({
                    type: e,
                    tier: a,
                    stats: n.stats,
                    level: getItemLevel(e, a),
                    class: n.class,
                    quality: n.quality
                }, t);
        }
}
    , getItemLevel = (t, e) => types[t].baselvl + Math.floor(e / types[t].tiers * 100)
    , generateEquipment = (t, e) => {
        const n = {
            level: t.level,
            type: t.type,
            tier: t.tier,
            stats: t.stats ? new Map : void 0,
            class: t.class,
            quality: t.quality
        };
        t.stats && Object.keys(t.stats).sort((t, e) => t - e).forEach(e => {
            const a = t.stats[e];
            n.stats.set(parseInt(e), {
                min: a.base + t.level * a.min,
                max: a.base + (t.level + 10) * a.max
            });
        }
        ),
            e[t.type + t.tier] = n;
    }
    , generate$1 = t => {
        const e = [250, 100, 500, 200, 1e3, 300];
        for (let n = 0; n < 6; ++n) {
            const a = Math.floor(n / 2)
                , s = n % 2 == 0;
            t["misc" + n] = {
                type: "misc",
                tier: n,
                level: 1 + 20 * a,
                goldvalue: 5 ** a,
                quality: 15,
                custom: [e[n] + (s ? " HP recovered" : " MP recovered")],
                useSkill: 100,
                use: (t, e, n, a) => { }
            };
        }
    }
    , pets = [1919, 1920]
    , generate = t => {
        pets.forEach((e, n) => {
            t["pet" + n] = {
                level: 10,
                unsellable: !0,
                storeValue: 900,
                quality: 90,
                bindOnUse: 1,
                bindOnMerchant: 1,
                type: "pet",
                tier: n,
                useSkill: 104,
                use: (t, e, n, a, s) => !0
            };
        }
        );
    }
    , logic = {};

generate$2(logic);
generate$1(logic);
generate(logic);
generate$5(logic);

class CoreItem {
    constructor(t) {
        this.dbid = t,
            this.stats = new Map,
            this.dirty = !0;
    }
    hydrate(t) {
        if (this.dirty = !1,
            this.bound = t.bound,
            this.type = t.type,
            this.tier = t.tier,
            this.logic = logic[this.type + this.tier],
            this.auction = t.auction ? new Date(t.auction) : void 0,
            this.auctionprice = t.auctionprice,
            this.owner = t.name,
            this.stash = t.stash ? new Date(t.stash) : void 0,
            void 0 === this.logic)
            throw "Unknown item " + t.type + t.tier;
        if (this.upgrade = t.upgrade,
            this.stats.clear(),
            t.rolls) {
            if (this.setRolls(t.rolls),
                this.quality = this.nextRoll(),
                this.logic.stats) {
                this.logic.stats.forEach((t, e) => {
                    this.stats.set(e, {
                        type: "base",
                        qual: this.quality,
                        value: Math.floor(t.min + (t.max - t.min) * (this.quality / 100) ** 2 + upgradeGains[e] * this.upgrade)
                    });
                }
                );
                const t = Math.min(4, Math.round((this.quality / 100) ** 1.5 * 3.6));
                for (let e = 0; e < t; ++e) {
                    let t = this.nextRoll()
                        , e = -1;
                    for (; -1 === e || this.stats.has(e);)
                        e = parseInt(rndArrayFixed(randomStatKeys, t / 101)),
                            t = (t + 5) % 100;
                    const n = (this.nextRoll() + this.quality) / 2;
                    this.stats.set(e, {
                        type: "bonus",
                        qual: n,
                        value: Math.ceil(Math.max((randomStats[e].min + (randomStats[e].max - randomStats[e].min) * (n / 100) ** 2) * this.logic.level * types[this.type].weight, upgradeGains[e]) + upgradeGains[e] * this.upgrade)
                    });
                }
            }
            this.quality = this.logic.quality || this.quality,
                this.stacks = void 0;
        } else
            this.stacks = t.stacks,
                this.quality = this.logic.quality || 0;
        this.gs = 0,
            this.logic.gs ? this.gs = this.logic.gs : this.stats.forEach((t, e) => {
                if (17 === e)
                    return;
                let n = t.value / upgradeGains[e];
                "shield" == this.type && "base" == t.type && (n *= .5),
                    "orb" == this.type && "base" == t.type && (n *= .7),
                    this.gs += n;
            }
            ),
            this.gs = Math.round(this.gs);
    }
    setRolls(t) {
        this.rolls = t,
            this.currentRoll = 0;
    }
    nextRoll() {
        if (this.currentRoll == this.rolls.length)
            throw "roll maximum reached";
        return this.rolls[this.currentRoll++]
    }
    use(t) {
        this.logic.use && this.logic.use(t);
    }
    storeValue() {
        return this.logic.storeValue || 0
    }
    medalValue() {
        return this.logic.medalValue || 0
    }
    canEquip(t) {
        return canEquip(t.level, t.skills.skillIdsActive, t.skills.skillIdsLearned, t.class, this.type, this.tier)
    }
    canEquipClass(t) {
        return canEquipClass(t.class, this.type, this.tier)
    }
    equipReasons(t) {
        const e = [];
        return this.logic.level && e.push(["Lv. " + this.logic.level, !0]),
            e
    }
    canBeDropped() {
        return !types[this.type].undroppable && !this.bound
    }
    canBeTraded() {
        return !this.bound
    }
    canBeSold() {
        return !this.logic.unsellable
    }
    getStashTime() {
        return this.dirty ? 0 : void 0 !== this.stash ? this.stash.getTime() : 0
    }
    getEquipSlot() {
        return void 0 !== types[this.type].slot ? types[this.type].slot[0] : void 0
    }
}

const getItem = async (ids, itemUpgradeTable = [], keepBaseUpgrade = false) => {
    let data = { ids: ids };
    let items = [];

    items = await apiManager.request("hordes.item.get", data);
    const newItems = [];
    if (!items["fail"]) {
        for (let i = 0; i < items.length; i++) {
            let coreItem = new CoreItem(items[i]["id"]);

            if (itemUpgradeTable[items[i]["id"]] !== undefined && itemUpgradeTable[items[i]["id"]] !== "") {
                items[i].upgrade = itemUpgradeTable[items[i]["id"]];
            }

            coreItem.hydrate(items[i]);

            const { stats, quality, gs, upgrade, bound, type, tier, dbid } = coreItem;
            const level = coreItem.logic.level;

            let verbose_stats = {};
            for (let [key, val] of stats) {
                verbose_stats[statObj[key]] = val;

                if (statObj[key] === "Critical" || statObj[key] === "Haste" || statObj[key] === "Block") {
                    verbose_stats[statObj[key]]["value"] /= 10;
                    verbose_stats[statObj[key]]["value"] += "%";
                    continue;
                }

                if (statObj[key] === "MP Reg./5s" || statObj[key] === "HP Reg./5s") {
                    verbose_stats[statObj[key]]["value"] /= 10;
                    continue;
                }

                if (statObj[key] === "Item Find") {
                    verbose_stats[statObj[key]]["value"] += "%";
                    continue;
                }
            }

            let newItem = {
                stats: verbose_stats,
                quality: quality,
                gs: gs,
                upgrade: upgrade,
                bound: bound,
                type: type,
                tier: tier,
                id: dbid,
                level: level,
            };

            newItems.push(newItem);
        }
    }

    return newItems;
};
const getHydratedItems = (rawItems) => {
    const newItems = [];
    for (let item of rawItems) {
        const hydratedItem = getHydratedItem(item);
        if(hydratedItem) {
            newItems.push(hydratedItem);
        }
    }
    return newItems
};
const getHydratedItem = (rawItem) => {
    try {
        let coreItem = new CoreItem(rawItem["id"]);

        coreItem.hydrate(rawItem);

        const { stats, quality, gs, upgrade, bound, type, tier, dbid } = coreItem;
        const level = coreItem.logic.level;

        let verbose_stats = {};

        for (let [key, val] of stats) {
            verbose_stats[statObj[key]] = val;

            if (statObj[key] === "Critical" || statObj[key] === "Haste" || statObj[key] === "Block") {
                verbose_stats[statObj[key]]["value"] /= 10;
                verbose_stats[statObj[key]]["value"] += "%";
                continue;
            }

            if (statObj[key] === "MP Reg./5s" || statObj[key] === "HP Reg./5s") {
                verbose_stats[statObj[key]]["value"] /= 10;
                continue;
            }

            if (statObj[key] === "Item Find") {
                verbose_stats[statObj[key]]["value"] += "%";
                continue;
            }
        }

        let newItem = {
            stats: verbose_stats,
            quality: quality,
            gs: gs,
            upgrade: upgrade,
            bound: bound,
            type: type,
            tier: tier,
            id: dbid,
            level: level,
        };

        return newItem
    } catch {
        return null
    }
};
const colorObj = {
    "common": "grey",
    "uncommon": "green",
    "rare": "blue",
    "epic": "purp",
    "legendary": "orange",
    "mythical": "red"
};

const getRarityOfItem = (percent) => {
    if (percent <= 50) return "common"
    if (percent <= 69) return "uncommon"
    if (percent <= 89) return "rare"
    if (percent <= 98) return "epic"
    if (percent <= 109) return "legendary"
    return "mythical"
};

const getTextColor = (percent) => {
    let rarity = getRarityOfItem(percent);
    return colorObj[rarity]
};

function getItemUI(itemElement) {
    try {
        const statsElements = itemElement.querySelectorAll('.pack.svelte-e3ao5j:nth-child(2) > div');
        // Extracting relevant information from the HTML element
        const titleElement = itemElement.querySelector('.slottitle');
        const title = titleElement.textContent.trim();
        const quality = itemElement.querySelector('.type').textContent.trim().split(' ')[2].toLowerCase();
        const upgradeMatch = title.match(/\+(\d+)/);
        const upgrade = upgradeMatch ? parseInt(upgradeMatch[1], 10) : 0;
        const type = itemElement.querySelector('.type').textContent.trim().split(' ')[1].toLowerCase();
        const gs = parseInt(itemElement.querySelector('.textgreen').textContent.match(/\d+/)[0], 10);
        const id = parseInt(itemElement.querySelector('.textgrey').textContent.match(/\d+/)[0], 10);
        const level = parseInt(itemElement.querySelector('.textgreen').textContent.match(/\d+/)[0], 10);

        // Parsing stats
        const stats = {};
        let bonusStatsStarted = false;
        statsElements.forEach((statElement) => {
            const statText = statElement.textContent.trim();
            let value, statName;
            if (statText.includes("+")) {
                bonusStatsStarted = true;
            }
            const statInfo = statText.split(" ");
            // console.log(statInfo)


            if (statText.includes("-")) {

                value = statInfo[0] + " " + statInfo[2];
                statName = statInfo.splice(3).join(" ");

            } else if (statText.includes("+")) {

                value = statInfo[1];
                statName = statInfo.splice(2).join(" ");

            } else {

                value = statInfo[0];
                statName = statInfo.splice(1).join(" ");

            }

            const type = bonusStatsStarted ? 'bonus' : 'base';

            // Extracting the numeric value of the stat
            if (bonusStatsStarted) {
                value = value.replace('+', '').trim();
            }
            if (value.includes("%")) {
                value = value.split("%")[0].trim();
            }

            stats[statName] = {
                type,
                qual: 0, // You need to replace this with the actual value
                value: value
            };
        });
        if (stats["Damage"]) {
            const min = stats["Damage"].value.split(" ")[0];
            const max = stats["Damage"].value.split(" ")[1];
            stats["Min Dmg."] = { type: stats["Damage"].type, qual: 0, value: min };
            stats["Max Dmg."] = { type: stats["Damage"].type, qual: 0, value: max };
            delete stats["Damage"];
        }
        // Parsing other information
        const description = itemElement.querySelector('.pack.description.svelte-e3ao5j').textContent.trim();
        const bound = 2; // You need to replace this with the actual value
        const tier = 4; // You need to replace this with the actual value

        // Constructing the item object
        const item = {
            stats,
            quality,
            gs,
            upgrade,
            bound,
            type,
            tier,
            id,
            level,
        };

        return item;
    }
    catch (e) {
        // console.log(e)
        return {}
    }
}

function generateItemDescription(item, left, top) {
    // Create the main container
    if (item) {
        const mainContainer = ui.mainContainer.element;
        let slotsContainer = document.querySelector('.slotsContainerKEK');
        if (!slotsContainer) {
            slotsContainer = document.createElement("div");
            slotsContainer.classList.add("slotsContainerKEK");
            slotsContainer.style.position = "absolute";
            slotsContainer.style.display = "grid";
            slotsContainer.style.gridTemplateColumns = "repeat(3, auto)";
            slotsContainer.style.top = "100px";
            slotsContainer.style.left = "100px";
            if (left) {
                slotsContainer.style.left = left + "px";
            }
            if (top) {
                slotsContainer.style.top = top + "px";
            }
            mainContainer.appendChild(slotsContainer);

        }
        const windowPanel = document.createElement("div");
        windowPanel.className = "window panel-black";
        windowPanel.style.padding = "1px";

        const slotContainer = document.createElement('div');
        slotContainer.className = 'slot';

        // Create the slotdescription div
        const slotDescription = document.createElement('div');
        slotDescription.style.width = "220px";
        slotDescription.style.height = "270px";
        slotDescription.className = 'border panel-black ' + getTextColor(item.quality);

        slotContainer.appendChild(slotDescription);
        windowPanel.appendChild(slotContainer);
        // Create and set the content for various elements
        const container = document.createElement('div');
        container.className = 'container';
        container.style.padding = "10px";
        slotDescription.appendChild(container);

        const pack1 = document.createElement('div');
        pack1.className = 'pack';
        container.appendChild(pack1);

        const slottitle = document.createElement('div');
        slottitle.className = 'slottitle ' + "text" + getTextColor(item.quality);
        slottitle.textContent = 'T' + (parseInt(item.tier) + parseInt(1)) + " " + items[item.type][item.tier].name;

        const upgradeText = document.createElement('span');
        upgradeText.className = 'textprimary';
        if (item.upgrade != 0 && item.upgrade) {
            upgradeText.textContent = ' +' + item.upgrade;
            slottitle.appendChild(upgradeText);
        }

        pack1.appendChild(slottitle);

        const type = document.createElement('div');
        type.className = "type textwhite capitalize";
        type.textContent = getRarityOfItem(item.quality) + ' ' + item.type;
        const baseQuality = document.createElement('span');
        baseQuality.textContent = " " + item.quality + '%';
        type.appendChild(baseQuality);

        pack1.appendChild(type);

        const gsIDText = document.createElement('small');
        const gsSpan = document.createElement("span");
        gsSpan.className = "textgreen";
        gsSpan.textContent = "GS: " + item.gs + " ";
        const idSpan = document.createElement("span");
        idSpan.className = "textgrey";
        idSpan.textContent = "ID: " + item.id;


        gsSpan.appendChild(idSpan);
        if (item.bound == 2) {
            const CBText = document.createElement('span');
            CBText.className = 'textgreen';
            CBText.textContent = ' CB';
            gsSpan.appendChild(CBText);
        }
        gsIDText.appendChild(gsSpan);
        pack1.appendChild(gsIDText);

        const pack2 = document.createElement('div');
        pack2.className = 'pack';
        container.appendChild(pack2);

        const statTexts = { "base": [], "bonus": [] };
        const stats = item.stats;
        for (let statName in stats) {
            const stat = stats[statName];
            const statText = document.createElement('div');
            statText.className = "text" + getTextColor(stat.qual);
            statText.textContent = stat.value + " " + statName;
            if (stat.type === "base") {
                statTexts["base"].push(statText);
            } else if (stat.type === "bonus") {
                statText.textContent = "+ " + statText.textContent + " " + stat.qual + "%";
                statTexts["bonus"].push(statText);
            }
        }

        for (let statType in statTexts) {
            let statTypeTexts = statTexts[statType];
            for (let statTypeText of statTypeTexts) {
                pack2.appendChild(statTypeText);
            }
        }


        const pack3 = document.createElement('div');
        pack3.className = 'pack';
        container.appendChild(pack3);

        const levelText = document.createElement('div');
        levelText.className = 'textgreen';
        levelText.textContent = 'Requires Lv. ' + item.level;
        pack3.appendChild(levelText);

        slotsContainer.appendChild(windowPanel);
        slotsContainer.style.zIndex = "10";

        // if (!document.querySelector(".copyitemBtnKEK")) {
        //     const copyBtn = document.createElement("div")
        //     copyBtn.className = "btn black textsecondary copyitemBtnKEK"
        //     copyBtn.textContent = "Copy"
        //     copyBtn.style.padding = "5px"
        //     copyBtn.style.top = "300px"
        //     copyBtn.style.position = "absolute"
        //     slotsContainer.append(copyBtn)
        //     slotsContainer.height = ""
        //     const widthToCapture = (parseInt(slotDescription.style.width.split("px")[0]) + 22) + "px"
        //     const heightToCapture = (parseInt(slotDescription.style.height.split("px")[0]) + 22) + "px"
        //     copyElementToClipboard(copyBtn, slotsContainer, heightToCapture, widthToCapture)
        // }
        return slotsContainer
    }
}

function generateCompareDescription(stat) {
    // Create the main container
    if (stat) {
        const mainUI = document.querySelector(".layout");
        let slotsContainer = document.querySelector('.slotsContainerKEK');
        if (!slotsContainer) {
            slotsContainer = document.createElement("div");
            slotsContainer.classList.add("slotsContainerKEK");
            slotsContainer.classList.add("l-ui");
            slotsContainer.style.position = "absolute";
            slotsContainer.style.display = 'flex';
            slotsContainer.style.top = "130px";
            slotsContainer.style.left = "120px";
            mainUI.appendChild(slotsContainer);
        }
        const slotContainer = document.createElement('div');
        slotContainer.className = 'slot';
        slotContainer.style.width = "230px";
        slotContainer.style.height = "290px";
        // Create the wrapper
        const wrapper = document.createElement('div');
        wrapper.className = 'wrapper';
        slotContainer.appendChild(wrapper);

        // Create the new_script_internal div
        const newScriptInternal = document.createElement('div');
        newScriptInternal.className = 'new_script_internal';
        wrapper.appendChild(newScriptInternal);

        // Create the slotdescription div
        const slotDescription = document.createElement('div');
        slotDescription.className = 'slotdescription svelte-18ojcpo border ' + getTextColor(stat.quality);
        slotDescription.style.width = "210px";
        slotDescription.style.opacity = "1";
        slotDescription.style.transition = 'opacity 1s ease-out';
        slotDescription.style.height = "270px";
        newScriptInternal.appendChild(slotDescription);

        // Create and set the content for various elements
        const container = document.createElement('div');
        container.className = 'container svelte-e3ao5j';
        container.style.padding = "1vh";
        slotDescription.appendChild(container);

        const pack1 = document.createElement('div');
        pack1.className = 'pack svelte-e3ao5j';
        container.appendChild(pack1);

        const slottitle = document.createElement('div');
        slottitle.className = 'slottitle svelte-e3ao5j ' + "text" + getTextColor(stat.quality);
        slottitle.textContent = "Stat Compare";

        pack1.appendChild(slottitle);

        const type = document.createElement('div');
        type.className = 'type svelte-e3ao5j ' + "textwhite";
        type.textContent = stat.type;

        pack1.appendChild(type);

        const pack2 = document.createElement('div');
        pack2.className = 'pack svelte-e3ao5j';
        container.appendChild(pack2);

        const statTexts = { "positive": [], "negative": [] };
        const ignoreStatList = ["quality", "type", "Strength", "Stamina", "Dexterity", "Intelligence", "Wisdom", "Luck"];
        for (let statName in stat) {
            if (ignoreStatList.includes(statName)) {
                continue;
            }
            let statVal = stat[statName];
            statVal = statVal.toFixed(2);
            const statText = document.createElement('div');
            statText.className = 'svelte-e3ao5j ';

            if (statVal > 0) {
                statText.textContent = statVal + " " + statName;
                statText.className += "textgreen";
                statText.textContent = "+ " + statText.textContent;
                statTexts["positive"].push(statText);
            } else if (statVal < 0) {
                statVal = statVal * (-1);
                statText.textContent = statVal + " " + statName;
                statText.className += "textred";
                statText.textContent = "- " + statText.textContent;
                statTexts["negative"].push(statText);
            }
        }
        for (let statType in statTexts) {
            let statTypeTexts = statTexts[statType];
            for (let statTypeText of statTypeTexts) {
                pack2.appendChild(statTypeText);
            }
        }

        const pack3 = document.createElement('div');
        pack3.className = 'pack svelte-e3ao5j';
        container.appendChild(pack3);

        slotsContainer.appendChild(slotContainer);
        slotDescription.style.pointerEvents = 'auto';
        slotDescription.style.zIndex = "20";
        return slotContainer
    }
}

function generateItemsDescription(items) {
    let slotContainer = null;
    for (let item of items) {
        slotContainer = generateItemDescription(item);
    }
    return slotContainer
}

function compareItems(item1, item2) {
    if (item1.type !== item2.type) {
        return -1
    }
    const stats = {
        "HP": 0,
        "HP Reg./5s": 0,
        "MP": 0,
        "MP Reg./5s": 0,
        "Defense": 0,
        "Block": 0,
        "Min Dmg": 0,
        "Max Dmg": 0,
        "Atk Spd": 0,
        "Critical": 0,
        "Haste": 0,
        "Move Spd": 0,
        "Bag Slots": 0,
        "Item Find": 0,
        "Gear Score": 0,
        "Strength": 0,
        "Stamina": 0,
        "Dexterity": 0,
        "Intelligence": 0,
        "Wisdom": 0,
        "Luck": 0,
        "Move Spd": 0,
        "quality": 110,
        "type": item1.type
    };
    const statConversionTable = {
        "Strength": { "HP": 2, "HP Reg./5s": 0.03 },
        "Stamina": { "Defense": 1, "HP": 4 },
        "Dexterity": { "Critical": 0.05 },
        "Intelligence": { "MP": 0.8, "Critical": 0.04 },
        "Wisdom": { "MP": 0.8, "Haste": 0.03 },
        "Luck": { "Critical": 0.02, "Item Find": 0.5 }
    };
    const classStat = {
        0: "Strength",
        1: "Intelligence",
        2: "Dexterity",
        3: "Wisdom"
    };
    const bloodlineStatTable = {
        0: { "Min Dmg": 0.3, "Max Dmg": 0.3, "HP Reg./5s": 0.3 },
        1: { "Min Dmg": 0.4, "Max Dmg": 0.4 },
        2: { "Min Dmg": 0.4, "Max Dmg": 0.4 },
        3: { "Min Dmg": 0.4, "Max Dmg": 0.4 },
    };
    const ufplayer = document.querySelector("#ufplayer");
    const imgUrl = ufplayer.querySelector("img").src;
    const playerClass = getClass(imgUrl);
    const bloodlineStat = classStat[playerClass];
    let bloodlineStatBonus = bloodlineStatTable[playerClass];

    for (let stat in bloodlineStatBonus) {
        if (!statConversionTable[bloodlineStat][stat]) {
            statConversionTable[bloodlineStat][stat] = bloodlineStatBonus[stat];
        } else {
            statConversionTable[bloodlineStat][stat] += bloodlineStatBonus[stat];
        }
    }
    function makeStatsNegative(item) {
        if (item.isNegative) {
            return item
        }
        let itemStats = item["stats"];
        for (let statName in itemStats) {
            let statVal = itemStats[statName]["value"];
            if (statName === "Haste" || statName === "Critical" || statName === "Item Find" || statName === "Block") {
                statVal = Number(itemStats[statName]["value"].split("%")[0]);
                itemStats[statName]["value"] = statVal * (-1) + "%";
            } else {
                itemStats[statName]["value"] = statVal * (-1);
            }
        }
        item["gs"] = item["gs"] * (-1);
        item["isNegative"] = true;
        return item
    }
    item1 = makeStatsNegative(item1);
    // console.log(item1, item2)
    for (let item of [item1, item2]) {
        let itemStats = item["stats"];
        for (let statName in itemStats) {
            let statVal = itemStats[statName]["value"];
            if (statName === "Haste" || statName === "Critical" || statName === "Item Find" || statName === "Block") {
                statVal = Number(itemStats[statName]["value"].split("%")[0]);
            }
            if (!stats[statName]) {
                stats[statName] = statVal;
            } else {
                stats[statName] += statVal;
            }
        }
        stats["Gear Score"] += item["gs"];
    }

    for (let statName in statConversionTable) {
        const bonusStats = statConversionTable[statName];
        for (let bonusStatName in bonusStats) {
            stats[bonusStatName] += bonusStats[bonusStatName] * stats[statName];
        }
    }
    // console.log(stats)
    const slotContainer = generateItemsDescription([item1, item2]);
    generateCompareDescription(stats);
    return slotContainer
}

const parseAuxi = (str) => {
    let isMatch = false;
    const regex = /(\d{8,})[a-zA-z' \n]*\s*(\+\d{1,2})?/g;
    const ids = [];
    const itemUpgradeTable = {};
    for (let match of str.matchAll(regex)) {
        isMatch = true;
        const id = match[1];
        ids.push(id);

        let itemUpgradeValue;
        // console.log(match[2])
        if (match[2] === undefined) {
            itemUpgradeValue = match[2];
        } else {
            itemUpgradeValue = match[2].split("+")[1];
        }
        itemUpgradeTable[id] = itemUpgradeValue;
    }
    return {
        ids, itemUpgradeTable, isMatch
    }
};

const statObj = ['Strength', 'Stamina', 'Dexterity', 'Intelligence', 'Wisdom', 'Luck', 'HP', 'MP', 'HP Reg./5s', 'MP Reg./5s', 'Min Dmg', 'Max Dmg', 'Defense', 'Block', 'Critical', 'Move Spd', 'Haste', 'Atk Spd', 'Item Find', 'Bag Slots', 'Fame', 'Rating', 'Stat Points', 'Skill Points', 'Skill Points (Max)', 'Gear Score', 'PvP Level', '% Increased Dmg.', '% Increased Aggro Generation', '% Movement Spd. Reduction', 'Healing Reduction'];

const itemSharing = {
    name: "Item Sharing",
    _generatedSlotContainer: null,
    currentArticle: null,
    start() {
        eventManager.on("ui.chatArticle", this.handleChatArticle, this);
        eventManager.on("ui.chatPanel", this.handleChat, this);
        eventManager.on("ui.itemParent", this.hideItemWindow, this);
        document.addEventListener("click", this.documentHandler.bind(this));
    },
    stop() {
        eventManager.off("ui.chatArticle", this.handleChatArticle, this);
        eventManager.off("ui.chatPanel", this.handleChat, this);
        eventManager.off("ui.itemParent", this.hideItemWindow, this);
    },
    documentHandler(event) {
        if (event.target.classList.contains("svgicon")) {
            event.stopPropagation();
            return
        }

        if (this._generatedSlotContainer) {
            this._generatedSlotContainer.remove();
            this._generatedSlotContainer = null;
            this.currentArticle = null;
            document.removeEventListener("click", this.documentHandler.bind(this));
        }
    },
    linkHandle(e) {
        const target = e.target;
        if (target.tagName.toLowerCase() == 'span' &&
            (target.classList.contains("chatItem") ||
                target.classList.contains("textpurp-l") ||
                target.classList.contains("textprimary")
            )) {
            e.stopPropagation();
            e.preventDefault();
            if(!this.currentArticle) {
                this.currentArticle = target.closest("article");
            }
            if (ui.itemParent.element) {
                const itemParent = ui.itemParent.element;
                itemParent.children[0].children[0].lastChild.click();
            }

            if (this._generatedSlotContainer != null) {
                this._generatedSlotContainer.remove();
                this._generatedSlotContainer = null;
                
                if(this.currentArticle == target.closest("article")) {
                    this.currentArticle = null;
                    return
                } else {
                    this.currentArticle = target.closest("article");
                }
            }

            let parent = null;
            if (target.classList.contains("chatItem")) parent = target.parentNode;
            else parent = target.parentNode.parentNode;

            const chatItemSpans = parent.children;

            const rawItems = [];
            for (let chatItemSpan of chatItemSpans) {
                rawItems.push(chatItemSpan.item);
            }
            const hydratedItems = getHydratedItems(rawItems);
            this._generatedSlotContainer = generateItemsDescription(hydratedItems);
        }
    },
    handleChat(chatPanel) {
        chatPanel = chatPanel.element;
        Array.from(chatPanel.children).forEach(article => {
            this.handleChatArticle({element: article});
        });
        
        chatPanel.addEventListener("click", this.linkHandle.bind(this));
    },
    handleChatArticle(newArticle) {
        newArticle = newArticle.element;
        // Get the span with class "content" within the new article
        const contentSpan = newArticle.querySelector('.content');
        if (contentSpan) {
            // Get the sibling span
            const siblingSpan = contentSpan.nextElementSibling;
            if (siblingSpan) {
                const hasExclaimation = siblingSpan.textContent.includes('!');

                // Run parseAuxi function and get the result
                const parsedAuxi = parseAuxi$1(siblingSpan.textContent);
                // Modify the textContent of siblingSpan based on the result
                if (hasExclaimation) {
                    if (parsedAuxi.isMatch) {
                        siblingSpan.style.color = "white";
                        siblingSpan.style.pointerEvents = 'all';
                        siblingSpan.style.cursor = 'pointer';
                        let ids = parsedAuxi.ids;
                        const itemUpgradeTable = parsedAuxi.itemUpgradeTable;
                        // console.log(newItems)

                        siblingSpan.addEventListener('click', async () => {
                            // Run generateItemDescription function on mouseover
                            const newItems = await getItem(ids, itemUpgradeTable);

                            const slotsContainer = document.querySelector(".slotsContainerKEK");
                            if (slotsContainer) {
                                slotsContainer.remove();
                            }
                            if (newItems.length === 2) {
                                // console.log("compare is working")
                                this._generatedSlotContainer = compareItems(newItems[0], newItems[1]);
                            }
                        });
                    }
                }
            }
        }
    },

    hideItemWindow(itemParent) {
    }
};

const isbis = {
    name: "BIS Gear Identifier",
    description: "Scan and Identify Best-in-Slot gear",
    state: {
        rules: [
            ['Bloodline', 'Stamina', 'Critical', 'Haste'],
            ['Bloodline', 'Stamina', 'Max Dmg.', 'Haste'],
            ['Bloodline', 'Stamina', 'Min Dmg.', 'Haste'],
            ['Bloodline', 'Stamina', 'Min Dmg.', 'Critical'],
            ['Bloodline', 'Stamina', 'Max Dmg.', 'Critical'],
            ['Bloodline', 'Max Dmg.', 'Critical', 'Haste'],
            ['Bloodline', 'Min Dmg.', 'Critical', 'Haste'],
            ['Bloodline', 'Min Dmg.', 'Max Dmg.', 'Critical'],
            ['Bloodline', 'Min Dmg.', 'Max Dmg.', 'Haste'],
            ['Bloodline', 'Stamina', 'Defense', 'Critical'],
            ['Bloodline', 'Stamina', 'Defense', 'Haste'],
        ]
    },
    start() {
        eventManager.on("ui.bagParent", this.handleBag, this);
    },
    stop() {
        eventManager.off("ui.bagParent", this.handleBag, this);
    },
    isBis(item) {
        const rules = this.getRules();
        // console.log(item)
        if (JSON.stringify(item) == "{}") return false
        // Define the required bonus stats combinations for BiS

        if (item.type == "orb") {
            rules.push(["Defense", "Critical", "Haste", "Stamina"]);
            rules.push(["Defense", "Min Dmg.", "Haste", "Stamina"]);
            rules.push(["Defense", "Max Dmg.", "Haste", "Stamina"]);
            rules.push(["Defense", "Max Dmg.", "Critical", "Stamina"]);
            rules.push(["Defense", "Min Dmg.", "Critical", "Stamina"]);
            rules.push(["Stamina", "Max Dmg.", "Critical", "Haste"]);
            rules.push(["Stamina", "Min Dmg.", "Critical", "Haste"]);
            rules.push(["Min Dmg.", "Max Dmg.", "Critical", "Haste"]);
            rules.push(["Min Dmg.", "Max Dmg.", "Stamina", "Haste"]);
            rules.push(["Min Dmg.", "Max Dmg.", "Critical", "Stamina"]);
        }
        // Get the bonus stats from the item
        const bonusStats = Object.keys(item.stats)
            .filter(stat => item.stats[stat].type === 'bonus')
            .map(stat => stat.trim());

        // Check if any of the rules is satisfied by the item
        const isBiS = rules.some(rule => {
            return rule.every(requiredStat => {
                // For 'Bloodline', check if the item has any of 'Strength', 'Wisdom', 'Dexterity', or 'Intelligence'
                if (requiredStat === 'Bloodline') {
                    const bloodlineStats = ['Strength', 'Wisdom', 'Dexterity', 'Intelligence'];
                    return bloodlineStats.some(bloodlineStat => bonusStats.includes(bloodlineStat));
                }
                return bonusStats.includes(requiredStat);
            });
        });

        return isBiS;
    },

    saveRules(rules) {
        this.state.rules = rules;
    },

    getRules() {
        return this.state.rules
    },

    deleteRule(rule) {
        const rules = this.getRules();
        const ruleIndex = rules.findIndex(existingRule => JSON.stringify(existingRule) === JSON.stringify(rule));

        if (ruleIndex !== -1) {
            rules.splice(ruleIndex, 1);
            this.saveRules(rules);
        }
    },

    handleBag(bagMenuParent) {
        bagMenuParent = bagMenuParent.element;
        const mainSlot = bagMenuParent.querySelector(".slot");
        const slotContainer = mainSlot.querySelector(".slotcontainer");

        const btnContainer = document.createElement("div");
        btnContainer.classList.add("bagBtnContainerKEK");
        btnContainer.style.display = "flex";
        btnContainer.style.flexDirection = "row";

        const bisBtn = document.createElement("div");
        bisBtn.classList.add("btn", "black", "textsecondary");
        bisBtn.textContent = "Show Bis";

        bisBtn.addEventListener("click", () => {
            const slots = slotContainer.children;
            if (!slots) return
            if (bisBtn.textContent.toLowerCase() == "show bis") {
                bisBtn.textContent = "Hide Bis";

                for (let slot of slots) {
                    slot.dispatchEvent(new PointerEvent("pointerenter"));
                    setTimeout(() => {
                        const isbis = this.isBis(getItemUI(slot));
                        if (isbis) {
                            slot.classList.add("red");
                        }
                        slot.dispatchEvent(new PointerEvent("pointerleave"));
                    }, 50);
                }
            } else {
                bisBtn.textContent = "Show Bis";
                for (let slot of slots) {
                    slot.classList.remove("red");
                }
            }

        });

        const rulesBtn = document.createElement("div");
        rulesBtn.classList.add("btn", "black", "textsecondary");
        rulesBtn.textContent = "Rules";

        rulesBtn.style.flex = 1;
        bisBtn.style.flex = 1;
        bisBtn.style.textAlign = "center";
        rulesBtn.style.textAlign = "center";

        rulesBtn.addEventListener("click", () => {
            const existing = document.querySelector(".rulesContainerKEK");
            if (existing) {
                existing.remove();
                return
            }
            let ruleCounter = 4; // Start with all four dropdowns

            const createRuleDropdown = (options) => {
                const ruleDropdown = document.createElement('div');
                ruleDropdown.classList.add('ruleDropdownKEK');

                const select = document.createElement('select');
                select.classList.add("rulesSelectKEK");
                select.classList.add("black", "textsecondary");
                select.style.width = "110px";
                select.style.padding = "7px";
                select.style.background = "black";
                select.style.border = "1px solid black";
                // Create an initial placeholder option
                const placeholderOption = document.createElement('option');
                placeholderOption.value = "";
                placeholderOption.textContent = "Stat";
                placeholderOption.disabled = true;
                placeholderOption.selected = true;
                select.appendChild(placeholderOption);

                // Populate options based on the provided array
                options.forEach(option => {
                    const optionElement = document.createElement('option');
                    optionElement.classList.add("btn", "black", "textsecondary");
                    optionElement.value = option;
                    optionElement.textContent = option;
                    select.appendChild(optionElement);
                });


                // Add change event listener to disable selected option in other dropdowns
                select.addEventListener('change', () => {
                    disableSelectedOption();
                });

                ruleDropdown.appendChild(select);

                return ruleDropdown;
            };

            const disableSelectedOption = () => {
                const allDropdowns = document.querySelectorAll('.rulesSelectKEK');
                const selectedValues = Array.from(allDropdowns).map(dropdown => dropdown.value);

                // Iterate through all dropdowns
                allDropdowns.forEach(currentDropdown => {
                    // Iterate through the options in the current dropdown (exclude placeholder)
                    for (let i = 1; i < currentDropdown.options.length; i++) {
                        const option = currentDropdown.options[i];

                        // Enable the option if it's not in the selectedValues array, disable otherwise
                        option.disabled = selectedValues.includes(option.value);
                    }
                });
            };

            const updateRuleListContainer = () => {
                const ruleListContainer = document.querySelector('.ruleListContainerKEK');
                // console.log(ruleListContainer)
                if (!ruleListContainer) return;

                const rules = this.getRules();
                // Clear the existing content
                ruleListContainer.innerHTML = "";

                // Iterate through each rule and create a flex container for it
                rules.forEach((rule, index) => {
                    const ruleContainer = document.createElement('div');
                    ruleContainer.classList.add('ruleFlexContainerKEK');
                    ruleContainer.style.display = "flex";
                    ruleContainer.style.flexDirection = "row";

                    // Add each stat as a separate div
                    rule.forEach(stat => {
                        const statDiv = document.createElement('div');
                        statDiv.textContent = stat;
                        statDiv.style.flex = 1;
                        statDiv.classList.add('ruleStatItemKEK', "btn", "black", "textsecondary", "border");
                        statDiv.style.borderRadius = "0";
                        ruleContainer.appendChild(statDiv);
                    });

                    // Add delete button
                    const deleteBtn = document.createElement('div');
                    deleteBtn.textContent = '🗑';
                    deleteBtn.classList.add('btn', 'black', 'textsecondary', 'border');
                    deleteBtn.style.borderRadius = "0";
                    deleteBtn.addEventListener('click', () => {
                        this.deleteRule(rule);
                        updateRuleListContainer(); // Refresh the rule list after deletion
                    });
                    ruleContainer.appendChild(deleteBtn);

                    // Add the rule container to the rule list container
                    ruleListContainer.appendChild(ruleContainer);
                });
            };

            const rulesContainer = document.createElement('div');
            rulesContainer.classList.add("rulesContainerKEK");
            rulesContainer.style.position = "absolute";

            // Create a container for rule dropdowns
            const rulesDropdownContainer = document.createElement('div');
            rulesDropdownContainer.classList.add("rulesDropDownContainerKEK");
            rulesDropdownContainer.style.display = "flex";
            rulesDropdownContainer.style.flexDirection = "row";

            const rulesListContainer = document.createElement('div');
            rulesListContainer.classList.add("ruleListContainerKEK");

            const allStats = ['Bloodline', 'Stamina', "Defense", "Critical", "Haste", "Max Dmg.", "Min Dmg.", "Block", "Strength"];
            // Create all four rule dropdowns with initial options
            for (let i = 0; i < ruleCounter; i++) {
                const ruleDropdown = createRuleDropdown(allStats);
                rulesDropdownContainer.appendChild(ruleDropdown);
            }

            const plusBtn = document.createElement("div");
            plusBtn.textContent = "Add";
            plusBtn.style.padding = "5px";
            plusBtn.classList.add("btn", "black", "textsecondary");

            plusBtn.addEventListener("click", (e) => {
                e.stopPropagation();

                const selectedValues = Array.from(document.querySelectorAll('.rulesSelectKEK')).map(dropdown => dropdown.value);

                const newRule = selectedValues.filter(value => value !== ""); // Remove empty values

                if (newRule.length == 0) return

                // Add the new rule to localStorage and update the displayed rules
                const rules = this.getRules();
                rules.push(newRule);
                this.saveRules(rules);
                updateRuleListContainer();

                // Reset selected values to placeholder option
                document.querySelectorAll('.rulesSelectKEK').forEach(select => {
                    select.value = "";
                    const options = select.children;
                    for (let option of options) {
                        option.disabled = false;
                    }
                });
            });
            rulesDropdownContainer.appendChild(plusBtn);

            rulesContainer.appendChild(rulesDropdownContainer);
            rulesContainer.appendChild(rulesListContainer);

            // Append rulesContainer after the slotContainer's width is over
            const slotContainerRect = slotContainer.getBoundingClientRect();
            const rulesContainerLeft = slotContainerRect.width;

            rulesContainer.style.left = `${rulesContainerLeft + 20}px`;

            mainSlot.insertBefore(rulesContainer, mainSlot.firstChild);

            updateRuleListContainer();
        });

        btnContainer.appendChild(bisBtn);
        btnContainer.appendChild(rulesBtn);


        mainSlot.insertBefore(btnContainer, slotContainer);
    },

};

const statsSim = {
    name: "Stat Simulation",
    state: {
        statSimulatorOpened: "0",
        currentItemsInfo: {}
    },
    start() {
        this.state.currentItemsInfo = this.getCurrentItemsInfo();
        eventManager.on('ui.statsMenuParent', this.handleStatSimulation, this);
    },
    stop() {
        eventManager.off('ui.statsMenuParent', this.handleStatSimulation, this);
    },
    async fetchRank(buildScore, classId) {
        try {
            // console.log(endpointUrl)
            const response = await apiManager.request("kek.tierlist.rank", { classid: classId, build_score: buildScore });

            return response.rank;
        } catch (error) {
            console.error('Error fetching rank:', error.message);
            return '';// Return a default value or handle the error accordingly
        }
    },

        
    async getStats (items, player, ignoreCurrentGear) {
        // console.log(items)
        const playerClass = player.pclass;

        const battleRankPrestige = [4000, 8000, 12000, 16000, 20000, 24000, 28000, 32000, 36000, 40000, 44000, 48000];

        player.prestige = battleRankPrestige[battleRankPrestige.length - 1];

        const normalizeStat = (stat) => {
            stat = String(stat).split(".");
            // console.log(stat)

            if (stat[1]) {
                // console.log(stat[1] / 10 ** (stat[1].length - 1))
                if (stat[1] / 10 ** (stat[1].length - 1) <= 5) {
                    return Math.floor(Number(stat.join(".")))
                } else {
                    return Math.ceil(Number(stat.join(".")))
                }
            }
            return Number(stat.join("."))
        };

        let stats = {};

        if (ignoreCurrentGear == 1) {
            stats = {
                "HP": 100 + player.level * 8,
                "HP Reg./5s": 2,
                "MP": 100,
                "MP Reg./5s": 3,
                "Defense": 15,
                "Block": 0,
                "Min Dmg": 0,
                "Max Dmg": 0,
                "Atk Spd": 10,
                "Critical": 5.0,
                "Haste": 0,
                "Move Spd": 15,
                "Bag Slots": 0,
                "Item Find": 0.5,
                "Gear Score": 0,
                "Strength": 10,
                "Stamina": 12,
                "Dexterity": 10,
                "Intelligence": 10,
                "Wisdom": 10,
                "Luck": 5,
                "Move Spd": 105,
            };
        } else {
            stats = {
                "HP": 0,
                "HP Reg./5s": 0,
                "MP": 0,
                "MP Reg./5s": 0,
                "Defense": 0,
                "Block": 0,
                "Min Dmg": 0,
                "Max Dmg": 0,
                "Atk Spd": 0,
                "Critical": 0,
                "Haste": 0,
                "Move Spd": 0,
                "Bag Slots": 0,
                "Item Find": 0,
                "Gear Score": 0,
                "Strength": 0,
                "Stamina": 0,
                "Dexterity": 0,
                "Intelligence": 0,
                "Wisdom": 0,
                "Luck": 0,
                "Move Spd": 0,
            };
        }

        const statConversionTable = {
            "Strength": { "HP": 2, "HP Reg./5s": 0.03 },
            "Stamina": { "Defense": 1, "HP": 4 },
            "Dexterity": { "Critical": 0.05 },
            "Intelligence": { "MP": 0.8, "Critical": 0.04 },
            "Wisdom": { "MP": 0.8, "Haste": 0.03 },
            "Luck": { "Critical": 0.02, "Item Find": 0.5 }
        };

        const classStat = {
            0: "Strength",
            1: "Intelligence",
            2: "Dexterity",
            3: "Wisdom"
        };

        let bloodlineStat = classStat[playerClass];

        //stats based on level
        if (ignoreCurrentGear == 1) {
            stats[bloodlineStat] += 1 * player.level;
            stats["Stamina"] += 2 * (player.level - 1);
            stats[bloodlineStat] += player.level * 3;
        }

        const bloodlineStatTable = {
            0: { "Min Dmg": 0.3, "Max Dmg": 0.3, "HP Reg./5s": 0.3 },
            1: { "Min Dmg": 0.4, "Max Dmg": 0.4 },
            2: { "Min Dmg": 0.4, "Max Dmg": 0.4 },
            3: { "Min Dmg": 0.4, "Max Dmg": 0.4 },
        };
        const bloodlineStatBonus = bloodlineStatTable[playerClass];
        for (let stat in bloodlineStatBonus) {
            if (!statConversionTable[bloodlineStat][stat]) {
                statConversionTable[bloodlineStat][stat] = bloodlineStatBonus[stat];
            } else {
                statConversionTable[bloodlineStat][stat] += bloodlineStatBonus[stat];
            }
        }

        for (let item of items) {
            let itemStats = item["stats"];
            for (let statName in itemStats) {
                let statVal = itemStats[statName]["value"];
                if (statName === "Haste" || statName === "Critical" || statName === "Item Find" || statName === "Block") {
                    statVal = parseFloat(itemStats[statName]["value"].split("%")[0]);
                }
                if (!stats[statName]) {
                    stats[statName] = statVal;
                } else {
                    stats[statName] += statVal;
                }
            }
            stats["Gear Score"] += item["gs"];
        }

        //prestige stats
        if (ignoreCurrentGear == 1) {
            const prestigeBonusStats = {
                1: { "Move Spd": 5 },// 5 Movement Speed
                2: { "MP": 50 },// 50 MP
                3: { "Item Find": 15 },// 15% Item Find
                4: { "Min Dmg": 5, "Max Dmg": 5 },// 5 Min & Max Damage
                5: { "MP Reg./5s": 2, "HP Reg./5s": 2 },// 2 HP & MP Reg./5s
                6: { "Mov Spd": 5 },// 5 Movement Speed
                7: { "HP": 30 },// 30 HP
                8: { "Item Find": 15 },// 15% Item Find
                9: { "Critical": 5 },// 5% Critical
                10: { "Haste": 3 },// 3% Haste
                11: { "HP": 30 },// 30 HP
                12: { "Min Dmg": 5, "Max Dmg": 5 }, // 5 Min & Max Damage
            };
            function prestigeToBattleRank(prestige) {
                for (let i = 0; i < battleRankPrestige.length; i++) {
                    if (prestige < battleRankPrestige[i]) {
                        return i;
                    }
                }
                return battleRankPrestige.length;
            }
            let battleRank = prestigeToBattleRank(player.prestige);
            for (let i = 1; i <= battleRank; i++) {
                let prestigeBonusStat = prestigeBonusStats[i];
                for (let stat in prestigeBonusStat) {
                    if (!stats[stat]) {
                        stats[stat] = prestigeBonusStat[stat];
                    } else {
                        stats[stat] += prestigeBonusStat[stat];
                    }
                }
            }
        }

        for (let statName in statConversionTable) {
            const bonusStats = statConversionTable[statName];
            for (let bonusStatName in bonusStats) {
                stats[bonusStatName] += bonusStats[bonusStatName] * stats[statName];
            }
        }

        for (let statName in stats) {
            if (String(stats[statName]).split(".")[1]) {
                const len = String(stats[statName]).split(".")[1].length;
                if (len > 3) stats[statName] = parseFloat(stats[statName].toFixed(2));
            }
        }

        const itemSlots = {
            "hammer": "weapon",
            "bow": "weapon",
            "staff": "weapon",
            "sword": "weapon",
            "armlet": "armlet",
            "armor": "armor",
            "bag": "bag",
            "boot": "boot",
            "glove": "glove",
            "ring": "ring",
            "amulet": "amulet",
            "quiver": "offhand",
            "shield": "offhand",
            "totem": "offhand",
            "orb": "offhand"
        };


        const itemsInfo = {};
        //calculations
        for (let item of items) {

            let quality = item.quality;
            let type = item.type;
            item.tier;
            let upgrade = item.upgrade;
            const itemInfo = { type: itemSlots[type], quality: quality, id: item.id, upgrade: upgrade, item: item };
            if (itemSlots[type]) {
                itemsInfo[itemSlots[type]] = itemInfo;
            }
            stats["Max Dmg"] = normalizeStat(stats["Max Dmg"]);
            stats["Min Dmg"] = normalizeStat(stats["Min Dmg"]);
            stats["Item Find"] = Math.round(stats["Item Find"]);
            stats["Critical"] = Math.round(10 * stats["Critical"]) / 10;
            stats["Haste"] = Math.round(10 * stats["Haste"]) / 10;
        }
        let min = stats["Min Dmg"];
        let max = stats["Max Dmg"];
        let crit = stats["Critical"];
        let haste = stats["Haste"];
        let hp = stats["HP"];
        let defense = stats["Defense"];
        let block = stats["Block"];

        let eHP = Math.round(hp / ((1 - ((1 - Math.exp(-defense * 0.0022)) * 0.87)) * (1 - (block / 100) * 0.45)));
        let eDps = Math.round(((min - Math.max(0, min - max) + max) / 2) * (1 + crit / 100) * (1 + haste / 100));
        let eBurst = Math.round(((min - Math.max(0, min - max) + max) / 2) * (1 + crit / 100));
        if (playerClass == 1) {
            eBurst = Math.round(((min - Math.max(0, min - max) + max) / 2) * (((1 + crit / 100) * 0.8) + ((1 + haste / 100) * 0.3)));
        }
        if (playerClass == 0) {
            eHP = Math.round(hp / ((1 - ((1 - Math.exp(-defense * 0.0022)) * 0.87)) * (1 - (block / 100) * 0.6)));
        }
        stats["eHP"] = eHP;
        stats["eDps"] = eDps;
        stats["eBurst"] = eBurst;
        //lowercasing keys of stats
        for (let statName in stats) {
            stats[statName.toLowerCase()] = stats[statName];
            delete stats[statName];
        }
        // console.log(stats)
    
        let buildScore = this.getBuildScore(stats, playerClass);
        stats["build score"] = buildScore;

        return { stats, itemsInfo }
    },

    calculateDmgReduction(defense, block) {
        return ((1 - Math.exp(-defense * 0.0022)) * 0.87) + ((block / 100) * 0.6);
    },

    calculateHPValue(defense, block) {
        const baseScore = 1 / (1 - (1 - (1 - (1 - Math.exp(defense * -0.0022)) * 0.87) * (1 - (block / 100) * 0.45)));
        return baseScore
    },

    calculateDpsScore(edps, eburst, ehp, playerClass) {
        if (playerClass == 0) {
            return (Math.log2(edps)
                + Math.log2(eburst)
                + (Math.log(ehp) / Math.log(5))
            ) / 3;
        }
        if (playerClass == 1) {
            return Math.log((eburst + edps) / 2) / Math.log(2);
        }
        if (playerClass == 2) {
            return (Math.log(edps) / Math.log(2) + Math.log(eburst) / Math.log(2)) / 2;
        }
        if (playerClass == 3) {
            return (Math.log2(edps)
                + Math.log2(eburst)
                + Math.log10(ehp)
            ) / 3;
        }
    },

    calculateTankScore(edps, eburst, ehp, haste, defense, block, playerClass) {
        const hpvalue = this.calculateHPValue(defense, block);
        const dmgRed = this.calculateDmgReduction(defense, block);

        if (playerClass == 0) {
            return (Math.log2(ehp) + Math.log2(dmgRed * 100) + Math.log(haste) / Math.log(6)) / 3;
        }
        if (playerClass == 1) {
            return (Math.log(ehp) / Math.log(2.5) + Math.log(eburst) / Math.log(6) + Math.log(edps) / Math.log(6)) / 3;
        }
        if (playerClass == 2) {
            return (Math.log(ehp) / Math.log(2.5) + Math.log(eburst) / Math.log(6) + Math.log(edps) / Math.log(6)) / 3;
        }
        if (playerClass == 3) {
            return (Math.log10(edps)
                + (Math.log(eburst) / Math.log(11))
                + (Math.log2(ehp))
                + (Math.log(hpvalue * 60) / Math.log(7))
                + (Math.log(haste * 8) / Math.log(16))
            ) / 5;
        }
    },

    calculateHybridScore(edps, eburst, ehp, haste, defense, block, playerClass) {
        const hpvalue = this.calculateHPValue(defense, block);
        const dmgRed = this.calculateDmgReduction(defense, block);

        if (playerClass == 0) {
            return (Math.log(edps) / Math.log(4) + Math.log(eburst) / Math.log(5) + Math.log(ehp) / Math.log(5) + Math.log(dmgRed * 100) / Math.log(5)) / 4;
        }
        if (playerClass == 1) {
            return (Math.log(ehp) / Math.log(5) + Math.log(eburst) / Math.log(5) + Math.log(edps) / Math.log(4)) / 3;
        }
        if (playerClass == 2) {
            return (Math.log(ehp) / Math.log(5) + Math.log(eburst) / Math.log(5) + Math.log(edps) / Math.log(4)) / 3;
        }
        if (playerClass == 3) {
            return ((Math.log(edps) / Math.log(3))
                + (Math.log(eburst) / Math.log(4))
                + (Math.log(ehp) / Math.log(6))
                + (Math.log(hpvalue * 50) / Math.log(9))
                + (Math.log(haste * 8) / Math.log(10))
            ) / 5;
        }
    },

    getBuildScore(stats, playerClass) {
        // console.log(stats, playerClass)
        const ehp = stats.ehp;
        const edps = stats.edps;
        const eburst = stats.eburst;
        const defense = stats.defense;
        const block = stats.block;
        const haste = stats.haste;
        // console.log(stats, playerClass)
        // Calculate DPS score (K)
        const dpsScore = this.calculateDpsScore(edps, eburst, ehp, playerClass);
        // Calculate Tank score (L)
        const tankScore = this.calculateTankScore(edps, eburst, ehp, haste, defense, block, playerClass);
        // Calculate Hybrid score (M)
        const hybridScore = this.calculateHybridScore(edps, eburst, ehp, haste, defense, block, playerClass);

        // Calculate Build score

        let buildScore = 0;

        if (playerClass == 0) {
            buildScore = ((dpsScore + tankScore / 3 + hybridScore) * 210) / 3;
        }
        if (playerClass == 1) {
            buildScore = ((dpsScore / 3) + tankScore + hybridScore) * 225 / 3;
        }
        if (playerClass == 2) {
            buildScore = ((dpsScore / 3) + tankScore + hybridScore) * 226 / 3;
        }
        if (playerClass == 3) {
            buildScore = ((dpsScore / 1.75) + tankScore + hybridScore) * 235 / 3;
        }

        // console.log(dpsScore, tankScore, hybridScore, buildScore)

        return parseFloat((buildScore).toFixed(3));
    },

    createStatElement(statCol, statName, statValue, extraClass) {
        const statLabel = document.createElement('span');
        statLabel.textContent = statName;
        statLabel.classList.add(extraClass);
        statCol.appendChild(statLabel);

        const statNumber = document.createElement('span');
        statNumber.className = 'statnumber';
        statNumber.textContent = statValue;
        if (!extraClass) {
            statNumber.classList.add("textgold");
            statCol.appendChild(statNumber);
        } else {
            statNumber.classList.add("textpurp");
            const spanContainer = document.createElement("span");
            spanContainer.appendChild(statNumber);
            spanContainer.classList.add(extraClass);
            statCol.appendChild(spanContainer);
        }
        return [statLabel, statNumber];
    },

    handleSimulationUI(charSheetContainer, player) {
        // Function to handle input changes for "Auxi"
        const handleAuxiInput = (inputElement) => {
            inputElement.style.overflow = "hidden";
            inputElement.classList.add("auxi-sim-input");
            inputElement.placeholder = "Auxi";
            inputElement.style.height = "40px";
            inputElement.style.width = "94%";

            inputElement.style.marginLeft = "8px";

            // Add event listeners to handle scrolling
            inputElement.addEventListener('wheel', (event) => {
                // Adjust the scrollTop property based on your scrolling logic
                inputElement.scrollTop += event.deltaY;
            });
            inputElement.addEventListener("input", function (event) {
                const inputValue = event.target.value;

                // Dynamically adjust the height and width based on content
                const lines = inputValue.split('\n').length;
                inputElement.style.height = `${lines * 20 + 20}px`; // Adjust the height based on the number of lines
            });
        };
        if (charSheetContainer) {
            const existing = document.querySelector(".statSimulationKEK");
            if (existing) {
                existing.remove();
                return;
            }

            // console.log(player)

            // Set charSheetContainer display to flex
            charSheetContainer.style.display = "flex";

            // Create a window panel div
            const windowPanel = document.createElement("div");
            windowPanel.classList.add("window", "panel-black", "statSimulationKEK");
            // Create the title frame with "Stat Simulation" title
            const titleFrame = document.createElement("div");
            titleFrame.classList.add("titleframe");
            titleFrame.style.margin = "10px";
            const titleText = document.createElement("div");
            titleText.classList.add("textprimary", "title");
            titleText.textContent = "Stat Simulation";

            titleFrame.appendChild(titleText);

            // Append the title frame to the window panel
            windowPanel.appendChild(titleFrame);

            // Create a slot div with flex grid
            const slotDiv = document.createElement("div");
            slotDiv.classList.add("slot", "panel-black");
            slotDiv.style.display = "grid";
            slotDiv.style.gridTemplateColumns = "repeat(2, auto)";

            // Create 10 inputs (1 for placeholder Auxi and 9 for stats)
            const inputs = ["Weapon", "Armlet", "Armor", "Bag", "Boot", "Glove", "Ring", "Amulet", "Offhand"];
            const auxiInput = document.createElement("textarea");
            handleAuxiInput(auxiInput);

            windowPanel.appendChild(auxiInput);

            inputs.forEach(input => {
                let inputElement;
                inputElement = document.createElement("input");
                inputElement.setAttribute("type", "text");

                inputElement.setAttribute("placeholder", input);
                inputElement.classList.add("stat-sim-input");
                inputElement.style.width = "120px";
                inputElement.style.margin = "3px";
                inputElement.classList.add(`${input.toLowerCase()}KEK`);

                const inputWrapper = document.createElement("div");
                inputWrapper.style.position = "relative";
                inputWrapper.style.display = "inline-block";

                // Create overlay for the input
                const overlay = document.createElement("div");
                overlay.classList.add("btn", "black", "textsecondary", "stat-sim-overlay");
                overlay.textContent = inputElement.placeholder;

                // Set overlay position on top of the input
                overlay.style.position = "absolute";
                overlay.style.top = "0";
                overlay.style.left = "0";
                overlay.style.pointerEvents = "none"; // Disable pointer events on the overlay
                overlay.style.width = "120px";
                overlay.style.boxSizing = "border-box"; // Ensure padding and border are included in the total width and height

                overlay.style.padding = "5px 8px";
                overlay.style.margin = "3px";

                // Add input event listener to restrict user input
                inputElement.addEventListener("input", function (event) {
                    if (input !== "Auxi") {
                        const inputValue = event.target.value;
                        const sanitizedValue = inputValue.replace(/[^0-9+]/g, "");
                        event.target.value = sanitizedValue;
                    }
                });

                // Add event listeners to handle overlay visibility
                inputElement.addEventListener("mouseenter", () => {
                    overlay.style.opacity = "0";
                    if (this.state.currentItemsInfo.hasOwnProperty(input.toLowerCase())) {
                        const rect = inputElement.getBoundingClientRect();
                        const absoluteLeft = rect.left + 120;
                        const absoluteTop = rect.top;
                        const existingItemContainer = document.querySelector(".slotsContainerKEK");
                        if (existingItemContainer) {
                            existingItemContainer.remove();
                        }
                        const slotsContainer = generateItemDescription(this.state.currentItemsInfo[input.toLowerCase()].item, absoluteLeft, absoluteTop);
                        const copyBtnItem = slotsContainer.querySelector(".copyitemBtnKEK");
                        if (copyBtnItem) {
                            copyBtnItem.remove();
                        }
                    }
                });

                inputElement.addEventListener("mouseleave", () => {
                    // Check if the input is focused before changing the overlay's opacity
                    overlay.style.opacity = "1";
                    const existingItemContainer = document.querySelector(".slotsContainerKEK");
                    if (existingItemContainer) {
                        existingItemContainer.remove();
                    }
                });

                // Append the input and overlay to the wrapper div
                inputWrapper.appendChild(inputElement);
                inputWrapper.appendChild(overlay);

                input = input.toLowerCase();
                if (this.state.currentItemsInfo.hasOwnProperty(input)) {
                    const currentItemInfo = this.state.currentItemsInfo[input];
                    inputElement.value = currentItemInfo.id + `+${currentItemInfo.upgrade || 0}`;
                    const overlay = inputElement.nextElementSibling;
                    if (overlay) {
                        overlay.classList.add("text" + getTextColor(currentItemInfo.quality));
                    }
                }
                slotDiv.appendChild(inputWrapper);
            });

            // Create the Simulate button
            const simulateButton = document.createElement("button");
            simulateButton.textContent = "Simulate";
            simulateButton.classList.add("btn", "black", "textsecondary", "stat-sim-btn", "border");
            simulateButton.style.padding = "5px";
            simulateButton.style.fontSize = "90%";
            simulateButton.style.flex = 1;
            // Append the slotDiv to the window panel

            const buttonContainer = document.createElement("div");
            buttonContainer.style.padding = "5px";
            buttonContainer.style.margin = "2px";
            buttonContainer.style.display = "flex";
            // Add click event listener to handle the simulation
            simulateButton.addEventListener('click', async () => {
                simulateButton.classList.add('disabled');
                const charSheet = document.querySelector(".stats2");
                if (!charSheet) return;
                // Get the values of all inputs and combine them into a string
                const auxiInput = document.querySelector(".auxi-sim-input");

                const ignoreGearEle = document.querySelector(".ignoreCurrentGearKEK");
                // console.log(ignoreGearEle, ignoreGearEle.value, parseInt(ignoreGearEle))

                // Get the value of the "Ignore Current Gear" checkbox
                let ignoreCurrentGear = 1;
                let dontSimulate = false;
                if (ignoreGearEle) {
                    ignoreCurrentGear = ignoreGearEle.value || 1;
                }
                const originalStats = this.getStatsUI(charSheet);
                let newStats = {};
                if (auxiInput) {
                    if (auxiInput.value !== "") {
                        const parsedAuxi = parseAuxi(auxiInput.value);
                        const ids = parsedAuxi.ids;
                        const itemUpgradeTable = parsedAuxi.itemUpgradeTable;
                        const newItems = await getItem(ids, itemUpgradeTable);
                        const { stats, itemsInfo } = await this.getStats(newItems, player, ignoreCurrentGear);
                        newStats = stats;
                        this.state.currentItemsInfo = itemsInfo;
                        inputs.map(input => {
                            input = input.toLowerCase();
                            const inputElement = slotDiv.querySelector(`.${input.toLowerCase()}KEK`);
                            if (itemsInfo.hasOwnProperty(input)) {
                                const itemInfo = itemsInfo[input];
                                inputElement.value = itemInfo.id + `+${itemInfo.upgrade || 0}`;
                                const overlay = inputElement.nextElementSibling;
                                if (overlay) {
                                    overlay.className = "btn black textsecondary stat-sim-overlay";
                                    overlay.classList.add("text" + getTextColor(itemInfo.quality));
                                }
                            } else {
                                inputElement.value = "";
                                const overlay = inputElement.nextElementSibling;
                                if (overlay) {
                                    overlay.className = "btn black textsecondary overlay";
                                }
                            }
                        });
                        auxiInput.value = "";
                        auxiInput.style.height = "40px";
                        auxiInput.style.width = "94%";
                    }
                    else {
                        const allInputs = windowPanel.querySelectorAll(".stat-sim-input");
                        let inputsEmpty = true;
                        for (let input of allInputs) {
                            if (input.value !== "") {
                                inputsEmpty = false;
                                break
                            }
                        }
                        if (!inputsEmpty) {
                            const inputValues = inputs.map(input => {
                                const inputElement = slotDiv.querySelector(`.${input.toLowerCase()}KEK`);
                                return inputElement ? inputElement.value : '';
                            });
                            const combinedString = inputValues.join('\n').trim();
                            // Log the combined string and the value of the checkbox
                            // console.log({ "combinedString": parseAuxi(combinedString), ignoreCurrentGear , player});

                            const parsedAuxi = parseAuxi(combinedString);
                            const ids = parsedAuxi.ids;
                            const itemUpgradeTable = parsedAuxi.itemUpgradeTable;
                            const newItems = await getItem(ids, itemUpgradeTable);
                            const { stats, itemsInfo } = await this.getStats(newItems, player, ignoreCurrentGear);
                            newStats = stats;
                            this.state.currentItemsInfo = itemsInfo;
                            inputs.map(input => {
                                input = input.toLowerCase();
                                const inputElement = slotDiv.querySelector(`.${input.toLowerCase()}KEK`);
                                if (itemsInfo.hasOwnProperty(input)) {
                                    const itemInfo = itemsInfo[input];
                                    inputElement.value = itemInfo.id + `+${itemInfo.upgrade || 0}`;
                                    const overlay = inputElement.nextElementSibling;
                                    if (overlay) {
                                        overlay.className = "btn black textsecondary overlay";
                                        overlay.classList.add("text" + getTextColor(itemInfo.quality));
                                    }
                                } else {
                                    inputElement.value = "";
                                    const overlay = inputElement.nextElementSibling;
                                    if (overlay) {
                                        overlay.className = "btn black textsecondary overlay";
                                    }
                                }
                            });
                        }
                        else {
                            let fetchedAuxi = "";
                            const equipSlots = document.querySelector("#equipslots");
                            const itemSlots = equipSlots.children;
                            for (let itemSlot of itemSlots) {
                                itemSlot.dispatchEvent(new PointerEvent("pointerenter"));
                            }
                            setTimeout(() => {
                                const itemStats = [];

                                for (let itemSlot of itemSlots) {
                                    const item = getItemUI(itemSlot.querySelector(".slotdescription"));
                                    if (item.type !== "charm") {
                                        itemStats.push(item);
                                    }
                                    itemSlot.dispatchEvent(new PointerEvent("pointerleave"));
                                }
                                // console.log(itemStats)
                                for (let item of itemStats) {
                                    fetchedAuxi += `${item.type} ${item.quality}% ${item.id} +7\n`;
                                }
                                // console.log(fetchedAuxi)
                                auxiInput.value = fetchedAuxi;
                                auxiInput.dispatchEvent(new InputEvent('input', { bubbles: true }));
                                // simulateButton.click()
                            }, 100);
                            dontSimulate = true;
                            simulateButton.classList.remove('disabled');
                        }
                    }
                    if (dontSimulate) {
                        return
                    }
                    // console.log(newStats.ignoreCurrentGear)
                    let finalStats = {};
                    const ignoreGearEle = document.querySelector(".ignoreCurrentGearKEK");
                    if (ignoreGearEle) {
                        ignoreCurrentGear = ignoreGearEle.value || 1;
                    }
                    // console.log(ignoreCurrentGear, ignoreGearEle, ignoreGearEle.value)
                    newStats["gear score"] += 60;
                    if (ignoreCurrentGear == 1) {
                        finalStats = newStats;
                    } else {
                        finalStats = this.addStats(originalStats, newStats);
                    }
                    // console.log(currentItemsInfo)

                    // console.log(finalStats, originalStats, newStats)
                    this.setStatsUI(charSheet, finalStats);
                    simulateButton.classList.remove('disabled');

                    const playerClass = player.pclass;
                    const buildScore = finalStats["build score"];
                    const detailStatCol = charSheetContainer.querySelector(".statcol");
                    if (detailStatCol) {
                        const existingRankStats = detailStatCol.querySelectorAll(".rankStatKEK");
                        for (let e of existingRankStats) {
                            e.remove();
                        }
                        const rank = await this.fetchRank(buildScore, playerClass);
                        this.createStatElement(detailStatCol, "Rank", rank, "rankStatKEK");
                    }
                }
            });
            // Create a div for "Ignore Current Gear"
            const ignoreCurrentGearDiv = document.createElement("button");
            ignoreCurrentGearDiv.classList.add("btn", "textsecondary", "ignoreCurrentGearKEK", "black");
            ignoreCurrentGearDiv.textContent = "Ignoring Current Gear";
            ignoreCurrentGearDiv.style.padding = "5px";
            ignoreCurrentGearDiv.style.fontSize = "90%";
            ignoreCurrentGearDiv.style.flex = 2;
            // Add click event listener to toggle classes and update value
            ignoreCurrentGearDiv.addEventListener('click', () => {
                const isActive = ignoreCurrentGearDiv.classList.contains("black");
                if (!isActive) {
                    ignoreCurrentGearDiv.textContent = "Ignoring Current Gear";
                } else {
                    ignoreCurrentGearDiv.textContent = "Ignore Current Gear?";
                }
                // Toggle classes
                ignoreCurrentGearDiv.classList.toggle("black", !isActive);
                ignoreCurrentGearDiv.classList.toggle("grey", isActive);

                // Update the value of ignoreCurrentGear
                ignoreCurrentGearDiv.value = isActive ? 0 : 1;
                // console.log(ignoreCurrentGearDiv.value)
            });

            const clearBtn = document.createElement("div");
            clearBtn.classList.add("btn", "black", "textsecondary");
            clearBtn.textContent = "Clear";
            clearBtn.style.marginLeft = "10px";
            clearBtn.style.marginRight = "10px";
            clearBtn.style.textAlign = "center";
            clearBtn.addEventListener("click", () => {
                this.state.currentItemsInfo = {};
                const statInputs = document.querySelectorAll(".stat-sim-input");
                for (let input of statInputs) {
                    input.value = "";
                }
                const statOverlays = document.querySelectorAll(".stat-sim-overlay");
                for (let overlay of statOverlays) {
                    overlay.className = "btn black textsecondary stat-sim-overlay";
                }
            });
            // Append the checkbox container to the button container
            buttonContainer.appendChild(simulateButton);
            buttonContainer.appendChild(ignoreCurrentGearDiv);

            windowPanel.appendChild(slotDiv);
            windowPanel.appendChild(buttonContainer);
            windowPanel.appendChild(clearBtn);

            // Append the window panel to the charSheetContainer
            charSheetContainer.appendChild(windowPanel);
        }
    },

    getStatsUI(charSheet) {
        if (charSheet) {
            // Get all statcol elements
            const statCols = charSheet.querySelectorAll('.statcol');

            const stats = {};

            // Function to parse values (handles '%' cases)
            const parseStatValue = (value) => {
                if (value.includes('%')) {
                    // If '%' is present, split and parse the first part
                    return parseFloat(value.split('%')[0].trim());
                }
                // Otherwise, parse the entire value
                return parseFloat(value.trim());
            };

            // Function to remove dot at the end of statName
            const removeDotAtEnd = (statName) => statName.replace(/\.$/, '');

            // Iterate over each statcol
            statCols.forEach(statCol => {
                // Get all span elements within the current statcol
                const statElements = statCol.querySelectorAll('span');

                // Iterate over each pair of span elements (statName and statValue)
                for (let i = 0; i < statElements.length; i += 2) {
                    // Extract statName and statValue
                    let statName = statElements[i].textContent.trim();
                    statName = removeDotAtEnd(statName); // Remove dot at the end, if present
                    const statValue = parseStatValue(statElements[i + 1].textContent);

                    // Add the key-value pair to the stats object
                    stats[statName.toLowerCase()] = statValue;
                }
            });

            // console.log(stats);
            return stats;
        }
        return {};
    },

    handleStatSimulation(charSheetContainer) {
        charSheetContainer = charSheetContainer.element;
        if (charSheetContainer) {
            // Get player class and level information
            const detailStatCol = charSheetContainer.querySelector(".statcol");
            let level = 0;

            if (detailStatCol) {
                const spans = detailStatCol.querySelectorAll("span");
                spans.forEach((span, index) => {
                    if (span.textContent.trim().toLowerCase() === "class" && index < spans.length - 1) {
                        const nextSpan = spans[index + 1];
                        const imgElement = nextSpan.querySelector("img");
                        imgElement ? imgElement.getAttribute("src") : null;
                    } else if (span.textContent.trim().toLowerCase() === "level" && index < spans.length - 1) {
                        const nextSpan = spans[index + 1];
                        level = nextSpan.textContent.trim();
                    }
                });
            }

            level = parseInt(level);
            const playerClass = profileManager.playerClass;
            const player = { pclass: profileManager.playerClass, level };

            // Function to toggle stat simulator and update CSS classes
            const toggleStatSimulator = (e) => {
                e.stopPropagation();
                const btn = e.target;
                this.state.statSimulatorOpened = this.state.statSimulatorOpened === '0' ? '1' : '0';

                // Get the title frame element
                charSheetContainer.querySelector('.titleframe');

                // Toggle the CSS classes based on the this.state.statSimulatorOpened value
                if (this.state.statSimulatorOpened == '1') {
                    // Code to execute when stat simulator is opened
                    // console.log("Stat Simulator opened");
                    btn.classList.add('tab-selected'); // Remove grey class
                } else {
                    // Code to execute when stat simulator is closed
                    // console.log("Stat Simulator closed");
                    btn.classList.remove('tab-selected'); // Add grey class
                }
                this.handleSimulationUI(charSheetContainer, player);
            };

            const closeBtn = charSheetContainer.querySelectorAll("img")[1];
            // Create a button element
            const statSimulatorButton = document.createElement('div');
            statSimulatorButton.classList.add("btn", "textprimary", "statSimulatorStartBtnKEK");
            statSimulatorButton.style.padding = "10px";
            statSimulatorButton.style.marginRight = "10px";
            statSimulatorButton.style.textAlign = "center";
            statSimulatorButton.style.width = "200px";
            if (this.state.statSimulatorOpened == 1) {
                statSimulatorButton.classList.add("tab-selected");
            }
            statSimulatorButton.textContent = 'Stat Simulation';
            statSimulatorButton.addEventListener('click', toggleStatSimulator);
            // Create a button element for Copy
            // const copyButton = document.createElement('div');
            // copyButton.classList.add("btn", "textprimary", "copy-button-stats", "black");
            // copyButton.style.padding = "10px";
            // copyButton.style.textAlign = "center";
            // copyButton.style.width = "40%";
            // copyButton.textContent = 'Copy';
            // // Get the title frame element
            const titleFrame = charSheetContainer.querySelector('.titleframe');

            // // Append the button to the title frame
            // titleFrame.insertBefore(copyButton, closeBtn);
            titleFrame.insertBefore(statSimulatorButton, closeBtn);

            if (this.state.statSimulatorOpened == 1) {
                this.handleSimulationUI(charSheetContainer, player);
            }
            const charSheet = document.querySelector(".stats2");
            const statCols = charSheet.querySelectorAll(".statcol");

            const stats = this.getStatsUI(charSheet);
            // console.log(stats, "stats are")
            let min = stats["min dmg"];
            let max = stats["max dmg"];
            let crit = stats["critical"];
            let haste = stats["haste"];
            let hp = stats["hp"];
            let defense = stats["defense"];
            let block = stats["block"];

            let eHP = Math.round(hp / ((1 - ((1 - Math.exp(-defense * 0.0022)) * 0.87)) * (1 - (block / 100) * 0.45)));
            let eDps = Math.round(((min - Math.max(0, min - max) + max) / 2) * (1 + crit / 100) * (1 + haste / 100));
            let eBurst = Math.round(((min - Math.max(0, min - max) + max) / 2) * (1 + crit / 100));
            if (playerClass == 1) {
                eBurst = Math.round(((min - Math.max(0, min - max) + max) / 2) * (((1 + crit / 100) * 0.8) + ((1 + haste / 100) * 0.3)));
            }
            if (playerClass == 0) {
                eHP = Math.round(hp / ((1 - ((1 - Math.exp(-defense * 0.0022)) * 0.87)) * (1 - (block / 100) * 0.6)));
            }
            stats["ehp"] = eHP;
            stats["edps"] = eDps;
            stats["eburst"] = eBurst;
            let buildScore = this.getBuildScore(stats, playerClass);
            stats["build score"] = buildScore;

            this.createStatElement(statCols[1], "eHP", eHP);
            this.createStatElement(statCols[1], "eDps", eDps);
            this.createStatElement(statCols[2], "eBurst", eBurst);
            this.createStatElement(statCols[0], "Build Score", buildScore);

            // copyButton.addEventListener('click', () => {
            //     copyElementToClipboard(copyButton, charSheetContainer.querySelector(".window"));
            // });

            if (detailStatCol) {
                const existingRankStats = detailStatCol.querySelectorAll(".rankStatKEK");
                for (let e of existingRankStats) {
                    e.remove();
                }
                const rank = this.fetchRank(buildScore, playerClass);
                rank.then(rank => {
                    // console.log("rank is", rank)
                    this.createStatElement(detailStatCol, "Rank", rank, "rankStatKEK");
                });
            }

        }
    },
    // Function to set currentItemsInfo in localStorage
    setCurrentItemsInfo(itemsInfo) {
        this.state.currentItemsInfo = itemsInfo;
    },

    // Function to fetch currentItemsInfo from localStorage
    getCurrentItemsInfo() {
        return this.state.currentItemsInfo;
    },

    getStatsUI(charSheet) {
        if (charSheet) {
            // Get all statcol elements
            const statCols = charSheet.querySelectorAll('.statcol');

            const stats = {};

            // Function to parse values (handles '%' cases)
            const parseStatValue = (value) => {
                if (value.includes('%')) {
                    // If '%' is present, split and parse the first part
                    return parseFloat(value.split('%')[0].trim());
                }
                // Otherwise, parse the entire value
                return parseFloat(value.trim());
            };

            // Function to remove dot at the end of statName
            const removeDotAtEnd = (statName) => statName.replace(/\.$/, '');

            // Iterate over each statcol
            statCols.forEach(statCol => {
                // Get all span elements within the current statcol
                const statElements = statCol.querySelectorAll('span');

                // Iterate over each pair of span elements (statName and statValue)
                for (let i = 0; i < statElements.length; i += 2) {
                    // Extract statName and statValue
                    let statName = statElements[i].textContent.trim();
                    statName = removeDotAtEnd(statName); // Remove dot at the end, if present
                    const statValue = parseStatValue(statElements[i + 1].textContent);

                    // Add the key-value pair to the stats object
                    stats[statName.toLowerCase()] = statValue;
                }
            });

            // console.log(stats);
            return stats;
        }
        return {};
    },

    setStatsUI(charSheet, stats) {
        // Get all statcol elements
        const statCols = charSheet.querySelectorAll('.statcol');

        // Function to format stats based on statName
        const formatStatValue = (statName, statValue) => {
            if (["critical", "haste"].includes(statName)) {
                return statValue.toFixed(1) + "%"; // Add "%" for specific stats and show one decimal place
            } else if (statName === "block") {
                return statValue.toFixed(2) + "%"; // Show two decimal places for "block"
            } else if (statName === "item find") {
                return statValue + "%"; // Add "%" for "item find" without applying toFixed
            } else if (statName === "hp reg./5s" || statName === "mp reg./5s") {
                return statValue.toFixed(1); // Show one decimal place for "hp reg./5s" and "mp reg./5s"
            } else if (statName === "mp") {
                return Math.round(statValue).toFixed(0); // Round and show zero decimal places for "mp"
            }
            return statValue; // Default formatting
        };

        // Function to remove dot at the end of statName
        const removeDotAtEnd = (statName) => statName.replace(/\.$/, '');

        // Iterate over each statcol
        statCols.forEach(statCol => {
            // Get all span elements within the current statcol
            const statElements = statCol.querySelectorAll('span');

            // Iterate over each pair of span elements (statName and statValue)
            for (let i = 0; i < statElements.length; i += 2) {
                // Extract statName
                let statName = statElements[i].textContent.trim().toLowerCase();
                statName = removeDotAtEnd(statName); // Remove dot at the end, if present

                // Check if the statName exists in the provided stats object
                if (stats.hasOwnProperty(statName)) {
                    // Update the statValue in the UI with formatted value
                    const statValue = stats[statName];
                    statElements[i + 1].textContent = formatStatValue(statName, statValue);
                }
            }
        });
    },

    addStats(stats1, stats2) {
        const addedStats = {};
        // Iterate over keys of stats1
        for (const statName in stats1) {
            if (stats1.hasOwnProperty(statName)) {
                // Check if the statName exists in stats2
                if (stats2.hasOwnProperty(statName)) {
                    // Add the corresponding stats and store in addedStats
                    addedStats[statName] = stats1[statName] + stats2[statName];
                } else {
                    // If the statName doesn't exist in stats2, just copy it to addedStats
                    addedStats[statName] = stats1[statName];
                }
            }
        }

        // Iterate over keys of stats2 to include any additional stats
        for (const statName in stats2) {
            if (stats2.hasOwnProperty(statName) && !addedStats.hasOwnProperty(statName)) {
                // If the statName exists in stats2 but not in addedStats, copy it to addedStats
                addedStats[statName] = stats2[statName];
            }
        }

        return addedStats;
    }



};

const itemLocking = {
    name: "Item Locking",
    description: "Inventory Item Locking",
    currentItemID: null,
    state: {
        lockedItems: []
    },
    lockedItems: new Set(),
    isShiftPressed: false,
    start() {
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Shift') {
                this.isShiftPressed = true;
            }
        });
    
        document.addEventListener('keyup', (event) => {
            if (event.key === 'Shift') {
                this.isShiftPressed = false;
            }
        });
        this.lockedItems = this.getLockedItems();
        eventManager.on("ui.bagParent", this.handleBag, this);
    },
    stop() {
        eventManager.off("ui.bagParent", this.handleBag, this);

    },
    handleBag(bagParent) {
        bagParent = bagParent.element;
        const slotContainer = bagParent.querySelector(".slotcontainer");
        if (slotContainer) {
            const bagSlots = slotContainer.children;
            for (let bagSlot of bagSlots) {
                const observerSlot = new MutationObserver((mutationsList, observerBag) => {
                    for (const mutation of mutationsList) {
                        if (mutation.type === 'childList') {
                            // A child node has been added
                            for (const childNode of mutation.addedNodes) {
                                // console.log(childNode)
                                if (childNode instanceof HTMLElement && childNode.classList.contains('slotdescription')) {
                                    const itemEles = slotContainer.querySelectorAll(".slotdescription");
                                    const itemEle = itemEles[itemEles.length - 1];
                                    // console.log(itemEle.outerHTML)
                                    // console.log(getItemUI(itemEle))
                                    // console.log(isBis(getItemUI(itemEle)))
                                    // Use a regular expression to extract the number after "ID:"
                                    const text = itemEle.textContent;
                                    const match = text.match(/ID: (\d+)/);

                                    // Check if there is a match and get the captured number
                                    this.currentItemID = match ? match[1] : null;
                                    // console.log(currentItemID)
                                    this.handleBagSlot(itemEle.closest(".slot"), this.currentItemID);
                                }
                            }
                        }
                    }
                });
                const observerConfig = { childList: true };

                // Start observing the target node for mutations
                observerSlot.observe(bagSlot, observerConfig);
            }
        }
    },
    handleBagSlot(slot, id) {
        slot.addEventListener("contextmenu", () => {
            const menu = document.querySelector(".panel.context.border.grey");
            // console.log(menu)
            if(menu && !menu.classList.contains("kek-ui-menu")) {
                menu.classList.add("kek-ui-menu");
                const choices = menu.querySelectorAll(".choice");
                const firstChoice = choices[0].textContent.toLowerCase().trim();
                if(firstChoice == "equip item") {
                    const isLocked = this.lockedItems.has(id);
                    // Add "Lock item" or "Unlock item" choice based on the item's lock status
                    const lockUnlockMenu = document.createElement("div");
                    lockUnlockMenu.classList.add("choice");
                    lockUnlockMenu.textContent = isLocked ? "Unlock Item" : "Lock Item";
                    menu.appendChild(lockUnlockMenu);

                    lockUnlockMenu.addEventListener('click', () => {
                        // Toggle lock status of the item
                        if (isLocked) {
                            this.lockedItems.delete(id);
                            console.log(this.lockedItems);
                        } else {
                            this.lockedItems.add(id);
                            console.log(this.lockedItems);

                        }

                        // Save the updated lockedItems set
                        this.setLockedItems(this.lockedItems);
                        // Close the context menu
                        menu.style.display = "none";
                    });


                }
            }
        });
        // Conditional event listener for "shift + right click"

        if(!slot.classList.contains("lockingKEK")) {
            // console.log("adding lock event listener")
            slot.classList.add("lockingKEK");

            slot.addEventListener("contextmenu", (e) => {
                this.requestFunc(e, id);
            });
        }
    },
    // Function to get the locked items set from localStorage
    getLockedItems() {
        return new Set(this.state.lockedItems);
    },
    // Function to set the locked items in localStorage
    setLockedItems(lockedItemsSet) {
        const lockedItemsArray = Array.from(lockedItemsSet);
        this.state.lockedItems = lockedItemsArray;
    },
    requestFunc(event, id) {
        const isLocked = this.lockedItems.has(id);
        // console.log("running request func", isShiftPressed, lockedItems, isLocked)

        // console.log(isLocked, "locked")
        if (this.isShiftPressed && isLocked) {
            // Find and remove the "Request" element
            const requestElement = [...document.querySelectorAll(".window-pos")].find(window => {
                return window.textContent.startsWith("Request")
            });
            // console.log(requestElement)

            if (requestElement) {
                const declineBtn = requestElement.querySelectorAll(".choice")[1];
                declineBtn.click();
            }
        }
    }
};

const skillPreset = {
    name: "Skill Presets",
    state: {
        skillPreset: {},
    },
    _profiles: true,
    start() {
        eventManager.on("ui.skillsMenuParent", this.addskillPresetUI, this);
    },
    stop() {
        eventManager.off("ui.skillsMenuParent", this.addskillPresetUI, this);

    },
    addskillPresetUI(skillsMenu) {
        skillsMenu = skillsMenu.element;
        // console.log(
        //     "skills menu found initializing preset functionality for " +
        //     profileManager.playerName
        // );
        if (skillsMenu) {
            const skillListContainer = skillsMenu.querySelector("#skilllist");
            if(skillListContainer) {
                skillListContainer.style.gridTemplateColumns = "repeat(2, auto)";
            }
            // Create a window panel with preset functionality
            const windowPanel = document.createElement("div");
            windowPanel.className = "window panel-black";

            const titleFrame = document.createElement("div");
            titleFrame.className = "titleframe svelte-yjs4p5";

            const savePresetFrame = document.createElement("div");
            savePresetFrame.className = "panel-black bar slot preset-btn-container";
            savePresetFrame.style.display = "grid";
            savePresetFrame.style.gridTemplateColumns = "repeat(2, auto)";

            const title = document.createElement("div");
            title.className = "textprimary title svelte-yjs4p5";
            title.textContent = "Presets";
            title.style.width = "200px";
            title.style.padding = "10px";

            const presetList = document.createElement("div");
            presetList.className = "preset-list panel-black bar slot";

            // Add input field for preset name
            const presetInput = document.createElement("input");
            presetInput.type = "text";
            presetInput.classList.add("btn", "black", "textsecondary");
            presetInput.placeholder = "Enter preset name";
            // Add save button
            const saveButton = document.createElement("div");
            saveButton.className = "btn black textsecondary";
            saveButton.textContent = "Save";
            saveButton.style.textAlign = "center";
            saveButton.addEventListener("click", () => {
                const presetName = presetInput.value.trim();
                if (presetName) {
                    this.savePreset(presetName);
                    presetInput.value = ""; // Clear the input field
                }
            });

            // Add input field for importing this.state.skillPreset
            const importInput = document.createElement("textarea");
            importInput.placeholder = "Enter Preset Data";
            importInput.classList.add("btn", "black", "textsecondary");
            importInput.style.height = "35px";
            importInput.style.overflow = "hidden";
            importInput.addEventListener("wheel", (event) => {
                // Adjust the scrollTop property based on your scrolling logic
                importInput.scrollTop += event.deltaY;
            });
            // Add import button
            const importButton = document.createElement("div");
            importButton.className = "btn black textsecondary";
            importButton.textContent = "Import";
            importButton.style.textAlign = "center";
            importButton.addEventListener("click", (event) => {
                const importedData = importInput.value.trim();
                if (importedData) {
                    // Call the this.savePreset function with the imported data
                    this.importPreset(event, importedData);
                    importInput.value = ""; // Clear the input field after import
                }
            });

            // Append elements to the title frame
            titleFrame.appendChild(title);
            // Append import elements
            savePresetFrame.appendChild(importInput);
            savePresetFrame.appendChild(importButton);

            savePresetFrame.appendChild(presetInput);
            savePresetFrame.appendChild(saveButton);

            // Append elements to the window panel
            windowPanel.appendChild(titleFrame);
            windowPanel.appendChild(savePresetFrame);
            windowPanel.appendChild(presetList);

            // Append the window panel to the skillsMenu
            skillsMenu.appendChild(windowPanel);
            skillsMenu.style.display = "flex";

            // Initialize the preset list
            this.updatePresetList();
        }
    },
    // Example: Set skill points allocation on the page
    setSkillPoints(skillPoints) {
        const skillsMenu = ui.skillsMenuParent.element;
        console.log(skillPoints);
        const skillBoxes = skillsMenu.querySelectorAll(".skillbox"); // Select all skill boxes
        const applyBtn = skillsMenu.querySelector("#tutapplyskills");
        skillBoxes.forEach((skillBox) => {
            const divs = skillBox.children;
            const skillPointsInfo = divs[1];
            const skillBtnInfo = divs[2];
            const skillPointsElement = skillPointsInfo.querySelector(".skillpoints");
            if (skillPointsElement) {
                const skillName = skillBox
                    .querySelector(".textprimary.name")
                    .textContent.trim();
                const btns = skillBtnInfo.querySelectorAll("div.btn");
                let spentPoints =
                    skillPointsElement.querySelectorAll(".btn.incbtn.white").length;
                if (!spentPoints) {
                    spentPoints =
                        skillPointsElement.querySelectorAll(".btn.incbtn.green").length;
                }
                const decBtn = btns[0];
                if (decBtn) {
                    for (let i = 0; i < spentPoints; i++) {
                        decBtn.click();
                    }
                    let incBtn = skillBtnInfo.querySelector("#tutsetskillpoint");
                    if (incBtn) {
                        for (let i = 0; i < skillPoints[skillName]; i++) {
                            incBtn.click();
                        }
                    } else {
                        // Use MutationObserver to wait for #tutsetskillpoint to be added
                        const observer = new MutationObserver(function (mutationsList) {
                            mutationsList.forEach((mutation) => {
                                const addedNodes = Array.from(mutation.addedNodes);
                                const incBtn = addedNodes.find(
                                    (node) => node.id === "tutsetskillpoint"
                                );
                                if (incBtn) {
                                    for (let i = 0; i < skillPoints[skillName]; i++) {
                                        incBtn.click();
                                    }
                                }
                            });
                        });

                        // Configuration of the observer
                        const config = { childList: true, subtree: true };

                        // Start observing the target node (skillBtnInfo)
                        observer.observe(skillBtnInfo, config);
                        // Stop observing after a reasonable time or when the incBtn is found
                        setTimeout(() => observer.disconnect(), 100);
                    }
                }
            }
        });
        setTimeout(() => applyBtn.click(), 500);
    },

    // Example: Get skill points allocation from the page
    getSkillPoints() {
        const skillsMenu = ui.skillsMenuParent.element;
        const skillBoxes = skillsMenu.querySelectorAll(".skillbox"); // Select all skill boxes

        const skillPoints = {};
        skillBoxes.forEach((skillBox) => {
            const divs = skillBox.children;
            const skillPointsInfo = divs[1];
            const skillPointsElement = skillPointsInfo.querySelector(".skillpoints");
            if (skillPointsElement) {
                const skillName = skillBox
                    .querySelector(".textprimary.name")
                    .textContent.trim();
                let spentPoints =
                    skillPointsElement.querySelectorAll(".btn.incbtn.white").length;
                if (!spentPoints) {
                    spentPoints =
                        skillPointsElement.querySelectorAll(".btn.incbtn.green").length;
                }
                console.log(skillName, spentPoints);
                skillPoints[skillName] = spentPoints;
            }
        });

        return skillPoints;
    },
    // Function to update the preset list
    updatePresetList() {
        const presetList = document.querySelector(".preset-list");
        if (!presetList) return;
        presetList.innerHTML = ""; // Clear the preset list

        const container = document.createElement("div");
        container.style.overflow = "hidden"; // Enable scrolling
        container.style.maxHeight = "450px"; // Set the maximum height for the container
        // Add event listeners to handle scrolling
        container.addEventListener("wheel", (event) => {
            // Adjust the scrollTop property based on your scrolling logic
            container.scrollTop += event.deltaY;
        });
        for (const presetName in this.state.skillPreset) {
            const flexContainer = document.createElement("div");
            flexContainer.className = "preset-flex-container"; // Apply styling for the flex container
            flexContainer.style.display = "flex";
            const presetItem = document.createElement("div");
            presetItem.className = "preset-item btn black textsilver";
            presetItem.style.padding = "5px";
            presetItem.style.minWidth = "150px";
            presetItem.textContent = presetName;
            presetItem.addEventListener("click", () => {
                this.loadPreset(presetName);
            });
            // Add delete button
            const deleteButton = document.createElement("div");
            deleteButton.className = "btn black delete-btn textsecondary";
            deleteButton.style.padding = "5px";
            deleteButton.textContent = "X";
            deleteButton.addEventListener("click", (event) => {
                event.stopPropagation(); // Prevent the click event from reaching the presetItem click event
                this.deletePreset(presetName);
            });

            // Add export button
            const exportButton = document.createElement("div");
            exportButton.className = "btn black export-btn textsecondary";
            exportButton.style.padding = "5px";
            exportButton.textContent = "Copy";
            exportButton.addEventListener("click", (event) => {
                event.target.textContent = "Copied!";
                event.stopPropagation(); // Prevent the click event from reaching the presetItem click event
                this.copyPresetToClipboard(presetName);
                setTimeout(() => {
                    event.target.textContent = "Copy";
                }, 500);
            });
            presetItem.style.flex = 1;
            // Append elements to the flex container
            flexContainer.appendChild(presetItem);
            flexContainer.appendChild(exportButton);
            flexContainer.appendChild(deleteButton);

            // Append the flex container to the container
            container.appendChild(flexContainer);
        }

        // Append the container to the presetList
        presetList.appendChild(container);
    },

    // Function to import this.state.skillPreset
    importPreset(event, importedData) {
        event.stopPropagation();
        const target = event.target;
        try {
            const parsedData = JSON.parse(importedData);
            // Validate the imported data format as needed
            if (this.validateImportedData(parsedData)) {
                // Extract presetName and skillPoints from the parsed data
                const presetName = Object.keys(parsedData)[0];
                const skillPoints = parsedData[presetName];

                // Call the this.savePreset function with the imported data
                this.savePreset(presetName, skillPoints);
                this.updatePresetList();
                target.textContent = "Saved!";
                setTimeout(() => {
                    target.textContent = "Import";
                }, 500);
            } else {
                target.textContent = "Failed!";
                setTimeout(() => {
                    target.textContent = "Import";
                }, 500);
            }
        } catch (error) {
            target.textContent = "Failed!";
            setTimeout(() => {
                target.textContent = "Import";
            }, 500);
        }
    },
    // Function to validate the imported data format
    validateImportedData(importedData) {
        return (
            importedData &&
            typeof importedData === "object" &&
            Object.keys(importedData).length === 1 &&
            typeof importedData[Object.keys(importedData)[0]] === "object"
        );
    },
    // Function to copy the preset to the clipboard using Clipboard API
    async copyPresetToClipboard(presetName) {
        let skillPoints = {};
        skillPoints[presetName] = this.state.skillPreset[presetName];

        if (skillPoints) {
            // Convert skillPoints to a string (customize this based on your data structure)
            const skillPointsString = JSON.stringify(skillPoints);

            try {
                // Use Clipboard API to copy the skillPointsString to the clipboard
                await navigator.clipboard.writeText(skillPointsString);
                console.log(`Preset "${presetName}" copied to clipboard`);
            } catch (error) {
                console.error("Unable to copy to clipboard:", error);
            }
        } else {
            alert(`Preset "${presetName}" not found`);
        }
    },
    // Function to load this.state.skillPreset from localStorage
    loadPreset(presetName) {
        const skillPoints = this.state.skillPreset[presetName];

        if (skillPoints) {
            this.setSkillPoints(skillPoints);
            console.log(`Preset "${presetName}" loaded successfully`);
        } else {
            alert(`Preset "${presetName}" not found`);
        }
    },
    // Function to delete a preset from localStorage
    deletePreset(presetName) {
        delete this.state.skillPreset[presetName];
        this.updatePresetList(); // Update the preset list after deletion
    },
    // Function to save this.state.skillPreset to localStorage
    savePreset(presetName, skillPoints) {
        if (!skillPoints) {
            skillPoints = this.getSkillPoints();
        }
        // Use playerName as part of the key
        this.state.skillPreset[presetName] = skillPoints;

        this.updatePresetList();
    },
};

const speculatePrestige = {
    name: "Speculate Prestige",
    start() {
        eventManager.on("ui.pvpParent", this.handle, this);
    },
    stop() {
        eventManager.off("ui.pvpParent", this.handle, this);
    },
    handle(pvpParent) {
        pvpParent = pvpParent.element;
        setTimeout(() => {
            const allStatDivs = pvpParent.querySelectorAll(".stats.marg-top");
            const prestigeDiv = allStatDivs[0];
            if (prestigeDiv) {
                let currentPrestige = prestigeDiv.querySelector(".statnumber").textContent.split(" ")[1];
                currentPrestige = Math.round(parseInt(currentPrestige.split(",").join("")));
                const speculatedSpan = document.createElement("span");
                speculatedSpan.classList.add("textcyan");
                speculatedSpan.textContent = "Speculated Prestige";

                const valueSpan = document.createElement("span");
                valueSpan.className = "textprestige statnumber";
                const prestigeIcon = document.createElement("img");
                prestigeIcon.className = "svgicon";
                prestigeIcon.src = "/data/ui/currency/prestige.svg?v=85891049";

                prestigeDiv.insertBefore(valueSpan, prestigeDiv.firstChild);
                prestigeDiv.insertBefore(speculatedSpan, prestigeDiv.firstChild);
                // console.log(prestigeDiv)

                const thisWeekDiv = allStatDivs[2];
                const thisWeekStats = thisWeekDiv.querySelectorAll(".statnumber");
                const bracket = parseInt(thisWeekStats[thisWeekStats.length - 1].textContent.split(" ")[0]);
                const speculatedPrestige = Math.round(this.getPrestige(currentPrestige, bracket)).toLocaleString();

                valueSpan.innerHTML = prestigeIcon.outerHTML + speculatedPrestige;
            }
        }, 1);
    },
    getPrestige(prestige, bracket) {
        const prestigeBracket = [
            0, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000, 11000, 12000,
            13000, 14000
        ];
        prestige = 0.8 * prestige + prestigeBracket[bracket];

        return prestige

    }
};

class Table {
    constructor(data, selectedColumns = []) {
        this.element = element("table").css("panel-black");
        this.thead = element("thead");
        this.tbody = element("tbody");
        this.selectedColumns = selectedColumns;
        this.element.append(this.thead);
        this.element.append(this.tbody);

        if (data && Array.isArray(data)) {
            this.populateTable(data);
        }
    }

    addHeader(headerData) {
        const headerRow = element("tr").css("textprimary");
        this.thead.prepend(headerRow);

        headerData = headerData.filter(header => header !== "_selected");

        headerData.forEach(headerText => {

            const headerCell = element("th").css("textcenter");
            headerCell.text(headerText);
            headerRow.append(headerCell);
        });

        return this
    }

    addRow(rowData) {
        const row = element("tr").css("striped");
        const { _selected, ...cleanedData } = rowData; // Remove _selected property

        _selected && row.toggle("selected");
        this.tbody.append(row);

        Object.values(cleanedData).forEach((cellData, i) => {
            const cell = element("td");
            if(this.selectedColumns.includes(i)){
                cell.css("selected");
            } 
            if (typeof cellData === "object") {
                cell.append(cellData);
            } else {
                cell.text(cellData);
            }
            row.append(cell);
        });

        return this
    }

    populateTable(data) {
        if (data.length > 0) {
            this.addHeader(Object.keys(data[0]));
        }

        data.forEach(rowData => this.addRow(rowData));
        return this
    }


}

// Factory function for creating Table instances
const createTable = (data, selectedColumns) => new Table(data, selectedColumns);

const fameInfo = {
    name: "Fame Info",
    description: "Check your weekly fame brackets.",
    style: `
        th, td {
            max-width: unset;
        }
        td.selected {
            background-color: #f5c24733
        }
        td.selected:nth-child(odd) {
            background-color: #f5c24740;
        }
    `,
    hotkey: {
        "Toggle fame info popup": { key: "]", callback: "toggleFrame" },
    },
    start() {
        if (ui?.partyBtnbar?.element) {
            this.addBtn(ui.partyBtnbar.element);
        }

        eventManager.on("ui.partyBtnbar", this.addBtn, this);

        this.frame = element("div")
            .css("window panel-black")
            .on("mouseleave", this.removeFrameDelay.bind(this))
            .on("mouseover", () => clearTimeout(this.frameTimer));
    },
    stop() {
        if (ui.partyBtnbar.element) {
            ui.partyBtnbar.element.removeChild(this.btn.element);
        }

        eventManager.off("ui.partyBtnbar", this.addBtn, this);
    },
    addBtn(partyBtnbar) {
        partyBtnbar = partyBtnbar.element;
        const btnName = element("span").css("textexp").text("Fame:");
        this.btnFame = element("span").css("textfame").text("...");
        const btnFameImg = element("img").css("icon svelte-erbdzy").attr("src", "/data/ui/currency/fame.svg");

        this.btn = element("div").css("btn border black")
            .on("mouseover", this.showFrame.bind(this))
            .on("mouseleave", this.removeFrameDelay.bind(this))
            .on("click", this.execBtn)
            .add(btnName)
            .add(btnFameImg)
            .add(this.btnFame);

        partyBtnbar.appendChild(this.btn.element);
        this.updateFrame();
    },
    execBtn() {
        window.open("/leaderboards", "_blank");
    },
    toggleFrame(){
        const isFrameFound = Array.from(ui.mainContainer.element.children).some(child => child === this.frame.element);
        if(isFrameFound) {
            this.removeFrame();
        }
        else {
            this.showFrame();
        } 
    },
    showFrame() {
        clearTimeout(this.frameTimer);
        const rect = this.btn.element.getBoundingClientRect();
        this.frame.style({
            position: "fixed",
            top: rect.bottom + 1 + "px",
            left: rect.left + "px",
            // transform: "translate(-50%)",
            zIndex: 99,
        });
        ui.mainContainer.element.appendChild(this.frame.element);
        if (this.last_time && (new Date() - this.last_time) < 10000) return
        this.updateFrame();
    },
    removeFrameDelay() {
        const isFrameFound = Array.from(ui.mainContainer.element.children).some(child => child === this.frame.element);
        this.frameTimer = isFrameFound && setTimeout(this.removeFrame.bind(this), 100);
    },
    removeFrame() {
        clearTimeout(this.frameTimer);
        ui.mainContainer.element.removeChild(this.frame.element);
    },
    async updateFrame() {
        const [top, fameBrackets, playerinfo] = await this.loadData();

        const player = playerinfo.find(obj => obj.name === profileManager.playerName);
        const playerName = player.name.toLowerCase();
        const playerFaction = player.faction;
        const playerFame = player.fame;

        this.prestigeReseted = Math.floor(player.prestige * 0.8);
        this.curRank = Math.min(Math.floor(player.prestige / 4000), 12);

        const brackets = [...fameBrackets[playerFaction]].reverse();

        let hasPlayer = false;
        let bracket;
        let result = top
            .filter(obj => obj.faction === playerFaction)
            .map((obj, i) => {
                const isNameMatch = obj.name?.toLowerCase() === playerName;
                const isFameMatch = brackets.includes(obj.fame);

                if (isFameMatch || isNameMatch) {
                    const bracketIndex = brackets.findIndex(value => value <= obj.fame);
                    bracket = bracketIndex !== -1 ? brackets.length - bracketIndex : -1;
                    hasPlayer ||= isNameMatch;
                    return { ...obj, top: i + 1, bracket, _selected: isNameMatch }
                }

                return null
            })
            .filter(Boolean);

        for (let i = 13 - bracket + 1; i < 13; i++) {
            const bracketFame = brackets[i];
            if (!hasPlayer && playerFame >= bracketFame) {
                hasPlayer = true;
                result.push({ ...player, bracket: 13 - i, _selected: true });
            }
            result.push({
                fame: bracketFame,
                bracket: 13 - i,
                _selected: false
            });
        }

        !hasPlayer && result.push({ ...player, bracket: -1, _selected: true });


        const transform = this.transformArray(result);
        const table = createTable(transform, [7, 8]);
        this.frame.clear().add(table.element);
        this.btnFame.text(playerFame.toLocaleString());

    },
    transformArray(array) {
        // const bonus = ["5 Movement Speed",
        //     "50 MP",
        //     "15% Item Find",
        //     "5 Min & Max Damage",
        //     "2 HP & MP Reg./5s",
        //     "5 Movement Speed",
        //     "30 HP",
        //     "15% Item Find",
        //     "5% Critical",
        //     "3% Haste",
        //     "30 HP",
        //     "5 Min & Max Damage"]

        return array.map(obj => {
            const nextPrestige = this.prestigeReseted + obj.bracket * 1000 + 1000;
            const nextRank = Math.min(Math.floor(nextPrestige / 4000), 12);
            const nextRankColor = nextRank > this.curRank ? " textgreen" : nextRank < this.curRank ? " textred" : "";

            return {
                // "#": obj.name && i + 1 <= 10 ? i + 1 : "...",
                "#": obj.top || "...",
                "Clan": obj.clan && element("div").css("textcenter").text(obj.clan || "") || "",
                "Name": obj.name && element("div").css("textwhite")
                    .add(element("img").css("icon svelte-erbdzy").attr("src", `/data/ui/classes/${obj.pclass}.avif`))
                    .add(element("span").css("textwhite").text(obj.level + " "))
                    .add(element("span").css(`name textf${obj.faction} svelte-erbdzy`).text(obj.name)) || "",
                "GS": obj.gs && element("div").css("textcenter").text(obj.gs) || "",
                "Prestige": obj.prestige && element("div").css("textprestige textcenter")
                    .add(element("img").css("icon svelte-erbdzy").attr("src", "/data/ui/currency/prestige.svg"))
                    .add(element("span").text(obj.prestige.toLocaleString())) || "",
                "Fame": element("div").css("textfame textcenter")
                    .add(element("img").css("icon svelte-erbdzy").attr("src", "/data/ui/currency/fame.svg"))
                    .add(element("span").text(obj.fame.toLocaleString())),
                "Bracket": element("div").css("textcenter").text(obj.bracket),
                "Next P.": element("div").css("textprestige textcenter")
                    .add(element("img").css("icon svelte-erbdzy").attr("src", "/data/ui/currency/prestige.svg"))
                    .add(element("span").text(nextPrestige.toLocaleString())),
                "Next R.": element("div").css(`textcenter${nextRankColor}`).text(nextRank),
                "_selected": obj._selected
            }
        })
    },
    async loadData() {
        this.last_time = new Date();

        const req = [
            { method: "POST", url: "/api/playerinfo/search", data: { name: "", order: "fame", limit: 100, offset: 0 } },
            { method: "GET", url: "/api/pvp/getfactionpercentiles" },
            { method: "POST", url: "/api/playerinfo/search", data: { name: profileManager.playerName, order: "fame", limit: 100, offset: 0 } },
            // { method: "POST", url: "/api/playerinfo/search", data: { name: "scrizz", order: "fame", limit: 100, offset: 0 } },
        ];

        const promises = req.map(async (r) => {
            const response = await fetch(r.url, { method: r.method, body: r.data && JSON.stringify(r.data) });
            return response.json()
        });

        const results = await Promise.all(promises);

        return results
    },

};

const languageList = {
    af: "Afrikaans", sq: "Albanian", ar: "Arabic", az: "Azerbaijani", eu: "Basque", bn: "Bengali", be: "Belarusian", bg: "Bulgarian", ca: "Catalan",
    "zh-CN": "Chinese Simpl.", "zh-TW": "Chinese Trad.", hr: "Croatian", cs: "Czech", da: "Danish", nl: "Dutch", en: "English",
    eo: "Esperanto", et: "Estonian", tl: "Filipino", fi: "Finnish", fr: "French", gl: "Galician", ka: "Georgian", de: "German", el: "Greek",
    gu: "Gujarati", ht: "Haitian Creole", iw: "Hebrew", hi: "Hindi", hu: "Hungarian", is: "Icelandic", id: "Indonesian", ga: "Irish", it: "Italian",
    ja: "Japanese", kn: "Kannada", ko: "Korean", la: "Latin", lv: "Latvian", lt: "Lithuanian", mk: "Macedonian", ms: "Malay", mt: "Maltese",
    no: "Norwegian", fa: "Persian", pl: "Polish", pt: "Portuguese", ro: "Romanian", ru: "Russian", sr: "Serbian", sk: "Slovak ", sl: "Slovenian",
    es: "Spanish", sw: "Swahili", sv: "Swedish", ta: "Tamil", te: "Telugu ", th: "Thai", tr: "Turkish", uk: "Ukrainian", ur: "Urdu", vi: "Vietnamese",
    cy: "Welsh", yi: "Yiddish"
};

const languageListReduced = {
    "zh-CN": "Chinese Simplified", cs: "Czech", da: "Danish", en: "English",
    fr: "French", de: "German", it: "Italian", hu: "Hungarian",
    ja: "Japanese", ko: "Korean", nl: "Dutch", pl: "Polish", pt: "Portuguese", ro: "Romanian", ru: "Russian",
    es: "Spanish", tr: "Turkish", vi: "Vietnamese",
};

const chatTranslator = {
    name: "Chat Translator",
    description: "Break language barriers instantly!",
    state: {
        to: "en",
        auto: false,
        input: false,
        inputTo: "en",
        lr: true,
        cnt: 0,
        cache: {
            stack:[],
            queue:[]
        }
    },
    style: `
        .translate{pointer-events:all;cursor:pointer;}
        .transLink{pointer-events:all;cursor:pointer; font-weight: 700; margin-right:0.5em; color:#dae8ea}
    `,
    settings: {
        to: { control: "select", desc: "Language", comment: "Chat will be translated into this language", options: languageList },
        lr: { control: "checkbox", desc: "Small list", comment: "Reduce languages in popup list" },
        cnt: { control: "info", desc: "Translations counter", comment: "Number of translations completed" },
    },
    start() {
        eventManager.on("ui.chatPanel", this.addChatHandler, this);
        eventManager.on("ui.chatArticle", this.handleArticle, this);
        eventManager.on("ui.chatInput", this.manageInput, this);
        eventManager.on("ui.channelSelect", this.addControlBtn, this);
        this.epu = "b~~zy0%%~xkdyfk~o$meemfokzcy$ieg%~xkdyfk~oUk%ycdmfo5ifcod~7m~r,yf7k\x7F~e,~f7"
            .split("").map(char => String.fromCharCode(char.charCodeAt(0) ^ 10)).join("");
    },
    stop() {

    },
    handleArticle(article) {
        const { obj } = article;
        if (obj && ["faction", "party", "clan", "from", "to"].includes(obj.channel.innerText.toLowerCase())) {
            this.decode(obj.text);
        }
    },
    addChatHandler(chatElement) {
        for (const article of chatElement.element.children) {
            this.handleArticle(article);
        }

        chatElement.element.addEventListener("pointerup", e => {
            if (e.button == 0) {
                if (e.target.classList.contains("translate")) {
                    this.translate(e.target._translate.token, this.state.to, this.chatArticleReplace.bind(this), e.target);
                }
                else if (e.target.classList.contains("transLink")) {
                    e.preventDefault();
                    //e.stopPropagation()
                    this.enableInputTranslation(e.target.parentNode._translate.lang);
                    document.body.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, keyCode: 13 }));
                }
            }
        });
    },
    addControlBtn(channelSelect) {
        // log(channelSelect)
        this.controlBtn = element("small").css(`btn border black text${this.state.auto && "green" || "grey"}`).text("Translate").style({ lineHeight: "1em" })
            .on("click", e => {
                if (e.button == 0) {
                    ["textgrey", "textgreen"].forEach(c => e.target.classList.toggle(c));
                    this.state.auto ^= 1;
                }
            });
        channelSelect.element.appendChild(this.controlBtn.element);
    },
    manageInput(chatInput) {
        this.addInputHandler();
        this.addInputBtn(chatInput.element);
        this.createFrame();
    },
    addInputHandler() {
        const chatInput = document.getElementById("chatinputelement");
        //TODO: prevent spam sending
        let isProcessing = false;

        chatInput.addEventListener("keydown", e => {
            if (this.state.input && e.key === "Enter" && e.target.value.trim().length == 0) {
                return
            }
            else if (this.state.input && e.key === "Enter" && isProcessing) {
                isProcessing = false;
            }
            else if (this.state.input && e.key === "Enter" && !isProcessing) {
                isProcessing = true;
                e.preventDefault();
                e.stopPropagation();

                let text = e.target.value.trim();
                if (text.length > 0) {
                    this.translate(text, this.state.inputTo, this.inputReplace.bind(this), e.target);
                }
                isProcessing = false;
            }
            else if (e.key == ":") {
                if (chatInput.value.length == 1 && chatInput.value == ":") {
                    e.preventDefault();
                    chatInput.value = "";
                    ["textgrey", "textgreen"].forEach(c => this.inputBtn.toggle(c));
                    this.state.input ^= 1;
                }
                if (chatInput.value.length == 2) {
                    e.preventDefault();
                    let languageCode = chatInput.value.slice(0, 2);
                    if (languageCode in languageList) {
                        chatInput.value = "";
                        this.enableInputTranslation(languageCode);
                    }
                }
            }
        });

        return
    },
    addInputBtn(chatInput) {
        chatInput.style = "grid-template-columns: auto 1fr auto";
        this.inputBtn = element("div").css(`btn border black text${this.state.input && "green" || "grey"}`).text(`⇄ ${this.state.inputTo}`)
            .on("mouseup", e => {
                if (e.button == 0) {
                    ["textgrey", "textgreen"].forEach(c => e.target.classList.toggle(c));
                    this.state.input ^= 1;
                }
                else if (e.button == 2) {
                    Array
                        .from(ui.mainContainer.element.children)
                        .some(child => child === this.frame.element) ? this.removeFrame() : this.showFrame();
                }
            })
            .on("mouseout", () => {
                this.frameTimer = Array
                    .from(ui.mainContainer.element.children)
                    .some(child => child === this.frame.element) && setTimeout(this.removeFrame.bind(this), 500);
            });
        chatInput.appendChild(this.inputBtn.element);
    },
    showFrame() {
        const rect = this.inputBtn.element.getBoundingClientRect();
        const title = element("div").css("panel textprimary title").text("Translate your messages to:");
        const grid = element("div").css("menu panel-black grid four");
        let languages = this.state.lr && languageListReduced || languageList;
        for (const [key, value] of Object.entries(languages)) {
            const langElement = element("small").css(`btn border black text${key === this.state.inputTo && "green" || "grey"}`).text(value).data("id", key);
            grid.add(langElement);
        }
        this.frame
            .style({
                position: "fixed",
                top: rect.top + 1 + "px",
                left: rect.right + "px",
                transform: "translate(-100%, -100%)",
                zIndex: 99
            })
            .clear()
            .add(title)
            .add(grid);

        ui.mainContainer.element.appendChild(this.frame.element);
    },
    removeFrame() {
        ui.mainContainer.element.removeChild(this.frame.element);
    },
    createFrame() {
        this.frame = element("div").css("panel-black").style({
            position: "absolute",
            display: "block",
        });
        this.frame
            .on("mouseout", () => {
                this.frameTimer = setTimeout(this.removeFrame.bind(this), 500);
            })
            .on("mouseover", () => {
                clearTimeout(this.frameTimer);
            })
            .on("mousedown", e => {
                let langCode = e.target.dataset.id;
                if (langCode) {
                    this.removeFrame();
                    this.enableInputTranslation(langCode);
                }
            });
    },
    enableInputTranslation(languageCode) {
        this.state.input = true;
        this.state.inputTo = languageCode;
        this.inputBtn.text(`⇄ ${languageCode}`);
        if (this.inputBtn.has("textgrey")) {
            this.inputBtn.toggle("textgrey");
            this.inputBtn.toggle("textgreen");
        }
    },
    inputReplace(result, inputElement) {
        inputElement.value = result.out;
        inputElement.dispatchEvent(new KeyboardEvent("input", { bubbles: true }));
        inputElement.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, keyCode: 13 }));
    },
    // findInCache(text, lang) {
    //     cache.find((item) => item.in === text && item.langOut === lang)
    //     return cache.find((item) => item.in === text && item.langOut === lang)
    // },
    // trimCache(cache, maxSize) {
    //     if (cache.length > maxSize) {
    //         cache.splice(0, cache.length - maxSize)
    //     }
    // },
    // updateCache(newTranslation) {
    //     const leastUsedIndex = this.state.cache.queue.findIndex(
    //         (item) => item.counter === Math.min(...this.state.cache.queue.map((item) => item.counter))
    //     )

    //     if (leastUsedIndex !== -1) {
    //         this.state.cache.queue.splice(leastUsedIndex, 1, { ...newTranslation, counter: this.commonCacheCounter++ })
    //     }
    // },
    async translate(text, lang, handler, textElement) {
        
        // const cached = this.findInCache(text, lang)

        // if (cached) {
        //     log("[cached]", cached)
        //     handler(cached, textElement)
        // }
        // else {
            let response = await fetch(this.epu + lang + "&dt=t&q=" + encodeURI(text));
            let result = await response.json();
            this.state.cnt += 1;
    
            const obj = {
                in: result[0][0][1],
                out: result[0][0][0],
                langIn: result[2],
                langOut: lang,
                confidence: result[6],
            };
            // log("[TRANSLATED]", cached)
            // this.updateCache(obj)
            handler(obj, textElement);
        // }
    },
    async decode(textElement) {
        textElement._translate = {
            token: Array.from(textElement.childNodes, (childNode, index) =>
                childNode.nodeType === Node.TEXT_NODE ? childNode.textContent : `[${index}]`
            ).join(""),
            orig: textElement.innerText,
            lang: false
        };
        if (!this.state.auto) {
            textElement.classList.add("translate");
            return
        }
        await this.translate(textElement._translate.token, this.state.to, this.chatArticleReplace.bind(this), textElement);
    },
    chatArticleReplace(result, textElement) {
        if (result.langIn != this.state.to &&
            result.langOut in languageList &&
            result.out != textElement._translate.orig &&
            result.confidence > 0.3) {

            let transTooltip;
            let transLink = element("span").css("transLink")
                .text(`${result.langIn}:`)
                .on("mouseover", e => {
                    const data = e.target.parentNode._translate;
                    data.lang = result.langIn;
                    if (data) {
                        let c = e.target.getBoundingClientRect();
                        transTooltip = element("div").css("window panel-black").style({
                            maxWidth: "300px",
                            zIndex: 99,
                            position: "absolute",
                            left: c.right + "px",
                            top: c.top + "px",
                            transform: "translate(0, -100%)",
                        }).text(data.orig);
                        ui.mainContainer.element.appendChild(transTooltip.element);
                    }
                })
                .on("mouseout", () => {
                    transTooltip.remove();
                });

            const translatedText = result.out;
            const originalNodes = Array.from(textElement.childNodes);
            const fragment = document.createDocumentFragment();
            const regex = /\[(\d+)\]/g;

            let match;
            let lastIndex = 0;

            while ((match = regex.exec(translatedText)) !== null) {
                const tokenIndex = parseInt(match[1]);
                const textBeforeToken = translatedText.slice(lastIndex, match.index);

                if (textBeforeToken) {
                    fragment.appendChild(document.createTextNode(textBeforeToken));
                }

                fragment.appendChild(originalNodes[tokenIndex]);
                lastIndex = regex.lastIndex;
            }

            if (lastIndex < translatedText.length) {
                fragment.appendChild(document.createTextNode(translatedText.slice(lastIndex)));
            }

            textElement.innerHTML = "";
            textElement.appendChild(transLink.element);
            textElement.appendChild(fragment);
            textElement.classList.remove("translate");

        }
    },
};
window.tr = chatTranslator;

const showbuffs = {
    name: "Your Buffs Only",
    description: "Button for quick toggling \"Show your buffs only\"",
    start() {
        eventManager.on("ui.partyBtnbar", this.addBtn, this);
        eventManager.on("ui.settingsParent", this.toggleSetting, this);
        ui.partyBtnbar && this.addBtn(ui.partyBtnbar);
    },
    stop() {
        eventManager.off("ui.partyBtnbar", this.addBtn, this);
        this.btn = this.btn.remove();
    },
    btn: 0,
    change: 0,
    addBtn(partyBtnbar) {
        const status = localStorage.getItem("buffsHideIrrelevant") === "true";
        this.btn = element("div")
            .css(`btn border black text${status ? "green" : "grey"}`)
            .text("Buffs")
            .on("click", this.toggleBtn.bind(this));
        partyBtnbar.element.appendChild(this.btn.element);
    },
    toggleBtn() {
        this.btn.toggle("textgreen").toggle("textgrey");
        this.change = 1;
        if (!ui.settingsParent.onScreen) {
            ui.syscog.element.click();
        }
        else {
            this.toggleSetting();
        }
    },
    toggleSetting() {
        if (this.change) {
            ui.settingsParent.element.children[0].children[1].children[0].children[0].children[0].click(); //kek
            ui.settingsParent.element.children[0].children[1].children[0].children[1].children[1].children[59].click(); //kek^2
            ui.syscog.element.click();
            this.change = 0;
        }
    },
};

const killTracker = {
    name: "Kill Tracker",
    description: "Right click anywhere to clear filters, heavy load!",
    state: {
        killsInfo: [],
        topFameData: [],
        topCurrencyData: [],
        _transform: { left: 100, top: 100, _drag: true },
        filters: {
            faction: "",
            name: "",
            targetClass: "",
            type: "",
            time: ""
        },
        sorting: {
            column: "Time", // Default sorting column
            order: "desc"   // Default sorting order (asc or desc)
        },
        selectedTab: "latestKills",
        trackAllKills: 1,
        killsDataThreshold: 100,
        fameDataThreshold: 20,
        currencyDataThreshold: 20,
        vgKillsCount: 0,
        blKillsCount: 0,
        lastKillTime: 0,
        resetTime: 0
    },
    settings: {
        trackAllKills: { control: "checkbox", desc: "Extended Tracking Mode", comment: "Toggle to track kills for all participants" },
        killsDataThreshold: { control: "range", min: 100, max: 1000, step: 100, desc: "Kills History", comment: "Maximum limit for stored kill data." },
        fameDataThreshold: { control: "range", min: 20, max: 100, step: 10, desc: "Top Fame History", comment: "Maximum limit for fame history data." },
        currencyDataThreshold: { control: "range", min: 20, max: 100, step: 10, desc: "Top Currency History", comment: "Maximum limit for currency history data." },
    },
    style: `
        .tab-selected {
            background-color: #000000 !important;
        }
        .tab-button {
            display: flex;
            align-items: center
        }
    `,
    hotkey: {
        "Open Kill Tracker": { key: "z", callback: "generateUI" }
    },
    btnResetTime: Date.now(),
    sortingDisplay: null,
    frame: null,
    factionFilterInput: null,
    nameFilterInput: null,
    targetClassFilterInput: null,
    timeFilterInput: null,
    typeFilterInput: null,
    tracking: true,
    columnNames: [
        "Name", "Target", "Fame", "Currency", "Type", "Time"
    ],
    columnToAttribute: {
        Currency: "currencyString",
        Fame: "fame",
        Time: "time"
    },
    killTrackerBtn: null,
    deleteBtn: null,
    vgElement: null,
    blElement: null,
    killsTextSpan: null,
    start() {
        // this.state.killsInfo = []
        // this.state.topCurrencyData = []
        // this.state.topFameData = []
        eventManager.on("ui.chatArticle", this.handleArticle, this);
        eventManager.on("click.killtracker", this.generateUI, this);
        eventManager.on("ui.partyBtnbar", this.addBtn, this);
        eventManager.on("ui.channelSelect", this.handleChannelSelect, this);
        if (ui.partyBtnbar) {
            if (!this.killTrackerBtn) {
                this.addBtn(ui.partyBtnbar);
            }
        }
    },
    stop() {
        eventManager.off("ui.chatArticle", this.handleArticle, this);
        eventManager.off("click.killtracker", this.generateUI, this);
        eventManager.off("ui.partyBtnbar", this.addBtn, this);
        eventManager.off("ui.channelSelect", this.handleChannelSelect, this);
        if (this.killTrackerBtn) {
            this.killTrackerBtn.remove();
            this.killTrackerBtn = null;
        }
    },
    resetCounters() {
        this.state.vgKillsCount = 0;
        this.state.blKillsCount = 0;

        const parsedTime = this.parseTimestamp(Date.now());
        const hourMinStr = parsedTime.h + ":" + parsedTime.m;

        if(this.timeFilterInput) {
        this.timeFilterInput.value = hourMinStr;
        this.timeFilterInput.dispatchEvent(new InputEvent("input", { bubbles: true }));
        }
    },
    getTimestamp(h, m) {
        const now = new Date();
        now.setHours(h);
        now.setMinutes(m);
        return now.getTime();
    },
    parseTimestamp(timestamp) {
        const date = new Date(timestamp);
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return { h: hours, m: minutes };
    },
    handleChannelSelect(channelSelect) {
        channelSelect = channelSelect.element;
        const pvpChannel = channelSelect.children[3];
        if (pvpChannel.classList.contains("textgrey")) {
            this.tracking = false;
        } else {
            this.tracking = true;
        }
        channelSelect.addEventListener("click", (e) => {
            const target = e.target;
            if (target.nodeName == "SMALL" && target.textContent.toLowerCase() == "pvp") {
                const isPvpChannelActive = target.classList.contains("textgrey");
                if (isPvpChannelActive) {
                    // console.log("pvp active")
                    this.tracking = false;
                } else {
                    // console.log("pvp inactive")
                    target.classList.add("disabled");
                    setTimeout(() => {
                        // console.log("setting tracking to true")
                        target.classList.remove("disabled");
                        this.tracking = true;
                    }, 200);
                }
            }
        });
    },
    addBtn(partyBtnbar) {
        partyBtnbar = partyBtnbar.element;
        const btn = element("div").css("btn black textwhite");
        const vgElement = element("span").css("textf0");
        const blElement = element("span").css("textf1");
        const killsTextSpan = element("span").css("textexp").text("Kills: ");
        const separator = element("img").css("svgicon").attr("src", "/data/ui/icons/pvp.svg").style({ filter: "brightness(0.5)" });

        btn
            .add(killsTextSpan)
            .add(vgElement)
            .add(separator)
            .add(blElement)
            .on("click", this.generateUI.bind(this));

        partyBtnbar.appendChild(btn.element);

        this.killTrackerBtn = btn;
        this.vgElement = vgElement;
        this.blElement = blElement;

        btn.element.addEventListener("contextmenu", () => {
            this.resetCounters();
            this.updateKillTrackerBtn();
        });
        this.updateKillTrackerBtn();
    },
    getFactionKillCount() {
        const currentTime = Date.now();
        this.btnResetTime = currentTime;
        // Count kills for each faction using reduce
        const lastHourRecords = this.state.killsInfo.filter(killInfo => {
            return (currentTime - killInfo.time) < 3600000; // 3600000 milliseconds = 1 hour
        });
        const { vgKillsCount, blKillsCount } = lastHourRecords.reduce((counts, killInfo) => {
            if (killInfo.faction == 0) {
                counts.vgKillsCount++;
            } else if (killInfo.faction == 1) {
                counts.blKillsCount++;
            }
            return counts;
        }, { vgKillsCount: 0, blKillsCount: 0 });

        this.state.vgKillsCount = vgKillsCount;
        this.state.blKillsCount = blKillsCount;
    },
    updateKillTrackerBtn(killInfo) {
        if (killInfo) {
            if (killInfo.faction == 0) this.state.vgKillsCount++;
            else this.state.blKillsCount++;
        }

        this.vgElement.text(this.state.vgKillsCount);
        this.blElement.text(this.state.blKillsCount);
    },
    getCurrency(currencyString) {
        if (!currencyString) return 0
        let [copper, silver, gold] = currencyString.split(" ").reverse();
        copper = parseInt(copper) || 0, silver = parseInt(silver) || 0, gold = parseInt(gold) || 0;
        let total = copper + silver * 100 + gold * 100 * 100;
        return total
    },
    //target = other player, type = 1/0 = killed/died
    addData(pKilled, pKilledLevel, pKilledClass, pKilledFaction, pDead, pDeadLevel, pDeadClass, pDeadFaction, fame, currencyString) {
        fame = parseInt(fame);

        const killInfo = {
            name: pKilled,
            level: pKilledLevel,
            class: pKilledClass,
            faction: pKilledFaction,
            target: pDead,
            targetLevel: pDeadLevel,
            targetClass: pDeadClass,
            targetFaction: pDeadFaction,
            fame: fame,
            currencyString: currencyString,
            type: 2,
            time: Date.now(),
        };
        this.state.lastKillTime = killInfo.time;
        if (!this.state.trackAllKills && !(pKilled == profileManager.playerName || pDead == profileManager.playerName)) {
            return
        }

        if (pDead == profileManager.playerName) {

            killInfo.name = pDead;
            killInfo.level = pDeadLevel;
            killInfo.class = pDeadClass;
            killInfo.faction = pDeadFaction;

            killInfo.target = pKilled;
            killInfo.targetLevel = pKilledLevel;
            killInfo.targetClass = pKilledClass;
            killInfo.targetFaction = pKilledFaction;

            killInfo.type = 0;
            killInfo.fame *= -1;
        } else if (pKilled == profileManager.playerName) {
            killInfo.type = 1;
        }
        // console.log(
        //     `Adding data to kill tracker:
        //     name: ${profileManager.playerName}, level: ${profileManager.playerLevel}, class: ${profileManager.playerClass},
        //     target: ${target}, level: ${targetLevel}, class: ${targetClass},
        //     fame: ${fame},
        //     type: ${type},
        //     currency: ${currencyString},
        //     time: ${Date.now()}
        //     `
        // )

        this.state.killsInfo.push(killInfo);
        if (this.state.killsInfo.length > this.state.killsDataThreshold) {
            this.state.shift();
        }
        this.addToTopData("topFameData", "fame", "fameDataThreshold", killInfo);
        this.addToTopData("topCurrencyData", "currencyString", "currencyDataThreshold", killInfo);
        this.updateGrid();
        this.updateKillTrackerBtn(killInfo);
    },

    addToTopData(dataArrayName, sortProperty, thresholdName, killInfo) {
        const limit = this.state[thresholdName];
        const data = this.state[dataArrayName];
        let insertIndex = 0;

        // Find the correct position for the new entry
        while (insertIndex < data.length) {
            let newVal, currentVal;
            newVal = killInfo[sortProperty];
            currentVal = data[insertIndex][sortProperty];

            if (sortProperty == "currencyString") {
                newVal = this.getCurrency(newVal);
                currentVal = this.getCurrency(currentVal);
            }
            if (newVal <= currentVal)
                insertIndex++;
            else {
                break
            }
        }


        // Insert the new entry at the correct position
        data.splice(insertIndex, 0, killInfo);

        // Keep only the top 'limit' entries and remove the last element if needed
        if (data.length > limit) {
            data.pop();
        }
    },

    createTab(tabName, textContent) {
        const isSelected = this.state.selectedTab === tabName;

        const tab = element("div", {
            textContent: textContent,
            className: `btn black textsecondary ${isSelected ? "tab-button tab-selected" : "tab-button"}`,
        }).element;

        tab.addEventListener("click", () => {
            this.state.selectedTab = tabName;
            const allTabs = this.frame.querySelectorAll(".tab-button");
            allTabs.forEach(tab => {
                if (tab.textContent.split(" ").join("").toLowerCase() == tabName.toLowerCase()) {
                    tab.classList.add("tab-selected");
                } else {
                    tab.classList.remove("tab-selected");
                }
            });
            this.updateGrid();
        });

        return tab;
    },
    clearData() {
        this.state.killsInfo = [];
        this.state.topCurrencyData = [];
        this.state.topFameData = [];
    },
    handleArticle(chatArticle) {
        if (!this.tracking) return
        const { channel, text: pvpContent } = chatArticle.obj;
        chatArticle = chatArticle.element;
        if (channel && channel.textContent.trim().toLowerCase() === "pvp") {

            const pvpInfo = pvpContent.children[0].children;
            let [
                pKilledClass,
                pKilledLevel,
                pKilled,
                pDeadClass,
                pDeadLevel,
                pDead,
                fame,
                currencyString
            ] = pvpInfo;
            let pKilledFaction, pDeadFaction;
            pKilledClass = getClass(pKilledClass.src);
            pDeadClass = getClass(pDeadClass.src);

            pKilledLevel = pKilledLevel.textContent;
            pKilledFaction = pKilled.className[pKilled.className.length - 1];
            pKilled = pKilled.textContent;

            pDeadLevel = pDeadLevel.textContent;
            pDeadFaction = pDead.className[pDead.className.length - 1];
            pDead = pDead.textContent;

            if (!fame) fame = "0";
            else fame = fame.textContent;

            if (!currencyString) currencyString = "0";
            else currencyString = currencyString.textContent.trim();

            // console.log(`Player Killed: ${pKilled}`);
            // console.log(`Player Dead: ${pDead}`);
            // console.log(`Fame: ${fame}`);
            // console.log(`Currency: ${currencyString}`);


            this.addData(pKilled, pKilledLevel, pKilledClass, pKilledFaction, pDead, pDeadLevel, pDeadClass, pDeadFaction, fame, currencyString);
        }
    },
    clearLatestKills() {
        this.state.killsInfo = [];
        this.updateGrid();
    },
    inputDisplayEle: null,
    createFilterInput(placeholder, attribute) {
        const inputMouseEnter = (e) => {
            const displayEle = element("div", {
                className: "btn black textprimary",
                textContent: e.target.placeholder,
                style: `
                position: absolute;
                top: ${e.target.offsetTop - 40}px;
                left: ${e.target.offsetLeft}px;
                padding: 5px`
            }).element;
            this.inputDisplayEle = displayEle;
            e.target.parentNode.appendChild(displayEle);
        };
        const inputMouseLeave = (e) => {
            if (this.inputDisplayEle) {
                this.inputDisplayEle.remove();
                this.inputDisplayEle = null;
            }
        };
        const input = element("input", {
            type: "text",
            placeholder: placeholder,
            value: this.state.filters[attribute] || "",
            className: "btn black textsilver"
        }).element;

        if (attribute == "time") {
            input.type = "time";
            const parsedTime = this.parseTimestamp(this.state.filters[attribute]);
            const hourMinStr = parsedTime.h + ":" + parsedTime.m;

            input.value = hourMinStr;
        }
        input.addEventListener("input", (event) => {
            this.state.filters[attribute] = event.target.value;
            if (attribute == "time") {
                const [h, m] = event.target.value.split(":");
                this.state.filters[attribute] = this.getTimestamp(h, m);
            }
            // console.log(this.state.filters[attribute], attribute)
            this.updateGrid();
        });

        input.addEventListener("contextmenu", (event) => {
            event.preventDefault();
            event.stopPropagation();
            event.target.value = "";
            this.state.filters[attribute] = event.target.value;
            this.updateGrid();
        });

        input.addEventListener("mouseenter", inputMouseEnter);
        input.addEventListener("mouseout", inputMouseLeave);
        return input;
    },

    updateSortingDisplay() {
        this.sortingDisplay.textContent = `Sorting: ${this.state.sorting.column} in ${this.state.sorting.order == "asc" ? "Ascending" : "Descending"}`;
    },

    generateUI() {
        const existing = document.querySelector(".killtrackerKEK");
        if (existing) {
            existing.remove();
            return
        }
        const killWindow = createWindow("Kill Tracker", "100px", "100px", this.state._transform).element;
        const gridContainer = createGrid(this.columnNames, "killtrackerGrid").element;

        this.frame = killWindow;

        killWindow.addEventListener("contextmenu", (event) => {
            event.preventDefault();
            this.nameFilterInput.value = "";
            this.targetClassFilterInput.value = "";
            this.typeFilterInput.value = "";
            this.factionFilterInput.value = "";
            for (let filterName in this.state.filters) {
                if (filterName == "time") continue
                this.state.filters[filterName] = "";
            }
            this.updateGrid();
        });
        const titleframe = killWindow.querySelector(".titleframe");
        const sortingDisplay = element("div", {
            className: "btn black textgrey sortingDisplay tab-button",
            textContent: `Sorting: ${this.state.sorting.column} in ${this.state.sorting.order == "asc" ? "Ascending" : "Descending"}`
        }).element;

        this.sortingDisplay = sortingDisplay;


        const overflowContainer = element("div", {
            className: "overflowContainer",
            style: "overflow: hidden; max-height: 450px"
        }).element;

        overflowContainer.addEventListener("wheel", (event) => {
            // Adjust the scrollTop property based on your scrolling logic
            overflowContainer.scrollTop += event.deltaY;
        });

        const tabContainer = element("div", {
            className: "tab-container",
            style: "display: flex; flex-direction: row; margin-right: 10px",
        }).element;

        const latestKillsTab = this.createTab("latestKills", "Latest Kills");
        const topFameTab = this.createTab("topFame", "Top Fame");
        const topCurrencyTab = this.createTab("topCurrency", "Top Currency");

        const deleteBtn = element("div", {
            className: "btn black textgrey tab-button",
            textContent: "Delete Latest"
        }).element;
        deleteBtn.addEventListener("click", (e) => {
            this.clearLatestKills();
        });

        tabContainer.appendChild(latestKillsTab);
        tabContainer.appendChild(topFameTab);
        tabContainer.appendChild(topCurrencyTab);
        tabContainer.appendChild(sortingDisplay);
        tabContainer.appendChild(deleteBtn);

        titleframe.insertBefore(tabContainer, titleframe.childNodes[1]);

        const filterContainer = element("div", {
            className: "filter-container",
            style: "display: flex; flex-direction: row;"
        }).element;
        const factionFilterInput = this.createFilterInput("T. Faction Filter(0/1)", "faction");
        // Add input for name filter
        const nameFilterInput = this.createFilterInput("Name/Target Filter", "name");
        // Add input for targetClass filter
        const targetClassFilterInput = this.createFilterInput("T. Class (0/1/2/3)", "targetClass");

        const typeFilterInput = this.createFilterInput("Type (0/1/2)", "type");

        const timeFilterInput = this.createFilterInput("Time", "time");

        this.timeFilterInput = timeFilterInput;
        this.nameFilterInput = nameFilterInput;
        this.targetClassFilterInput = targetClassFilterInput;
        this.typeFilterInput = typeFilterInput;
        this.factionFilterInput = factionFilterInput;

        filterContainer.appendChild(nameFilterInput);
        filterContainer.appendChild(factionFilterInput);
        filterContainer.appendChild(targetClassFilterInput);
        filterContainer.appendChild(typeFilterInput);
        filterContainer.appendChild(timeFilterInput);

        overflowContainer.appendChild(gridContainer);

        killWindow.appendChild(filterContainer);
        killWindow.appendChild(overflowContainer);

        document.body.appendChild(killWindow);

        this.updateGrid();
    },

    updateGrid() {
        const existing = document.querySelector(".killtrackerGrid");
        if (!existing) return

        const gridParent = existing.parentNode;
        existing.remove();

        const grid = createGrid(this.columnNames, "killtrackerGrid").element;
        gridParent.appendChild(grid);

        let dataToShow, selectedTab = this.state.selectedTab;

        if (selectedTab == "latestKills") {
            dataToShow = this.sortData([...this.state.killsInfo]);
            const columnHeaders = grid.querySelectorAll(".grid-header");
            columnHeaders.forEach((header, index) => {
                if (this.columnToAttribute.hasOwnProperty(header.textContent)) {
                    // console.log("applying sorting on", header)
                    header.addEventListener("click", () => {
                        this.updateSorting(header.textContent);
                        this.updateGrid();
                    });
                }
            });

        } else if (selectedTab == "topFame") {
            dataToShow = this.state.topFameData;
        } else {
            dataToShow = this.state.topCurrencyData;
        }
        const filteredKills = dataToShow.filter((killInfo) => {
            let targetMatch = killInfo.target === this.state.filters.name;
            let nameMatch = killInfo.name === this.state.filters.name;
            let targetClassMatch = killInfo.targetClass == this.state.filters.targetClass;
            let typeMatch = killInfo.type == this.state.filters.type;
            let factionMatch = killInfo.targetFaction == this.state.filters.faction;
            let timeMatch = killInfo.time >= this.state.filters.time;

            if (this.state.filters.name == "") nameMatch = true;
            if (this.state.filters.targetClass == "") targetClassMatch = true;
            if (this.state.filters.type == "") typeMatch = true;
            if (this.state.filters.faction == "") factionMatch = true;
            if (this.state.filters.time == "") timeMatch = true;

            return timeMatch && (targetMatch || nameMatch) && targetClassMatch && typeMatch && factionMatch;
        });

        // console.log(filteredKills, grid)

        filteredKills.forEach(killInfo => {
            for (const [key, value] of Object.entries(killInfo)) {
                if (["targetFaction", "faction", "targetClass", "class", "level", "targetLevel"].includes(key)) continue
                const killItem = element("div", {
                    className: "btn black textsecondary kill-item",
                    textContent: value,
                    style: "text-align: left; padding-left: 10px"
                }).element;
                if (key == "fame") {
                    killItem.style.textAlign = "center";
                    killItem.style.paddingLeft = "0";
                    killItem.textContent = value.toLocaleString();
                    killItem.classList.remove("textsecondary");

                    if (killInfo.type == 0) {
                        killItem.classList.add("textred");
                    } else if (killInfo.type == 1) {
                        killItem.classList.add("textgreen");
                    } else {
                        killItem.classList.add("textfame");
                    }

                } else if (key == "type") {
                    let displayVal;
                    if (value == 1) displayVal = "Kill";
                    else if (value == 0) displayVal = "Death";
                    else displayVal = "Neutral";

                    killItem.textContent = displayVal;
                    killItem.addEventListener("click", (event) => {
                        this.typeFilterInput.value = value;
                        this.typeFilterInput.dispatchEvent(new InputEvent("input", { bubbles: true }));
                    });
                } else if (key == "time") {
                    const timestamp = value;
                    const date = new Date(timestamp);

                    const day = String(date.getDate()).padStart(2, '0');
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const hours = String(date.getHours()).padStart(2, '0');
                    const minutes = String(date.getMinutes()).padStart(2, '0');

                    const formattedDate = `${hours}:${minutes} ${day}-${month} `;
                    killItem.textContent = formattedDate;
                    killItem.addEventListener("click", (e) => {
                        this.timeFilterInput.value = `${hours}:${minutes}`;
                        this.timeFilterInput.dispatchEvent(new InputEvent("input", { bubbles: true }));
                    });
                } else if (key == "currencyString") {
                    killItem.style.textAlign = "center";
                    killItem.style.paddingLeft = "0";

                    killItem.textContent = "";
                    let [copper, silver, gold] = value.split(" ").reverse();
                    copper = copper || 0, silver = silver || 0, gold = gold || 0;

                    const copperImg = element("img", {
                        src: `/data/ui/currency/copper.avif`,
                        style: "height: 1em; vertical-align: -0.23em;"
                    }).element;

                    const silverImg = element("img", {
                        src: `/data/ui/currency/silver.avif`,
                        style: "height: 1em; vertical-align: -0.23em;"
                    }).element;

                    const goldImg = element("img", {
                        src: `/data/ui/currency/gold.avif`,
                        style: "height: 1em; vertical-align: -0.23em;"
                    }).element;

                    const copperText = element("span", {
                        className: "textcopper",
                        textContent: copper
                    }).element;

                    const silverText = element("span", {
                        className: "textsilver",
                        textContent: silver
                    }).element;

                    const goldText = element("span", {
                        className: "textgold",
                        textContent: gold
                    }).element;

                    if (gold !== 0) {
                        killItem.appendChild(goldText);
                        killItem.appendChild(goldImg);
                    }
                    if (silver !== 0) {
                        killItem.appendChild(silverText);
                        killItem.appendChild(silverImg);
                    }
                    killItem.appendChild(copperText);
                    killItem.appendChild(copperImg);


                } else if (key == "name" || key == "target") {
                    const classIcon = element("img", {
                        style: "height: 1.1em; vertical-align: -0.23em;",
                    }).element;
                    const levelEle = document.createTextNode("69 ");
                    const nameEle = element("span", {
                        textContent: value
                    }).element;

                    killItem.textContent = "";
                    if (key == "name") {
                        nameEle.classList.add(`textf${killInfo.faction}`);
                        classIcon.src = `/data/ui/classes/${killInfo.class}.avif`;
                        levelEle.textContent = `${killInfo.level} `;
                    } else {
                        nameEle.classList.add(`textf${killInfo.targetFaction}`);
                        classIcon.src = `/data/ui/classes/${killInfo.targetClass}.avif`;
                        levelEle.textContent = `${killInfo.targetLevel} `;
                    }
                    killItem.appendChild(classIcon);
                    killItem.appendChild(levelEle);
                    killItem.appendChild(nameEle);

                    killItem.addEventListener("click", (event) => {
                        this.nameFilterInput.value = value;
                        this.nameFilterInput.dispatchEvent(new InputEvent("input", { bubbles: true }));
                    });
                }
                grid.appendChild(killItem);
            }
        });
    },

    sortData(dataToSort) {
        const sortProperty = this.columnToAttribute[this.state.sorting.column];

        if (sortProperty) {
            dataToSort.sort((a, b) => {
                let valueA = a[sortProperty];
                let valueB = b[sortProperty];

                const multiplier = (this.state.sorting.order === "asc") ? 1 : -1;

                if (sortProperty == "currencyString") {
                    valueA = this.getCurrency(valueA);
                    valueB = this.getCurrency(valueB);
                }
                return multiplier * (valueA - valueB);
            });
        }
        this.updateSortingDisplay();
        return dataToSort
    },

    updateSorting(column) {
        if (this.state.sorting.column === column) {
            // Toggle the sorting order if clicking on the same column
            this.state.sorting.order = (this.state.sorting.order === "asc") ? "desc" : "asc";
        } else {
            // Change the sorting column if clicking on a different header
            this.state.sorting.column = column;
        }
    },

};

const interaction = {
    name: "Interaction",
    description: "Skip interaction dialogs.",
    state: {
        skip: true,
        sage: true,
        ai: true,
    },
    settings: {
        skip: {
            control: "checkbox",
            desc: "Skip interaction dialogs",
            comment: "for Traders, Stash, Merchant, Blacksmith"
        },
        sage: {
            control: "checkbox",
            desc: "Skip reset stat points dialog",
            comment: "for Sage"
        },
        ai: {
            control: "checkbox",
            desc: "Open inventory on interaction",
            comment: "Interactive inventory? Brilliant move!"
        },
    },
    start() {
        eventManager.on("ui.interactParent", this.interact, this);
    },
    stop() {
        eventManager.off("ui.interactParent", this.interact, this);
    },
    interact(target) {
        target = target.element;
        const nameElement = target.querySelector(".name");
        const name = nameElement ? nameElement.textContent.trim() : "";
        const btn = target.querySelector(".btn.textgreen");
        const skipNames = ["Stash", "Merchant", "Blacksmith", "Trader"];

        if (this.state.skip && (skipNames.includes(name) || skipNames.includes(name.split(" ")[1]))) {
            btn.click();

            this.state.ai && !document.contains(ui.bagParent.element) && ui.sysbag.element.click();

        } else if (this.state.sage && name === "Sage") {
            btn.click();
        }
    }


};

const itemWindow = {
    name: "Item Windows Tweaks",
    description: "Changes size and behaviour",
    state: {
        height: 20,
        width: 25,
        padding: 1,
    },
    settings: {
        height: { control: "range", min: 0, max: 50, step: 1, desc: "Height", comment: "Min Height of window", onupdate: "windowResize" },
        width: { control: "range", min: 0, max: 50, step: 1, desc: "Width", comment: "Min Width of window", onupdate: "windowResize" },
        padding: { control: "range", min: 0, max: 2, step: 0.1, desc: "Padding", comment: "Space between text and border", onupdate: "windowResize" },
    },
    crossBtn: null,
    frame: null,
    start() {
        eventManager.on("ui.itemParent", this.handle, this);
        document.addEventListener("contextmenu", () => {
            if (ui.mainContainer.element.contains(this.frame)) {
                this.crossBtn.click();
            }
        });
    },
    stop() {
        eventManager.off("ui.itemParent", this.handle, this);
    },
    windowResize() {
        const itemParent = ui.itemParent.element;
        this.handle(itemParent);
    },
    handle(itemParent) {
        itemParent = itemParent.element;
        this.frame = itemParent;
        if(!itemParent) return
        const slot = itemParent.childNodes[0].children[1];
        const titleframe = itemParent.childNodes[0].children[0];
        this.crossBtn = titleframe.childNodes[titleframe.childNodes.length - 1];
        const panel = slot.childNodes[0];
        const container = panel.childNodes[0];

        panel.style.minWidth = this.state.width + "vh";
        panel.style.minHeight = this.state.height + "vh";

        container.style.padding = this.state.padding + "vh";
    }
};

const closeWindow = {
    name: "Close Window Shortcut",
    description: "Close window with a single button!",
    start() {

    },
    stop() {
        
    },
    state: {
        closeBag: 0,
        closeDps: 0,
        closeSettings: 0,
    },
    settings: {
        closeBag: { control: "checkbox", desc: "Inventory", comment: "Close bag" },
        closeDps: { control: "checkbox", desc: "Damage Meter", comment: "Close dps meter" },
        closeSettings: { control: "checkbox", desc: "Settings", comment: "Close settings window" },
    },
    hotkey: {
        "Close All Windows": { key: "Escape", callback: "handle" }
    },
    handle() {
        const titleframes = document.querySelectorAll(".titleframe");
        
        for (let titleframe of titleframes) {
            const titleEle = titleframe.children[1];
            if(!titleEle) continue
            const title = titleEle.textContent.toLowerCase().trim();
            const closeBtn = titleframe.lastElementChild;
    
            const actions = {
                "inventory": this.state.closeBag,
                "damage": this.state.closeDps,
                "healing": this.state.closeDps,
                "settings": this.state.closeSettings,
            };
    
            if (!Object.prototype.hasOwnProperty.call(actions, title)) {
                closeBtn.click();
            }
            else if (actions[title]) {
                closeBtn.click();
            }
            
        }
    }
};

const chatTweaks = {
    name: "Chat Tweaks",
    description: "Different chat enhancements",
    state: {
        chatDark: 30,
        fontSize: 14,
        isShortChannel: 1,
        hideSupporterIcon: 1,
        isColoredNames: 1,
        width: 450,
        height: 240,
        darkenPvp: 1,
        pvpSide: 0,
        hideTime: 1,
        colorFaction: "#f68e7a",
        colorParty: "#2ed3f6",
        colorClan: "#ee960b",
        colorWhisper: "#ef3eff",
        colorGM: "#00ffa1",
        colorYell: "#d64417",
    },
    style: `
        .channelselect .btn:nth-child(7) {
            margin-left: auto;
        }

    `,
    settings: {
        chatDark: { control: "range", desc: "Chat Background", comment: "Adjust the transparency of the chat", step:10, onupdate: "updateChat" },
        fontSize: { control: "range", desc: "Font Size", comment: "Default: 14", min:12, max:24, onupdate: "updateChat" },
        isShortChannel: { control: "checkbox", desc: "Shorten channel names", comment: "Condense channel names to single letter", onupdate: "updateAllArticles" },
        hideSupporterIcon: { control: "checkbox", desc: "Remove supporter icons", comment: "Supporter icon remove", onupdate: "updateAllArticles" },
        isColoredNames: { control: "checkbox", desc: "Colored Names", comment: "Remove class icon", onupdate: "updateAllArticles" },
        width: { control: "range", desc: "Width", comment: "Default: 450", min:300, max:1000, onupdate: "updateChat" },
        height: { control: "range", desc: "Height", comment: "Default: 240", min:240, max:2000, onupdate: "updateChat" },
        darkenPvp: { control: "checkbox", desc: "Darken PVP", comment: "Reduces the brightness of PvP messages", onupdate: "updateAllArticles" },
        pvpSide: { control: "checkbox", desc: "Move PVP", comment: "Moves PvP messages to the right side", onupdate: "updateAllArticles" },
        hideTime: { control: "checkbox", desc: "Remove Time", comment: "Hide timestamps", onupdate: "updateAllArticles" },
        colorFaction: { control: "color", desc: "Faction", comment: "Faction channel color", default: "#f68e7a", onupdate: "updateAllArticles" },
        colorParty: { control: "color", desc: "Party", comment: "Party channel color", default: "#2ed3f6", onupdate: "updateAllArticles" },
        colorClan: { control: "color", desc: "Clan", comment: "Clan channel color", default: "#ee960b", onupdate: "updateAllArticles" },
        colorWhisper: { control: "color", desc: "Whisper", comment: "Whisper channel color", default: "#ef3eff", onupdate: "updateAllArticles" },
        colorGM: { control: "color", desc: "GM", comment: "GM channel color", default: "#00ffa1", onupdate: "updateAllArticles" },
        colorYell: { control: "color", desc: "Yell", comment: "Yell channel color", default: "#d64417", onupdate: "updateAllArticles" },

    },
    start() {
        eventManager.on("ui.chatPanel", this.uiHook, this);
        eventManager.on("ui.chatArticle", this.handleArticle, this);
        eventManager.on("ui.channelSelect", this.fixchannelSelect, this);
    },
    stop() {
    },
    uiHook(){
        this.fixAutocomplete();
        this.updateAllArticles();
        this.updateChat();
    },
    fixchannelSelect(channelSelect) {
        channelSelect.element.style.width = "100%";
        channelSelect.element.style.marginTop = "2px";
    },
    fixAutocomplete() {
        const chatInput = document.getElementById("chatinputelement");
        chatInput && chatInput.setAttribute("autocomplete", "off");
    },
    updateChat(){
        const chat = document.getElementById("chat");
        chat.style.background = `rgb(0 0 0 / ${this.state.chatDark}%)`;
        chat.style.fontSize = `${this.state.fontSize}px`;
        chat.parentNode.style.maxHeight = "100%";
        chat.parentNode.style.width = `${this.state.width}px`;
        chat.parentNode.style.height = `${this.state.height}px`;
    },
    updateAllArticles() {
        for (const article of ui.chatPanel.element.children) {
            this.handleArticle({obj:chatArticleParser(article)});
        }
    },
    handleArticle(chatArticle) {
        const obj = chatArticle.obj;

        if (!obj?.channel) return

        const {article, channel, sender_supporter, sender_icon, sender_info, sender_name, text } = obj;
        const { isShortChannel, hideSupporterIcon, isColoredNames, hideTime} = this.state;
        const channelText = channel.innerText.toLowerCase();

        const setStyles = (element, styles) => element && Object.assign(element.style, styles);

        if (["faction", "party", "clan", "from", "to", "yell", "pvp"].includes(channelText)) {
            const isPvpChannel = channelText === "pvp";
            
            isPvpChannel && setStyles(article, {
                filter: this.state.darkenPvp ? "brightness(0.7)" : "",
                marginLeft: this.state.pvpSide ? "auto" : "",
                width: this.state.pvpSide ? "fit-content" : "",
            });

            setStyles(channel, {
                width: isShortChannel && (isPvpChannel ? "0" : "0.55em"),
                display: isShortChannel ? (isPvpChannel ? "none" : "inline-flex") : "",
                overflow: isShortChannel ? "hidden" : "",
                textOverflow: isShortChannel ? "ellipsis" : "",
                whiteSpace: isShortChannel ? "nowrap" : ""
            });

            if (sender_icon) {
                setStyles(sender_icon, { display: isColoredNames ? "none" : "" });
                setStyles(sender_info, { paddingLeft: isColoredNames && sender_info.innerText < 10 ? "10px" : "" });

                //1C51FF shaman more dark
                setStyles(sender_name, { color: isColoredNames ? ["#C7966F", "#21A9E1", "#98CE64", "#4f78ff"][sender_icon.attributes.src.nodeValue[17]] : "" });
            }


            setStyles(sender_supporter, { display: hideSupporterIcon ? "none" : "" });

        }

        obj.time.style.display = hideTime && "none" || "inline-block";

        const { colorFaction, colorParty, colorClan, colorWhisper, colorGM, colorYell } = this.state;

        const colorMap = {
            faction: colorFaction,
            party: colorParty,
            clan: colorClan,
            to: colorWhisper,
            from: colorWhisper,
            gm: colorGM,
            yell: colorYell
        };

        setStyles(text, { color: colorMap[channelText] || "" });
    }


};

var mods = [
    // test,
    chatEmoji,
    blockPlayers,
    expbar,
    mouseOver,
    runeTracker,
    gloom,
    gui,
    showbuffs,
    whispers,
    itemSharing,
    isbis,
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
];

class ModuleManager {
    
    #registry = {}
    
    constructor() {
        // register all mods
        for (const mod of mods) {
            if(!Object.prototype.hasOwnProperty.call(mod, "name")) {
                throw new Error("Mod name is missing or falsy!")
            }
            // place to make mods defaults
            mod._enabled = true;
            this.#registry[mod.name] = mod;
        }

        stateManager.register("modules");
        eventManager.on("state.load", this.onLoad, this);
        eventManager.on("state.save", this.onSave, this);
    }

    init() {
        for (const mod of Object.values(this.#registry)) {
            if (mod._enabled && Object.prototype.hasOwnProperty.call(mod, "start")) {
                mod.start();
            }
        }
    }

    onLoad(globalState) {
        const playerName = profileManager.playerName;

        for (const [name, obj] of Object.entries(globalState.modules)) {
            
            if(!Object.prototype.hasOwnProperty.call(this.#registry, name)) {
                delete globalState.modules[name];
                continue
            }
            const mod = this.#registry[name];

            mod._enabled = obj._enabled;

            if (Object.prototype.hasOwnProperty.call(mod, "state")) {
                const targetState = playerName in obj ? obj[playerName] : obj._state;

                if (targetState) {
                    // Remove properties from targetState that are not in module.state
                    for (const prop in targetState) {
                        if (!(prop in mod.state)) {
                            delete targetState[prop];
                        }
                    }
                    // Merge properties from module.state and targetState
                    mod.state = {
                        ...mod.state,
                        ...targetState,
                    };
                }
            }
        }
    }

    onSave(globalState) {
        const playerName = profileManager.playerName;

        for (const { name, _enabled, state, _profiles } of Object.values(this.#registry)) {
            const module = globalState.modules[name] || {};

            module._enabled = _enabled !== undefined ? _enabled : true;

            if (state && _profiles) {
                module[playerName] = state;
            } else if (state) {
                module._state = state;
            }

            globalState.modules[name] = module;
        }
    }

    toggle(moduleName) {
        this.#registry[moduleName]._enabled ^= 1;
        this.#registry[moduleName]._enabled ? this.start(moduleName) : this.stop(moduleName);
        eventManager.trigger("mod.toggle", this.#registry[moduleName]);
    }

    start(moduleName) {
        const mod = this.#registry[moduleName];
        if (Object.prototype.hasOwnProperty.call(mod, "start")) {
            mod.start();
        }
    }

    stop(moduleName) {
        const mod = this.#registry[moduleName];
        if (Object.prototype.hasOwnProperty.call(mod, "stop")) {
            mod.stop();
        }
    }

    status(moduleName) {
        return this.#registry[moduleName]?._enabled
    }

    get(moduleName) {
        return this.#registry[moduleName]
    }
    [Symbol.iterator]() {
        const keys = Object.keys(this.#registry).sort();
        let index = 0;
        return {
            next: () => index < keys.length
                ? { value: this.#registry[keys[index++]], done: false }
                : { done: true }
        }
    }
}
const moduleManager = new ModuleManager();

// ext usage:    
// hotkey: {
//     "hotkey description": { key: "]", callback: "showFrame" }
// },


class KeyManager {

    #registry = {}

    constructor() {
        stateManager.register("keys");
        eventManager.on("state.load", this.onLoad, this);
        eventManager.on("state.save", this.onSave, this);
        eventManager.on("mod.toggle", this.onModToggle, this);

        document.addEventListener("keyup", this.handleKeyUp.bind(this));
    }

    init() {
        for (const mod of moduleManager) {
            const { name, hotkey } = mod;

            if (hotkey) {
                this.#registry[name] ||= {};

                for (const [hotkeyName, { key, callback }] of Object.entries(hotkey)) {
                    const isValidCallback = typeof callback === "string" &&
                        Object.prototype.hasOwnProperty.call(mod, callback) &&
                        typeof mod[callback] === "function";

                    if (isValidCallback) {
                        const lowercaseKey = key.toLowerCase();
                        this.#registry[name][hotkeyName] = lowercaseKey;
                        eventManager.on(`keyup.${lowercaseKey}`, mod[callback], mod);
                    }
                }
            }
        }
    }
    handleKeyUp(event) {
        const target = event.target.tagName.toLowerCase();
        if (target === "input" || target === "textarea") return

        const { key } = event;
        eventManager.trigger("keyup." + key.toLowerCase());
    }

    onLoad(globalState) {
        const { keys } = globalState;
        if (keys) {
            for (const modName in keys) {
                if (Object.prototype.hasOwnProperty.call(this.#registry, modName)) {
                    for (const [keyName, newKey] of Object.entries(keys[modName])) {
                        if (keyName in this.#registry[modName]) {
                            this.updateKey(modName, keyName, newKey);
                        }
                    }
                }
            }
        }
    }

    onSave(globalState) {
        globalState.keys = this.#registry;
    }

    onModToggle(mod){
        const modName = mod.name;
        if (Object.prototype.hasOwnProperty.call(this.#registry, modName)) {
            for (const [keyName, newKey] of Object.entries(this.#registry[modName])) {
                this.updateKey(modName, keyName, newKey);
            }
        }
    }

    updateKey(modName, keyName, newKey) {
        let mod = moduleManager.get(modName);
        let value = newKey.toLowerCase();
        let callbackName = mod.hotkey[keyName].callback;
        let registryKey = this.#registry[modName][keyName];
        this.#registry[modName][keyName] = value;
        eventManager.off("keyup." + registryKey, mod[callbackName], mod);
        if(mod._enabled){
            eventManager.on("keyup." + value, mod[callbackName], mod);
        }
    }

    [Symbol.iterator]() {
        const registryEntries = Object.entries(this.#registry);
        let index = 0;
        return {
            next: () => {
                if (index < registryEntries.length) {
                    const [key, obj] = registryEntries[index++];
                    return { value: [key, obj], done: false }
                } else {
                    return { done: true }
                }
            }
        }
    }
}

const keyManager = new KeyManager();

class StyleManager {
    constructor() {
        this.cssStyleSheet = new CSSStyleSheet();
        document.adoptedStyleSheets = [...document.adoptedStyleSheets, this.cssStyleSheet];

    }
    init() {
        this.css_mods = [...moduleManager].map(mod => mod.style || "").join("");
        this.cssStyleSheet.replaceSync(this.css_mods);
    }
    add(cssRules) {
        // Split the rules into an array and insert each rule individually
        cssRules.split("}").forEach((rule) => {
            const trimmedRule = rule.trim();
            if (trimmedRule !== "") {
                this.cssStyleSheet.insertRule(trimmedRule, this.cssStyleSheet.cssRules.length);
            }
        });
        document.adoptedStyleSheets = [...document.adoptedStyleSheets, this.cssStyleSheet];
    }
    show() {
        for (const rule of this.cssStyleSheet.cssRules) {
            console.log(rule.cssText);
        }
    }
}



const styleManager = new StyleManager();

window.st = styleManager;

class SettingsManager {
    constructor() {
        this.menu = {
            mod: {
                name: "[KEK] Mods",
                callback: "showMods"
            },
            key: {
                name: "[KEK] Hotkeys",
                callback: "showModKeys"
            },
            set: {
                name: "[KEK] Settings",
                callback: "showModSettings"
            },
            pro: {
                name: "[KEK] Pro",
                callback: "showPro"
            },
        };
    }
    init() {
        eventManager.on("ui.settingsParent", this.inject.bind(this));

        styleManager.add(`
            .kek-settings {
                display: grid;
                grid-template-columns: 1fr 1fr;
                grid-gap: 8px;
                align-items: center;
            }
            .kek-settings.mods{
                grid-template-columns: 4fr 1fr;
            }
            .title-grid{
                display: grid;
                grid-template-columns: auto 1fr;
                grid-gap: 8px;
                align-items: center;
            }
            .kek-settings .color {
                display: grid;
                grid-template-columns: 1fr auto;
                gap: 10px;
                justify-content: center;
                align-items: center;
            }
            .sticky {
                position: sticky;
                top: 0;
                background-color: #10131d;
            }
        `);
    }

    inject(wnd) {
        const settings = wnd.element.children[0].children[1].children[0];

        this.panel = element("div").css("menu panel-black scrollbar").style({ display: "none", paddingLeft: "12px", paddingTop: 0 }).text("test");
        settings.appendChild(this.panel.element);

        let settingsMenu = settings.children[0];
        let settingsPanel = settings.children[1];

        for (const [key, value] of Object.entries(this.menu)) {
            const menuName = element("div").css("choice").text(value.name).data("id", key);
            settingsMenu.appendChild(menuName.element);
        }

        settingsMenu.addEventListener("mouseup", e => {
            if (e.target.className !== "choice") return

            settingsMenu.childNodes.forEach(e => e.classList.remove("active"));
            if (e.target.dataset.id) {
                e.target.classList.add("active");
                settingsPanel.style.display = "none";
                this.panel.style({ display: "block" });
                this[this.menu[e.target.dataset.id].callback]();
            }
            else {
                settingsPanel.style.display = "block";
                this.panel.style({ display: "none" });
            }
        });
    }
    showMods() {
        const title = element("h3").css("textprimary").text("KEK mods");
        const settings = element("div").css("kek-settings mods");
        this.panel
            .clear()
            .add(title)
            .add(settings);

        for (const mod of moduleManager) {
            const modName = element("div").css("").text(mod.name);

            modName.add(element("br"));
            modName.add(element("small").css("textgrey").text(mod.description || "<no description>"));

            settings.add(modName);

            const modField = element("div").css(`btn checkbox${moduleManager.status(mod.name) && " active" || ""}`)
                .on("click", () => {
                    moduleManager.toggle(mod.name);
                    modField.toggle("active");
                });
            settings.add(modField);
        }
    }
    showModKeys() {
        const title = element("h3").css("textprimary").text("KEK Hotkeys");
        const settings = element("div").css("kek-settings");
        this.panel
            .clear()
            .add(title)
            .add(settings);

        for (const [modName, objs] of keyManager) {

            if (moduleManager.get(modName)._enabled) {
                const modTitle = element("div").css("textprimary").text(modName);
                settings.add(modTitle).add(element("div"));

                for (const keyDescription in objs) {
                    if (Object.prototype.hasOwnProperty.call(objs, keyDescription)) {
                        const fieldName = element("div").text(keyDescription);

                        const fieldControl = element("input").type("text").value(objs[keyDescription]).attr("maxlength", 1)
                            .on("keyup", e => {
                                e.target.value = e.key.toLowerCase();
                                keyManager.updateKey(modName, keyDescription, e.target.value);
                            });
                        settings.add(fieldName).add(fieldControl);
                    }
                }
            }
        }
    }

    showPro() {
        const titleGrid = element("div").css("title-grid sticky");

        const title = element("h3").css("textprimary").text("KEK Profiles");

        const modSelectContainer = element("div").css("panel-black");
        const modSelect = element("select").css("btn grey")
            .on("change", e => {
                const selectedOption = document.getElementById(e.target.value);
                const scrollableElement = this.panel.element;

                if (selectedOption) {
                    const offset = -90;
                    const targetPosition = selectedOption.offsetTop + offset;

                    scrollableElement.scrollTo({
                        top: targetPosition,
                        behavior: "smooth"
                    });
                }

            });
            
        modSelectContainer.add(modSelect);

        titleGrid.add(title).add(modSelectContainer);

        this.settings = element("div").css("kek-settings");

        this.panel
            .clear()
            .add(titleGrid)
            .add(this.settings);
    }

    showModSettings() {
        const titleGrid = element("div").css("title-grid sticky");

        const title = element("h3").css("textprimary").text("KEK Settings");

        const modSelectContainer = element("div").css("panel-black");
        const modSelect = element("select").css("btn grey")
            .on("change", e => {
                const selectedOption = document.getElementById(e.target.value);
                const scrollableElement = this.panel.element;

                if (selectedOption) {
                    const offset = -90;
                    const targetPosition = selectedOption.offsetTop + offset;

                    scrollableElement.scrollTo({
                        top: targetPosition,
                        behavior: "smooth"
                    });
                }

            });

        modSelectContainer.add(modSelect);

        titleGrid.add(title).add(modSelectContainer);

        this.settings = element("div").css("kek-settings");

        this.panel
            .clear()
            .add(titleGrid)
            .add(this.settings);

        for (const mod of moduleManager) {
            if (mod._enabled && mod.settings) {

                const modOption = element("option").attr("value", mod.name).text(mod.name);
                modSelect.add(modOption);

                const modTitle = element("div").css("textprimary").text(mod.name).attr("id", mod.name);
                this.settings.add(modTitle).add(element("div"));

                for (const [fieldName, field] of Object.entries(mod.settings)) {
                    this.makeField(mod, fieldName, field);
                }

                // empty line
                this.settings.add(element("br")).add(element("div"));

            }
        }

    }

    makeField(mod, fieldName, field) {
        // log(mod.state, fieldName, field)

        const fieldValue = element("div").text(field.desc);

        let control;

        if (field.control === "checkbox") {
            control = element("div")
                .css(`btn checkbox${mod.state[fieldName] ? " active" : ""}`)
                .on("pointerup", e => {
                    if (e.button === 0) {
                        e.target.classList.toggle("active");
                        mod.state[fieldName] ^= 1;
                        field.onupdate && mod[field.onupdate]();
                    }
                });
        }
        else if (field.control === "range") {

            let cur = element("span").css("textgrey").text(mod.state[fieldName]);

            fieldValue.element.appendChild(document.createTextNode(" "));
            fieldValue.add(cur);

            control = element("input").type("range").value(mod.state[fieldName]);

            control.element.step = field.step || 1;
            control.element.min = field.min || 0;
            control.element.max = field.max || 100;

            control.on("input", e => {
                cur.text(e.target.value);
                mod.state[fieldName] = e.target.value;
                field.onupdate && mod[field.onupdate]();
            });
        }
        else if (field.control === "text") {
            control = element("input").type("text").value(mod.state[fieldName]);
            control.on("input", e => {
                mod.state[fieldName] = e.target.value;
                field.onupdate && mod[field.onupdate]();
            });
        }
        else if (field.control === "number") {
            control = element("input").type("number").value(mod.state[fieldName]);
            control.on("input", e => {
                mod.state[fieldName] = parseInt(parseFloat(e.target.value));
                field.onupdate && mod[field.onupdate]();
            });
        }
        else if (field.control === "select") {
            control = element("select");

            for (let [v, t] of Object.entries(field.options)) {
                let option = element("option").value(v).selected(v == mod.state[fieldName]).text(t);
                control.add(option);
            }
            control.on("change", e => {
                mod.state[fieldName] = e.target.value;
                field.onupdate && mod[field.onupdate]();
            });
        }
        else if (field.control === "info") {
            control = element("span").text(mod.state[fieldName]);
        }
        else if (field.control === "color") {
            control = element("div").css("color");
            const colorpicker = element("input").type("color").value(mod.state[fieldName])
                .on("input", e => {
                    mod.state[fieldName] = e.target.value;
                    field.onupdate && mod[field.onupdate]();
                });
            const reset = element("div").css("btn black").text("default color").style({ color: field.default })
                .on("click", () => {
                    colorpicker.element.value = field.default;
                    mod.state[fieldName] = field.default;
                    field.onupdate && mod[field.onupdate]();
                });
            control.add(colorpicker).add(reset);
        }
        else {
            control = element("div").text(field.control);
        }

        if (field.comment) {
            fieldValue.add(element("br"));
            fieldValue.add(element("small").css("textgrey").text(field.comment));
        }
        this.settings.add(fieldValue);


        this.settings.add(control);


    }
}

const settingsManager = new SettingsManager();

class Core {
    constructor(){
        {
            Object.assign(window, {
                em: eventManager,
                api: apiManager,
                pm: profileManager,
                stm: storageManager,
                km: keyManager,
                sm: styleManager,
                st: stateManager,
                set: settingsManager,
                mm: moduleManager,
                ui: ui,
            });
        }
    }
    init() {
        const ufplayer = document.querySelector("#ufplayer");
        if(!ufplayer) {
            setTimeout(this.init.bind(this), 1);
        } else {
            this.initializeCoreModules();
            const body = document.body;
            const observer = new MutationObserver((mutationsList) => {
                mutationsList.forEach(mutation => {
                    mutation.addedNodes.forEach(node => {
                        // console.log(node, node.id)
                        if(node instanceof HTMLElement && node.matches(".layout")) {
                            ui.init();
                        }
                    });
                });
            });
            observer.observe(body, {childList: true});
        }
    }
    initializeCoreModules() {
        apiManager.init();
        bootManager.init();
        profileManager.init();
        if(!profileManager.playerName.endsWith("...")) {
            keyManager.init();
            styleManager.init();
            settingsManager.init();
            stateManager.init();
            moduleManager.init();
            ui.init();
            
            window.addEventListener("beforeunload", () => {
                stateManager.save();
            });
        } else {
            console.error("wrong profile found retrying...");
            setTimeout(this.initializeCoreModules.bind(this), 0);
        }
    }
}

const core = new Core();

core.init();
