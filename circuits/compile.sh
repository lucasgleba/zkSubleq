#!/bin/bash

set -e
trap 'catch $?' ERR

catch() {
  exit 1
}

main() {
    cd ./test/$1/temp/
    echo "compiling circuit to r1cs..."
    date
    circom ../circuit.circom --r1cs --wasm --sym
    echo
    snarkjs r1cs info circuit.r1cs
}

main $1
