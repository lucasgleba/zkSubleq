const { getWasmTester } = require("./utils");
const sample = require("../subleq_js/sample.js");

async function checkStep(inputJson, circuit) {
  const w = await circuit.calculateWitness(inputJson, true);
  const expectedOutput = { sRoot0: inputJson.sRoot0, sRoot1: inputJson.sRoot1 };
  await circuit.assertOut(w, expectedOutput);
}

const DATA = sample.formatSample(sample.genSample());

describe("Test step circuit", function () {
  this.timeout(100000);
  let circuit;
  before(async () => {
    circuit = await getWasmTester("step");
  });
  it("Check test cases", async () => {
    const inputJson = DATA;
    await checkStep(inputJson, circuit);
  });
});
