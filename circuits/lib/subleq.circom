include "../../node_modules/circomlib/circuits/comparators.circom";
include "../../node_modules/circomlib/circuits/mux1.circom";

template Subleq(n) {
    signal input pcIn;
    signal input aIn;
    signal input bIn;
    signal input cIn;
    signal output pcOut;
    signal output bOut;

    signal bLTa;
    component bLTater = LessThan(n);
    bLTater.in[0] <== bIn;
    bLTater.in[1] <== aIn;
    bLTa <== bLTater.out

    bOut <== (2**n * bLTa + bIn - aIn);

    signal bOutIsZero;
    component bOutIsZeroter = isZero();
    bOutIsZeroter.in <== bOut;
    bOutIsZero <== bOutIsZeroter.out;

    signal bOutLetZero;
    bOutLetZero <== bOutIsZero || bLTa;

    component pcMux = Mux1();

    pcMux.c[0] <== pcIn + 1
    pcMux.c[1] <== cIn
    pcMux.s <== bOutLetZero;

    pcOut <== pcMux.out
}