import React, { Component } from "react"
import { bind } from "decko"

export default class Form extends Component {
  state = {
    meta: {},
  }

  defaultChangeFunc({ allInputs, thisInput, name, value }) {
    return { ...allInputs, [name]: { value } }
  }

  defaultValidateFunc({ allInputs, value }) {
    return []
  }

  @bind
  registerGroup({ name, isActivated, activated = true }) {
    console.log("register grouPPP")
    this.setState(prevState => ({
      ...prevState,
      meta: {
        ...prevState.meta,
        [name]: {
          ...prevState.meta[name],
          activated,
          isActivated,
        },
      },
    }))
  }

  @bind
  isGroupActivated(name) {
    console.log("is activated")
    console.log(name, this.state.meta[name])
    return this.state.meta[name] ? this.state.meta[name].activated : true
  }

  @bind
  processChange(
    name,
    value,
    onChange = this.defaultChangeFunc,
    onValidate = this.defaultValidateFunc
  ) {
    console.log("=========== PROCESS CHANGE: " + name)
    console.log("=========== VALUE: ", value)

    const groupName = this.state.meta[name].affectsGroup
    let isActivated = true
    let groupObject = {}

    const allInputs = this.state
    const thisInput = this.state[name]
    const result = onChange({ allInputs, thisInput, name, value })
    const validation = onValidate({ result, value: result[name].value })
    const errors = Array.isArray(validation)
      ? validation
      : [...result.meta[name].errors, validation]

    if (result.meta === undefined) {
      console.error(
        `Did you forget to spread allInputs in registerInput ${name}.onChange`
      )
    }

    if (groupName) {
      const group = this.state.meta[groupName]
      isActivated = group.isActivated({ allInputs: result, name })
      console.log(isActivated)

      console.log("STATE")
      groupObject = {
        [groupName]: {
          ...group,
          activated: isActivated,
        },
      }
    }

    this.setState(
      {
        ...result,
        meta: {
          ...result.meta,
          [name]: {
            ...result.meta[name],
            errors,
          },
          ...groupObject,
        },
      },
      () => console.log("VALUE RESOLVE FOR " + name)
    )
  }

  render() {
    const self = this
    console.log("rendering", this.state, this.props)
    return this.renderInputs({
      self,
      getInputProps: this.getInputProps,
      getSubmitProps: this.getSubmitProps,
      getErrors: this.getErrors,
      isGroupActivated: this.isGroupActivated,
    })
  }

  @bind
  getInputProps(name) {
    return {
      id: name,
      ...this.state[name],
      ...this.state.meta[name],
    }
  }

  @bind
  getErrors(name) {
    return this.state.meta[name] ? this.state.meta[name].errors : []
  }

  @bind
  getValues() {
    const values = {}

    for (let key in this.state) {
      // this is resolution. could introduce custom functions
      // for certain types here. to build a value from their body
      // of data
      if (this.state.meta[key].activated) values[key] = this.state.key.value
    }
  }

  // Things that directly relate to the value of2 the input are stored in
  // this.state[input], auxilary items are stored in this.state.meta[input]

  @bind
  registerInput({
    name,
    type,
    onChange = this.defaultChangeFunc,
    onValidate = this.defaultValidateFunc,
    isEnabled,
    defaultValue = "",
    affectsGroup,
  }) {
    const input = document.getElementById(name)

    console.log("render input===============")
    console.log(input, name)

    if (!input) {
      console.error(
        `Attempting to register ${name} input before it's rendered. Make sure to render an input in renderInputs for ${name}`
      )
      return
    }

    this.setState(
      prevState => ({
        ...prevState,
        ...onChange({ allInputs: prevState, value: defaultValue }),
        meta: {
          ...prevState.meta,
          [name]: {
            id: name,
            name,
            errors: [],
            onChange,
            onValidate,
            isEnabled,
            type,
            affectsGroup,
          },
        },
      })
      // () => this.processChange(name, defaultValue, onChange, onValidate)
    )

    input.addEventListener("input", event =>
      this.processChange(name, event.target.value, onChange, onValidate)
    )
  }
}
