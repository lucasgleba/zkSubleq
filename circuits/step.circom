include "./lib/subleq.circom";
include "./lib/merkleTree.circom";
include "../node_modules/circomlib/circuits/bitify.circom";

template Step(mLevels, mSlotSize) {
    // State 0
    // Internals
    signal input pcIn; // ok
    // Sep Addr from M in A, B
    signal input aAddr;
    signal input bAddr;
    signal input cIn;
    signal input aIn;
    signal input bIn;
    // Externals
    signal input mRoot0; // ok
    signal input sRoot0; // ok (public)
    signal input aAddrPathIndices[mLevels];
    signal input aAddrPathElements[mLevels];
    signal input bAddrPathElements[mLevels];
    signal input cPathElements[mLevels];
    signal input aMPathElements[mLevels];
    signal input bMPathElements[mLevels];

    // State 1
    // Internals
    signal input pcOut; // ok
    signal input bOut;
    // Externals
    signal input mRoot1; // ok
    signal input sRoot1; // ok (public)

    // pcIn, mRoot0 are valid
    component sRoot0Hasher = HashLeftRight();
    sRoot0Hasher.left <== pcIn;
    sRoot0Hasher.right <== mRoot0;
    sRoot0Hasher.hash === sRoot0;
    
    // pcOut, mRoot1 are valid
    component sRoot1Hasher = HashLeftRight();
    sRoot1Hasher.left <== pcOut;
    sRoot1Hasher.right <== mRoot1;
    sRoot1Hasher.hash === sRoot1;

    // Bitify bAddr
    signal binBAddr[mLevels];
    component bAddrBitifier = Num2Bits(mLevels);
    bAddrBitifier.in <== bAddr;

    // Merkle check bOut
    component bOutMerkleChecker = MerkleTreeChecker(mLevels);
    bOutMerkleChecker.leaf <== bOut;
    bOutMerkleChecker.root <== mRoot1;

    for (var ii = 0; ii < mLevels; ii++) {
        bOutMerkleChecker.pathElements[ii] <== bMPathElements[ii];
        bOutMerkleChecker.pathIndices[ii] <== bAddrBitifier.out[ii];
    }
}

component main {public [sRoot0, sRoot1]} = Step(3, 32);
