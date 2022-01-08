include "./lib/subleq.circom";
include "./lib/merkleTree.circom";

template Step(mLevels, mSlotSize) {
    // State 0
    // Internals
    signal input pcIn;
    // Sep Addr from M in A, B
    signal input aIn;
    signal input bIn;
    signal input cIn;
    // Externals
    signal input mRoot0;
    signal input sRoot0;
    signal input aPathIndices[mLevels];
    signal input aPathElements[mLevels];
    signal input bPathElements[mLevels];
    signal input cPathElements[mLevels];

    // State 1
    // Internals
    signal input pcOut;
    signal input bOut;
    // Externals
    signal input mRoot1;
    signal input sRoot1;

    signal output sRoot0Out;

    // sRoot is valid
    component sRoot0Hasher = HashLeftRight();
    sRoot0Hasher.left <== pcIn;
    sRoot0Hasher.right <== mRoot0;
    // sRoot0Hasher.hash === sRoot0;

    sRoot0Out <== sRoot0Hasher.hash;
}

component main {public [sRoot0, sRoot1]} = Step(3, 32);
