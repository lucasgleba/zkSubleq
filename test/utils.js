/**
 * NOTE: If circom files don't have a pragma statement,
 * their tests will fail because stderr won't be null during compilation.
 */

const { cwd } = require("process");
const path = require("path");
const wasm_tester = require("circom_tester").wasm;
const { bigInt } = require("snarkjs");

const NUM_SIZE = 32;
const NUM_MAX = bigInt(2).pow(bigInt(NUM_SIZE));

async function getWasmTester() {
  const circuitPath = path.join(
    // __dirname,
    cwd(),
    "circuits",
    "test",
    ...arguments,
    "circuit.circom"
  );
  // console.log(circuitPath);
  return await wasm_tester(circuitPath);
}

// TODO: Very different functions, might want to put them in separate files
// Returns string
function negTo2Comp(nn) {
  nn = bigInt(nn);
  if (nn.isNegative()) {
    nn = nn.neg();
  }
  return NUM_MAX.sub(nn); // .toString();
}

function fit2Comp(nn) {
  nn = bigInt(nn);
  if (nn.isNegative()) {
    return negTo2Comp(nn);
  }
  return nn; // .toString();
}

module.exports = {
  getWasmTester,
  negTo2Comp,
  fit2Comp,
};
