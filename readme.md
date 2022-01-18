# zkSubleq

A VM based on the [Subleq one-instruction set computer](https://esolangs.org/wiki/Subleq) implemented in JS and circom.

**Subleq?**

Given three operands A, B, C
- _sub_: Set `Memory\[B\] -= Memory\[A\]`.
- _leq_: If the new value is less than or equal to 0, set `ProgramCounter = C`. Otherwise `ProgramCounter += 1`.

There is only one instruction, so no opcodes are needed. Other than the program counter (aka instruction pointer), there are no registers.

## How does it work?

In order to make zk-SNARKs possible, the state of the machine is Merkleized; only the memory slots involved in a given steps are passed as input. For VMs with a large memory, passing the entire state would be impractical. The same applies to running the machine on-chain.

![zkSubleq Merkleization graph](zkSubleq_merkle.jpg)

```circom
// Circuit for one VM step I/O

// INPUT
signal input pcIn; // Program counter value
signal input aAddr; // A operand (address)
signal input bAddr; // B operand (address)
signal input cIn; // C operand (instruction index)
signal input aIn; // Memory[A]
signal input bIn; // Memory[B]
signal input mRoot0; // Memory subtree root
signal input sRoot0; // State tree root
// Merkle proof elements (paths are derived in the circuit)
signal input aAddrPathElements[mLevels]; // aAddr -> mRoot
signal input bAddrPathElements[mLevels]; // bAddr -> mRoot
signal input cInPathElements[mLevels]; // cIn -> mRoot
signal input aInPathElements[mLevels]; // AIn -> mRoot
signal input bInPathElements[mLevels]; // bIn/bOut -> mRoot

// OUTPUT
// Values after step execution
signal output pcOut; // Program counter value
signal output mRoot1; // Memory subtree root
signal output sRoot1; // State tree root
```

## Why does it suck?

**Instruction set too simple**

Turing-complete, yes. But using this for real-life programs would be super slow. Most of the constrains in the circuit will come from validating Merkle proofs. A more sophisticated instruction set would not cost much and would speed things up a lot. It would be good to make it easily transpilable/compilable from a popular ISA/intermediate representation.

**One memory slot per signal**

Every leaf node in the state tree corresponds to a register or memory slot so values can go as high as circom integers (2^253+), as opposed to conventional computers limited to 8-bit memory slots. It would be better to pack multiple smaller registers/slots into a single value to make the state tree (especially the memory subtree) more shallow.

**Two many long Merkle proofs to validate**

The circuit validates 6 long merkle proofs (memory slot -> memory root): aAddr, bAddr, cIn, aIn, bIn, bOut. A better machine would have a load-store architecture where most of the operations happen between registers (which would be in a much smaller subtree) and at most one memory slot is read or written every step (other than the instruction). This would lower the number of constrains _very_ significantly and would make VM more compatible with existing RISC ISAs.
