include "./lib/subleq.circom";
include "./lib/merkleTree.circom";
include "../node_modules/circomlib/circuits/bitify.circom";

// mLevels: 3, mSlotSize: 32
// Merkle checking memory: 26506 constrains (99.86%)
// Checking subleq: 37 constrains (0.14%)

template Step(mLevels, mSlotSize) {
    // ******** State 0 ********
    // Internals
    // Decimal sum x2, then bitify x2 OR bitify x1, then binary sum x2 [?]
    // 2 dec sum, 3 bitify VS. 2 bin sum, 1 bitify
    signal input pcIn; // ok
    signal input aAddr; // ok
    signal input bAddr; // ok
    signal input cIn; // ok
    signal input aIn; // ok
    signal input bIn; // ok
    // Externals
    signal input mRoot0; // ok
    signal input sRoot0; // ok (public)
    signal input aAddrPathElements[mLevels]; // ok
    signal input bAddrPathElements[mLevels]; // ok
    signal input cPathElements[mLevels]; // ok
    signal input aMPathElements[mLevels]; // ok
    signal input bMPathElements[mLevels]; // ok

    // ******** State 1 ********
    // Internals
    signal input pcOut; // merkle ok, missing subleq
    signal input bOut; // merkle ok, missing subleq
    // Externals
    signal input mRoot1; // ok
    signal input sRoot1; // ok (public)

    // ******** Operand addresses ********
    // Derive aInsAddr, bInsAddr, cInsAddr FROM pcIn
    signal aInsAddr;
    signal bInsAddr;
    signal cInsAddr;
    aInsAddr <== pcIn * 3;
    bInsAddr <== aInsAddr + 1;
    cInsAddr <== aInsAddr + 2; // bAddr + 1 OR aAddr + 2?


    // ******** Merkle check sTrees ********
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

    // ******** Merkle check mTrees ********
    // Bitify aInsAddr, bInsAddr, cInsAddr
    component aInsAddrBitifier = Num2Bits(mLevels);
    aInsAddrBitifier.in <== aInsAddr;
    component bInsAddrBitifier = Num2Bits(mLevels);
    bInsAddrBitifier.in <== bInsAddr;
    component cInsAddrBitifier = Num2Bits(mLevels);
    cInsAddrBitifier.in <== cInsAddr;
    // Bitify aAddr, bAddr
    component aAddrBitifier = Num2Bits(mLevels);
    aAddrBitifier.in <== aAddr;
    component bAddrBitifier = Num2Bits(mLevels);
    bAddrBitifier.in <== bAddr;

    // Setup aAddr, bAddr, CIn checkers
    component aAddrMerkleChecker = MerkleTreeChecker(mLevels);
    aAddrMerkleChecker.leaf <== aAddr;
    aAddrMerkleChecker.root <== mRoot0;
    component bAddrMerkleChecker = MerkleTreeChecker(mLevels);
    bAddrMerkleChecker.leaf <== bAddr;
    bAddrMerkleChecker.root <== mRoot0;
    component cInMerkleChecker = MerkleTreeChecker(mLevels);
    cInMerkleChecker.leaf <== cIn;
    cInMerkleChecker.root <== mRoot0;
    // Setup aIn, bIn checkers
    component aInMerkleChecker = MerkleTreeChecker(mLevels);
    aInMerkleChecker.leaf <== aIn;
    aInMerkleChecker.root <== mRoot0;
    component bInMerkleChecker = MerkleTreeChecker(mLevels);
    bInMerkleChecker.leaf <== bIn;
    bInMerkleChecker.root <== mRoot0;
    // Setup BOut checker
    component bOutMerkleChecker = MerkleTreeChecker(mLevels);
    bOutMerkleChecker.leaf <== bOut;
    bOutMerkleChecker.root <== mRoot1;

    for (var ii = 0; ii < mLevels; ii++) {
        // Set proof[ii] for aAddr, bAddr, cIn
        aAddrMerkleChecker.pathIndices[ii] <== aInsAddrBitifier.out[ii];
        aAddrMerkleChecker.pathElements[ii] <== aAddrPathElements[ii];
        bAddrMerkleChecker.pathIndices[ii] <== bInsAddrBitifier.out[ii];
        bAddrMerkleChecker.pathElements[ii] <== bAddrPathElements[ii];
        cInMerkleChecker.pathIndices[ii] <== cInsAddrBitifier.out[ii];
        cInMerkleChecker.pathElements[ii] <== cPathElements[ii];
        // Set proof[ii] for aIn, bIn
        aInMerkleChecker.pathIndices[ii] <== aAddrBitifier.out[ii];
        aInMerkleChecker.pathElements[ii] <== aMPathElements[ii];
        bInMerkleChecker.pathIndices[ii] <== bAddrBitifier.out[ii];
        bInMerkleChecker.pathElements[ii] <== bMPathElements[ii];
        // Set proof[ii] for bOut
        bOutMerkleChecker.pathIndices[ii] <== bAddrBitifier.out[ii];
        bOutMerkleChecker.pathElements[ii] <== bMPathElements[ii];
    }

    // ******** Check SUBLEQ ********
    component subleqChecker = Subleq(mSlotSize);
    subleqChecker.pcIn <== pcIn;
    subleqChecker.aIn <== aIn;
    subleqChecker.bIn <== bIn;
    subleqChecker.cIn <== cIn;
    subleqChecker.pcOut === pcOut;
    subleqChecker.bOut === bOut;
}

component main {public [sRoot0, sRoot1]} = Step(3, 32);
