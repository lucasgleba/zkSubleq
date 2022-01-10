// TODO: Improve naming
const MerkleTree = require("fixed-merkle-tree");
const { bigInt } = require("snarkjs");
const stringifyBigInts =
  require("websnark/tools/stringifybigint").stringifyBigInts;

const BI1 = bigInt(1);
const BI2 = bigInt(2);

// TODO: make this an object

const INSTRUCTION_SIZE = 3;
const MEMORY_SLOT_SIZE = 128;
const TWO_POW_M_SLOT_SIZE = BI2.pow(bigInt(MEMORY_SLOT_SIZE));
const MIN_SLOT_VALUE = TWO_POW_M_SLOT_SIZE.div(BI2).neg();
const MAX_SLOT_VALUE = TWO_POW_M_SLOT_SIZE.div(BI2).sub(BI1);

function toTwosComp(value) {
  value = bigInt(value);
  if (value.isNegative()) {
    if (value.lesser(MIN_SLOT_VALUE)) {
      throw "value < MIN_SLOT_VALUE";
    }
    return TWO_POW_M_SLOT_SIZE.add(value);
  } else {
    if (value.greater(MAX_SLOT_VALUE)) {
      throw "value > MAX_SLOT_VALUE";
    }
    return value;
  }
}

// aa, bb are positive bigInts between 0 and TWO_POW_M_SLOT_SIZE - 1 inclusive;
function sub(aa, bb) {
  aa = aa.sub(bb).mod(TWO_POW_M_SLOT_SIZE);
  if (aa.isNegative()) {
    return TWO_POW_M_SLOT_SIZE.add(aa);
  } else {
    return aa;
  }
}

function toPc(pc) {
  return bigInt(pc);
}

function toMemory(memoryData) {
  return memoryData.map(function (element) {
    return toTwosComp(element);
  });
}

function genMTree(memoryDepth, memoryData) {
  memoryDepth = memoryDepth || 3;
  memory = toMemory(memoryData);
  return new MerkleTree(memoryDepth, memory);
}

function genSTree(pc, mTree) {
  pc = toPc(pc);
  return new MerkleTree(1, [pc, mTree.root()]);
}

function subleq(pc, mTree) {
  const insStartIndex = pc.toJSNumber() * INSTRUCTION_SIZE;
  const ins = mTree._layers[0].slice(insStartIndex, insStartIndex + 3);
  const [addrA, addrB, posC] = ins;
  const mA = mTree._layers[0][addrA];
  const mB = mTree._layers[0][addrB];
  if (mB.lesserOrEquals(mA)) {
    pc = posC;
  } else {
    pc = pc.add(bigInt(1));
  }
  let newMB = sub(mB, mA);
  return { insStartIndex, newPc: pc, addrA, addrB, posC, mA, mB, newMB };
}

function step(sTree, mTree) {
  const [pc, mRoot] = sTree.elements();

  if (mTree.root() != mRoot) {
    throw "mTree.root() != mRoot";
  }

  let { insStartIndex, newPc, addrA, addrB, posC, mA, mB, newMB } = subleq(
    pc,
    mTree
  );

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
}

function multiStep(sTree, mTree, nSteps) {
  const states = [];
  for (let ii = 0; ii < nSteps; ii++) {
    states.push(step(sTree, mTree));
  }
  return states;
}

module.exports = {
  sub,
  genMTree,
  genSTree,
  subleq,
  step,
  multiStep,
};
