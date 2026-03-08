import eventManager from "../core/event";
import log from "../core/logger";
import { getItemUI } from "../core/widgets/item";

const isbis = {
    name: "BIS Gear Identifier",
    description: "Scan and Identify Best-in-Slot gear",
    state: {
        rules: [
            ["Bloodline", "Stamina", "Critical", "Haste"],
            ["Bloodline", "Stamina", "Max Dmg.", "Haste"],
            ["Bloodline", "Stamina", "Min Dmg.", "Haste"],
            ["Bloodline", "Stamina", "Min Dmg.", "Critical"],
            ["Bloodline", "Stamina", "Max Dmg.", "Critical"],
            ["Bloodline", "Max Dmg.", "Critical", "Haste"],
            ["Bloodline", "Min Dmg.", "Critical", "Haste"],
            ["Bloodline", "Min Dmg.", "Max Dmg.", "Critical"],
            ["Bloodline", "Min Dmg.", "Max Dmg.", "Haste"],
            ["Bloodline", "Stamina", "Defense", "Critical"],
            ["Bloodline", "Stamina", "Defense", "Haste"],
        ]
    },
    start() {
        eventManager.on("ui.bagParent", this.handleBag, this)
    },
    stop() {
        eventManager.off("ui.bagParent", this.handleBag, this)
    },
    isBis(item) {
        const rules = this.getRules()
        // console.log(item)
        if (JSON.stringify(item) == "{}") return false
        // Define the required bonus stats combinations for BiS

        if (item.type == "orb") {
            rules.push(["Defense", "Critical", "Haste", "Stamina"])
            rules.push(["Defense", "Min Dmg.", "Haste", "Stamina"])
            rules.push(["Defense", "Max Dmg.", "Haste", "Stamina"])
            rules.push(["Defense", "Max Dmg.", "Critical", "Stamina"])
            rules.push(["Defense", "Min Dmg.", "Critical", "Stamina"])
            rules.push(["Stamina", "Max Dmg.", "Critical", "Haste"])
            rules.push(["Stamina", "Min Dmg.", "Critical", "Haste"])
            rules.push(["Min Dmg.", "Max Dmg.", "Critical", "Haste"])
            rules.push(["Min Dmg.", "Max Dmg.", "Stamina", "Haste"])
            rules.push(["Min Dmg.", "Max Dmg.", "Critical", "Stamina"])
        }
        // Get the bonus stats from the item
        const bonusStats = Object.keys(item.stats)
            .filter(stat => item.stats[stat].type === "bonus")
            .map(stat => stat.trim());

        // Check if any of the rules is satisfied by the item
        const isBiS = rules.some(rule => {
            return rule.every(requiredStat => {
                // For "Bloodline", check if the item has any of "Strength", "Wisdom", "Dexterity", or "Intelligence"
                if (requiredStat === "Bloodline") {
                    const bloodlineStats = ["Strength", "Wisdom", "Dexterity", "Intelligence"];
                    return bloodlineStats.some(bloodlineStat => bonusStats.includes(bloodlineStat));
                }
                return bonusStats.includes(requiredStat);
            });
        });

        return isBiS;
    },

    saveRules(rules) {
        this.state.rules = rules
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
        bagMenuParent = bagMenuParent.element
        const mainSlot = bagMenuParent.querySelector(".slot")
        const slotContainer = mainSlot.querySelector(".slotcontainer")

        const btnContainer = document.createElement("div")
        btnContainer.classList.add("bagBtnContainerKEK")
        btnContainer.style.display = "flex"
        btnContainer.style.flexDirection = "row"

        const bisBtn = document.createElement("div")
        bisBtn.classList.add("btn", "black", "textsecondary")
        bisBtn.textContent = "Show Bis"

        bisBtn.addEventListener("click", () => {
            const slots = slotContainer.children
            if (!slots) return
            if (bisBtn.textContent.toLowerCase() == "show bis") {
                bisBtn.textContent = "Hide Bis"
                let bisSlots = []
                for (let slot of slots) {
                    slot.dispatchEvent(new PointerEvent("pointerenter"))
                    setTimeout(() => {
                        const isbis = this.isBis(getItemUI(slot))
                        if (isbis) {
                            bisSlots.push(slot)
                        }
                        slot.dispatchEvent(new PointerEvent("pointerleave"))
                    }, 50)
                }
                setTimeout(() => {
                    bisSlots.forEach(slot => slot.classList.add("red"))
                }, 250)
                
            } else {
                bisBtn.textContent = "Show Bis"
                for (let slot of slots) {
                    slot.classList.remove("red")
                }
            }

        })

        const rulesBtn = document.createElement("div")
        rulesBtn.classList.add("btn", "black", "textsecondary")
        rulesBtn.textContent = "Rules"

        rulesBtn.style.flex = 1
        bisBtn.style.flex = 1
        bisBtn.style.textAlign = "center"
        rulesBtn.style.textAlign = "center"

        rulesBtn.addEventListener("click", () => {
            const existing = document.querySelector(".rulesContainerKEK")
            if (existing) {
                existing.remove()
                return
            }
            let ruleCounter = 4; // Start with all four dropdowns

            const createRuleDropdown = (options) => {
                const ruleDropdown = document.createElement("div");
                ruleDropdown.classList.add("ruleDropdownKEK");

                const select = document.createElement("select");
                select.classList.add("rulesSelectKEK");
                select.classList.add("black", "textsecondary");
                select.style.width = "110px";
                select.style.padding = "7px"
                select.style.background = "black"
                select.style.border = "1px solid black"
                // Create an initial placeholder option
                const placeholderOption = document.createElement("option");
                placeholderOption.value = "";
                placeholderOption.textContent = "Stat";
                placeholderOption.disabled = true
                placeholderOption.selected = true
                select.appendChild(placeholderOption);

                // Populate options based on the provided array
                options.forEach(option => {
                    const optionElement = document.createElement("option");
                    optionElement.classList.add("btn", "black", "textsecondary");
                    optionElement.value = option;
                    optionElement.textContent = option;
                    select.appendChild(optionElement);
                });


                // Add change event listener to disable selected option in other dropdowns
                select.addEventListener("change", () => {
                    disableSelectedOption(select);
                });

                ruleDropdown.appendChild(select);

                return ruleDropdown;
            }

            const disableSelectedOption = () => {
                const allDropdowns = document.querySelectorAll(".rulesSelectKEK");
                const selectedValues = Array.from(allDropdowns).map(dropdown => dropdown.value);

                // Iterate through all dropdowns
                allDropdowns.forEach(currentDropdown => {
                    // Iterate through the options in the current dropdown (exclude placeholder)
                    for (let i = 1; i < currentDropdown.options.length; i++) {
                        const option = currentDropdown.options[i];

                        // Enable the option if it"s not in the selectedValues array, disable otherwise
                        option.disabled = selectedValues.includes(option.value);
                    }
                });
            }

            const updateRuleListContainer = () => {
                const ruleListContainer = document.querySelector(".ruleListContainerKEK");
                // console.log(ruleListContainer)
                if (!ruleListContainer) return;

                const rules = this.getRules()
                // Clear the existing content
                ruleListContainer.innerHTML = "";

                // Iterate through each rule and create a flex container for it
                rules.forEach((rule, index) => {
                    const ruleContainer = document.createElement("div");
                    ruleContainer.classList.add("ruleFlexContainerKEK");
                    ruleContainer.style.display = "flex"
                    ruleContainer.style.flexDirection = "row"

                    // Add each stat as a separate div
                    rule.forEach(stat => {
                        const statDiv = document.createElement("div");
                        statDiv.textContent = stat;
                        statDiv.style.flex = 1
                        statDiv.classList.add("ruleStatItemKEK", "btn", "black", "textsecondary", "border");
                        statDiv.style.borderRadius = "0"
                        ruleContainer.appendChild(statDiv);
                    });

                    // Add delete button
                    const deleteBtn = document.createElement("div");
                    deleteBtn.textContent = "🗑";
                    deleteBtn.classList.add("btn", "black", "textsecondary", "border");
                    deleteBtn.style.borderRadius = "0";
                    deleteBtn.addEventListener("click", () => {
                        this.deleteRule(rule);
                        updateRuleListContainer(); // Refresh the rule list after deletion
                    });
                    ruleContainer.appendChild(deleteBtn);

                    // Add the rule container to the rule list container
                    ruleListContainer.appendChild(ruleContainer);
                });
            }

            const rulesContainer = document.createElement("div");
            rulesContainer.classList.add("rulesContainerKEK")
            rulesContainer.style.position = "absolute";

            // Create a container for rule dropdowns
            const rulesDropdownContainer = document.createElement("div");
            rulesDropdownContainer.classList.add("rulesDropDownContainerKEK");
            rulesDropdownContainer.style.display = "flex";
            rulesDropdownContainer.style.flexDirection = "row";

            const rulesListContainer = document.createElement("div");
            rulesListContainer.classList.add("ruleListContainerKEK")

            const allStats = ["Bloodline", "Stamina", "Defense", "Critical", "Haste", "Max Dmg.", "Min Dmg.", "Block", "Strength"]
            // Create all four rule dropdowns with initial options
            for (let i = 0; i < ruleCounter; i++) {
                const ruleDropdown = createRuleDropdown(allStats);
                rulesDropdownContainer.appendChild(ruleDropdown);
            }

            const plusBtn = document.createElement("div")
            plusBtn.textContent = "Add"
            plusBtn.style.padding = "5px"
            plusBtn.classList.add("btn", "black", "textsecondary")

            plusBtn.addEventListener("click", (e) => {
                e.stopPropagation();

                const selectedValues = Array.from(document.querySelectorAll(".rulesSelectKEK")).map(dropdown => dropdown.value);

                const newRule = selectedValues.filter(value => value !== ""); // Remove empty values

                if (newRule.length == 0) return

                // Add the new rule to localStorage and update the displayed rules
                const rules = this.getRules();
                rules.push(newRule);
                this.saveRules(rules);
                updateRuleListContainer();

                // Reset selected values to placeholder option
                document.querySelectorAll(".rulesSelectKEK").forEach(select => {
                    select.value = "";
                    const options = select.children
                    for (let option of options) {
                        option.disabled = false
                    }
                });
            });
            rulesDropdownContainer.appendChild(plusBtn)

            rulesContainer.appendChild(rulesDropdownContainer);
            rulesContainer.appendChild(rulesListContainer)

            // Append rulesContainer after the slotContainer"s width is over
            const slotContainerRect = slotContainer.getBoundingClientRect();
            const rulesContainerLeft = slotContainerRect.width;

            rulesContainer.style.left = `${rulesContainerLeft + 20}px`;

            mainSlot.insertBefore(rulesContainer, mainSlot.firstChild);

            updateRuleListContainer()
        });

        btnContainer.appendChild(bisBtn)
        btnContainer.appendChild(rulesBtn)


        mainSlot.insertBefore(btnContainer, slotContainer)
    },

}

export default isbis