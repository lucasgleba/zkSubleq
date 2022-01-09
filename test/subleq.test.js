// TODO: Uninstall if not needed
// const chai = require("chai");
// const F1Field = require("ffjavascript").F1Field;
// const Scalar = require("ffjavascript").Scalar;
// const p = Scalar.fromString(
//   "21888242871839275222246405745257275088548364400416034343698204186575808495617"
// );
// exports.p = p
// const Fr = new F1Field(p);

// const assert = chai.assert;

const { getWasmTester, fit2Comp } = require("./utils");
const { bigInt } = require("snarkjs");

// ERROR in plus 1? in circom etc

async function checkSubleq(pcIn, aIn, bIn, cIn, circuit) {
  const input = { pcIn, aIn, bIn, cIn };
  const w = await circuit.calculateWitness(input, true);
  const bOut = fit2Comp(bIn - aIn);
  const pcOut = bOut.lesserOrEquals(bigInt.zero) ? cIn : pcIn + 1;
  const expectedOutput = { pcOut, bOut };
  await circuit.assertOut(w, expectedOutput);
}

describe("Test subleq circuit", function () {
  this.timeout(100000);
  let circuit;
  before(async () => {
    circuit = await getWasmTester("lib", "subleq");
  });
  // TODO: Fuzzing
  it("Check test cases", async () => {
    await checkSubleq(0, 0, 0, 1, circuit);
  });
});
