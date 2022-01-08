const MerkleTree = require("fixed-merkle-tree");

const left = "0";
const right =
  "12999932215463058328365417142008198354087394811577550991827809230954647299547";

const tree = new MerkleTree(1, [left, right]);

console.log(tree.root());
