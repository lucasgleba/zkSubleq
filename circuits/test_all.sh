#!/bin/bash
date
for ii in lib/subleq
do
    printf '%s' "$ii"
    sh test.sh $ii > ./test/$ii/temp/stdout.txt 2>&1 ./test/$ii/temp/stderr.txt && echo " [OK]" || echo " [FAIL]"
done
