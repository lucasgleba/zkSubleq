const { bigInt } = require("snarkjs");

const NUM_SIZE = 32;
const NUM_MAX = bigInt(2).pow(bigInt(NUM_SIZE));

function negTo2Comp(nn) {
  nn = bigInt(nn);
  if (nn.isNegative()) {
    nn = nn.neg();
  }
  return NUM_MAX.sub(nn); // .toString();
}

function fit2Comp(nn) {
  nn = bigInt(nn);
  if (nn.isNegative()) {
    return negTo2Comp(nn);
  }
  return nn; // .toString();
}

module.exports = {
  negTo2Comp,
  fit2Comp,
};
