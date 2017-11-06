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
    return this.state.meta[name] ? this.state.meta[name].activated : true
  }

  @bind
  processChange(
    name,
    value,
    onChange = this.defaultChangeFunc,
    onValidate = this.defaultValidateFunc
  ) {
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

    // Let onValidate take array.This will mean async validations. Promise.all
    // the array of functions. Encourage async/await functions for validations.
    // Those functions return validation syntax

    if (result.meta === undefined) {
      console.error(
        `Did you forget to spread allInputs in registerInput ${name}.onChange`
      )
    }

    if (groupName) {
      const group = this.state.meta[groupName]
      isActivated = group.isActivated({ allInputs: result, name })

      groupObject = {
        [groupName]: {
          ...group,
          activated: isActivated,
        },
      }
    }

    this.setState({
      ...result,
      meta: {
        ...result.meta,
        [name]: {
          ...result.meta[name],
          errors,
        },
        ...groupObject,
      },
    })
  }

  render() {
    return this.renderInputs({
      self: this,
      getInputProps: this.getInputProps,
      getSubmitProps: this.getSubmitProps,
      getErrors: this.getErrors,
      isGroupActivated: this.isGroupActivated,
    })
  }

  getSubmitProps() {
    return {
      type: "submit",
    }
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
      // also need to check here if input HAS a group and if that group
      // is deactivated. if so, dont resolve value
      if (key !== "meta") values[key] = this.state[key].value
    }

    return values
  }

  // Things that directly relate to the value of2 the input are stored in
  // this.state[input], auxilary items are stored in this.state.meta[input]

  @bind
  registerInput(props) {
    const input = document.getElementById(name)

    const {
      name,
      type,
      onChange = this.defaultChangeFunc,
      onValidate = this.defaultValidateFunc,
      isEnabled,
      defaultValue = "",
      affectsGroup,
    } = props

    if (!input) {
      return console.error(
        `Attempting to register ${name} input before it's rendered. Make sure to render an input in renderInputs for ${name}`
      )
    }

    this.setState(prevState => ({
      ...prevState,
      ...onChange({ allInputs: prevState, value: defaultValue }),
      meta: {
        ...prevState.meta,
        [name]: {
          id: name,
          errors: [],
          ...props,
        },
      },
    }))

    input.addEventListener("input", event =>
      this.processChange(name, event.target.value, onChange, onValidate)
    )
  }
}
