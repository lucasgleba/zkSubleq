#!/bin/bash

set -e
trap 'catch $?' ERR

catch() {
  exit 1
}

main() {
    cd ./test/$1/temp/
    date
    echo
    snarkjs r1cs info circuit.r1cs
}

main $1
