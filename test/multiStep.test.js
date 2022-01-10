// TODO: Test for failure if input is not valid
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
  it("validMultiStep_1_3_32", async () => {
    let circuit = await getWasmTester(
      "multi_step",
      "validMultiStep_1_3_32.circom"
    );
    let data;
    for (let ii = 0; ii < N_TEST_CASES; ii++) {
      data = sample.formatSample(sample.genSample(ii, 3));
      await checkStep(data, circuit);
    }
  });
  it("multiStep_8_5_32", async () => {
    // seed, memoryDepth, nSteps
    // seed, memoryDepth are hardcode inside the function at the moment
    const stepsData = sample.genSampleMultiStep(0, 5, 8);
    const firstStep = stepsData[0];
    const lastStep = stepsData[stepsData.length - 1];
    const data = {
      pcIn: firstStep.startState.pc,
      mRoot0: firstStep.startState.mRoot,
      sRoot0: firstStep.startState.root,
      aAddr: [],
      bAddr: [],
      cIn: [],
      aIn: [],
      bIn: [],
      aAddrPathElements: [],
      bAddrPathElements: [],
      cPathElements: [],
      aMPathElements: [],
      bMPathElements: [],
    };
    stepsData.forEach(function (stepData) {
      stepData = sample.formatSample(stepData).input;
      data.aAddr.push(stepData.aAddr);
      data.bAddr.push(stepData.bAddr);
      data.cIn.push(stepData.cIn);
      data.aIn.push(stepData.aIn);
      data.bIn.push(stepData.bIn);
      data.aAddrPathElements.push(stepData.aAddrPathElements);
      data.bAddrPathElements.push(stepData.bAddrPathElements);
      data.cPathElements.push(stepData.cPathElements);
      data.aMPathElements.push(stepData.aMPathElements);
      data.bMPathElements.push(stepData.bMPathElements);
    });
    let circuit = await getWasmTester("multi_step", "multiStep_8_5_32.circom");
    const w = await circuit.calculateWitness(data, true);
    const expectedOutput = {
      pcOut: lastStep.endState.pc,
      mRoot1: lastStep.endState.mRoot,
      sRoot1: lastStep.endState.root,
    };
    await circuit.assertOut(w, expectedOutput);
  });
});
