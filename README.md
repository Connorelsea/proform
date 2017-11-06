React Form

Goal: Provide a form library with an opinionated and standardized data-flow but no standardized layout or styling. This allows the deveoper to re-use abstracted form components across their application regardless of whether each form's data requirements and relations are the same.

A very basic form example:

```javascript
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
```