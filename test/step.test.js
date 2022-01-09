// TODO: Test for failure if input is not valid
const { getWasmTester } = require("./utils");
const sample = require("../subleq_js/sample.js");

const { N_TEST_CASES } = require("./config");

async function checkStep(data, circuit) {
  const inputJson = Object.assign({}, data.input);
  delete inputJson.sRoot1;
  const w = await circuit.calculateWitness(inputJson, true);
  await circuit.assertOut(w, data.internalOutput);
}

async function checkValidStep(data, circuit) {
  const inputJson = data.input;
  const w = await circuit.calculateWitness(inputJson, true);
  const expectedOutput = { sRoot0: inputJson.sRoot0, sRoot1: inputJson.sRoot1 };
  await circuit.assertOut(w, expectedOutput);
}

describe("step circuit", function () {
  this.timeout(100000);
  describe("step io", function () {
    [
      [3, 32],
      // [4, 32],
      // [8, 32],
      // [16, 32],
      [20, 32],
    ].forEach(function (params) {
      const [md, ss] = params;
      const cname = `step_${md}_${ss}`;
      it(cname, async () => {
        let circuit = await getWasmTester("step", cname + ".circom");
        let data;
        for (let ii = 0; ii < N_TEST_CASES; ii++) {
          data = sample.formatSample(sample.genSample(ii, md));
          await checkStep(data, circuit);
        }
      });
    });
  });
  describe("valid step constrain", function () {
    [
      [3, 32],
      [20, 32],
    ].forEach(function (params) {
      const [md, ss] = params;
      const cname = `valid_step_${md}_${ss}`;
      it(cname, async () => {
        let circuit = await getWasmTester("step", cname + ".circom");
        let data;
        for (let ii = 0; ii < N_TEST_CASES; ii++) {
          data = sample.formatSample(sample.genSample(ii, md));
          await checkValidStep(data, circuit);
        }
      });
    });
  });
});
