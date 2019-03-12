import React, { Component } from 'react';

class Char {
    constructor(style, text, sp) {
        this.style = style
        this.text = text
        this.special = sp
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
        this.setCursorPosition(this.cursorPosition - 1);
    }
    defaultMoveRight(event) {
        this.setCursorPosition(this.cursorPosition + 1)
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
      console.log(idxLast)
      // no more lines in the array
      if (idxLast === undefined) idxLast = 0

      var idxLast2 = findFromStart(this.state.windowText, idxLast + 1, 1, function (elem) {
          if (elem.text === "Enter") return true
          return false
      })
      if (idxLast2 === undefined) return
      console.log(idxLast2)
      var dist = this.state.cursorPosition - idxLast
      var offset = idxLast2 + dist
      this.setCursorPosition(offset)
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

    }

    createCharSpan(style, key) {
        return <span style={style}>{key}</span>
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
                this.insertTextAfterPosition(this.state.cursorPosition, new Char({color: this.state.fontColor}, event.key.toUpperCase()), false)
                this.setCursorPosition(this.state.cursorPosition + 1);
            }
            else if (event.key === "Enter") {
                // add a break to simulate a return
                var c = new Char({}, event.key, true)
                this.insertTextAfterPosition(this.state.cursorPosition, c)
                this.setCursorPosition(this.state.cursorPosition + 1);
            }
            else if (event.key === "Backspace") {
                if (this.state.cursorPosition === 0) return
                this.removeTextAtPosition(this.state.cursorPosition - 1)
                this.setCursorPosition(this.state.cursorPosition - 1)
            }
            else if (this.canDisplayChar(event)){
                var c = new Char({}, event.key, false)

                this.insertTextAfterPosition(this.state.cursorPosition, c)
                this.setCursorPosition(this.state.cursorPosition + 1);
            }
        }

        /* Arrow keys */
        if (event.key === "ArrowLeft") {
            if (this.state.cursorPosition === 0) return
            this.setCursorPosition(this.state.cursorPosition - 1);
        }
        else if (event.key === "ArrowRight") {
            if (this.state.cursorPosition >= this.state.windowText.length) return
            this.setCursorPosition(this.state.cursorPosition + 1)
        }
        else if (event.key === "ArrowUp") {
            console.log("Up pressed")
            this.defaultMoveUp(event);
        }
        else if (event.key === "ArrowDown") {
            console.log("Down pressed")
            this.defaultMoveDown(event)
        }
    }

    createCursor(style, text) {
        return <span id="cursor">{text}</span>
    }

    render() {
        const style = {
            width: this.state.width,
            height: this.state.height,
            backgroundColor: this.state.backgroundColor
        }
        console.log("rend")
        var pos = this.state.cursorPosition
        var displayElems = this.state.windowText.map((elem, idx) => {
            if (!elem.special) {
                return this.createCharSpan(elem.style, elem.text)
            }
            else if (elem.special && elem.text === "Enter") {
                return <br/>
            }
            else {
                return null
            }
        })
        // only draw the cursor if in the frame
        if (this.state.shouldDrawCursor)
            displayElems.splice(pos, 0, this.createCursor(null, "|"))
        return <div id="editorWindow" onKeyDown={event => this.onKeyDownHandler(event)} tabIndex={-1} onBlur={event => this.onBlurHandler(event)} onFocus={event => this.onFocusHandler(event)} style={style}>
        {displayElems}
        </div>
    }
}

export default TextWindow
