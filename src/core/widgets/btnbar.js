import element from "./element"

function addSysbtn(sysbtnbar, btn) {
    let customBtnbar = document.querySelector(".sysbtnbarKEK")
    if(!customBtnbar) {
        customBtnbar = element("div", {
            className: "sysbtnbarKEK",
            style: "display: flex; float: right; clear: right;"
            // style: "display: flex; float: right; clear: right; margin: 5px"
        }).element
        sysbtnbar.parentNode.appendChild(customBtnbar)
    }
    btn.addEventListener("mouseenter", () => {
        if (customBtnbar) {
            const displayBtn = element("div", {
                className: "btn black displayBtnKEK border textsecondary",
                textContent: btn.tooltip,
                style: "padding-left: 3px; padding-right: 3px; margin: 2px;"
            }).element
            customBtnbar.insertBefore(displayBtn, customBtnbar.firstChild)
        }
    })

    btn.addEventListener("mouseleave", () => {
        if (customBtnbar) {
            const displayBtn = customBtnbar.querySelector(".displayBtnKEK")
            if (displayBtn) {
                displayBtn.remove()
            }
        }
    })
    customBtnbar.appendChild(btn)
}

function addPartybtn(partyBtnbar, btn) {
    // console.log(partyBtnbar, btn)
    partyBtnbar.appendChild(btn)
}

export {
    addPartybtn, 
    addSysbtn
}