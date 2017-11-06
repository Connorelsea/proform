import React, { Component } from "react"
import logo from "./logo.svg"
import "./App.css"
import UserForm from "./UserForm"

class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Form Testing</h1>
        </header>
        <div style={{ paddingLeft: 60 }}>
          <UserForm />
        </div>
      </div>
    )
  }
}

export default App
