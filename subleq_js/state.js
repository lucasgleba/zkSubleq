const MerkleTree = require("fixed-merkle-tree");
const { bigInt } = require("snarkjs");

const BI1 = bigInt(1);
const BI2 = bigInt(2);

function StateMaker(memoryDepth, memorySlotSize) {
  memoryDepth = memoryDepth || 13;
  memorySlotSize = memorySlotSize || 128;

  this.MEMORY_DEPTH = memoryDepth;
  this.MEMORY_SLOT_SIZE = bigInt(memorySlotSize);
  this.TWO_POW_M_SLOT_SIZE = BI2.pow(this.MEMORY_SLOT_SIZE);
  this.MIN_SLOT_VALUE = this.TWO_POW_M_SLOT_SIZE.div(BI2).neg();
  this.MAX_SLOT_VALUE = this.TWO_POW_M_SLOT_SIZE.div(BI2).sub(BI1);

  // value is bigInt, pos or neg
  this.toTwosComp = (value) => {
    if (value.isNegative()) {
      if (value.lesser(this.MIN_SLOT_VALUE)) {
        throw "value < MIN_SLOT_VALUE";
      }
      return this.TWO_POW_M_SLOT_SIZE.add(value);
    } else {
      if (value.greater(this.MAX_SLOT_VALUE)) {
        throw "value > MAX_SLOT_VALUE";
      }
      return value;
    }
  };

  this.toPc = (pc) => {
    return bigInt(pc);
  };

  this.toMemory = (memoryData) => {
    const self = this;
    return memoryData.map(function (element) {
      return self.toTwosComp(bigInt(element));
    });
  };

  this.newMTree = (memoryData) => {
    memory = this.toMemory(memoryData);
    return new MerkleTree(this.MEMORY_DEPTH, memory);
  };

  this.newSTree = (pc, mTree) => {
    pc = this.toPc(pc);
    return new MerkleTree(1, [pc, mTree.root()]);
  };
}

module.exports = StateMaker;
