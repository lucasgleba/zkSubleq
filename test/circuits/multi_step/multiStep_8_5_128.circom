pragma circom 2.0.2;

include "../../../circuits/multiStep.circom";

component main {public [sRoot0]} = MultiStep(8, 5, 128);
