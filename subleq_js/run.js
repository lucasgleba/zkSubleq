const fs = require("fs");
const subleq = require("./subleq");

function readMemory(rawMemory) {
  let memory;
  memory = rawMemory.replace(/\s/g, "");
  memory = memory.split(",");
  if (memory[memory.length - 1] == "") {
    memory.pop();
  }
  return memory;
}

function padMemory(memory, memorySize) {
  return memory.concat(new Array(memorySize - memory.length).fill(0));
}

function run(nSteps, memory0, pc0) {
  nSteps = nSteps || 1;
  pc0 = pc0 || 0;
  // Log base 2 of length
  const memoryDepth = Math.ceil(Math.log(memory0.length) / Math.LN2);
  const memorySize = 2 ** memoryDepth;
  memory0 = padMemory(memory0, memorySize);
  console.log("memory depth:", memoryDepth, "levels");
  console.log("memory size:", memorySize, "slots");
  console.log("memory0 size", memory0.length, "slots");
  console.log("pc0:", pc0);
  console.log("");
  console.log("building trees...");
  const mTree = subleq.genMTree(memoryDepth, memory0);
  const sTree = subleq.genSTree(pc0, mTree);
  console.log("running...");
  for (let ss = 0; ss < nSteps; ss++) {
    subleq.step(sTree, mTree);
  }
  console.log("DONE!");
  console.log("");
  console.log(mTree._layers[0]);
}

function main() {
  const filepath = process.argv[2];
  let rawMemory0;
  try {
    rawMemory0 = fs.readFileSync(filepath, "utf8");
  } catch (err) {
    console.error(err);
    return;
  }
  const memory0 = readMemory(rawMemory0);
  const nSteps = process.argv[3];
  const pc0 = process.argv[4];
  run(nSteps, memory0, pc0);
}

if (require.main === module) {
  main();
}
