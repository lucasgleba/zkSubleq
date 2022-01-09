pragma circom 2.0.2;

include "./step.circom";

template MultiStep(nSteps, mLevels, mSlotSize) {
    // ******** INPUT ********
    // Internals: pc, instruction, operands
    signal input pcIn;
    signal input aAddr[nSteps];
    signal input bAddr[nSteps];
    signal input cIn[nSteps];
    signal input aIn[nSteps];
    signal input bIn[nSteps];
    // Externals: merkle proofs and roots
    signal input mRoot0;
    signal input sRoot0;
    signal input aAddrPathElements[nSteps][mLevels];
    signal input bAddrPathElements[nSteps][mLevels];
    signal input cPathElements[nSteps][mLevels];
    signal input aMPathElements[nSteps][mLevels];
    signal input bMPathElements[nSteps][mLevels];

    // ******** OUTPUT ********
    // Internals
    signal output pcOut;
    // signal output bOut;
    // Externals
    signal output mRoot1;
    signal output sRoot1;

    component steps[nSteps];

    steps[0] = Step(mLevels, mSlotSize);
    
    steps[0].pcIn <== pcIn;
    steps[0].mRoot0 <== mRoot0;
    steps[0].sRoot0 <== sRoot0;

    steps[0].aAddr <== aAddr[0];
    steps[0].bAddr <== bAddr[0];
    steps[0].cIn <== cIn[0];
    steps[0].aIn <== aIn[0];
    steps[0].bIn <== bIn[0];

    for (var ii = 0; ii < mLevels; ii++) {
        steps[0].aAddrPathElements[ii] <== aAddrPathElements[0][ii];
        steps[0].bAddrPathElements[ii] <== bAddrPathElements[0][ii];
        steps[0].cPathElements[ii] <== cPathElements[0][ii];
        steps[0].aMPathElements[ii] <== aMPathElements[0][ii];
        steps[0].bMPathElements[ii] <== bMPathElements[0][ii];
    }

    for (var ii = 1; ii < nSteps; ii++) {
        steps[ii] = Step(mLevels, mSlotSize);
    
        steps[ii].pcIn <== steps[ii - 1].pcOut;
        steps[ii].mRoot0 <== steps[ii - 1].mRoot1;
        steps[ii].sRoot0 <== steps[ii - 1].sRoot1;

        steps[ii].aAddr <== aAddr[ii];
        steps[ii].bAddr <== bAddr[ii];
        steps[ii].cIn <== cIn[ii];
        steps[ii].aIn <== aIn[ii];
        steps[ii].bIn <== bIn[ii];

        for (var jj = 0; jj < mLevels; jj++) {
            steps[ii].aAddrPathElements[jj] <== aAddrPathElements[ii][jj];
            steps[ii].bAddrPathElements[jj] <== bAddrPathElements[ii][jj];
            steps[ii].cPathElements[jj] <== cPathElements[ii][jj];
            steps[ii].aMPathElements[jj] <== aMPathElements[ii][jj];
            steps[ii].bMPathElements[jj] <== bMPathElements[ii][jj];
        }
    }

    pcOut <== steps[nSteps - 1].pcOut;
    // bOut <== steps[nSteps - 1].bOut;
    mRoot1 <== steps[nSteps - 1].mRoot1;
    sRoot1 <== steps[nSteps - 1].sRoot1;

}

template ValidMultiStep(nSteps, mLevels, mSlotSize) {
    // ******** State 0 ********
    // Internals: pc, instruction, operands
    signal input pcIn;
    signal input aAddr[nSteps];
    signal input bAddr[nSteps];
    signal input cIn[nSteps];
    signal input aIn[nSteps];
    signal input bIn[nSteps];
    // Externals: merkle proofs and roots
    signal input mRoot0;
    signal input sRoot0;
    signal input aAddrPathElements[nSteps][mLevels];
    signal input bAddrPathElements[nSteps][mLevels];
    signal input cPathElements[nSteps][mLevels];
    signal input aMPathElements[nSteps][mLevels];
    signal input bMPathElements[nSteps][mLevels];

    // ******** State 1 ********
    // Internals
    // signal output pcOut;
    // signal output bOut;
    // Externals
    // signal output mRoot1;
    signal input sRoot1;

    // ******** Setup ********
    component multiStep = MultiStep(nSteps, mLevels, mSlotSize);
    
    multiStep.pcIn <== pcIn;
    multiStep.mRoot0 <== mRoot0;
    multiStep.sRoot0 <== sRoot0;
    
    for (var ii = 0; ii < nSteps; ii++) {
        multiStep.aAddr[ii] <== aAddr[ii];
        multiStep.bAddr[ii] <== bAddr[ii];
        multiStep.cIn[ii] <== cIn[ii];
        multiStep.aIn[ii] <== aIn[ii];
        multiStep.bIn[ii] <== bIn[ii];

        for (var jj = 0; jj < mLevels; jj++) {
            multiStep.aAddrPathElements[ii][jj] <== aAddrPathElements[ii][jj];
            multiStep.bAddrPathElements[ii][jj] <== bAddrPathElements[ii][jj];
            multiStep.cPathElements[ii][jj] <== cPathElements[ii][jj];
            multiStep.aMPathElements[ii][jj] <== aMPathElements[ii][jj];
            multiStep.bMPathElements[ii][jj] <== bMPathElements[ii][jj];
        }
    }

    // ******** Assertion ********
    multiStep.sRoot1 === sRoot1;

}