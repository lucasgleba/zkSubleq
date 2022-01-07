const subleq = require("./subleq");

const { INSTRUCTION_SIZE } = subleq.constants;

function genSample() {
  const rawPc = 1;

  const codeLen = 2; // instructions
  const codeOffset = codeLen * INSTRUCTION_SIZE;
  const code = new Array(codeOffset).fill(0);
  const pcInsStartIndex = rawPc * INSTRUCTION_SIZE;

  code[pcInsStartIndex + 0] = codeOffset + 0; // addrA
  code[pcInsStartIndex + 1] = codeOffset + 1; // addrB
  code[pcInsStartIndex + 2] = 0; // C

  const data = [10, 1]; // mA, mB

  const mTree = subleq.genMTree(code, data);
  const sTree = subleq.genSTree(rawPc, mTree);

  return subleq.step(sTree, mTree);
}

const filename = "sample";
const fs = require("fs");
const data = genSample();
const dataStr = JSON.stringify(data, null, 4);
fs.writeFile(filename + ".json", dataStr, function (err, result) {
  if (err) console.log("error", err);
});
console.log(dataStr, `> ${filename}.json`);
