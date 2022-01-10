const { bigInt } = require("snarkjs");
const stringifyBigInts =
  require("websnark/tools/stringifybigint").stringifyBigInts;

const BI1 = bigInt(1);
const BI2 = bigInt(2);

const INSTRUCTION_SIZE = 3;

function Subleq(memorySlotSize) {
  this.MEMORY_SLOT_SIZE = bigInt(memorySlotSize);
  this.TWO_POW_M_SLOT_SIZE = BI2.pow(this.MEMORY_SLOT_SIZE);

  // aa, bb are positive bigInts between 0 and TWO_POW_M_SLOT_SIZE - 1 inclusive;
  this.sub = (aa, bb) => {
    aa = aa.sub(bb).mod(this.TWO_POW_M_SLOT_SIZE);
    if (aa.isNegative()) {
      return this.TWO_POW_M_SLOT_SIZE.add(aa);
    } else {
      return aa;
    }
  };

  // TODO: split this
  this.subleq = (pc, mTree) => {
    const insStartIndex = pc.toJSNumber() * INSTRUCTION_SIZE;
    const ins = mTree._layers[0].slice(
      insStartIndex,
      insStartIndex + INSTRUCTION_SIZE
    );
    const [addrA, addrB, posC] = ins;
    const mA = mTree._layers[0][addrA];
    const mB = mTree._layers[0][addrB];
    if (mB.lesserOrEquals(mA)) {
      pc = posC;
    } else {
      pc = pc.add(BI1);
    }
    let newMB = this.sub(mB, mA);
    return { insStartIndex, newPc: pc, addrA, addrB, posC, mA, mB, newMB };
  };

  this.step = (sTree, mTree) => {
    const [pc, mRoot] = sTree.elements();

    if (mTree.root() != mRoot) {
      throw "mTree.root() != mRoot";
    }

    let { insStartIndex, newPc, addrA, addrB, posC, mA, mB, newMB } =
      this.subleq(pc, mTree);

    const A = {
      addr: addrA,
      m: mA,
      addrPath: mTree.path(insStartIndex + 0),
      mPath: mTree.path(addrA.toJSNumber()),
    };
    const B = {
      addr: addrB,
      m: mB,
      addrPath: mTree.path(insStartIndex + 1),
      mPath: mTree.path(addrB.toJSNumber()),
    };

    const C = {
      pos: posC,
      posPath: mTree.path(insStartIndex + 2),
    };

    const startState = {
      root: sTree.root(),
      mRoot: mRoot,
      pc: pc,
      A: A,
      B: B,
      C: C,
    };

    mTree.update(addrB.toJSNumber(), newMB);
    sTree.update(0, newPc);
    sTree.update(1, mTree.root());

    const endState = {
      root: sTree.root(),
      mRoot: mTree.root(),
      pc: newPc,
      B: {
        m: newMB,
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
