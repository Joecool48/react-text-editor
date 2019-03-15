import AvlTreeList from "./avltreelist"
import React, { Component } from 'react';

//import KeyComboManager from './keyComboManager'

//const MAX_KEY_COMBO_LENGTH = 10

class Char {
    constructor(style, text, sp) {
        this.style = style
        this.text = text
        this.special = sp
        this.randomId = Math.random(0, 1000000000)
    }
}

// function findFromStart(arr, start, step, func) {
//     for (var i = start; i >= 0 && i < arr.length; i += step) {
//         if (func(arr[i])) return i
//     }
//     return undefined
// }

// function abs(a) {
//     return a > 0 ? a : -a
// }

function min(a, b) {
    return a < b ? a : b
}

// function max(a, b) {
//     return a > b ? a : b
// }

const INSERT_MODE = "Insert"
const NORMAL_MODE = "Normal"

class TextWindow extends Component {
    getNumLines() {
        return this.windowText.length
    }
    getLineLen() {
        return this.windowText.get(this.state.cursorLine).length
    }

    // concats the second list to the end of the first
    concat(arr1, arr2) {
        // iterate through arr2 and push to arr1
        var iter = arr2.iterator()
        while(iter.hasNext()) {
            var val = iter.next() // get element
            arr1.push(val)
        }
    }

    defaultMoveLeft(event) {
        if (this.state.editorMode !== INSERT_MODE && this.state.cursorCol === 0) return
        if (this.state.cursorCol === 0 && this.state.cursorLine === 0) return
        var row = this.state.cursorLine
        var col = this.state.cursorCol
        if (col === 0) {
            row -= 1
            col = this.windowText.get(row).length // col is 0 indexed
        }
        else col--
        this.setCursorPosition(row, col)
    }
    defaultMoveRight(event) {
        if (this.state.editorMode !== INSERT_MODE && this.state.cursorCol === this.windowText.get(this.state.cursorLine).length - 1) return
        if (this.state.cursorLine === this.windowText.length - 1 && this.state.cursorCol === this.windowText.get(this.state.cursorLine).length) return
        var row = this.state.cursorLine
        var col = this.state.cursorCol
        if (col === this.windowText.get(this.state.cursorLine).length) {
            row += 1
            col = 0
        }
        else col++
        this.setCursorPosition(row, col)
    }
    defaultMoveUp(event) {
        if (this.state.cursorLine === 0) return // cant move up anymore obviously
        // the new position above is calculated based off of the min of the current pos, and the next line
        var newColIdx = min(this.state.cursorCol, this.windowText.get(this.state.cursorLine - 1).length)
        this.setCursorPosition(this.state.cursorLine - 1, newColIdx)
    }
    defaultMoveDown(event) {
        // check out of bounds
        if (this.state.cursorLine === this.windowText.length - 1) return
        // same routine for calculating below idx as above
        var newColIdx = min(this.state.cursorCol, this.windowText.get(this.state.cursorLine +  1).length)
        this.setCursorPosition(this.state.cursorLine + 1, newColIdx)
    }
    // Deletes an element one to the left of the cursor position.
    // If there are no more left on the current line it goes to the line below to delete
    defaultDeleteLeft(event) {
        if (this.state.cursorLine === 0 && this.state.cursorCol === 0) return
        // if nothing in the line, then delete the line
        if (this.getLineLen() === 0) {
            this.windowText.remove(this.state.cursorLine)
            // removing at cursorLine should have us insert at cursorLine - 1 a []
            this.addUndoableState()
            var newCursorLine = this.state.cursorLine - 1
            this.setCursorPosition(newCursorLine, this.windowText.get(newCursorLine).length)
        }
        /* Append it to the row before */
        else if (this.state.cursorCol === 0 && this.state.cursorLine !== 0) {
            // save line length before concatenating
            var lineLen = this.windowText.get(this.state.cursorLine - 1).length
            this.concat(this.windowText.get(this.state.cursorLine - 1), this.windowText.get(this.state.cursorLine))
            this.windowText.remove(this.state.cursorLine)
            this.setCursorPosition(this.state.cursorLine - 1, lineLen)
        }
        else {
            this.windowText.get(this.state.cursorLine).remove(this.state.cursorCol - 1)
            this.setCursorPosition(this.state.cursorLine, this.state.cursorCol - 1)
        }
    }

    defaultDeleteRight(event) {
        // check if out of bounds
        if (this.state.cursorLine === this.windowText.length - 1 && this.state.cursorCol === this.windowText.get(this.state.cursorLine).length) return
        // concat the line before to your current line and remove the one before
        return // TODO later

        //if (this.state.cursorCol === this.windowText.get(this.state.cursorLine).length) {

        //}
    }

    setMode(newMode) {
        this.setState({editorMode: newMode})
        this.keyComboManager.setMode(newMode)
    }
    switchFromInsertToNormal() {
        if (this.state.cursorCol > 0) this.setCursorPosition(this.state.cursorLine, this.state.cursorCol - 1)
        this.setMode(NORMAL_MODE)
    }
    switchFromNormalToInsert() {
        this.setMode(INSERT_MODE)
    }

    skipToBeginning() {
        this.setCursorPosition(0, 0)
    }
    skipToEnd() {
        this.setCursorPosition(this.getNumLines() - 1, this.windowText.get(this.getNumLines() - 1).length)
    }
    skipToEndOfLine() {
        this.setCursorPosition(this.state.cursorLine, this.getLineLen())
    }

    deleteLine() {
        // stay at current cursorLine unless you were at the last one
        if(this.windowText.length === 0) return
        if (this.state.cursorLine !== 0) {
            this.windowText.remove(this.state.cursorLine)
            this.setCursorPosition(this.state.cursorLine - 1, 0) // set back to beginning of line
        }
        else {
            this.windowText.remove(this.state.cursorLine) // no need to go down a line
            this.setCursorPosition(this.state.cursorLine, 0)
        }
    }

    defaultAddNewline(event) {
        var avllist = new AvlTreeList()
        // if not at the end or beginning, split the line in two
        if (this.state.cursorCol !== 0 && this.state.cursorCol !== this.getLineLen()) {
            // split the array at position
            var newArr = this.windowText.get(this.state.cursorLine).splice(0, this.state.cursorCol)
            this.windowText.insert(this.state.cursorLine, newArr)
            this.setCursorPosition(this.state.cursorLine + 1, 0)
        }
        /* cursor is at beginning, so move the entire line up */
        else if (this.state.cursorCol === 0) {
            // insert a new list
            avllist.randomId = this.generateRandomId()
            this.windowText.insert(this.state.cursorLine, avllist)
            this.setCursorPosition(this.state.cursorLine + 1, 0) // technically it is at a undefined position since 0 doesnt exist
        }
        /* cursor is at end of line so add a line above it and increment linenum*/
        else {
            avllist.randomId = this.generateRandomId()
            this.windowText.insert(this.state.cursorLine + 1, avllist)
            this.setCursorPosition(this.state.cursorLine + 1, 0)
        }
    }
    // add a newline below current line, then switch to insert mode
    addNewlineInsert(event) {
        // insert a newline right after, and switch to it
        var avllist = new AvlTreeList()
        avllist.randomId = this.generateRandomId()
        this.windowText.insert(this.state.cursorLine + 1, avllist)
        this.setCursorPosition(this.state.cursorLine + 1, 0)
        this.switchFromNormalToInsert()
    }
    switchToAppend(event) {
      if (this.state.cursorCol <= this.windowText.get(this.state.cursorLine).length)
          this.setCursorPosition(this.state.cursorLine, this.state.cursorCol + 1)
      this.switchFromNormalToInsert()
    }

    // For react element. Generate a gigantic random number so
    // there is almost no propability for collisions
    generateRandomId() {
        return Math.random(0, 1000000000)
    }

    constructor (props) {
        super(props);
        this.state = {
            width: this.props.width,
            height: this.props.height,
            fontColor: this.props.fontColor,
            fontSize: this.props.fontSize,
            lineHeight: this.props.lineHeight,
            backgroundColor: this.props.backgroundColor,
            cursorColor: this.props.cursorColor,
            currentCursorColor: this.props.cursorColor,
            cursorLine: 0,
            cursorCol: 0,
            cursorMode: this.props.cursorMode,
            editorMode: INSERT_MODE
        }

        // the undo stack that stores previous commands to undo when called upon
        this.undoStack = []

        // outside of state for efficient updating
        this.windowText = new AvlTreeList() // create 2d list of avl list
        this.windowText.randomId = this.generateRandomId()
        this.modeList = [INSERT_MODE, NORMAL_MODE]

        this.keyComboManager = this.props.keyComboManager // get the key manager from the parent
        // signal the manager to set the start value
        this.keyComboManager.setCursorPos(1, 1)
        // id's for elements to get react to be quiet with its warning about key prop
        this.cursorRandomId = this.generateRandomId()
        this.mainDivRandomId = this.generateRandomId()
        // Register the macros with their respective modes.
        // MUST BIND THE FUNCTION TO THIS SO THAT IT CAN BE CALLED CORRECTLY OUTSIDE
        this.keyComboManager.registerKeyCombo(["ArrowLeft"], this.modeList, this.defaultMoveLeft.bind(this))
        this.keyComboManager.registerKeyCombo(["ArrowRight"], this.modeList, this.defaultMoveRight.bind(this))
        this.keyComboManager.registerKeyCombo(["ArrowUp"], this.modeList, this.defaultMoveUp.bind(this))
        this.keyComboManager.registerKeyCombo(["ArrowDown"], this.modeList, this.defaultMoveDown.bind(this))

        this.keyComboManager.registerKeyCombo(["Backspace"], [INSERT_MODE], this.defaultDeleteLeft.bind(this))
        this.keyComboManager.registerKeyCombo(["Enter"], [INSERT_MODE], this.defaultAddNewline.bind(this))
        this.keyComboManager.registerKeyCombo(["Delete"], [INSERT_MODE], this.defaultDeleteRight.bind(this))

        // switch to normal mode from insert
        this.keyComboManager.registerKeyCombo(["Escape"], [INSERT_MODE], this.switchFromInsertToNormal.bind(this))

        // switch to insert mode from normal
        this.keyComboManager.registerKeyCombo(["i"], [NORMAL_MODE], this.switchFromNormalToInsert.bind(this))

        // skip to beginning of file macro
        this.keyComboManager.registerKeyCombo(["g", "g"], [NORMAL_MODE], this.skipToBeginning.bind(this))

        // skip to end of file macro
        this.keyComboManager.registerKeyCombo(["G"], [NORMAL_MODE], this.skipToEnd.bind(this))

        // skip to end of line macro
        this.keyComboManager.registerKeyCombo(["$"], [NORMAL_MODE], this.skipToEndOfLine.bind(this))

        // move keys in normal mode for movement, deletion, and mode switching
        this.keyComboManager.registerKeyCombo(["j"], [NORMAL_MODE], this.defaultMoveDown.bind(this))
        this.keyComboManager.registerKeyCombo(["k"], [NORMAL_MODE], this.defaultMoveUp.bind(this))
        this.keyComboManager.registerKeyCombo(["h"], [NORMAL_MODE], this.defaultMoveLeft.bind(this))
        this.keyComboManager.registerKeyCombo(["l"], [NORMAL_MODE], this.defaultMoveRight.bind(this))
        //delete line macro
        this.keyComboManager.registerKeyCombo(["d", "d"], [NORMAL_MODE], this.deleteLine.bind(this))
        // switch to insert mode and append
        this.keyComboManager.registerKeyCombo(["a"], [NORMAL_MODE], this.switchToAppend.bind(this))
        // add a newline below and go to it
        this.keyComboManager.registerKeyCombo(["o"], [NORMAL_MODE], this.addNewlineInsert.bind(this))
    }

    // undo and redo operations. Maybe differentially save the state? This way we eat up much less memory than copying the entire thing

    createCharSpan(key, style, text) {
        return <span className="text" key={key} style={style}>{text}</span>
    }

    addTextAtPosition(line, col, elem) {
        if (col >= this.getLineLen()) this.windowText.get(line).push(elem)
        else this.windowText.get(line).set(col, elem)
        this.forceUpdate() // render to improve efficiency by not having the array in state
    }
    insertTextAfterPosition(line, col, elem) {
        if (this.getNumLines() === 0) {
            var avllist = new AvlTreeList()
            avllist.randomId = this.generateRandomId()
            this.windowText.push(avllist)
        }
        if (col >= this.getLineLen()) this.windowText.get(line).push(elem)
        else {
            this.windowText.get(line).insert(col, elem) // insert the element right after the current pos
        }
        this.forceUpdate()
    }
    onFocusHandler(event) {
        if (this.state.cursorPosition === null) {
            this.setState({cursorPosition: 0})
        }
        this.setState({shouldDrawCursor: true})
    }
    onBlurHandler(event) {
        this.setState({shouldDrawCursor: false})
    }
    setCursorPosition(row, col) {
        this.keyComboManager.setCursorPos(row + 1, col + 1)
        this.setState({cursorLine : row, cursorCol: col})
    }

    canDisplayChar(event) {
        var keycode = event.keyCode
        var valid =
          (keycode > 47 && keycode < 58)   || // number keys
          keycode === 32 || // spacebar & return key(s) (if you want to allow carriage returns)
          (keycode > 64 && keycode < 91)   || // letter keys
          (keycode > 95 && keycode < 112)  || // numpad keys
          (keycode > 185 && keycode < 193) || // ;=,-./` (in order)
          (keycode > 218 && keycode < 223)   // [\]' (in order)

          return valid
    }
    onKeyDownHandler(event) {
        if (this.state.editorMode === INSERT_MODE) {
            if (this.canDisplayChar(event) && event.shiftKey) {
                this.insertTextAfterPosition(this.state.cursorLine, this.state.cursorCol, new Char({}, event.key, false))
                this.setCursorPosition(this.state.cursorLine, this.state.cursorCol + 1);
            }
            else if (this.canDisplayChar(event)){
                this.insertTextAfterPosition(this.state.cursorLine, this.state.cursorCol, new Char({}, event.key, false))
                this.setCursorPosition(this.state.cursorLine, this.state.cursorCol + 1);
            }
        }
        this.keyComboManager.keyPressed(event)

        var handler = this.keyComboManager.getHandlerForMode(this.state.editorMode)
        this.setMode(this.state.editorMode)

        if (handler !== undefined)
            handler(event)
    }

    onKeyUpHandler(event) {
        this.keyComboManager.keyUnpressed(event)
    }

    createCursor(style, text) {
        return <span key={this.cursorRandomId} id="cursor">{text}</span>
    }

    // a method to mark the starting and ending lines that are displayed on screen
    // simply returns an array of the line to start from
    scrollRangeVertical() {
        // number of lines that can be displayed on screen vertically
        var numLines = 8 // this.state.width / this.state.lineHeight
        // needs no scrolling
        if (this.getNumLines() <= numLines) return 0
        // based on the cursor position show N many lines above and below
        var numOff = this.getNumLines() - numLines // number of lines that cant be displayed
        // display numLines / 2 above and below cursor position
        return Math.ceil(numOff)
    }
    // TODO Make it so that we can scroll horizontally and the text doesnt go off the screen
    // Cursor should always remain in the middle
    scrollRangeHorizontal() {

    }

    render() {
        const style = {
            width: this.state.width,
            height: this.state.height,
            backgroundColor: this.state.backgroundColor
        }
        // convert the avl 2d list to a 1d array using iterators to have linear time
        var elems = []
        var rowIdx = 0
        var colIdx = 0
        var func = function(elem) {
            if (!elem.special) {
                // idx functions as a key to get react to be quiet
                elems.push(this.createCharSpan(elem.randomId, elem.style, elem.text))
            }
            if (this.state.shouldDrawCursor && this.state.cursorCol - 1 === colIdx && this.state.cursorLine === rowIdx) elems.push(this.createCursor(null, "|"))
            colIdx++
        }
        // how many lines to display
        var displayLineNum = this.state.cursorLine + 8 > this.windowText.length ? this.windowText.length : this.state.cursorLine + 8
        for (rowIdx = this.scrollRangeVertical(); rowIdx < displayLineNum; rowIdx++) {
            if (this.state.shouldDrawCursor && this.state.cursorCol === 0 && this.state.cursorLine === rowIdx) elems.push(this.createCursor(null, "|"))
            colIdx = 0
            this.windowText.get(rowIdx).forEach(func, this)
            elems.push(<br key={this.windowText.get(rowIdx).randomId}></br>)
        }

        return <div key={this.divRandomId} id="editorWindow" onKeyDown={event => this.onKeyDownHandler(event)} onKeyUp={event => this.onKeyUpHandler(event)} tabIndex={-1} onBlur={event => this.onBlurHandler(event)} onFocus={event => this.onFocusHandler(event)} style={style}>
        {elems}
        </div>
    }
}

export default TextWindow
