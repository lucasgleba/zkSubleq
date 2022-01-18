pragma circom 2.0.2;

include "./lib/subleq.circom";
include "./lib/merkleTree.circom";
include "../node_modules/circomlib/circuits/bitify.circom";

template Step(mLevels, mSlotSize) {
    // ******** INPUT ********
    // Internals: pc, instruction, operands
    signal input pcIn;
    signal input aAddr;
    signal input bAddr;
    signal input cIn;
    signal input aIn;
    signal input bIn;
    // Externals: merkle proofs and roots
    signal input mRoot0;
    signal input sRoot0;
    signal input aAddrPathElements[mLevels];
    signal input bAddrPathElements[mLevels];
    signal input cInPathElements[mLevels];
    signal input aInPathElements[mLevels];
    signal input bInPathElements[mLevels];

    // ******** OUTPUT ********
    // Internals
    signal output pcOut;
    // signal output bOut;
    // Externals
    signal output mRoot1;
    signal output sRoot1;

    signal bOut;

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
        m1Tree.pathElements[ii] <== bInPathElements[ii];
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
        cInMerkleChecker.pathElements[ii] <== cInPathElements[ii];
        // Set proof[ii] for aIn, bIn
        aInMerkleChecker.pathIndices[ii] <== aAddrBitifier.out[ii];
        aInMerkleChecker.pathElements[ii] <== aInPathElements[ii];
        bInMerkleChecker.pathIndices[ii] <== bAddrBitifier.out[ii];
        bInMerkleChecker.pathElements[ii] <== bInPathElements[ii];
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
    signal input cInPathElements[mLevels];
    signal input aInPathElements[mLevels];
    signal input bInPathElements[mLevels];

    // ******** State 1 ********
    // Internals
    // signal input pcOut;
    // signal input bOut;
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
        step.cInPathElements[ii] <== cInPathElements[ii];
        step.aInPathElements[ii] <== aInPathElements[ii];
        step.bInPathElements[ii] <== bInPathElements[ii];
    }

    // ******** Assertion ********
    // step.pcOut === pcOut;
    // step.bOut === bOut;
    // step.mRoot1 === mRoot1;
    // sRoot1 won't be valid unless pcOut, bOut, mRoot1 also are
    step.sRoot1 === sRoot1;

}
