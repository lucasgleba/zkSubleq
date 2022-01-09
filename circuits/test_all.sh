#!/bin/bash
date
for ii in lib/subleq step
do
    printf '%s' "$ii"
    sh test.sh $ii > ./test/$ii/build/stdout.txt 2> ./test/$ii/build/stderr.txt && echo " [OK]" || echo " [FAIL]"
done
