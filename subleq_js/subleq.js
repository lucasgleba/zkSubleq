// TODO: Improve naming
const MerkleTree = require("fixed-merkle-tree");
const { fit2Comp } = require("./utils");
const { bigInt } = require("snarkjs");
const stringifyBigInts =
  require("websnark/tools/stringifybigint").stringifyBigInts;

// const MEMORY_DEPTH = 3;
// const MEMORY_SIZE = 2 ** MEMORY_DEPTH;
const INSTRUCTION_SIZE = 3;
const MEMORY_SLOT_SIZE = 32;
const TWO_POW_M_SLOT_SIZE = bigInt(2).pow(bigInt(MEMORY_SLOT_SIZE));

function toPc(pc) {
  return bigInt(pc);
}

function toMemory(code, data) {
  return [...code, ...data].map(function (element) {
    if (element >= 0) {
      return bigInt(element);
    } else {
      return TWO_POW_M_SLOT_SIZE.sub(bigInt(Math.abs(element)));
    }
  });
}

function genMTree(code, data, memoryDepth) {
  memoryDepth = memoryDepth || 3;
  memory = toMemory(code, data);
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
  let newMB = fit2Comp(mB.sub(mA));
  if (mB.lesserOrEquals(mA)) {
    pc = posC;
  } else {
    pc = pc.add(bigInt(1));
  }
  // mTree.update(bIndex, newMB);
  return { insStartIndex, newPc: pc, addrA, addrB, posC, mA, mB, newMB };
}

function step(sTree, mTree) {
  const [pc, mRoot] = sTree.elements();

  if (mTree.root() != mRoot) {
    return false;
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
  // console.log(sTree._layers[0]);
  // console.log(mTree._layers[0].slice(0, 25));
  // console.log(mTree._layers[0].slice(25, 32));
  return states;
}

module.exports = {
  constants: {
    INSTRUCTION_SIZE,
    MEMORY_SLOT_SIZE,
    TWO_POW_M_SLOT_SIZE,
  },
  genMTree,
  genSTree,
  subleq,
  step,
  multiStep,
};
