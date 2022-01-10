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
    const rndFloat = x - Math.floor(x);
    return Math.floor(aa + rndFloat * (bb - aa));
  };
}

function genSample(seed, memoryDepth) {
  seed = seed || DEFAULT_SEED;
  memoryDepth = memoryDepth || 3;

  const memorySize = 2 ** memoryDepth;
  const safeLazyGenValueP1 = memorySize - 2;

  const random = new Random(seed);

  const rawPc = random.random(Math.floor(safeLazyGenValueP1 / 3));
  const code = [];
  const data = [];

  for (let ii = 0; ii < memorySize; ii++) {
    code.push(random.random(safeLazyGenValueP1));
  }

  const mTree = subleq.genMTree(code, data, memoryDepth);
  const sTree = subleq.genSTree(rawPc, mTree);

  return subleq.step(sTree, mTree);
}

function genSampleMultiStep(seed, memoryDepth, nSteps) {
  // seed = seed || DEFAULT_SEED;
  // memoryDepth = memoryDepth || 3;

  // const memorySize = 2 ** memoryDepth;

  memoryDepth = 5;
  const memorySize = 2 ** memoryDepth;

  const rawPc = 0;

  const codeSize = 25;
  const data = new Array(memorySize - codeSize).fill(0);
  const Z = codeSize;
  const O = Z + 1;
  const [A, B, H, W, X] = [O + 1, O + 2, O + 3, O + 4, O + 5];
  data[Z - Z] = 0;
  data[O - Z] = 1;
  data[A - Z] = 0;
  data[B - Z] = 0;
  data[H - Z] = 72;
  data[W - Z] = 87;
  // Set A, B to 72, 87 (ASCII "HW")
  let code = [
    // Set m[A] = m[H]
    H,
    X,
    1, // 0
    X,
    A,
    2, // 1
    // Reset m[X] = 0
    X,
    X,
    3, // 2
    // Set m[B] = m[W]
    W,
    X,
    4, // 3
    X,
    B,
    5, // 4
    // Reset m[X] = 0
    X,
    X,
    6, // 5
    // Done
    Z,
    Z,
    6, // 6
  ];
  code = code.concat(new Array(codeSize - code.length).fill(0));

  // console.log(memoryDepth);
  // console.log(code, code.length);
  // console.log(data, data.length);

  const mTree = subleq.genMTree(code, data, memoryDepth);
  const sTree = subleq.genSTree(rawPc, mTree);

  // console.log(mTree._layers[0]);

  return subleq.multiStep(sTree, mTree, nSteps);
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
  const data = genSample(...process.argv.slice(2, 4));
  const formattedData = formatSample(data).input;
  const dataStr = JSON.stringify(formattedData, null, 4);
  const filepath = process.argv[4] || "sample.json";
  const fs = require("fs");
  fs.writeFile(filepath, dataStr, function (err, result) {
    if (err) console.log("error", err);
  });
  console.log(dataStr, ">", filepath);
}

if (!module.parent) {
  main();
}

module.exports = {
  genSample,
  genSampleMultiStep,
  formatSample,
};
