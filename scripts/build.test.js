const rewire = require("rewire")
const build = rewire("./build")
const copyPublicFolder = build.__get__("copyPublicFolder")
// @ponicode
describe("copyPublicFolder", () => {
    test("0", () => {
        let callFunction = () => {
            copyPublicFolder()
        }
    
        expect(callFunction).not.toThrow()
    })
})
