import React from "react"
import ReactDOM from "react-dom"
import App from "./App"

import BasicForm from "./BasicForm"

it("renders without crashing", () => {
  const div = document.createElement("div")
  const f = new BasicForm()

  expect(
    f.testChange({
      name: "username",
      givenValue: "connor",
      expectedOutput: { value: "connor" },
    })
  )

  ReactDOM.render(<App />, div)
})
