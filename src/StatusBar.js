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
        const style = {
            //backgroundColor: "#58055b",
            margin: "0px",
            float: "left",
            color: "white"
        }
        const style2 = {
            //backgroundColor: "#58055b",
            margin: "0px",
            float: "right",
            color: "white"
        }
        const style3 = {
            width: "300px",
            height:  "18px",
            backgroundColor: "#58055b"
        }
        return <div style={style3}>
            <p style={style}>{this.state.mode}</p>
            <p style={style2}>33</p>
        </div>
    }
}

export default StatusBar
