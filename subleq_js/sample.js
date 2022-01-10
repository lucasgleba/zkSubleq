const fs = require("fs");
const subleq = require("./subleq");
const run = require("./run");

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
  const memory = [];

  for (let ii = 0; ii < memorySize; ii++) {
    memory.push(random.random(safeLazyGenValueP1));
  }

  const mTree = subleq.genMTree(memoryDepth, memory);
  const sTree = subleq.genSTree(rawPc, mTree);

  return subleq.step(sTree, mTree);
}

function genSampleMultiStep(programPath, nSteps, maxMemoryDepth) {
  nSteps = nSteps || 1;
  const pc0 = 0;

  let rawMemory0;
  try {
    rawMemory0 = fs.readFileSync(programPath, "utf8");
  } catch (err) {
    throw err;
    return;
  }

  let memory0 = run.readMemory(rawMemory0);
  const memoryDepth = Math.ceil(Math.log(memory0.length) / Math.LN2);
  const memorySize = 2 ** memoryDepth;

  if (maxMemoryDepth != undefined && memoryDepth > maxMemoryDepth) {
    throw "memoryDepth > maxMemoryDepth";
  }

  memory0 = run.padMemory(memory0, memorySize);
  const mTree = subleq.genMTree(memoryDepth, memory0);
  const sTree = subleq.genSTree(pc0, mTree);
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

if (require.main === module) {
  main();
}

module.exports = {
  genSample,
  genSampleMultiStep,
  formatSample,
};
