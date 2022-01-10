pragma circom 2.0.2;

include "../../node_modules/circomlib/circuits/comparators.circom";
include "../../node_modules/circomlib/circuits/gates.circom";
include "../../node_modules/circomlib/circuits/mux1.circom";

template Subleq(valueSize) {

    // assert(n <= 252);

    signal input pcIn;
    signal input aIn;
    signal input bIn;
    signal input cIn;
    signal output pcOut;
    signal output bOut;

    signal bLTa;
    component bLTater = LessThan(valueSize);
    bLTater.in[0] <== bIn;
    bLTater.in[1] <== aIn;
    bLTa <== bLTater.out;

    var mod = 2 ** valueSize;

    bOut <==  mod * bLTa + bIn - aIn;

    signal bOutEQZero;
    component bOutEQZeroer = IsZero();
    bOutEQZeroer.in <== bOut;
    bOutEQZero <== bOutEQZeroer.out;

    signal bOutLEQZero;
    component bOutLETZeroer = OR();
    bOutLETZeroer.a <== bOutEQZero;
    bOutLETZeroer.b <== bLTa;
    bOutLEQZero <== bOutLETZeroer.out;

    component pcMux = Mux1();

    pcMux.c[0] <== pcIn + 1;
    pcMux.c[1] <== cIn;
    pcMux.s <== bOutLEQZero;

    pcOut <== pcMux.out;

}