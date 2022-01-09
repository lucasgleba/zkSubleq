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

const { getWasmTester } = require("./utils");
const { fit2Comp } = require("../subleq_js/utils");
const { bigInt } = require("snarkjs");

const TEST_INPUT_VALUE_RANGE = [0, 1, 2];

async function checkSubleq(pcIn, aIn, bIn, cIn, circuit) {
  const input = { pcIn, aIn, bIn, cIn };
  const w = await circuit.calculateWitness(input, true);
  const bOut = fit2Comp(bIn - aIn);
  const pcOut = bOut.lesserOrEquals(bigInt.zero) ? cIn : pcIn + 1;
  const expectedOutput = { pcOut, bOut };
  // console.log(input, expectedOutput);
  await circuit.assertOut(w, expectedOutput);
}

describe("Test subleq circuit", function () {
  this.timeout(100000);
  it("subleq_32", async () => {
    let circuit = await getWasmTester("subleq_32.circom");
    await TEST_INPUT_VALUE_RANGE.forEach(async (pcIn) => {
      await TEST_INPUT_VALUE_RANGE.forEach(async (aIn) => {
        await TEST_INPUT_VALUE_RANGE.forEach(async (bIn) => {
          await TEST_INPUT_VALUE_RANGE.forEach(async (cIn) => {
            // console.log(pcIn, aIn, bIn, cIn);
            await checkSubleq(pcIn, aIn, bIn, cIn, circuit);
          });
        });
      });
    });
  });
});
