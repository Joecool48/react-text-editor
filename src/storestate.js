const INSERT = 1
const DELETE = 0
class StoreState {
    // create a state starting at the current postiion
    
    constructor(cursorRow, cursorCol) {
        this.stateStack = []
    }
    addLineSectionToState(line, text, startCol, endCol, action) {
        if (action !== INSERT && action !== DELETE)
            throw Object.assign(new Error("StoreState action not recognized"))
        this.stateStack.push({
            line: line,
            startCol: startCol,
            endCol: endCol,
            text: text,
            action: action
        })
        
    }
    getTopPartState() {
        return this.stateStack.pop()
    }
    isStateEmpty() {
        return this.stateStack.length === 0
    }
}
export default StoreState
