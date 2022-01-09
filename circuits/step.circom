pragma circom 2.0.2;

include "./lib/subleq.circom";
include "./lib/merkleTree.circom";
include "../node_modules/circomlib/circuits/bitify.circom";

// mLevels: 3, mSlotSize: 32
// Merkle checking memory: 26479 constrains (99.9%)
// Checking subleq: 37 constrains (0.136%)

template Step(mLevels, mSlotSize) {
    // ******** INPUT ********
    // Internals: pc, instruction, operands
    // Decimal sum x2, then bitify x2 OR bitify x1, then binary sum x2 [?]
    // 2 dec sum, 3 bitify VS. 2 bin sum, 1 bitify
    signal input pcIn; // ok
    signal input aAddr; // ok
    signal input bAddr; // ok
    signal input cIn; // ok
    signal input aIn; // ok
    signal input bIn; // ok
    // Externals: merkle proofs and roots
    signal input mRoot0; // ok
    signal input sRoot0; // ok
    signal input aAddrPathElements[mLevels]; // ok
    signal input bAddrPathElements[mLevels]; // ok
    signal input cPathElements[mLevels]; // ok
    signal input aMPathElements[mLevels]; // ok
    signal input bMPathElements[mLevels]; // ok

    // ******** OUTPUT ********
    // Internals
    signal output pcOut;
    // signal output bOut;
    signal bOut;
    // Externals
    signal output mRoot1;
    signal output sRoot1;

    // ******** EXECUTE STEP ********
    // Bitify bAddr
    component bAddrBitifier = Num2Bits(mLevels);
    bAddrBitifier.in <== bAddr;
    // Set subleq
    component subleqChecker = Subleq(mSlotSize);
    subleqChecker.pcIn <== pcIn;
    subleqChecker.aIn <== aIn;
    subleqChecker.bIn <== bIn;
    subleqChecker.cIn <== cIn;
    pcOut <== subleqChecker.pcOut;
    bOut <== subleqChecker.bOut;
    // Set mRoot1
    component m1Tree = MerkleTree(mLevels);
    m1Tree.leaf <== bOut;
    for (var ii = 0; ii < mLevels; ii++) {
        m1Tree.pathIndices[ii] <== bAddrBitifier.out[ii];
        m1Tree.pathElements[ii] <== bMPathElements[ii];
    }
    mRoot1 <== m1Tree.root;
    // Set sRoot1
    component s1Hash = HashLeftRight();
    s1Hash.left <== pcOut;
    s1Hash.right <== mRoot1;
    sRoot1 <== s1Hash.hash;

    // ******** CHECK STATE ********
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

    // ******** Merkle check mTrees ********
    // Bitify aInsAddr, bInsAddr, cInsAddr
    component aInsAddrBitifier = Num2Bits(mLevels);
    aInsAddrBitifier.in <== aInsAddr;
    component bInsAddrBitifier = Num2Bits(mLevels);
    bInsAddrBitifier.in <== bInsAddr;
    component cInsAddrBitifier = Num2Bits(mLevels);
    cInsAddrBitifier.in <== cInsAddr;
    // Bitify aAddr
    component aAddrBitifier = Num2Bits(mLevels);
    aAddrBitifier.in <== aAddr;
    // bAddr already bitified above
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
    }
}

template ValidStep(mLevels, mSlotSize) {
    // ******** State 0 ********
    // Internals
    signal input pcIn;
    signal input aAddr;
    signal input bAddr;
    signal input cIn;
    signal input aIn;
    signal input bIn;
    // Externals
    signal input mRoot0;
    signal input sRoot0; // public
    signal input aAddrPathElements[mLevels];
    signal input bAddrPathElements[mLevels];
    signal input cPathElements[mLevels];
    signal input aMPathElements[mLevels];
    signal input bMPathElements[mLevels];

    // ******** State 1 ********
    // Internals
    // signal input pcOut; // ok
    // signal input bOut; // ok
    // Externals
    // signal input mRoot1;
    signal input sRoot1; // public

    // ******** Setup ********
    component step = Step(mLevels, mSlotSize);

    step.pcIn <== pcIn;
    step.aAddr <== aAddr;
    step.bAddr <== bAddr;
    step.cIn <== cIn;
    step.aIn <== aIn;
    step.bIn <== bIn;
    step.mRoot0 <== mRoot0;
    step.sRoot0 <== sRoot0;

    for (var ii = 0; ii < mLevels; ii++) {
        step.aAddrPathElements[ii] <== aAddrPathElements[ii];
        step.bAddrPathElements[ii] <== bAddrPathElements[ii];
        step.cPathElements[ii] <== cPathElements[ii];
        step.aMPathElements[ii] <== aMPathElements[ii];
        step.bMPathElements[ii] <== bMPathElements[ii];
    }

    // ******** Assertion ********
    // step.pcOut === pcOut;
    // step.bOut === bOut;
    // step.mRoot1 === mRoot1;
    // sRoot1 won't be valid unless pcOut, bOut, mRoot1 also are
    step.sRoot1 === sRoot1;

}
