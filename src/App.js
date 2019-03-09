import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

import Editor from "./Editor"
import TextWindow from "./TextWindow"

class App extends Component {
  render() {
    return <TextWindow width="300px" height="200px" backgroundColor="magenta" cursorColor="green" cursorMode="block" fontColor="black" />
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
