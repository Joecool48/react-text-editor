import React, { Component } from 'react';

//import KeyComboManager from './keyComboManager'

const MAX_KEY_COMBO_LENGTH = 10

class Char {
    constructor(style, text, sp) {
        this.style = style
        this.text = text
        this.special = sp
        this.randomId = Math.random(0, 1000000000)
    }
}

function findFromStart(arr, start, step, func) {
    for (var i = start; i >= 0 && i < arr.length; i += step) {
        if (func(arr[i])) return i
    }
    return undefined
}

function abs(a) {
    return a > 0 ? a : -a
}

const INSERT_MODE = "Insert"
const NORMAL_MODE = "Normal"

class TextWindow extends Component {

    // Takes in a position and a set and finds the value right before and value right after pos
    findPrevLineBreak(set, pos) {
        var minIdx = undefined
        var dist = pos
        console.log(set)
        var arr = Array.from(set)
        for (var i = 0; i < arr.length; i++) {
            console.log(arr[i])
            if (arr[i] <= pos && pos - arr[i] < dist) {
                dist = (pos - arr[i])
                minIdx = arr[i]
            }
        }
        return minIdx === undefined ? 0 : minIdx
    }
    findNextLineBreak(set, pos) {
      console.log("Position:", pos)
        var maxIdx = undefined
        var dist = pos
        var arr = Array.from(set)
        for (var i = 0; i < arr.length; i++) {
            if (arr[i] >= pos && abs(pos - arr[i]) < dist) {
                dist = abs(pos - arr[i])
                maxIdx = arr[i]
            }
        }
        console.log("Next break: ", maxIdx)
        return maxIdx === undefined ? this.state.windowText.length : maxIdx
    }

    defaultMoveLeft(event) {
        if (this.state.editorMode !== INSERT_MODE && this.lineBreakSet.has(this.state.cursorPosition - 1)) return
        if (this.state.cursorPosition === 0) return
        this.setCursorPosition(this.state.cursorPosition - 1);
    }
    defaultMoveRight(event) {
        if (this.state.editorMode !== INSERT_MODE && this.lineBreakSet.has(this.state.cursorPosition + 1)) return
        if (this.state.cursorPosition >= this.state.windowText.length) return
        this.setCursorPosition(this.state.cursorPosition + 1)
    }
    defaultMoveUp(event) {
        // find the last index of newline
        console.log("In defaultMoveUp")
        var currentLineIdx = this.findPrevLineBreak(this.lineBreakSet, this.state.cursorPosition)


        // no more lines in the array
        if (currentLineIdx === undefined) return

        var prevLineIdx = this.findPrevLineBreak(this.lineBreakSet, currentLineIdx)


        if (prevLineIdx === undefined) prevLineIdx = 0

        console.log(currentLineIdx, prevLineIdx)

        var dist = this.state.cursorPosition - currentLineIdx
        var offset = prevLineIdx + dist
        if (offset > currentLineIdx) this.setCursorPosition(currentLineIdx)
        else this.setCursorPosition(offset)
    }
    defaultMoveDown(event) {
        // find the last index of newline
        console.log("In defaultMoveDown")
        var currentLineIdx = this.findPrevLineBreak(this.lineBreakSet, this.state.cursorPosition)


        // no more lines in the array
        if (currentLineIdx === undefined) currentLineIdx = 0

        var nextLineIdx = this.findNextLineBreak(this.lineBreakSet, this.state.cursorPosition)

        console.log(currentLineIdx, nextLineIdx)

        if (nextLineIdx === undefined) return

        var dist = this.state.cursorPosition - currentLineIdx
        var offset = nextLineIdx + dist
        this.setCursorPosition(offset)
    }

    defaultDeleteLeft(event) {
        if (this.state.cursorPosition === 0) return
        this.removeTextAtPosition(this.state.cursorPosition - 1)
        this.setCursorPosition(this.state.cursorPosition - 1)
    }

    defaultDeleteRight(event) {
        this.removeTextAtPosition(this.state.cursorPosition)
    }

    defaultAddNewline(event) {
        // add a break to simulate a return
        var c = new Char({}, event.key, true)
        this.lineBreakSet.add(this.state.cursorPosition) // cache the location of the index
        console.log(this.lineBreakSet)
        this.insertTextAfterPosition(this.state.cursorPosition, c)
        this.setCursorPosition(this.state.cursorPosition + 1);
    }
    setMode(newMode) {
        this.setState({editorMode: newMode})
        this.keyComboManager.setMode(newMode)
    }
    switchFromInsertToNormal() {
        if (this.state.cursorPosition > 0 && !this.lineBreakSet.has(this.state.cursorPosition - 1)) this.setCursorPosition(this.state.cursorPosition - 1)
        this.setMode(NORMAL_MODE)
    }
    switchFromNormalToInsert() {
        this.setMode(INSERT_MODE)
    }

    skipToBeginning() {
        this.setCursorPosition(0)
    }
    skipToEnd() {
        this.setCursorPosition(this.state.windowText.length)
    }
    skipToEndOfLine() {
        var lineBreak = this.findNextLineBreak(this.lineBreakSet, this.cursorPosition)
        if (lineBreak === undefined) this.setCursorPosition(this.state.windowText.length)
        else this.setCursorPosition(lineBreak)
    }

    deleteLine() {
        console.log("Deleted line")
        var prev = this.findPrevLineBreak(this.lineBreakSet, this.state.cursorPosition)
        var next = this.findNextLineBreak(this.lineBreakSet, this.state.cursorPosition)
        var firstHalf = this.state.windowText.slice(0, prev)
        var secondHalf = this.state.windowText.slice(next)
        console.log(this.lineBreakSet)
        this.lineBreakSet.delete(prev) // get rid of the line break you just deleted
        var newArr = firstHalf.concat(secondHalf)
        this.setState({windowText: newArr})
        var cursor = this.findPrevLineBreak(this.lineBreakSet, prev - 1)
        this.setCursorPosition(cursor + 1)
    }

    switchToAppend() {
      if (this.state.cursorPosition < this.state.windowText.length && !this.lineBreakSet.has(this.state.cursorPosition + 1)) this.setCursorPosition(this.state.cursorPosition + 1)
      this.switchFromNormalToInsert()
    }

    constructor (props) {
        super(props);
        this.state = {
            width: this.props.width,
            height: this.props.height,
            fontColor: this.props.fontColor,
            backgroundColor: this.props.backgroundColor,
            cursorColor: this.props.cursorColor,
            currentCursorColor: this.props.cursorColor,
            cursorPosition: null,
            cursorMode: this.props.cursorMode,
            editorMode: INSERT_MODE,
            windowText: []
        }
        this.line = 0
        this.col = 0
        // set up the handlers
        this.keyBindingMap = {
            NORMAL_MODE: {
                'h': this.defaultMoveLeft,
                'l': this.defaultMoveRight,
                'j': this.defaultMoveDown,
                'k': this.defaultMoveUp,
                'gg': this.gotToFirstLine,
                'G': this.goToLastLine,
                'w': this.jumpForwardStartWord,
                'e': this.jumpforwardEndWord,
                'b': this.jumpBackStartWord,
                '0': this.jumpStartLine,
                '$': this.jumpEndLine,
                'a': this.appendToCursor,
                'i': this.enterInsertMode,
            }
        }
        // cache that keeps line breaks indexes into the main array
        this.lineBreakSet = new Set()

        this.modeList = [INSERT_MODE, NORMAL_MODE]

        this.keyComboManager = this.props.keyComboManager // get the key manager from the parent

        // id's for elements to get react to be quiet with its warning about key prop
        this.cursorRandomId = Math.random(0, 1000000000)
        this.mainDivRandomId = Math.random(0, 1000000000)
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

        // move keys in normal mode
        this.keyComboManager.registerKeyCombo(["j"], [NORMAL_MODE], this.defaultMoveDown.bind(this))
        this.keyComboManager.registerKeyCombo(["k"], [NORMAL_MODE], this.defaultMoveUp.bind(this))
        this.keyComboManager.registerKeyCombo(["h"], [NORMAL_MODE], this.defaultMoveLeft.bind(this))
        this.keyComboManager.registerKeyCombo(["l"], [NORMAL_MODE], this.defaultMoveRight.bind(this))
        this.keyComboManager.registerKeyCombo(["d", "d"], [NORMAL_MODE], this.deleteLine.bind(this))
        this.keyComboManager.registerKeyCombo(["a"], [NORMAL_MODE], this.switchToAppend.bind(this))
    }

    createCharSpan(key, style, text) {
        return <span key={key} style={style}>{text}</span>
    }

    addTextAtPosition(position, elem) {
        var arrClone = this.state.windowText.slice(0)
        if (position >= this.state.windowText.length) arrClone.push(elem)
        else arrClone[position] = elem
        this.setState({windowText: arrClone})
    }
    insertTextAfterPosition(position, elem) {
        var arrClone = this.state.windowText.slice(0)
        if (position >= this.state.windowText.length) arrClone.push(elem)
        else arrClone.splice(position, 0, elem)
        this.setState({windowText: arrClone})
    }
    removeTextAtPosition(position) {
        if(position < 0) return
        var arrClone = this.state.windowText.slice(0)
        if (position >= this.state.windowText.length) return
        if (this.state.windowText[position].special && this.state.windowText[position].text === "Enter")
            this.lineBreakSet.delete(position)
        console.log(this.lineBreakSet)
        arrClone.splice(position, 1)
        this.setState({windowText: arrClone})
    }
    onFocusHandler(event) {
        if (this.state.cursorPosition === null) {
            this.setState({cursorPosition: 0})
        }
        this.setState({shouldDrawCursor: true})
        console.log("Focus received")
    }
    onBlurHandler(event) {
        this.setState({shouldDrawCursor: false})
        console.log("Focus unreceived")
    }
    calcLineNumber(set, pos) {
      var arr = Array.from(set)
      var count = 0
      for (var i = 0; i < arr.length; i++) {
          if (arr[i] <= pos) count++
          else break
      }
      return count
    }
    setCursorPosition(pos) {
        if (pos < 0) return
        this.keyComboManager.setCursorPos(this.calcLineNumber(this.lineBreakSet, this.state.cursorPosition) + 1, this.state.cursorPosition - this.findPrevLineBreak(this.lineBreakSet, this.state.cursorPosition) + 1)
        this.setState({cursorPosition: pos})
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
                this.insertTextAfterPosition(this.state.cursorPosition, new Char({}, event.key, false))
                this.setCursorPosition(this.state.cursorPosition + 1);
            }
            else if (this.canDisplayChar(event)){
                this.insertTextAfterPosition(this.state.cursorPosition, new Char({}, event.key, false))
                this.setCursorPosition(this.state.cursorPosition + 1);
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

    render() {
        const style = {
            width: this.state.width,
            height: this.state.height,
            backgroundColor: this.state.backgroundColor
        }
        var pos = this.state.cursorPosition
        var displayElems = this.state.windowText.map((elem, idx) => {
            if (!elem.special) {
                // idx functions as a key to get react to be quiet
                return this.createCharSpan(elem.randomId, elem.style, elem.text)
            }
            else if (elem.special && elem.text === "Enter") {
                return <br key={elem.randomId}></br>
            }
            else {
                return
            }
        })
        // only draw the cursor if in the frame
        if (this.state.shouldDrawCursor)
            displayElems.splice(pos, 0, this.createCursor(null, "|"))
        return <div key={this.divRandomId} id="editorWindow" onKeyDown={event => this.onKeyDownHandler(event)} onKeyUp={event => this.onKeyUpHandler(event)} tabIndex={-1} onBlur={event => this.onBlurHandler(event)} onFocus={event => this.onFocusHandler(event)} style={style}>
        {displayElems}
        </div>
    }
}

export default TextWindow
