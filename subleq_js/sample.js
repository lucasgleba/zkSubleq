const subleq = require("./subleq");

const { INSTRUCTION_SIZE } = subleq.constants;

function genSample() {
  const rawPc = 1;

  const codeLen = 2; // n instructions
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

function formatSample(data) {
  return {
    pcIn: data.startState.pc,
    aAddrIn: data.startState.A.addr,
    bAddrIn: data.startState.B.addr,
    cIn: data.startState.C.pos,
    aMIn: data.startState.A.m,
    bMIn: data.startState.B.m,
    mRoot0: data.startState.mRoot,
    sRoot0: data.startState.root,
    aAddrPathIndices: data.startState.A.addrPath.pathIndices,
    aAddrPathElements: data.startState.A.addrPath.pathElements,
    bAddrPathElements: data.startState.B.addrPath.pathElements,
    cPathElements: data.startState.C.posPath.pathElements,
    aMPathElements: data.startState.A.mPath.pathElements,
    bMPathElements: data.startState.B.mPath.pathElements,
    pcOut: data.endState.pc,
    bOut: data.endState.B.m,
    mRoot1: data.endState.mRoot,
    sRoot1: data.endState.root,
  };
}

const filename = "sample";
const fs = require("fs");
const data = genSample();
const formattedData = formatSample(data);
const dataStr = JSON.stringify(formattedData, null, 4);
fs.writeFile(filename + ".json", dataStr, function (err, result) {
  if (err) console.log("error", err);
});
console.log(dataStr, `> ${filename}.json`);
