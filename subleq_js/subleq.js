const { bigInt } = require("snarkjs");
const stringifyBigInts =
  require("websnark/tools/stringifybigint").stringifyBigInts;

const BI1 = bigInt(1);
const BI2 = bigInt(2);

const INSTRUCTION_SIZE = 3;

function Subleq(memorySlotSize) {
  this.MEMORY_SLOT_SIZE = bigInt(memorySlotSize);
  this.TWO_POW_M_SLOT_SIZE = BI2.pow(this.MEMORY_SLOT_SIZE);

  // bIn, aIn are positive bigInts between 0 and TWO_POW_M_SLOT_SIZE - 1 inclusive;
  this.sub = (bIn, aIn) => {
    bIn = bIn.sub(aIn).mod(this.TWO_POW_M_SLOT_SIZE);
    if (bIn.isNegative()) {
      return this.TWO_POW_M_SLOT_SIZE.add(bIn);
    } else {
      return bIn;
    }
  };

  this.subleq = (pcIn, aIn, bIn, cIn) => {
    const bOut = this.sub(bIn, aIn);
    let pcOut;
    if (aIn.lesser(bIn)) {
      pcOut = pcIn.add(BI1);
    } else {
      pcOut = cIn;
    }
    return { bOut, pcOut };
  };

  this.getIns = (pcIn, mTree) => {
    const memorySize = mTree._layers[0].length;
    const insAddr = pcIn.toJSNumber() * INSTRUCTION_SIZE;
    if (insAddr + INSTRUCTION_SIZE > memorySize) {
      throw "memory address does not exist";
    }
    const ins = mTree._layers[0].slice(insAddr, insAddr + INSTRUCTION_SIZE);
    const [aAddr, bAddr, cIn] = ins;
    if (aAddr >= memorySize || bAddr >= memorySize) {
      throw "memory address does not exist";
    }
    const aIn = mTree._layers[0][aAddr];
    const bIn = mTree._layers[0][bAddr];
    return {
      insAddr,
      aAddr,
      bAddr,
      cIn,
      aIn,
      bIn,
    };
  };

  this.step = (sTree, mTree) => {
    const [pcIn, mRoot] = sTree.elements();

    if (mTree.root() != mRoot) {
      throw "mTree.root() != mRoot";
    }

    const { insAddr, aAddr, bAddr, cIn, aIn, bIn } = this.getIns(pcIn, mTree);
    const { bOut, pcOut } = this.subleq(pcIn, aIn, bIn, cIn);

    const A = {
      addr: aAddr,
      m: aIn,
      addrPath: mTree.path(insAddr + 0),
      mPath: mTree.path(aAddr.toJSNumber()),
    };
    const B = {
      addr: bAddr,
      m: bIn,
      addrPath: mTree.path(insAddr + 1),
      mPath: mTree.path(bAddr.toJSNumber()),
    };

    const C = {
      pos: cIn,
      posPath: mTree.path(insAddr + 2),
    };

    const startState = {
      root: sTree.root(),
      mRoot: mRoot,
      pc: pcIn,
      A: A,
      B: B,
      C: C,
    };

    mTree.update(bAddr.toJSNumber(), bOut);
    sTree.update(0, pcOut);
    sTree.update(1, mTree.root());

    const endState = {
      root: sTree.root(),
      mRoot: mTree.root(),
      pc: pcOut,
      B: {
        m: bOut,
      },
    };

    return stringifyBigInts({
      startState,
      endState,
    });
  };

  this.multiStep = (sTree, mTree, nSteps) => {
    const states = [];
    for (let ii = 0; ii < nSteps; ii++) {
      states.push(this.step(sTree, mTree));
    }
    return states;
  };
}

module.exports = Subleq;
