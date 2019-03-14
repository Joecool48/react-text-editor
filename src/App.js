import React, { Component } from 'react';
import './App.css';

//import Editor from "./Editor"
import TextWindow from "./TextWindow"
import KeyComboManager from "./keyComboManager"
import StatusBar from "./StatusBar"

const MAX_KEY_COMBO_LENGTH = 10

class App extends Component {

  setParentState(newMode, newLine, newCol) {
      console.log("Called newmode")
      this.setState({mode: newMode, line: newLine, col: newCol})
  }

  constructor(props) {
      super(props)
      this.keyManager = new KeyComboManager(MAX_KEY_COMBO_LENGTH, this.setParentState.bind(this))
      this.state = {mode: this.keyManager.mode, line: this.keyManager.line, col: this.keyManager.col}
  }

  render() {
    return (
        <div>
            <TextWindow keyComboManager={this.keyManager} margin="0px" width="300px" height="200px" backgroundColor="#A9A9A9" cursorColor="green" cursorMode="block" fontColor="black" />
            <StatusBar width="300px" mode={this.state.mode} line={this.state.line} col={this.state.col}/>
        </div>
      )
  }
}

export default App;
