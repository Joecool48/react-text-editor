import React, { Component } from 'react'

class Editor extends Component {
    constructor (props) {
        super(props);
        this.state = {
            editorWidth: this.props.width,
            editorHeight: this.props.height,
            editorBackgroundColor: this.props.backgroundColor
        }
    }
    render() {
        const style = {
            width: this.state.editorWidth,
            height: this.state.editorHeight,
            backgroundColor: this.state.editorBackgroundColor
        }
        return <div style={style}>Wow thats cool</div>
    }
}

export default Editor
