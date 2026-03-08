// element.js
import log from "../logger";

class HtmlElement {
    constructor(tagName, options, data) {
        this.element = document.createElement(tagName);
        Object.assign(this.element, options);
        Object.assign(this.element.dataset, data);
    }
    to(parent){
        parent.element.appendChild(this.element)
        return this
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
        this.element.hidden = true
        return this;
    }

    selected(is = false) {
        this.element.selected = is
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
        this.element.classList.remove(className)
        return this
    }

    toggle(className) {
        this.element.classList.toggle(className)
        return this
    }
    type(type) {
        this.element.type = type
        return this
    }
    value(value) {
        this.element.value = value
        return this
    }
    getPos(){
        return this.element.getBoundingClientRect()
    }
    // Removes all child elements from the element
    clear() {
        while (this.element.firstChild) {
            this.element.removeChild(this.element.firstChild)
        }
        return this
    }
}

const element = (tagName, options = {}, dataset = {}) => new HtmlElement(tagName, options, dataset)

export default element