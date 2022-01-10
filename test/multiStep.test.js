const path = require("path");
const { getWasmTester } = require("./utils");
const sample = require("../subleq_js/sample.js");

const { N_TEST_CASES } = require("./config");

async function checkStep(data, circuit) {
  const inputJson = data.input;
  const w = await circuit.calculateWitness(inputJson, true);
  const expectedOutput = { sRoot0: inputJson.sRoot0, sRoot1: inputJson.sRoot1 };
  await circuit.assertOut(w, expectedOutput);
}

describe("multi step circuit", function () {
  this.timeout(100000);
  it("validMultiStep_1_3_128", async () => {
    let circuit = await getWasmTester(
      "multi_step",
      "validMultiStep_1_3_128.circom"
    );
    let data;
    for (let ii = 0; ii < N_TEST_CASES; ii++) {
      data = sample.formatSample(sample.genSample(ii, 128, 3));
      await checkStep(data, circuit);
    }
  });
  it("multiStep_8_5_128", async () => {
    // path, nSteps, maxMemoryDepth
    const programPath = path.join(process.cwd(), "programs", "hw.txt");
    const stepsData = sample.genMultiStepSample(programPath, 8, 128, 5);
    const data = sample.formatMultiStepSample(stepsData);
    const inputData = Object.assign({}, data.input);
    delete inputData.sRoot1;
    let circuit = await getWasmTester("multi_step", "multiStep_8_5_128.circom");
    const w = await circuit.calculateWitness(inputData, true);
    await circuit.assertOut(w, data.internalOutput);
  });
});
