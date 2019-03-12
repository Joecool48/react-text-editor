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

const INSERT_MODE = "Insert"
const NORMAL_MODE = "Normal"

class TextWindow extends Component {
    defaultMoveLeft(event) {
        if (this.state.cursorPosition === 0) return
        this.setCursorPosition(this.state.cursorPosition - 1);
    }
    defaultMoveRight(event) {
        if (this.state.cursorPosition >= this.state.windowText.length) return
        this.setCursorPosition(this.state.cursorPosition + 1)
    }
    defaultMoveUp(event) {
        // find the last index of newline
        var idxLast = findFromStart(this.state.windowText, this.state.cursorPosition - 1, -1, function (elem) {
            if (elem.text === "Enter") return true
            return false
        })

        // no more lines in the array
        if (idxLast === undefined) return

        var idxLast2 = findFromStart(this.state.windowText, idxLast - 1, -1, function (elem) {
            if (elem.text === "Enter") return true
            return false
        })
        if (idxLast2 === undefined) idxLast2 = 0
        var dist = this.state.cursorPosition - idxLast
        var offset = idxLast2 + dist
        if (offset > idxLast) this.setCursorPosition(idxLast)
        else this.setCursorPosition(offset)
    }
    defaultMoveDown(event) {
      // find the last index of newline
      var idxLast = findFromStart(this.state.windowText, this.state.cursorPosition - 1, -1, function (elem) {
          if (elem.text === "Enter") return true
          return false
      })
      // no more lines in the array
      if (idxLast === undefined) idxLast = 0

      var idxLast2 = findFromStart(this.state.windowText, idxLast + 1, 1, function (elem) {
          if (elem.text === "Enter") return true
          return false
      })
      if (idxLast2 === undefined) return
      var dist = this.state.cursorPosition - idxLast
      var offset = idxLast2 + dist
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
        if (position === this.state.windowText.length - 1) arrClone.pop()
        else arrClone.splice(position, 1)
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

    setCursorPosition(pos) {
        if (pos < 0) return
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

        var handler = this.keyComboManager.getHandlerForMode(INSERT_MODE)
        console.log(handler)
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
