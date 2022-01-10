const Subleq = require("./subleq");
const StateMaker = require("./state");
const utils = require("./utils");

function run(memory0, nSteps, memorySlotSize, asciiSlots) {
  pc0 = 0;
  // Log base 2 of length
  const memoryDepth = Math.ceil(Math.log(memory0.length) / Math.LN2);
  const memorySize = 2 ** memoryDepth;
  memory0 = utils.padMemory(memory0, memorySize);

  console.log("memory depth:", memoryDepth, "levels");
  // console.log("memory0 size", memory0.length, "slots");
  console.log("memory size:", memorySize, "slots");
  console.log("pc0:", pc0);
  console.log("");
  console.log("building trees...");

  const sMaker = new StateMaker(memoryDepth, memorySlotSize);
  const mTree = sMaker.newMTree(memory0);
  const sTree = sMaker.newSTree(pc0, mTree);

  console.log(`running ${nSteps} steps...`);
  console.log("");

  const subleq = new Subleq(memorySlotSize);
  for (let ss = 0; ss < nSteps; ss++) {
    if (ss % 5 == 0) {
      console.log("step", ss);
    }
    subleq.step(sTree, mTree);
  }

  console.log("");
  console.log("DONE!");
  console.log("");
  console.log(mTree._layers[0]);
  console.log("");

  if (asciiSlots.length == 0) {
    return;
  }
  const asciiList = [];
  asciiSlots.forEach((slot) => {
    asciiList.push(String.fromCharCode(mTree._layers[0][slot].toJSNumber()));
  });
  console.log("[ASCII]", asciiList.join(""));
}

function main() {
  let [filepath, nSteps, memorySlotSize, asciiSlots] = process.argv.slice(2, 6);
  const memory0 = utils.readMemoryFile(filepath);
  nSteps = nSteps || 1;
  memorySlotSize = memorySlotSize || 128;
  if (asciiSlots != undefined) {
    asciiSlots = asciiSlots.split(",");
  } else {
    asciiSlots = [];
  }
  run(memory0, nSteps, memorySlotSize, asciiSlots);
}

if (require.main === module) {
  main();
}
