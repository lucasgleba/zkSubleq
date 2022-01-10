pragma circom 2.0.2;

include "../../multiStep.circom";

component main {public [sRoot0, sRoot1]} = ValidMultiStep(2, 13, 128);
