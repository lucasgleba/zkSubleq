const subleq = require("./subleq");

const { INSTRUCTION_SIZE, MEMORY_SIZE, TWO_POW_M_SLOT_SIZE } = subleq.constants;

// const MAX_M_VALUE_P1 = TWO_POW_M_SLOT_SIZE.toJSNumber();
const SAFE_LAZY_GEN_VALUE_P1 = MEMORY_SIZE - 2;
const SEED = 1234; // For genFixedSample

// WARNING: Not good randomness!
function Random(seed) {
  this.seed = seed || 0;
  this.random = function (aa, bb) {
    if (bb == undefined) {
      bb = aa;
      aa = 0;
    }
    const x = Math.sin(this.seed++) * 10000;
    const rnd_float = x - Math.floor(x);
    return Math.floor(aa + rnd_float * (bb - aa));
  };
}

function genSample(seed) {
  const random = new Random(seed);

  const rawPc = random.random(Math.floor(SAFE_LAZY_GEN_VALUE_P1 / 3));
  const code = [];
  const data = [];

  for (let ii = 0; ii < MEMORY_SIZE; ii++) {
    code.push(random.random(SAFE_LAZY_GEN_VALUE_P1));
  }

  const mTree = subleq.genMTree(code, data);
  const sTree = subleq.genSTree(rawPc, mTree);
  return subleq.step(sTree, mTree);
}

function genFixedSample() {
  return genSample(SEED);
  // const rawPc = 1;
  // const codeLen = 2; // n instructions
  // const codeOffset = codeLen * INSTRUCTION_SIZE;
  // const code = new Array(codeOffset).fill(0);
  // const pcInsStartIndex = rawPc * INSTRUCTION_SIZE;
  // code[pcInsStartIndex + 0] = codeOffset + 0; // addrA
  // code[pcInsStartIndex + 1] = codeOffset + 1; // addrB
  // code[pcInsStartIndex + 2] = 0; // C
  // const data = [10, 1]; // mA, mB
  // const mTree = subleq.genMTree(code, data);
  // const sTree = subleq.genSTree(rawPc, mTree);
  // return subleq.step(sTree, mTree);
}

function formatSample(data) {
  return {
    pcIn: data.startState.pc,
    aAddr: data.startState.A.addr,
    bAddr: data.startState.B.addr, // aAddr + 1
    aIn: data.startState.A.m,
    bIn: data.startState.B.m,
    cIn: data.startState.C.pos,
    mRoot0: data.startState.mRoot,
    sRoot0: data.startState.root,
    // aAddrPathIndices: data.startState.A.addrPath.pathIndices,
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

function main() {
  const filename = "sample";
  const fs = require("fs");
  // const data = genFixedSample();
  const data = genSample(0);
  const formattedData = formatSample(data);
  const dataStr = JSON.stringify(formattedData, null, 4);
  fs.writeFile(filename + ".json", dataStr, function (err, result) {
    if (err) console.log("error", err);
  });
  console.log(dataStr, `> ${filename}.json`);
}

if (!module.parent) {
  main();
}

module.exports = {
  genSample,
  genFixedSample,
  formatSample,
};
