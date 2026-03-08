import gui from "../../mods/gui";

// Function to make an element draggable
function hasChildWithClass(parentElement, className) {
    // Use querySelector to check if any child has the specified class
    return parentElement.querySelector('.' + className) !== null;
}

function makeDraggable(element, transform) {
    // console.log("making ", element, "draggable with", transform)
    if (!transform._drag) return

    const isChat = element.classList.contains("l-corner-ll")
    element.style.position = 'absolute';
    if(!isChat) element.style.top = transform.top + "px"
    else element.style.bottom = transform.top + "px"

    element.style.left = transform.left + "px"
    // Set initial position
    let startX, startY;
    let initialLeft = parseInt(element.style.left.split("px")[0]);
    let initialTop
    if(!isChat) initialTop = parseInt(element.style.top.split("px")[0]);
    else initialTop = parseInt(element.style.bottom.split("px")[0]);

    // Function to handle mouse down event
    function handleMouseDown(event) {
        element.classList.add("is-dragging")
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
            const newLeft = (initialLeft + deltaX)
            let newTop = (initialTop + deltaY)
            if(isChat) newTop = initialTop - deltaY
            element.style.left = newLeft + 'px';
            if(!isChat) element.style.top = newTop + 'px';
            else element.style.bottom = newTop + "px"


            transform.left = newLeft
            transform.top = newTop
        }
    }

    // Function to handle mouse up event
    function handleMouseUp() {
        element.classList.remove("is-dragging")
        // Update initial position for the next drag
        initialLeft = element.offsetLeft;
        if(!isChat) initialTop = element.offsetTop
        else initialTop = element.style.bottom.split("px")[0];

        // console.log(element.style.bottom.split("px")[0])
        // Remove event listeners for mouse move and mouse up events
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
    }

    // Add event listener for mouse down event
    element.addEventListener('mousedown', handleMouseDown);
}

export { makeDraggable }