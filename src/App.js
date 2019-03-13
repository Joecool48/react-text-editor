import React, { Component } from 'react';
import './App.css';

import Editor from "./Editor"
import TextWindow from "./TextWindow"
import KeyComboManager from "./keyComboManager"
import StatusBar from "./StatusBar"

const MAX_KEY_COMBO_LENGTH = 10

class App extends Component {

  setNewMode(newMode) {
      console.log("Called newmode")
      this.setState({mode: newMode})
  }

  constructor(props) {
      super(props)
      this.keyManager = new KeyComboManager(MAX_KEY_COMBO_LENGTH, this.setNewMode.bind(this))
      this.state = {mode: this.keyManager.mode}
  }

  render() {
    return (
        <div>
            <TextWindow keyComboManager={this.keyManager} margin="0px" width="300px" height="200px" backgroundColor="#A9A9A9" cursorColor="green" cursorMode="block" fontColor="black" />
            <StatusBar width="300px" mode={this.state.mode}/>
        </div>
      )
  }
}

export default App;
