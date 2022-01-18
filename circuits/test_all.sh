#!/bin/bash
for ii in lib/subleq step multistep
do
    date
    printf '%s' "$ii"
    sh run_test.sh $ii > ./test/$ii/build/stdout.txt 2> ./test/$ii/build/stderr.txt && echo " [OK]" || echo " [FAIL]"
    echo
done
