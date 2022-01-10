const Subleq = require("./subleq");
const StateMaker = require("./state");
const utils = require("./utils");

const DEFAULT_SEED = 0;

// WARNING: Not good randomness!
function Random(seed) {
  this.seed = seed || DEFAULT_SEED;
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

function genSample(seed, memorySlotSize, memoryDepth) {
  seed = seed || DEFAULT_SEED;
  memoryDepth = memoryDepth || 3;
  memorySlotSize = memorySlotSize || 128;

  const memorySize = 2 ** memoryDepth;
  const safeLazyGenValueP1 = memorySize - 2;

  const random = new Random(seed);

  const rawPc = random.random(Math.floor(safeLazyGenValueP1 / 3)); // 3 == INSTRUCTION_SIZE
  const memory = [];

  for (let ii = 0; ii < memorySize; ii++) {
    memory.push(random.random(safeLazyGenValueP1));
  }

  const sMaker = new StateMaker(memoryDepth, memorySlotSize);
  const mTree = sMaker.newMTree(memory);
  const sTree = sMaker.newSTree(rawPc, mTree);
  const subleq = new Subleq(memorySlotSize);
  return subleq.step(sTree, mTree);
}

function genMultiStepSample(
  programPath,
  nSteps,
  memorySlotSize,
  memoryDepth,
  maxMemoryDepth
) {
  nSteps = nSteps || 1;
  memorySlotSize = memorySlotSize || 128;
  const pc0 = 0;

  let memory0 = utils.readMemoryFile(programPath);
  const minReqMemoryDepth = Math.ceil(Math.log(memory0.length) / Math.LN2);

  if (memoryDepth != undefined) {
    if (minReqMemoryDepth > memoryDepth) {
      throw "minReqMemoryDepth > memoryDepth";
    }
  } else {
    memoryDepth = minReqMemoryDepth;
  }
  if (maxMemoryDepth != undefined && memoryDepth > maxMemoryDepth) {
    throw "memoryDepth > maxMemoryDepth";
  }

  const memorySize = 2 ** memoryDepth;
  memory0 = utils.padMemory(memory0, memorySize);

  const sMaker = new StateMaker(memoryDepth, memorySlotSize);
  const mTree = sMaker.newMTree(memory0);
  const sTree = sMaker.newSTree(pc0, mTree);
  const subleq = new Subleq(memorySlotSize);
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

function formatMultiStepSample(stepsData) {
  const firstStep = stepsData[0];
  const lastStep = stepsData[stepsData.length - 1];
  const inputData = {
    pcIn: firstStep.startState.pc,
    mRoot0: firstStep.startState.mRoot,
    sRoot0: firstStep.startState.root,
    sRoot1: lastStep.endState.root,
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
    stepData = formatSample(stepData).input;
    inputData.aAddr.push(stepData.aAddr);
    inputData.bAddr.push(stepData.bAddr);
    inputData.cIn.push(stepData.cIn);
    inputData.aIn.push(stepData.aIn);
    inputData.bIn.push(stepData.bIn);
    inputData.aAddrPathElements.push(stepData.aAddrPathElements);
    inputData.bAddrPathElements.push(stepData.bAddrPathElements);
    inputData.cPathElements.push(stepData.cPathElements);
    inputData.aMPathElements.push(stepData.aMPathElements);
    inputData.bMPathElements.push(stepData.bMPathElements);
  });
  return {
    input: inputData,
    internalOutput: {
      pcOut: lastStep.endState.pc,
      mRoot1: lastStep.endState.mRoot,
      sRoot1: lastStep.endState.root,
    },
  };
}

function main() {
  const fs = require("fs");
  let formattedData;
  const filepath = process.argv[3];
  const mode = process.argv[2];
  if (mode == "single") {
    const [seed, memorySlotSize, memoryDepth] = process.argv.slice(4, 7);
    const data = genSample(seed, memorySlotSize, memoryDepth);
    formattedData = formatSample(data).input;
  } else if (mode == "multi") {
    const [programPath, nSteps, memorySlotSize, memoryDepth] =
      process.argv.slice(4, 8);
    const data = genMultiStepSample(
      programPath,
      nSteps,
      memorySlotSize,
      memoryDepth
    );
    formattedData = formatMultiStepSample(data).input;
  } else if (mode == "help") {
    console.log("single outputFile.json seed memorySlotSize memoryDepth");
    console.log(
      "multi outputFile.json programPath.txt nSteps memorySlotSize memoryDepth"
    );
    return;
  } else {
    throw "mode not valid (try node sample.js help)";
  }
  const dataStr = JSON.stringify(formattedData, null, 4);
  fs.writeFileSync(filepath, dataStr);
  console.log(dataStr, ">", filepath);
}

if (require.main === module) {
  main();
}

module.exports = {
  genSample,
  genMultiStepSample,
  formatSample,
  formatMultiStepSample,
};
