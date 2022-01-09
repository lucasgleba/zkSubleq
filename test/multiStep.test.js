// TODO: Test for failure if input is not valid
const { getWasmTester } = require("./utils");
const sample = require("../subleq_js/sample.js");

const N_TEST_CASES = 10;

async function checkStep(data, circuit) {
  const inputJson = data.input;
  const w = await circuit.calculateWitness(inputJson, true);
  const expectedOutput = { sRoot0: inputJson.sRoot0, sRoot1: inputJson.sRoot1 };
  await circuit.assertOut(w, expectedOutput);
}

describe("Test multi step circuit", function () {
  this.timeout(100000);
  it("multiStep_1_3_32", async () => {
    let circuit = await getWasmTester("multiStep_1_3_32.circom");
    let data;
    for (let ii = 0; ii < N_TEST_CASES; ii++) {
      data = sample.formatSample(sample.genSample(ii));
      await checkStep(data, circuit);
    }
  });
});
