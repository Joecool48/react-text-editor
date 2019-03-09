import React, { Component } from 'react';

class Char {
    constructor(style, text) {
        this.style = style
        this.text = text
        this.special = null
    }
}

class TextWindow extends Component {
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
            windowText: []
        }
    }
    drawCursor() {
        // set the span of the current cursor position
        if (this.state.cursorMode === "block") {
            const newText = this.state.windowText.slice(0)
            var i
            for (i = 0; i < newText.length; i += 1) {
                if (i === this.state.cursorPosition) {
                    newText[i].style.backgroundColor = "green"
                }
                else {
                    newText[i].style.backgroundColor = this.state.backgroundColor
                }
            }
            this.setState({windowText: newText})
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
        else arrClone = arrClone.splice(position, 0, elem)
        this.setState({windowText: arrClone})
    }
    removeTextAtPosition(position) {
        if(position < 0) return
        var arrClone = this.state.windowText.slice(0)
        if (position >= this.state.windowText.length) return
        if (position === this.state.windowText.length - 1) arrClone.pop()
        else arrClone = arrClone.splice(position)
        this.setState({windowText: arrClone})
    }
    onFocusHandler(event) {
        if (this.state.cursorPosition === null) {
            this.setState({cursorPosition: 0})
        }
        console.log("Focus received")
    }
    onBlurHandler(event) {

        console.log("Focus unreceived")
    }

    setCursorPosition(pos) {
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
        if (this.canDisplayChar(event) && event.shiftKey) {
            this.addTextAtPosition(this.state.cursorPosition, new Char({color: this.state.fontColor}, event.key.toUpperCase()))
            this.setCursorPosition(this.state.cursorPosition + 1);
        }
        else if (event.key === "Enter") {
            // add a break to simulate a return
            var c = new Char({}, null)
            c.special = "Enter"
            this.addTextAtPosition(this.state.cursorPosition, c)
            this.setCursorPosition(this.state.cursorPosition + 1);
        }
        else if (event.key === "Backspace") {
            if (this.state.cursorPosition === 0) return
            this.removeTextAtPosition(this.state.cursorPosition - 1)
            this.setCursorPosition(this.state.cursorPosition - 1)
        }
        /* Arrow keys */
        else if (event.key === "ArrowLeft") {
            if (this.state.cursorPosition === 0) return
            this.setCursorPosition(this.state.cursorPosition - 1);
        }
        else if (event.key === "ArrowRight") {
            if (this.state.cursorPosition >= this.state.windowText.length) return
            this.setCursorPosition(this.state.cursorPosition + 1)
        }
        else if (this.canDisplayChar(event)){
            var c = new Char({}, event.key)

            this.insertTextAfterPosition(this.state.cursorPosition, c)
            this.setCursorPosition(this.state.cursorPosition + 1);
        }
        this.drawCursor()
    }
    render() {
        const style = {
            width: this.state.width,
            height: this.state.height,
            backgroundColor: this.state.backgroundColor
        }
        var displayElems = this.state.windowText.map(elem => {
            if (elem.text !== null) {
                return this.createCharSpan(elem.style, elem.text)
            }
            else if (elem.special === "Enter") {
                return <br/>
            }
            else {
                return null
            }
        })

        return <div id="editorWindow" onKeyDown={event => this.onKeyDownHandler(event)} tabIndex={-1} onBlur={event => this.onBlurHandler(event)} onFocus={event => this.onFocusHandler(event)} style={style}>
        {displayElems}
        </div>
    }
}

export default TextWindow
