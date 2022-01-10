const fs = require("fs");

function zeroPad(aa, size) {
  return aa.concat(new Array(size - aa.length).fill(0));
}

function padMemory(memory, memorySize) {
  return zeroPad(memory, memorySize);
}

function strToMemory(rawMemory) {
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

function readMemoryFile(filepath) {
  let rawMemory0;
  try {
    rawMemory0 = fs.readFileSync(filepath, "utf8");
  } catch (err) {
    throw err;
  }
  let memory0 = strToMemory(rawMemory0);
  return memory0;
}

module.exports = {
  zeroPad,
  padMemory,
  strToMemory,
  readMemoryFile,
};
