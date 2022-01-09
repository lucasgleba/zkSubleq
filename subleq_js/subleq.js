const MerkleTree = require("fixed-merkle-tree");
const { fit2Comp } = require("./utils");
const { bigInt } = require("snarkjs");
const stringifyBigInts =
  require("websnark/tools/stringifybigint").stringifyBigInts;

const MEMORY_DEPTH = 3;
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

function genMTree(code, data) {
  memory = toMemory(code, data);
  return new MerkleTree(MEMORY_DEPTH, memory);
}

function genSTree(pc, mTree) {
  pc = toPc(pc);
  return new MerkleTree(1, [pc, mTree.root()]);
}

function subleq(pc, mTree) {
  const insStartIndex = pc.toJSNumber() * INSTRUCTION_SIZE;
  const bIndex = insStartIndex + 1;
  const ins = mTree._layers[0].slice(insStartIndex, insStartIndex + 3);
  const [addrA, addrB, posC] = ins;
  const mA = mTree._layers[0][addrA];
  const mB = mTree._layers[0][addrB];
  let newMB = fit2Comp(mB.sub(mA));
  if (mB.lesserOrEquals(mA)) {
    pc = posC;
  } else {
    pc.add(bigInt(1));
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

module.exports = {
  constants: {
    MEMORY_DEPTH,
    INSTRUCTION_SIZE,
    MEMORY_SLOT_SIZE,
    TWO_POW_M_SLOT_SIZE,
  },
  genMTree,
  genSTree,
  subleq,
  step,
};
