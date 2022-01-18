#!/bin/bash
# use like run_test.sh
# expects expects ptau file for value in ptau.txt to be in build folder
# e.g., circuits/test/step/build/pot15_final.ptau
# https://github.com/iden3/snarkjs#7-prepare-phase-2
# expected to be run from /circuits

set -e
trap 'catch $?' ERR

catch() {
  exit 1
}

main() {
    mkdir ./test/$1/build/ 2> /dev/null || echo
    cd ./test/$1/build/

    n_ptau=$(<../ptau.txt)
    # ptau0_fn="pot${n_ptau}_0000.ptau"
    # ptau1_fn="pot${n_ptau}_0001.ptau"
    ptauf_fn="pot${n_ptau}_final.ptau"

    echo "compiling circuit to r1cs..."
    date
    circom ../circuit.circom --r1cs --wasm --sym
    echo
    snarkjs r1cs info circuit.r1cs
    echo

    # echo "calculating witness..."
    # date
    # node ./circuit_js/generate_witness.js ./circuit_js/circuit.wasm ../input.json witness.wtns
    # echo

    echo "running powers of tau ceremony..."
    # https://docs.circom.io/getting-started/proving-circuits/#powers-of-tau
    # echo "[ptau] phase 1"
    # date
    # if [ -e $ptau1_fn ]
    # then
    #     echo "ptau file already exists. skipping..."
    # else
    #     snarkjs powersoftau new bn128 $n_ptau $ptau0_fn
    # fi
    # snarkjs powersoftau contribute $ptau0_fn $ptau1_fn --name="First contribution" -v -e="$(date)"
    # snarkjs powersoftau verify $ptau1_fn
    echo "[ptau] phase 2"
    date
    # if [ -e verification_key.json ]
    # then
    #     echo "verification key already exists. skipping..."
    # else
    # snarkjs groth16 setup circuit.r1cs $ptauf_fn circuit_0000.zkey || (
    # snarkjs powersoftau prepare phase2 $ptau1_fn $ptauf_fn -v
    # echo "verifying $ptauf_fn..."
    # snarkjs powersoftau verify $ptauf_fn -v

    snarkjs groth16 setup circuit.r1cs $ptauf_fn circuit_0000.zkey -v
    snarkjs zkey contribute circuit_0000.zkey circuit_0001.zkey --name="1st Contributor Name" -v -e="$(date)"
    # snarkjs zkey verify circuit.r1cs $ptauf_fn circuit_0001.zkey
    snarkjs zkey export verificationkey circuit_0001.zkey verification_key.json
    echo

    echo "done!"
    date
}

main $1
