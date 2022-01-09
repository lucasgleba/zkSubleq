const chai = require("chai");
const F1Field = require("ffjavascript").F1Field;
const Scalar = require("ffjavascript").Scalar;
const p = Scalar.fromString(
  "21888242871839275222246405745257275088548364400416034343698204186575808495617"
);
// exports.p = p
const Fr = new F1Field(p);

const assert = chai.assert;

const { getWasmTester } = require("./utils");

describe("Test subleq circuit", function () {
  this.timeout(100000);
  let circuit;
  before(async () => {
    circuit = await getWasmTester("lib", "subleq");
  });
  it("ok", async () => {
    assert(true);
  });
  // xit("Should create a iszero circuit", async () => {
  //   let witness;
  //   witness = await circuit.calculateWitness({ in: 111 }, true);
  //   assert(Fr.eq(Fr.e(witness[0]), Fr.e(1)));
  //   assert(Fr.eq(Fr.e(witness[1]), Fr.e(0)));

  //   witness = await circuit.calculateWitness({ in: 0 }, true);
  //   assert(Fr.eq(Fr.e(witness[0]), Fr.e(1)));
  //   assert(Fr.eq(Fr.e(witness[1]), Fr.e(1)));
  // });
});
