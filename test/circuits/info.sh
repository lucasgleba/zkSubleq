#!/bin/bash

set -e
trap 'catch $?' ERR

catch() {
  exit 1
}

main() {
    echo "compiling circuit to r1cs..."
    date
    circom ./$1/$2.circom --r1cs --wasm --sym --output ./tmp
    echo
    snarkjs r1cs info ./tmp/$2.r1cs
    rm -rf ./tmp/*
}

main $1 $2
