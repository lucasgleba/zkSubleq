#!/bin/bash
# use: sh run_test.sh <path>
# e.g., sh run_test.sh step; sh run_test.sh lib/subleq

set -e
trap 'catch $?' ERR

catch() {
  exit 1
}

main() {
    cd ./test/$1/build/

    echo "calculating witness..."
    date
    node ./circuit_js/generate_witness.js ./circuit_js/circuit.wasm ../input.json witness.wtns
    echo

    echo "generating proof..."
    date
    snarkjs groth16 prove circuit_0001.zkey witness.wtns proof.json public.json
    echo

    echo "verifying proof..."
    date
    snarkjs groth16 verify verification_key.json public.json proof.json
    if cmp --silent ../expected.json public.json
    then
        echo "proof OK"
    else 
        echo "ERROR: result does not match expected"
        echo "expected:"
        cat ../expected.json
        echo ""
        echo "found"
        cat public.json
        echo ""
        exit 1
    fi
    echo

    echo "done!"
    date
}

main $1
