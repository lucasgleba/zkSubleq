/**
 * NOTE: If circom files don't have a pragma statement,
 * their tests will fail because stderr won't be null during compilation.
 */

// const { cwd } = require("process");
const path = require("path");
const wasm_tester = require("circom_tester").wasm;

async function getWasmTester(...args) {
  // const circuitPath = path.join(
  //   cwd(),
  //   "circuits",
  //   "test",
  //   ...arguments,
  //   "circuit.circom"
  // );
  const circuitPath = path.join(__dirname, "circuits", ...args);
  // console.log(circuitPath);
  return await wasm_tester(circuitPath);
}

module.exports = {
  getWasmTester,
};
