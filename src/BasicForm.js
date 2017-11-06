import React from "react"
import Form from "./Form"
import { bind } from "decko"

export default class BasicForm extends Form {
  componentDidMount() {
    this.registerInput({ name: "username" })
  }

  @bind
  onSubmit(event) {
    event.preventDefault()
    let vals = this.getValues()
  }

  renderInputs({ getInputProps, getSubmitProps }) {
    return (
      <form onSubmit={this.onSubmit}>
        <label>Username</label>
        <input {...getInputProps("username")} />
        <button {...getSubmitProps()}>Submit</button>
      </form>
    )
  }
}
