const { getWasmTester } = require("./utils");
const sample = require("../subleq_js/sample.js");

const N_TEST_CASES = 50;

async function checkStep(inputJson, circuit) {
  const w = await circuit.calculateWitness(inputJson, true);
  const expectedOutput = { sRoot0: inputJson.sRoot0, sRoot1: inputJson.sRoot1 };
  await circuit.assertOut(w, expectedOutput);
}

describe("Test step circuit", function () {
  this.timeout(100000);
  let circuit;
  before(async () => {
    circuit = await getWasmTester("step");
  });
  it(`Check ${N_TEST_CASES} test cases`, async () => {
    let inputJson;
    for (let ii = 0; ii < N_TEST_CASES; ii++) {
      inputJson = sample.formatSample(sample.genSample(ii));
      await checkStep(inputJson, circuit);
    }
  });
});
