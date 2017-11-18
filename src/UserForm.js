import React from "react"
import Form from "./Form"

export default class UserForm extends Form {
  constructor(props) {
    super(props)
    this.onSubmit = this.onSubmit.bind(this)
    // this.Input = this.Input.bind(this)
  }

  isAdult(value) {
    return parseInt(value.split("-")[0]) < 1996
  }

  componentDidMount() {
    this.registerInput({
      name: "birthday",
      type: "date",
      onChange: ({ allInputs, value }) => ({
        ...allInputs,
        birthday: { value },
        adult: { checked: this.isAdult(value) },
      }),
      onValidate: ({ allInputs, value }) =>
        !this.isAdult(value) ? ["Must be 21"] : [],
      affectsGroup: "adult_info",
    })

    this.registerInput({ name: "adult", type: "checkbox" })
    this.registerInput({ name: "username", type: "text" })
    this.registerInput({ name: "password", type: "password" })

    this.registerInput({
      name: "social_security",
      type: "text",
      group: "adult_info",
    })

    this.registerGroup({
      name: "adult_info",
      isActivated: ({ allInputs, nameOfChangedInput, value }) =>
        allInputs["adult"].checked,
      activated: false,
    })
  }

  onSubmit(e) {
    e.preventDefault()
    console.log(this.getValues())
  }

  Input = class Input extends React.Component {
    shouldComponentUpdate(nextProps, nextState) {
      console.log("----------- should comp update")
      console.log(nextProps, this.props)
      console.log(nextState, this.state)

      const form = this.props.self

      console.log(form)

      if (
        JSON.stringify(this.props.self.state[form.props.name]) !==
        JSON.stringify(nextProps.self.state[form.props.name])
      ) {
        return true
      }

      return false
    }

    render() {
      const { name, label, self } = this.props

      console.log("Getting input props", self.getInputProps(name))
      return (
        <div>
          {console.log("Updating Input: " + label)}
          <label htmlFor={name}>{label}</label>
          <input {...self.getInputProps(name)} />
          {self.getErrors(name)}
        </div>
      )
    }
  }

  // Input = ({ name, label }) => (
  //   <div>
  //   {console.log("Updating Input: " + label)}
  //   <label for={name}>{label}</label>
  //   <input {...this.getInputProps(name)} />
  //   {this.getErrors(name)}
  // </div>
  // )

  renderInputs({ getInputProps, getSubmitProps, getErrors, isGroupActivated }) {
    const { Input } = this
    return (
      <form onSubmit={this.onSubmit}>
        {console.log("Updating Form")}
        <div>
          <h2>Account</h2>
          <Input label="Username" name="username" self={this} />
          <Input label="Password" name="password" self={this} />
        </div>

        <div>
          <h2>Age</h2>
          <Input label="Birthday" name="birthday" self={this} />
          <Input label="Is of Adult Age: " name="adult" self={this} />
        </div>

        {isGroupActivated("adult_info") && (
          <div>
            <h2>Adult Information</h2>
            <p>
              Conditionally displayed fields only available above a certain age
            </p>
            <Input label="Social Security" name="social_security" self={this} />
          </div>
        )}

        <button type="submit">Create Account</button>
        <pre>{JSON.stringify(this.state, null, 2)}</pre>
      </form>
    )
  }
}
