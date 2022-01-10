const fs = require("fs");
const subleq = require("./subleq");

function readMemory(rawMemory) {
  let memory = [];
  rawMemory.split("\n").forEach((_line, index) => {
    if (_line.length == 0) {
      return;
    }
    line = _line.replace(/\s/g, "");
    if (line.slice(0, 2) == "//") {
      return;
    } else if (isNaN(line[0])) {
      console.log(
        "[WARNING] unrecognized character at line",
        index + 1,
        `"${_line}"`
      );
      return;
    }
    line = line.split(",");
    if (line[line.length - 1] == "") {
      line.pop();
    }
    memory = memory.concat(line);
  });
  // console.log(memory);
  return memory;
}

function padMemory(memory, memorySize) {
  return memory.concat(new Array(memorySize - memory.length).fill(0));
}

function run(nSteps, memory0, asciiSlots) {
  nSteps = nSteps || 1;
  pc0 = 0;
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
  console.log(`running ${nSteps} steps...`);
  console.log("");
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
  const filepath = process.argv[2];
  let rawMemory0;
  console.log(`reading ${filepath}...`);
  try {
    rawMemory0 = fs.readFileSync(filepath, "utf8");
  } catch (err) {
    throw err;
  }
  const memory0 = readMemory(rawMemory0);
  const nSteps = process.argv[3];
  // const pc0 = process.argv[4];
  let asciiSlots;
  if (process.argv[4]) {
    asciiSlots = process.argv[4].split(",");
  } else {
    asciiSlots = [];
  }
  run(nSteps, memory0, asciiSlots);
}

if (require.main === module) {
  main();
}
module.exports = {
  run,
  padMemory,
  readMemory,
};
