import React, { Component } from "react"

class StatusBar extends Component {
    constructor(props) {
        super(props)
        this.state = {mode: props.mode}
    }
    componentWillReceiveProps(newProps) {
        this.setState({mode: newProps.mode})
    }
    render() {
        return <div>
            <p>{this.state.mode}</p>
        </div>
    }
}

export default StatusBar
