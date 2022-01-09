#!/bin/bash

set -e
trap 'catch $?' ERR

catch() {
  exit 1
}

main() {
    cd ./test/$1/temp/

    n_ptau=$(<../ptau.txt)
    ptau0_fn="pot${n_ptau}_0000.ptau"
    ptau1_fn="pot${n_ptau}_0001.ptau"
    ptauf_fn="pot${n_ptau}_final.ptau"

    echo "compiling circuit to r1cs..."
    date
    circom ../circuit.circom --r1cs --wasm --sym
    echo
    snarkjs r1cs info circuit.r1cs

    echo "calculating witness..."
    date
    node ./circuit_js/generate_witness.js ./circuit_js/circuit.wasm ../input.json witness.wtns

    echo "running powers of tau ceremony..."
    # https://docs.circom.io/getting-started/proving-circuits/#powers-of-tau
    echo "[ptau] phase 1"
    date
    if [ -e $ptau1_fn ]
    then
        echo "ptau file already exists. skipping..."
    else
        snarkjs powersoftau new bn128 $n_ptau $ptau0_fn
        snarkjs powersoftau contribute $ptau0_fn $ptau1_fn --name="First contribution" -v -e="$(date)"
    fi
    echo "[ptau] phase 2"
    date
    if [ -e verification_key.json ]
    then
        echo "verification key already exists. skipping..."
    else
        snarkjs groth16 setup circuit.r1cs $ptauf_fn circuit_0000.zkey || (
        snarkjs powersoftau prepare phase2 $ptau1_fn $ptauf_fn -v &&
        snarkjs groth16 setup circuit.r1cs $ptauf_fn circuit_0000.zkey
    )
        snarkjs zkey contribute circuit_0000.zkey circuit_0001.zkey --name="1st Contributor Name" -v -e="$(date)"
        snarkjs zkey export verificationkey circuit_0001.zkey verification_key.json
    fi

    echo "generating proof..."
    date
    snarkjs groth16 prove circuit_0001.zkey witness.wtns proof.json public.json

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

    # echo "clearing files"
    # date
    # rm circuit.r1cs
    # rm circuit.wasm
    # rm circuit.sym
    # rm circuit_init.zkey
    # rm circuit.zkey
    # rm verification_key.json
    # rm verifier.sol
    # rm proof.json
    # rm public.json
    # rm witness.wtns

    echo "done!"
    date
}

main $1
