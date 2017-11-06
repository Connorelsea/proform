# proform

Goal: Provide a form library with an opinionated and standardized data-flow but no standardized layout or styling. This allows the deveoper to re-use abstracted form components across their application regardless of whether each form's data requirements and relations are the same.

A very basic form example:

```javascript
import React from "react"
import Form from "./Form" // library base class
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

### Current Features

- Form input state handling system
  - Cross-field relationships and mutations
- Form per-field validation system
- Form submission
- Per-field disabling, Per-field/per-section temporary deactivating
  - Deactivating: Removed visually, Not included in the end form result
  - Disabling: "Disabled" look visually, included in end form result

### Future Feature Goals (~Roadmap)

- Typed validations
  - Default types include (error, warning, suggestion)
    - Custom validation types can be plugged
    - Some validation types block form submission when present,
      others do not block form submission even when present.
- Form state serialization
  - Save form state to (local storage || remote server || file)
  - Restore form state from (local storage || remote server || file)
- Pluggable custom field value-resolution based on field type
- Form-wide/global validations/errors seperate from per-field

# Documentation

### Form Lifecycle

The life-cycle of the form occurs on every input change. The life-cycle consists of the functions listed below in order (excluding registration). A function that provides basic behavior is used for each of these life-cycle functions. If you wish to define custom functionality, it is easy to override one of these life-cycle functions.

0. Registration (occurs only once)
...
1. onChange 
2. onValidate
3. isActivated

### Creating an Input

Input registration is done in `componentDidMount()`. This is where you provide information such as name, props, and custom definitions for lifecycle functions.

The simplest input registration is as follows:

```javascript
  this.registerInput({ name: "username" })
```

This creates an input named "username". The name of an input is used when mutating its state and when resoving a value on change and on submission.

For every input you register, there should be a matching input in your form's `renderInputs(...)` function. The flexibility of this approach allows for the use of any input component - spread the result of the `getInputProps(inputName)` function onto the component and it will then be synced with the form's state.

```javascript
export default class BasicForm extends Form {
  componentDidMount() {
    this.registerInput({ name: "username" })
  }

  renderInputs({ getInputProps, getSubmitProps }) {
    return (
      <form>
        <input {...getInputProps("username")} />
        <button {...getSubmitProps()}>Submit</button>
      </form>
    )
  }
}
```

You can define functions that will plug into the input's lifecycle by supplying them during registration. Docs will explain this better in the future but shortest explanation is: All form inputs are objects stored in the same level of state. onChange is like redux - the object you return is a literal object representation of the "state of all inputs" and will replace the current state. This is why we spread `allInputs` first in the following example. Here you can alter the field you are registering, or alter some other field based on the changing value of the currently registered field. This is how cross-field relationships and mutations are defined.

The onChange function below is what the "default" onChange function would be if you were to omit an onChange function during registration. Most simply inputs will **not** need a custom onChange function, which allows for quick form prototyping.

```javascript
export default class BasicForm extends Form {
  componentDidMount() {
    this.registerInput({
      name: "username"
      onChange: ({ allInputs, value }) => ({
        ...allInputs,
        username: { value }, // { value } is short for { value: value }
      }),
    })
  }

  renderInputs({ getInputProps, getSubmitProps }) {
    return (
      <form>
        <input {...getInputProps("username")} />
        <button {...getSubmitProps()}>Submit</button>
      </form>
    )
  }
}
```

### Validations

Currently: return string to add to list of current errors, return array to overwrite previous error array and replace with new one. Return object signature will probably change here (to support typed validations) but onValidate API will almost definitely stay the same.

```javascript
  this.registerInput({
    name: "username"
    onValidate: ({ allInputs, value }) =>
      value === "hitler" && ["No nazis allowed, this isn't Twitter"]
  })
```

Above shows how to add the errors into your form's state. Below is an example of how to display these errors in your form. If there are no errors, an empty array is returned, no elements are mapped until errors occur and fill that array.

```javascript
  renderInputs({ getInputProps, getSubmitProps, getErrors }) {
    return (
      <form>
        <input {...getInputProps("username")} />
        {getErrors("username").map(error => <div>{error}</div>)}
        <button {...getSubmitProps()}>Submit</button>
      </form>
    )
  }
```

It is convienent to standardize your basic input structure (including the display of validations). Consider some close variation of the following for a standard input:

```javascript
  Input = ({ name, label }) => (
    <div>
      <label for={name}>{label}</label>
      <input {...this.getInputProps(name)} />
      <div></div>
    </div>
  )
```