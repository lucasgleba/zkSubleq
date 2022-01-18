// Checks Subleq circuit against all size 4 permutations with repetition of {1, 2, 3}

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
const { subleq } = require("../subleq_js/subleq");

const TEST_INPUT_VALUE_SET = [0, 1, 2];

async function checkSubleq(pcIn, aIn, bIn, cIn, circuit) {
  const input = { pcIn, aIn, bIn, cIn };
  const w = await circuit.calculateWitness(input, true);
  const expectedOutput = subleq(...input);
  await circuit.assertOut(w, expectedOutput);
}

describe("subleq circuit", function () {
  this.timeout(100000);
  it("subleq_128", async () => {
    let circuit = await getWasmTester("lib", "subleq_128.circom");
    await TEST_INPUT_VALUE_SET.forEach(async (pcIn) => {
      await TEST_INPUT_VALUE_SET.forEach(async (aIn) => {
        await TEST_INPUT_VALUE_SET.forEach(async (bIn) => {
          await TEST_INPUT_VALUE_SET.forEach(async (cIn) => {
            await checkSubleq(pcIn, aIn, bIn, cIn, circuit);
          });
        });
      });
    });
  });
});
