const subleq = require("./subleq");

const DEFAULT_SEED = 0;

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

function genSample(seed, memory_depth) {
  seed = seed || DEFAULT_SEED;
  memory_depth = memory_depth || 3;

  const memory_size = 2 ** memory_depth;
  const safe_lazy_gen_value_p1 = memory_size - 2;

  const random = new Random(seed);

  const rawPc = random.random(Math.floor(safe_lazy_gen_value_p1 / 3));
  const code = [];
  const data = [];

  for (let ii = 0; ii < memory_size; ii++) {
    code.push(random.random(safe_lazy_gen_value_p1));
  }

  const mTree = subleq.genMTree(code, data);
  const sTree = subleq.genSTree(rawPc, mTree);
  return subleq.step(sTree, mTree);
}

function genFixedSample() {
  return genSample(DEFAULT_SEED, 3);
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
    input: {
      pcIn: data.startState.pc,
      aAddr: data.startState.A.addr,
      bAddr: data.startState.B.addr, // aAddr + 1
      aIn: data.startState.A.m,
      bIn: data.startState.B.m,
      cIn: data.startState.C.pos,
      mRoot0: data.startState.mRoot,
      sRoot0: data.startState.root,
      aAddrPathElements: data.startState.A.addrPath.pathElements,
      bAddrPathElements: data.startState.B.addrPath.pathElements,
      cPathElements: data.startState.C.posPath.pathElements,
      aMPathElements: data.startState.A.mPath.pathElements,
      bMPathElements: data.startState.B.mPath.pathElements,
      sRoot1: data.endState.root,
    },
    internalOutput: {
      pcOut: data.endState.pc,
      // bOut: data.endState.B.m,
      mRoot1: data.endState.mRoot,
      sRoot1: data.endState.root,
    },
    // output: {
    //   sRoot0: data.startState.root,
    //   sRoot1: data.endState.root,
    // },
  };
}

function main() {
  const filename = "sample";
  const fs = require("fs");
  const data = genFixedSample();
  const formattedData = formatSample(data).input;
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
