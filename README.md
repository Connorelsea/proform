# proform

So far, very light: ~1.3kb unminifized but gzipped

Not yet structured for distribution. Rapidly iterating/changing the API currently to see what works best. If you're interested, look around and help me with suggestions/critiques

Goal: Provide a form library (sort of also design pattern) with an opinionated and standardized data-flow but no standardized layout or styling. This allows the deveoper to re-use abstracted form components across their application regardless of whether each form's data requirements and relations are the same.

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
    - Validation object signature
      - { type: String, blocking: Boolean, class: String, meta: Object }
      - Defualt meta is just a string, but could be an object for more
        complex errors. Map over validations, spread result onto custom re-usable
        component.
- Form state serialization
  - Save form state to (local storage || remote server || file)
  - Restore form state from (local storage || remote server || file)
- Pluggable custom field value-resolution based on field type
- Form-wide/global validations/errors seperate from per-field
- Disable submit button conditionally
- Track field touched state
- Track submitting state
- Maybe/maybe not: "Loading" type validation for async validations. Display until promise resolved then remove. Seems kind of cool idea
  - What should happen if async validation fails? Fallback? Retry?
- Choose validations onChange or validations on blur
- Support Yup validationSchema. Have generators on a per-type basis so that you can have a schema of validations for each type (warning, error, etc).

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

DX Tip: If you forget to render an input for one you registered, a warning is shown in the console with the name of the missing input.

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

// DX Tip: Hopefully you won't forget to spread allInputs in onChange, but if you ever do, there is a console warning upon its omission.

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

### Design Patterns for Re-Use

It is convienent to standardize your basic input structure (including the display of validations).

Imagine a generalied structre that could be frequently re-used:

```javascript
    <div>
      <label for={name}>{label}</label>
      <input {...this.getInputProps(name)} />
      {this.getErrors(name)}
    </div>
```

Want to re-use a structure (like the standard one above), use classes to your advantage (every reader: 😵).

But really...

```javascript
class CustomForm extends Form {
  Input = ({ name, label }) => (
    <div>
      <label for={name}>{label}</label>
      <input {...this.getInputProps(name)} />
      {this.getErrors(name)}
    </div>
  )
}

class myForm extends CustomForm {
  componentDidMount() {
    this.registerInput({  name: "username" })
  }

  renderInputs({ getInputProps, getSubmitProps }) {
    return (
      <form>
        <this.Input name="username" label="UserName: " />
      </form>
    )
  }
}
```

This provides a number of advantages
1. The custom Input is now available on all forms extending `CustomForm`
  - Define once, edit in one central place, yet forms are not coupled
  - Passing the props to a custom input component seperates the implementation from the usage, effectively decoupling it. The layout is now easily changed without breaking structure
2. The custom input can access API functions like `this.getInputProps`
3. Extensibility. End up using more than one type of input in multiple places? Define more custom inputs with different names on `CustomForm` and these new inputs become available anywhere.

*Optional bonus advantage/rambling:*

4. *Thinking even crazier, this could allow us to share forms across applications. Consider an abstract sign up form with many standard user options. Use a primitive set of Inputs that will be defined in each target application. Form structure is the same across, but `<this.Input>` resolves to different things when in different contexts*

This is also not the only way. Co-locating the structure of a custom input in a specific form class is also powerful. Want to edit the structure of a custom input used for a single form - easy after co-location.

### Other

Currently has a dependency on "decko" to provide some quick dev util functionality. I'll do a codemod or something on the prod version to change the @bind calls to 'this.funcName = this.findName.bind(this)` in the class constructor instead to remove the superficial depdency. The production version of this library has no outside dependencies.