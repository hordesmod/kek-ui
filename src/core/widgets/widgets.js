import { makeDraggable } from './drag';
import element from './element'; // Adjust the path accordingly

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
        if(typeof onClose == "function") onClose()
    });

    // Set the z-index
    mainContainer.style.zIndex = 10;

    // Return the main container
    if(transform) {
        makeDraggable(mainContainer.element, transform)
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

export {
    createWindow,
    createGrid
};
