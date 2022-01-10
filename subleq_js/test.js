const path = require("path");
const sample = require("./sample");
const programPath = path.join(process.cwd(), "programs", "hw.txt");
console.log(sample.genSampleMultiStep(programPath, 8, 5));
