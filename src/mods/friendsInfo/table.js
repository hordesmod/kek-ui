import element from "../../core/widgets/element"

class Table {
    constructor(data, selectedColumns = []) {
        this.element = element("table").css("panel-black")
        this.thead = element("thead")
        this.tbody = element("tbody")
        this.selectedColumns = selectedColumns
        this.element.append(this.thead)
        this.element.append(this.tbody)

        if (data && Array.isArray(data)) {
            this.populateTable(data)
        }
    }

    addHeader(headerData) {
        const headerRow = element("tr").css("textprimary")
        this.thead.prepend(headerRow)

        headerData = headerData.filter(header => header !== "_selected")

        headerData.forEach(headerText => {

            const headerCell = element("th").css("textcenter")
            headerCell.text(headerText)
            headerRow.append(headerCell)
        })

        return this
    }

    addRow(rowData) {
        const row = element("tr").css("striped")
        const { _selected, ...cleanedData } = rowData // Remove _selected property

        _selected && row.toggle("selected")
        this.tbody.append(row)

        Object.values(cleanedData).forEach((cellData, i) => {
            const cell = element("td")
            if(this.selectedColumns.includes(i)){
                cell.css("selected")
            } 
            if (typeof cellData === "object") {
                cell.append(cellData)
            } else {
                cell.text(cellData)
            }
            row.append(cell)
        })

        return this
    }

    populateTable(data) {
        if (data.length > 0) {
            this.addHeader(Object.keys(data[0]))
        }

        data.forEach(rowData => this.addRow(rowData))
        return this
    }


}

// Factory function for creating Table instances
const createTable = (data, selectedColumns) => new Table(data, selectedColumns)

export default createTable