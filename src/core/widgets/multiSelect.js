import log from "../logger"
import element from "./element"

const multiSelect = (args) => new MultiSelect(args)

class MultiSelect {
    constructor(args) {
        this.config = {
            search: true,
            height: "15rem",
            placeholder: "select",
            txtSelected: "selected",
            txtAll: "All",
            txtRemove: "Remove",
            txtSearch: "search",
            ...args
        }

        this.create()

        // var listWrap = newEl('div', { class: 'multiselect-dropdown-list-wrapper' });
        // var list = newEl('div', { class: 'multiselect-dropdown-list', style: { height: config.height } });

        // listWrap.appendChild(search);
        // div.appendChild(listWrap);
        // listWrap.appendChild(list);

    }

    create() {
        this.select = element("div").css("multiselect").attr("tabindex", 0)
            .style({
                fontSize: ".9em",
                boxSizing: "border-box",
                display: "inline-block",
                padding: "5px 8px",
                borderRadius: "3px",
                border: "3px solid #a4bfc5",
                backgroundColor: "#27353f",
                position: "relative",
                backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23dae8ea' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M2 5l6 6 6-6'/%3e%3c/svg%3e\")",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right .75rem center",
                backgroundSize: "16px 12px",
                width: "100%",
                color: "#dae8ea",

            })
            .on("click", () => {
                this.list.element.style.display = this.list.element.style.display === "block" ? "none" : "block"
            })
            .on("blur", () => {
                this.list.element.style.display = "none"
            })

        this.list = element("div").css("multiselect-list").style({
            backgroundColor: "#151a24",
            height: this.config.height,
            display: "none",
            overflowY: "auto",
            overflowX: "hidden",
            position: "absolute",
            top: "30px",
            left: 0,
            scrollbarWidth: "thin",
            scrollbarColor: "#5b858e rgba(0,0,0,0)",
            color: "#a6dcd5",
            width: "-webkit-fill-available",
            zIndex: 99,
            paddingTop: "6px",
        })
        this.select.add(this.list)

        this.values = element("div")
        this.select.add(this.values)

        for (const value of this.config.options) {
            if (value === "") {
                this.list.add(element("div").style({ marginTop: "12px" }))
                continue
            }
            const option = element("div")
                .style({
                    padding: "3px 6px",
                })
                .on("mouseenter", e => {
                    e.stopPropagation()
                    e.target.style.background = "#1967d2"
                    e.target.style.color = "#a6dcd5"
                })
                .on("mouseleave", e => {
                    e.stopPropagation()
                    e.target.style.background = ""
                    e.target.style.color = ""
                })
                .on("click", e => {
                    e.stopPropagation()
                    option.element.children[0].classList.toggle("active")
                    this.update()
                })
            const checkbox = element("div").css("btn checkbox")
            const label = element("div").text(value).style({
                // color: "#a6dcd5",
                paddingLeft: "0.7em",
                display: "inline-block",
            })
            option.add(checkbox).add(label)
            this.list.add(option)
        }

        this.element = this.select.element

        this.update()
    }

    set(options) {
        for (const option of this.list.element.children) {
            if (options.includes(option.children[1]?.innerText)) {
                option.children[0].classList.add("active")
            }
            else {
                option.children[0]?.classList.remove("active")
            }
        }
        this.update()
    }

    clear() {
        for (const option of this.list.element.children) {
            option.children[0]?.classList.remove("active")
        }
        this.update()
    }

    update() {
        this.values.clear()

        this.selected = []

        for (const option of this.list.element.children) {
            if (option.children[0]?.classList.contains("active")) {
                const value = element("span").style({ marginRight: "0.5em" }).text(option.children[1].textContent)
                this.values.add(value)
                // log(option.children[1].textContent)

                this.selected.push(option.children[1].textContent)
            }
        }

        if (this.selected.length === 0) {
            const placeholder = element("span").style({ color: "#759ea7" }).text(this.config.placeholder)
            this.values.add(placeholder)
        }
        // log(this.selected)
    }
}
export default multiSelect

