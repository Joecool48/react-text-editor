import React, { Component } from 'react';
import './App.css';

import Editor from "./Editor"
import TextWindow from "./TextWindow"
import KeyComboManager from "./keyComboManager"
class App extends Component {
  render() {
    return <TextWindow keyComboManager={new KeyComboManager(1)} width="300px" height="200px" backgroundColor="#A9A9A9" cursorColor="green" cursorMode="block" fontColor="black" />
  }
}

export default App;




//   return (
//     <div className="App">
//       <header className="App-header">
//         <img src={logo} className="App-logo" alt="logo" />
//         <p>
//           Edit <code>src/App.js</code> and save to reload.
//         </p>
//         <a
//           className="App-link"
//           href="https://reactjs.org"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           Learn React
//         </a>
//       </header>
//     </div>
//   );
// }
