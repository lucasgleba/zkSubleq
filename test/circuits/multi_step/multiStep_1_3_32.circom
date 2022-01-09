pragma circom 2.0.2;

include "../../../circuits/multiStep.circom";

component main {public [sRoot0, sRoot1]} = ValidStep(3, 32);
