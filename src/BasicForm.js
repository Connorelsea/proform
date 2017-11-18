import React from "react"
import Form from "./Form"

export default class BasicForm extends Form {
  constructor(props) {
    super(props)
    this.onSubmit = this.onSubmit.bind(this)
  }

  componentDidMount() {
    this.registerInput({ name: "username" })
  }

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
