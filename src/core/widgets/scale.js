// Function to make an element scalable from a central point
function makeScaleable(element, scaleBtn, transform,
    excludeSelectors =
        [".ignoreScale"]
) {
    // console.log("making", element, "scaleable with ", transform, element.children)
    if(!transform._scale) return
    let originalWidth, originalHeight;
    element.style.width = transform.width + "px"
    element.style.height = transform.height + "px"
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

            let bar = child.querySelector(".bar")
            if (bar) {
                bar.style.width = transform.width + 'px';
                bar.style.height = transform.height + 'px';
            }
        }
    }
    let initialX, initialY;
    // Function to handle mouse down event on the scale button
    function handleScaleBtnMouseDown(event) {
        element.classList.add("is-scaling")
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
            const newWidth = originalWidth * widthScaleFactor
            const newHeight = originalHeight * heightScaleFactor
            element.style.width = newWidth + 'px';
            element.style.height = newHeight + 'px';

            transform.width = newWidth
            transform.height = newHeight
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

                    let bar = child.querySelector(".bar")
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
        element.classList.remove("is-scaling")

        // Remove event listeners for mouse move and mouse up events
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
    }

    // Add event listener for mouse down event on the scale button
    if (scaleBtn) {
        scaleBtn.addEventListener('mousedown', handleScaleBtnMouseDown);
    }
}

export {makeScaleable}